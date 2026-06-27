const sharp = require('sharp');

const { HfInference } = require('@huggingface/inference');

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const hf = HF_API_KEY ? new HfInference(HF_API_KEY) : null;

// ViT ImageNet classifier with Weighted Voting post-processing
const VIT_API_URL = 'https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224';

if (!HF_API_KEY) {
  console.warn('⚠️  HUGGINGFACE_API_KEY is not set in .env');
}

// Fallback: ImageNet label → clothing type mapping
const labelToType = {
  'jersey': 't-shirt', 't-shirt': 't-shirt', 'tee shirt': 't-shirt',
  'suit': 'jacket', 'jean': 'pants', 'blue jean': 'pants', 'denim': 'pants',
  'bow tie': 'accessories', 'miniskirt': 'skirt', 'overskirt': 'skirt',
  'cardigan': 'sweater', 'fur coat': 'jacket', 'trench coat': 'jacket',
  'lab coat': 'jacket', 'cloak': 'jacket', 'poncho': 'jacket',
  'abaya': 'kurta', 'running shoe': 'shoes', 'loafer': 'shoes',
  'sandal': 'shoes', 'cowboy boot': 'shoes', 'boot': 'shoes',
  'sombrero': 'cap', 'cowboy hat': 'cap', 'bonnet': 'cap',
  'sunglasses': 'sunglasses', 'sunglass': 'sunglasses',
  'sweatshirt': 'sweater', 'maillot': 'shirt',
  'digital watch': 'watch', 'stopwatch': 'watch',
  'buckle': 'belt', 'kimono': 'kurta',
  'wool': 'sweater', 'woolen': 'sweater',
  'windsor tie': 'accessories', 'bolo tie': 'accessories',
};

// Keyword → type mapping (for partial matching)
const keywordToType = [
  { keywords: ['t-shirt', 'tshirt', 'tee shirt', 'tee'], type: 't-shirt' },
  { keywords: ['polo', 'blouse', 'maillot', 'tank'], type: 'shirt' },
  { keywords: ['pant', 'jean', 'trouser', 'shorts', 'legging', 'denim'], type: 'pants' },
  { keywords: ['dress', 'gown', 'swimsuit'], type: 'dress' },
  { keywords: ['skirt', 'sarong'], type: 'skirt' },
  { keywords: ['jacket', 'coat', 'blazer', 'suit', 'cloak', 'poncho', 'bomber', 'parka'], type: 'jacket' },
  { keywords: ['sweater', 'sweatshirt', 'hoodie', 'pullover', 'fleece', 'jumper', 'cardigan'], type: 'sweater' },
  { keywords: ['shoe', 'boot', 'sneaker', 'loafer', 'sandal', 'slipper'], type: 'shoes' },
  { keywords: ['watch', 'wristwatch'], type: 'watch' },
  { keywords: ['belt', 'buckle'], type: 'belt' },
  { keywords: ['sunglasses', 'glasses'], type: 'sunglasses' },
  { keywords: ['hat', 'cap', 'bonnet', 'helmet', 'beret'], type: 'cap' },
  { keywords: ['bag', 'purse', 'wallet', 'backpack'], type: 'accessories' },
  { keywords: ['tie', 'bow', 'scarf', 'necklace', 'glove'], type: 'accessories' },
  { keywords: ['kurta', 'salwar', 'sherwani', 'tunic', 'robe', 'abaya', 'kameez'], type: 'kurta' },
];

// Category inference from type
const typeToCategory = {
  shirt: 'casual', 't-shirt': 'casual', pants: 'casual', skirt: 'casual',
  sweater: 'casual', shoes: 'casual', accessories: 'casual',
  watch: 'casual', belt: 'casual', sunglasses: 'casual', cap: 'casual',
  dress: 'formal', jacket: 'formal', kurta: 'formal',
  other: 'other'
};

/**
 * Map a single label to a clothing type using exact + keyword matching
 */
function mapLabelToType(label) {
  const lowerLabel = label.toLowerCase().trim();

  // Check each sub-label (ImageNet returns "jersey, T-shirt, tee shirt")
  const parts = lowerLabel.split(',').map(p => p.trim());
  for (const part of parts) {
    if (labelToType[part]) return labelToType[part];
  }

  // Keyword partial match
  for (const { keywords, type } of keywordToType) {
    if (keywords.some(kw => lowerLabel.includes(kw))) return type;
  }

  return null; // Not a clothing item
}

/**
 * WEIGHTED VOTING CLASSIFIER
 * Instead of picking the first match, this aggregates confidence scores
 * across ALL top results and groups them by clothing type.
 *
 * Example: If ViT returns:
 *   - sweatshirt (12.5%)    → sweater: 12.5%
 *   - jersey/T-shirt (6.4%) → t-shirt: 6.4%
 *   - cardigan (6.8%)       → sweater: 6.8% + 12.5% = 19.3%
 *   - wool (5.6%)           → sweater: 5.6% + 19.3% = 24.9%
 *
 * Sweater wins with 24.9% aggregated vs t-shirt's 6.4%.
 * But for a real shirt image, shirt-related labels would collectively
 * outweigh any single sweater label.
 */
function classifyWithVoting(results) {
  if (!results || results.length === 0) return { type: 'other', confidence: 0, labels: [] };

  const typeScores = {};   // { 'shirt': 0.35, 'sweater': 0.12, ... }
  const typeReasons = {};  // { 'shirt': ['jersey (12%)', ...], ... }

  // Scan top 10 results and aggregate scores by type
  for (const result of results.slice(0, 10)) {
    const mappedType = mapLabelToType(result.label);
    if (mappedType) {
      typeScores[mappedType] = (typeScores[mappedType] || 0) + result.score;
      if (!typeReasons[mappedType]) typeReasons[mappedType] = [];
      typeReasons[mappedType].push(`${result.label.split(',')[0].trim()} (${(result.score*100).toFixed(1)}%)`);
    }
  }

  if (Object.keys(typeScores).length === 0) {
    return { type: 'other', confidence: results[0]?.score || 0, labels: results.slice(0, 5).map(r => r.label) };
  }

  // Sort types by aggregated score
  const sortedTypes = Object.entries(typeScores).sort((a, b) => b[1] - a[1]);
  const bestType = sortedTypes[0][0];
  const bestScore = sortedTypes[0][1];

  console.log('📊 Voting results:');
  sortedTypes.forEach(([type, score]) => {
    console.log(`   ${type}: ${(score*100).toFixed(1)}% (from: ${typeReasons[type].join(', ')})`);
  });

  return {
    type: bestType,
    confidence: bestScore,
    labels: results.slice(0, 5).map(r => r.label)
  };
}

/**
 * Classify image using ViT + Weighted Voting
 */
async function classifyImage(imageBuffer) {
  console.log('🤖 Classifying with ViT + Weighted Voting...');

  const response = await fetch(VIT_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/octet-stream'
    },
    body: imageBuffer
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`ViT API ${response.status}: ${errBody}`);
  }

  const results = await response.json();
  console.log('📋 Raw ViT labels:', results.slice(0, 5).map(r => `${r.label} (${(r.score*100).toFixed(1)}%)`).join(', '));

  const classified = classifyWithVoting(results);
  const category = typeToCategory[classified.type] || 'casual';

  console.log(`✅ Final: ${classified.type} | Category: ${category} | Aggregated Confidence: ${(classified.confidence * 100).toFixed(1)}%`);

  return {
    type: classified.type,
    confidence: classified.confidence,
    category,
    labels: classified.labels,
    method: 'vit-voting'
  };
}

/**
 * Analyze clothing image
 * @param {Buffer} imageBuffer - The image as a Buffer
 * @returns {Promise<Object>} - Analysis result
 */
exports.analyzeClothingImage = async (imageBuffer) => {
  let detectedType = 'other';
  let dominantColor = 'neutral';
  let category = 'casual';
  let confidence = 0;
  let detectedLabels = [];
  let classificationMethod = 'none';
  let errorMsg = null;

  try {
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Empty image buffer');
    }

    console.log(`📸 Analyzing image (${(imageBuffer.length / 1024).toFixed(1)} KB)`);

    // 1. Extract dominant color with Sharp
    try {
      dominantColor = await extractDominantColor(imageBuffer);
      console.log(`🎨 Color: ${dominantColor}`);
    } catch (colorErr) {
      console.error('❌ Color error:', colorErr.message);
    }

    // 2. Classify clothing type
    if (!HF_API_KEY) {
      errorMsg = 'HUGGINGFACE_API_KEY not configured';
    } else {
      try {
        const result = await classifyImage(imageBuffer);
        detectedType = result.type;
        confidence = result.confidence;
        category = result.category;
        detectedLabels = result.labels;
        classificationMethod = result.method;
      } catch (classifyErr) {
        console.error('❌ Classification failed:', classifyErr.message);
        errorMsg = classifyErr.message;
      }
    }

    return {
      type: detectedType,
      color: dominantColor,
      category,
      confidence,
      detectedLabels,
      classificationMethod,
      ...(errorMsg && { error: errorMsg })
    };
  } catch (error) {
    console.error('❌ General Error:', error);
    return { type: 'other', color: 'neutral', category: 'casual', confidence: 0, detectedLabels: [], error: error.message };
  }
};

/**
 * Extract dominant color from buffer
 */
async function extractDominantColor(imageBuffer) {
  try {
    const { data, info } = await sharp(imageBuffer)
      .resize(5, 5, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const ch = info.channels || 3;
    const ci = 12 * ch;
    const r = data[ci], g = data[ci + 1], b = data[ci + 2];
    if (r === undefined || g === undefined || b === undefined) return 'neutral';
    return rgbToColorName(r, g, b);
  } catch (e) {
    return 'neutral';
  }
}

/**
 * RGB to color name using HSL
 */
function rgbToColorName(r, g, b) {
  const red = r / 255, green = g / 255, blue = b / 255;
  const max = Math.max(red, green, blue), min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min || (max - min) < 0.1) {
    if (lightness < 0.3) return 'black';
    if (lightness > 0.8) return 'white';
    return 'gray';
  }

  const saturation = (max - min) / (1 - Math.abs(2 * lightness - 1));
  let hue;
  if (max === red) hue = ((green - blue) / (max - min) + (green < blue ? 6 : 0)) / 6;
  else if (max === green) hue = ((blue - red) / (max - min) + 2) / 6;
  else hue = ((red - green) / (max - min) + 4) / 6;

  if (hue >= 0.02 && hue <= 0.12 && lightness < 0.45 && saturation < 0.7) return 'brown';
  if (hue < 0.05 || hue >= 0.95) return 'red';
  if (hue < 0.12) return 'orange';
  if (hue < 0.18) return 'yellow';
  if (hue < 0.35) return 'green';
  if (hue < 0.55) return 'cyan';
  if (hue < 0.72) return 'blue';
  if (hue < 0.82) return 'purple';
  if (hue < 0.92) return 'pink';
  return 'red';
}

exports.generateOutfitWithAI = async (wardrobeItems, weather, occasion) => {
  if (!hf) return null;
  try {
    const inventory = wardrobeItems.map(i => `- ID: "${i._id.toString()}", Type: ${i.type}, Color: ${i.color}, Subcategory: ${i.category}`).join('\n');
    const weatherData = weather ? `${weather.temp}°C, ${weather.condition}` : 'Unknown';
    const occData = occasion || 'casual';
    
    const prompt = `[INST] You are an expert AI fashion stylist. 
Create exactly ONE complete outfit using ONLY the items listed below.
Conditions: ${weatherData} for a ${occData} occasion.

Item Inventory:
${inventory}

Rules:
1. Provide exactly ONE top, ONE bottom (or one fullBody instead of top & bottom).
2. Optionally add outerwear, footwear, accessory.
3. Output strictly valid JSON. 
4. The keys must be exactly: "topId", "bottomId", "fullBodyId", "outerwearId", "footwearId", "accessoryId", "reasoning". If an item is not selected, its value must be null. 
5. Output ONLY the JSON block. Do not include markdown codeblocks or text like 'Here is the JSON...'. [/INST]`;

    const result = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.1,
        return_full_text: false
      }
    });

    const rawText = result.generated_text;
    const jsonStart = rawText.indexOf('{');
    const jsonEnd = rawText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd >= jsonStart) {
      const jsonStr = rawText.substring(jsonStart, jsonEnd + 1);
      return JSON.parse(jsonStr);
    }
    return null;
  } catch (err) {
    console.error('Failure in generateOutfitWithAI:', err.message);
    return null;
  }
};

const sharp = require('sharp');

const { HfInference } = require('@huggingface/inference');

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const hf = HF_API_KEY ? new HfInference(HF_API_KEY) : null;
const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224';

if (!HF_API_KEY) {
  console.warn('⚠️  HUGGINGFACE_API_KEY is not set in .env');
}

// Comprehensive ImageNet label → clothing type mapping
// vit-base-patch16-224 uses ImageNet-1K labels — these are ALL the clothing-related ones
const labelToType = {
  // Direct clothing labels in ImageNet
  'jersey': 't-shirt',
  't-shirt': 't-shirt',
  'suit': 'jacket',
  'jean': 'pants',
  'bow tie': 'accessories',
  'brassiere': 'shirt',
  'swimsuit': 'dress',
  'bikini': 'dress',
  'miniskirt': 'skirt',
  'overskirt': 'skirt',
  'hoopskirt': 'skirt',
  'sarong': 'skirt',
  'cardigan': 'sweater',
  'fur coat': 'jacket',
  'trench coat': 'jacket',
  'lab coat': 'jacket',
  'cloak': 'jacket',
  'poncho': 'jacket',
  'military uniform': 'jacket',
  'abaya': 'kurta',
  'academic gown': 'kurta',
  'stole': 'accessories',
  'feather boa': 'accessories',
  'pajama': 'kurta',
  'running shoe': 'shoes',
  'Loafer': 'shoes',
  'sandal': 'shoes',
  'clog': 'shoes',
  'cowboy boot': 'shoes',
  'boot': 'shoes',
  'sombrero': 'cap',
  'cowboy hat': 'cap',
  'bonnet': 'cap',
  'mortarboard': 'cap',
  'shower cap': 'cap',
  'bathing cap': 'cap',
  'football helmet': 'cap',
  'crash helmet': 'cap',
  'sunglasses': 'sunglasses',
  'sunglass': 'sunglasses',
  'neck brace': 'accessories',
  'necklace': 'accessories',
  'bib': 'accessories',
  'maillot': 'shirt',
  'tank suit': 'shirt',
  'sweatshirt': 'sweater',
  'hosiery': 'pants',
  'sock': 'accessories',
  'handkerchief': 'accessories',
  'diaper': 'other',
  'apron': 'other',
  'vestment': 'kurta',
  'kimono': 'kurta',
  'digital watch': 'watch',
  'stopwatch': 'watch',
  'magnetic compass': 'watch',
  'buckle': 'belt',
};

// Keyword-based fallback detection (partial match)
const keywordToType = [
  { keywords: ['t-shirt', 'tshirt', 'tee'], type: 't-shirt' },
  { keywords: ['shirt', 'polo', 'blouse', 'jersey', 'maillot', 'tank'], type: 'shirt' },
  { keywords: ['pant', 'jean', 'trouser', 'shorts', 'legging', 'hosiery'], type: 'pants' },
  { keywords: ['dress', 'gown', 'swimsuit', 'bikini'], type: 'dress' },
  { keywords: ['skirt', 'sarong'], type: 'skirt' },
  { keywords: ['jacket', 'coat', 'blazer', 'suit', 'cloak', 'poncho', 'uniform', 'parka', 'windbreaker', 'leather', 'denim jacket', 'cardigan', 'shacket', 'bomber'], type: 'jacket' },
  { keywords: ['sweater', 'sweatshirt', 'hoodie', 'pullover', 'fleece', 'jumper'], type: 'sweater' },
  { keywords: ['shoe', 'boot', 'sneaker', 'loafer', 'sandal', 'clog', 'slipper', 'heel'], type: 'shoes' },
  { keywords: ['watch', 'wristwatch', 'clock'], type: 'watch' },
  { keywords: ['belt', 'buckle'], type: 'belt' },
  { keywords: ['sunglasses', 'sunglass', 'glasses'], type: 'sunglasses' },
  { keywords: ['hat', 'cap', 'bonnet', 'helmet', 'sombrero', 'beret', 'turban'], type: 'cap' },
  { keywords: ['bag', 'purse', 'wallet', 'backpack', 'handbag', 'clutch'], type: 'accessories' },
  { keywords: ['tie', 'bow', 'scarf', 'necklace', 'brace', 'sock', 'glove'], type: 'accessories' },
  { keywords: ['kurta', 'salwar', 'sherwani', 'dhoti', 'lungi', 'tunic', 'robe', 'abaya', 'vestment', 'kimono', 'pajama', 'kameez', 'churidar'], type: 'kurta' },
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
 * Classify clothing from HF labels
 */
function classifyFromLabels(results) {
  if (!results || results.length === 0) return { type: 'other', confidence: 0, labels: [] };

  // 1. Try exact label match first
  for (const result of results) {
    const label = result.label.toLowerCase().trim();
    // Check each part of multi-word labels like "jean, blue jean, denim"
    const parts = label.split(',').map(p => p.trim());
    for (const part of parts) {
      if (labelToType[part]) {
        return {
          type: labelToType[part],
          confidence: result.score,
          labels: results.slice(0, 5).map(r => r.label)
        };
      }
    }
  }

  // 2. Try keyword matching across all results
  for (const result of results.slice(0, 10)) {
    const label = result.label.toLowerCase();
    for (const { keywords, type } of keywordToType) {
      if (keywords.some(kw => label.includes(kw))) {
        return {
          type,
          confidence: result.score,
          labels: results.slice(0, 5).map(r => r.label)
        };
      }
    }
  }

  // 3. No clothing detected
  return {
    type: 'other',
    confidence: results[0]?.score || 0,
    labels: results.slice(0, 5).map(r => r.label)
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

    // 2. Classify with HuggingFace API (direct fetch — bypasses broken library)
    if (!HF_API_KEY) {
      errorMsg = 'HUGGINGFACE_API_KEY not configured';
    } else {
      try {
        console.log('🤖 Classifying image with ViT...');

        const response = await fetch(HF_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/octet-stream'
          },
          body: imageBuffer
        });

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`HF API ${response.status}: ${errBody}`);
        }

        const results = await response.json();
        console.log('📋 Raw HF results:', results.slice(0, 5).map(r => `${r.label} (${(r.score*100).toFixed(1)}%)`).join(', '));

        const classified = classifyFromLabels(results);
        detectedType = classified.type;
        confidence = classified.confidence;
        detectedLabels = classified.labels;
        category = typeToCategory[detectedType] || 'casual';

        console.log(`👕 Detected: ${detectedType} | Category: ${category} | Confidence: ${(confidence * 100).toFixed(1)}%`);

      } catch (hfErr) {
        console.error('❌ HF API Error:', hfErr.message);
        errorMsg = hfErr.message;
      }
    }

    return { type: detectedType, color: dominantColor, category, confidence, detectedLabels, ...(errorMsg && { error: errorMsg }) };
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

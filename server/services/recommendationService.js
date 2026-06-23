/**
 * Recommendation Service
 * Scores wardrobe items based on weather, occasion, color harmony, and user preferences.
 */
const aiService = require('./aiService');

// Define item types for outfit assembly
const TOPS = ['shirt', 't-shirt', 'sweater', 'kurta']; // Added kurta and t-shirt as a top here
const BOTTOMS = ['pants', 'skirt'];
const OUTERWEAR = ['jacket'];
const FULL_BODY = ['dress'];
const FOOTWEAR = ['shoes'];
const ACCESSORIES = ['watch', 'belt', 'sunglasses', 'cap', 'accessories'];

/**
 * Get occasion-specific scoring
 * @param {Object} item - Clothing item
 * @param {String} occasion - casual, formal, trendy, sporty, festival, cozy, romantic, auto
 * @returns {Object} { score, reasons }
 */
function getOccasionScore(item, occasion) {
  const reasons = [];
  let score = 0;

  // Map of categories to moods/occasions they fit
  const categoryToMood = {
    'casual': ['casual', 'cozy', 'trendy'],
    'formal': ['formal', 'romantic'],
    'sports': ['sporty'],
    'ethnic': ['festival', 'romantic'],
    'sleepwear': []
  };

  switch (occasion) {
    case 'formal':
      if (['shirt', 't-shirt', 'pants', 'jacket', 'dress'].includes(item.type)) {
        score = 25;
        reasons.push('Professional & polished');
      } else if (item.category === 'formal') {
        score = 25;
        reasons.push('Formal attire');
      } else if (item.type === 'sweater' && ['black', 'navy', 'gray'].includes(item.color?.toLowerCase())) {
        score = 15;
        reasons.push('Works with formal wear');
      }
      break;

    case 'casual':
      if (item.category === 'casual' || item.category === 'sports') {
        score = 25;
        reasons.push('Perfect for casual day');
      } else if (['jeans', 't-shirt', 'sneakers'].includes(item.type?.toLowerCase())) {
        score = 20;
        reasons.push('Casual & comfortable');
      } else if (item.type === 'shirt' || item.type === 'sweater') {
        score = 15;
      }
      break;

    case 'trendy':
      if (item.category === 'trendy' || item.category === 'ethnic') {
        score = 25;
        reasons.push('Fashion forward');
      } else if (!['black', 'white', 'gray'].includes(item.color?.toLowerCase())) {
        score = 15;
        reasons.push('Bold & stylish');
      } else if (item.type === 'dress' || item.type === 'kurta') {
        score = 12;
        reasons.push('Eye-catching piece');
      }
      break;

    case 'sporty':
      if (item.category === 'sports' || item.type?.toLowerCase().includes('track')) {
        score = 30;
        reasons.push('Perfect for sports');
      } else if (['sweater', 'pants', 'shoes'].includes(item.type)) {
        score = 15;
        reasons.push('Athleisure-friendly');
      }
      break;

    case 'festival':
      if (item.category === 'ethnic' || item.type === 'kurta') {
        score = 35;
        reasons.push('Perfect for festival');
      } else if (!['black', 'white', 'brown'].includes(item.color?.toLowerCase())) {
        score = 15;
        reasons.push('Festive colors');
      } else if (item.category === 'formal') {
        score = 10;
        reasons.push('Can work with ethnic wear');
      }
      break;

    case 'cozy':
      if (['sweater', 'pants', 'jacket'].includes(item.type)) {
        score = 25;
        reasons.push('Warm & comfortable');
      } else if (['black', 'brown', 'gray', 'navy'].includes(item.color?.toLowerCase())) {
        score = 15;
        reasons.push('Cozy earth tones');
      } else if (item.category === 'casual') {
        score = 12;
      }
      break;

    case 'romantic':
      if (item.category === 'ethnic' || item.type === 'dress') {
        score = 25;
        reasons.push('Elegant & charming');
      } else if (['pink', 'red', 'burgundy', 'rose'].includes(item.color?.toLowerCase())) {
        score = 20;
        reasons.push('Romantic hues');
      } else if (item.type === 'sweater' && !['bright red', 'lime'].includes(item.color?.toLowerCase())) {
        score = 12;
      }
      break;

    case 'auto':
    default:
      // Default scoring - favor category match
      if (item.category === 'casual' || item.category === 'formal') {
        score = 15;
        reasons.push(`Good ${item.category} piece`);
      }
      break;
  }

  return { score: Math.max(0, Math.min(35, score)), reasons };
}

/**
 * Generate an outfit recommendation
 * @param {Array} wardrobe - Array of user's clothing items
 * @param {Object} weather - Weather object { temp, condition }
 * @param {String} occasion - 'casual', 'formal', 'festival', 'sports', 'sleepwear'
 * @param {Object} preferences - User preferences { style, favoriteColors: [] }
 * @param {Array} recentHistory - Array of recently worn outfits
 * @returns {Object} Recommended outfit and reasoning
 */
exports.recommendOutfit = async (wardrobe, weather, occasion = 'casual', preferences = {}, recentHistory = [], userGender = 'other') => {
  if (!wardrobe || wardrobe.length === 0) {
    return { error: 'Your wardrobe is empty. Please upload some clothes first!' };
  }

  // Attempt Generative AI recommendation first
  try {
    const aiResult = await aiService.generateOutfitWithAI(wardrobe, weather, occasion);
    if (aiResult && (aiResult.topId || aiResult.fullBodyId)) {
      const top = wardrobe.find(i => i._id.toString() === aiResult.topId);
      const bottom = wardrobe.find(i => i._id.toString() === aiResult.bottomId);
      const outerwear = wardrobe.find(i => i._id.toString() === aiResult.outerwearId);
      const fullBody = wardrobe.find(i => i._id.toString() === aiResult.fullBodyId);
      const footwear = wardrobe.find(i => i._id.toString() === aiResult.footwearId);
      const accessory = wardrobe.find(i => i._id.toString() === aiResult.accessoryId);
      
      const isValidTopBottom = top && bottom && !fullBody;
      const isValidFullBody = fullBody && !top && !bottom;
      
      if (isValidTopBottom || isValidFullBody) {
        return {
          type: isValidTopBottom ? 'two-piece' : 'one-piece',
          top: top || undefined,
          bottom: bottom || undefined,
          fullBody: fullBody || undefined,
          outerwear: outerwear || undefined,
          footwear: footwear || undefined,
          accessories: accessory ? [accessory] : undefined,
          score: 100,
          reasonText: aiResult.reasoning || `Styled by AI for a ${occasion} day at ${weather?.temp}°C.`,
          shoppingSuggestions: []
        };
      }
    }
  } catch(e) {
    console.log("Generative AI Outfit generator skipped or failed:", e.message);
  }

  // Filter wardrobe by gender compatibility
  const filteredWardrobe = wardrobe.filter(item => {
    if (userGender === 'other') return true;
    return !item.gender || item.gender === 'unisex' || item.gender === userGender;
  });

  // 1. Separate wardrobe into categories
  const itemsByCategory = {
    tops: filteredWardrobe.filter(item => TOPS.includes(item.type) && item.category !== 'sleepwear'),
    bottoms: filteredWardrobe.filter(item => BOTTOMS.includes(item.type)),
    outerwear: filteredWardrobe.filter(item => OUTERWEAR.includes(item.type)),
    fullBody: filteredWardrobe.filter(item => FULL_BODY.includes(item.type)),
    footwear: filteredWardrobe.filter(item => FOOTWEAR.includes(item.type)),
    accessories: filteredWardrobe.filter(item => ACCESSORIES.includes(item.type))
  };

  // If festival, handle specially: kurta can act as full body or top depending on bottom availability
  if (occasion === 'festival') {
     const kurtas = itemsByCategory.tops.filter(i => i.type === 'kurta');
     if(kurtas.length > 0) {
        itemsByCategory.fullBody.push(...kurtas); // Consider kurtas as full body for simplicity in ethnic wear
     }
  }

  // 2. Score all items
  const now = new Date();
  const scoredItems = wardrobe.map(item => {
    let score = 0;
    const reasons = [];

    // --- Repetition Penalty (Max -30) ---
    // Check if item was worn recently
    const wornHistory = recentHistory.filter(h => 
      (h.top && h.top.toString() === item._id.toString()) ||
      (h.bottom && h.bottom.toString() === item._id.toString()) ||
      (h.outerwear && h.outerwear.toString() === item._id.toString()) ||
      (h.fullBody && h.fullBody.toString() === item._id.toString()) ||
      (h.footwear && h.footwear.toString() === item._id.toString())
    );

    if (wornHistory.length > 0) {
      // Find the most recent time it was worn
      wornHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
      const daysAgo = Math.floor((now - new Date(wornHistory[0].date)) / (1000 * 60 * 60 * 24));
      
      if (daysAgo === 0) {
        score -= 30; // Worn today/yesterday, huge penalty
        reasons.push('You just wore this!');
      } else if (daysAgo <= 3) {
        score -= 15;
        reasons.push('Worn recently');
      } else if (daysAgo <= 7) {
        score -= 5;
      }
    }

    // --- Weather Score (Max 30) ---
    let weatherScore = 15; // Base neutral score
    if (weather.temp > 30) { // Hot
      if (['jacket', 'sweater'].includes(item.type)) { weatherScore -= 10; reasons.push('Too warm for this weather'); }
      else if (item.type === 'shirt' || item.type === 'skirt') { weatherScore += 10; reasons.push('Good for hot weather'); }
      if (['black', 'dark blue', 'brown'].includes(item.color?.toLowerCase())) { weatherScore -= 5; } // Penalize dark colors
      if (['white', 'light blue', 'yellow', 'pink'].includes(item.color?.toLowerCase())) { weatherScore += 5; }
      if (['sunglasses', 'cap'].includes(item.type)) { weatherScore += 15; reasons.push('Crucial for sunny weather'); }
    } else if (weather.temp < 20) { // Cold
      if (['jacket', 'sweater'].includes(item.type)) { weatherScore += 15; reasons.push('Good for cold weather'); }
      if (item.type === 'skirt') { weatherScore -= 5; }
      if (['black', 'brown', 'dark green', 'navy'].includes(item.color?.toLowerCase())) { weatherScore += 5; } // Boost dark colors
    } else { // Moderate
      if (item.type === 'jacket') weatherScore -= 5; // Maybe not needed
      else weatherScore += 5;
    }

    if (weather.condition === 'rain' || weather.condition === 'snow') {
      if (item.color?.toLowerCase() === 'white') { weatherScore -= 10; reasons.push('Avoid white in rain/snow'); }
      if (item.type === 'jacket') { weatherScore += 10; reasons.push('Good protection for weather'); }
    }
    score += Math.max(0, Math.min(30, weatherScore));

    // --- Occasion Score (Max 35) ---
    let occasionScore = getOccasionScore(item, occasion);
    if (occasionScore.score > 0) {
      score += occasionScore.score;
      reasons.push(...occasionScore.reasons);
    }

    // --- AI Learning Score Modifier ---
    if (item.aiScoreModifier) {
      score += item.aiScoreModifier;
      if (item.aiScoreModifier >= 10) {
        reasons.push('We know you love this item! 👍');
      }
    }

    // --- User Preferences Score (Max 15) ---
    let prefScore = 0;
    if (preferences.favoriteColors && preferences.favoriteColors.some(c => item.color?.toLowerCase().includes(c.toLowerCase()))) {
      prefScore += 10;
      reasons.push('Matches your favorite color');
    }
    if (preferences.style === item.category) {
      prefScore += 5;
    }
    score += prefScore;

    return { item, score, reasons };
  });

  // Group scored items
  const scoredTops = scoredItems.filter(s => itemsByCategory.tops.some(i => i._id.toString() === s.item._id.toString())).sort((a,b)=>b.score - a.score);
  const scoredBottoms = scoredItems.filter(s => itemsByCategory.bottoms.some(i => i._id.toString() === s.item._id.toString())).sort((a,b)=>b.score - a.score);
  const scoredOuterwear = scoredItems.filter(s => itemsByCategory.outerwear.some(i => i._id.toString() === s.item._id.toString())).sort((a,b)=>b.score - a.score);
  const scoredFullBody = scoredItems.filter(s => itemsByCategory.fullBody.some(i => i._id.toString() === s.item._id.toString())).sort((a,b)=>b.score - a.score);
  const scoredFootwear = scoredItems.filter(s => itemsByCategory.footwear.some(i => i._id.toString() === s.item._id.toString())).sort((a,b)=>b.score - a.score);
  const scoredAccessories = scoredItems.filter(s => itemsByCategory.accessories.some(i => i._id.toString() === s.item._id.toString())).sort((a,b)=>b.score - a.score);


  // 3. Assemble Outfit combinations
  const candidateOutfits = [];

  // Option A: Two-piece (Top + Bottom + optional Outerwear)
  if (scoredTops.length > 0 && scoredBottoms.length > 0) {
    for (let i = 0; i < Math.min(3, scoredTops.length); i++) {
      for (let j = 0; j < Math.min(3, scoredBottoms.length); j++) {
        const top = scoredTops[i];
        const bottom = scoredBottoms[j];
        
        let colorHarmonyScore = calculateColorHarmony(top.item.color, bottom.item.color);
        let styleHarmonyScore = calculateStyleHarmony(top.item, bottom.item);
        
        let totalScore = top.score + bottom.score + (colorHarmonyScore * 2) + (styleHarmonyScore * 1.5); 
        
        // Disqualify explicitly terrible matches from getting recommended entirely unless nothing else exists
        if (totalScore < 0 && scoredTops.length > 3 && scoredBottoms.length > 3) continue;

        let outfit = {
          type: 'two-piece',
          top: top.item,
          bottom: bottom.item,
          score: totalScore,
          reasons: [...new Set([...top.reasons, ...bottom.reasons])], // Unique reasons
          colorHarmony: colorHarmonyScore,
          styleHarmony: styleHarmonyScore
        };

        // Add outerwear if weather is cold or raining
        if ((weather.temp < 20 || weather.condition === 'rain') && scoredOuterwear.length > 0) {
          const outerwear = scoredOuterwear[0];
          outfit.outerwear = outerwear.item;
          outfit.score += outerwear.score * 0.5; // Don't let outerwear dominate the score
          outfit.reasons.push(...outerwear.reasons);
        }

        if (scoredFootwear.length > 0) outfit.footwear = scoredFootwear[0].item;
        if (scoredAccessories.length > 0) {
           outfit.accessories = [scoredAccessories[0].item];
           outfit.score += scoredAccessories[0].score * 0.25; 
           outfit.reasons.push('Elevated with accessories');
        }
        
        candidateOutfits.push(outfit);
      }
    }
  }

  // Option B: One-piece (Dress / Kurta)
  if (scoredFullBody.length > 0) {
    for (let i = 0; i < Math.min(3, scoredFullBody.length); i++) {
      const full = scoredFullBody[i];
      let outfit = {
        type: 'one-piece',
        fullBody: full.item,
        score: full.score * 2.2, // Boost to compete with top+bottom combined score
        reasons: full.reasons,
        colorHarmony: 10 // Inherently harmonious
      };

      if (weather.temp < 20 && scoredOuterwear.length > 0) {
        outfit.outerwear = scoredOuterwear[0].item;
        outfit.score += scoredOuterwear[0].score * 0.5;
        let harmony = calculateColorHarmony(full.item.color, outfit.outerwear.color);
        outfit.colorHarmony = harmony;
        outfit.score += harmony;
      }
      if (scoredFootwear.length > 0) outfit.footwear = scoredFootwear[0].item;
      if (scoredAccessories.length > 0) {
           outfit.accessories = [scoredAccessories[0].item];
           outfit.score += scoredAccessories[0].score * 0.25;
           outfit.reasons.push('Elevated with accessories');
      }

      candidateOutfits.push(outfit);
    }
  }

  // 4. Select Best Outfit & Analyze Wardrobe Gaps for Shopping
  let shoppingSuggestions = [];
  
  // Helper to generate gender-specific affiliate links
  const getLink = (category) => {
    const prefix = userGender === 'male' ? 'men-' : (userGender === 'female' ? 'women-' : '');
    return `https://www.myntra.com/${prefix}${category}`;
  };

  if (candidateOutfits.length === 0) {
    if (scoredTops.length === 0 && scoredFullBody.length === 0) {
      shoppingSuggestions.push({
        type: 'tops',
        title: 'Shop for Tops & Shirts',
        reason: 'Your wardrobe needs more tops to create complete outfits.',
        link: getLink('shirts')
      });
    }
    if (scoredBottoms.length === 0 && scoredFullBody.length === 0) {
      shoppingSuggestions.push({
        type: 'bottoms',
        title: 'Shop for Jeans & Trousers',
        reason: 'You need bottoms to complete your look.',
        link: getLink('trousers')
      });
    }

    // Fallback: Just return whatever we have highest scored (pick randomly from top 3 to add variety)
    if (scoredTops.length > 0) {
      const topChoices = scoredTops.slice(0, 3);
      const randomTop = topChoices[Math.floor(Math.random() * topChoices.length)];
      return { partial: true, top: randomTop.item, reasonText: "Not enough items for a full outfit.", shoppingSuggestions };
    }
    if (scoredBottoms.length > 0) {
      const bottomChoices = scoredBottoms.slice(0, 3);
      const randomBottom = bottomChoices[Math.floor(Math.random() * bottomChoices.length)];
      return { partial: true, bottom: randomBottom.item, reasonText: "Not enough items for a full outfit.", shoppingSuggestions };
    }
    
    // Completely empty active wardrobe (all donated or none matching)
    return { 
      error: 'Could not generate an outfit with current wardrobe items.',
      shoppingSuggestions: [
        { type: 'tops', title: 'Shop Tops', reason: 'Start your wardrobe with some basic tops.', link: getLink('tshirts') },
        { type: 'bottoms', title: 'Shop Bottoms', reason: 'Add some versatile jeans or trousers.', link: getLink('jeans') }
      ]
    };
  }

  // Sort by highest score
  candidateOutfits.sort((a, b) => b.score - a.score);
  
  // Pick randomly from the top 3 outfits that are within 10 points of the best score
  const highestScore = candidateOutfits[0].score;
  const topCandidates = candidateOutfits.filter(o => o.score >= highestScore - 10).slice(0, 3);
  const bestOutfit = topCandidates[Math.floor(Math.random() * topCandidates.length)];

  // Check if outfit is missing outerwear in cold weather
  if (weather.temp < 20 && !bestOutfit.outerwear) {
    shoppingSuggestions.push({
      type: 'outerwear',
      title: 'Shop Winter Jackets',
      reason: 'It is cold outside, but we could not find a suitable jacket in your wardrobe!',
      link: getLink('jackets')
    });
  }

  // Universal Monetization: If they have a perfect outfit, UPSELL accessories!
  if (shoppingSuggestions.length === 0) {
    if (occasion === 'formal') {
      shoppingSuggestions.push({
        type: 'accessory',
        title: 'Elevate with a Premium Watch',
        reason: 'A perfect formal outfit is incomplete without a classic timepiece.',
        link: 'https://www.myntra.com/watches'
      });
    } else if (occasion === 'festival') {
      shoppingSuggestions.push({
        type: 'footwear',
        title: 'Shop Ethnic Footwear',
        reason: 'Pair your ethnic wear with traditional Mojaris or Kolhapuris.',
        link: 'https://www.myntra.com/ethnic-shoes'
      });
    } else if (weather.temp > 28) {
      shoppingSuggestions.push({
        type: 'accessory',
        title: 'Trendy Sunglasses',
        reason: 'It is sunny outside! Protect your eyes and look stylish.',
        link: 'https://www.myntra.com/sunglasses'
      });
    } else {
      shoppingSuggestions.push({
        type: 'footwear',
        title: 'Fresh Sneakers',
        reason: 'Upgrade your casual look with the latest trending sneakers.',
        link: 'https://www.myntra.com/sneakers'
      });
    }
  }

  // Generate final reasoning string
  let finalReason = `Designed for ${weather.temp}°C ${weather.condition} and requested occasion (${occasion}). `;
  
  if (bestOutfit.styleHarmony === 15) finalReason += 'The pieces share a flawless styling sync. ';
  else if (bestOutfit.styleHarmony <= -15) finalReason += 'This is an avant-garde, rule-bending silhouette. ';
  else if (bestOutfit.styleHarmony >= 5) finalReason += 'Provides excellent smart-casual or athleisure contrast. ';

  if (bestOutfit.colorHarmony >= 12) finalReason += 'The tones anchor each other classically. ';
  else if (bestOutfit.colorHarmony >= 8) finalReason += 'Colors are beautifully analogous and cohesive. ';
  else if (bestOutfit.colorHarmony <= 0) finalReason += 'A very bold, experimental high-contrast block. ';
  
  if (bestOutfit.reasons && bestOutfit.reasons.length > 0) {
     const uniqueReasons = [...new Set(bestOutfit.reasons)].filter(r => r);
     if(uniqueReasons.length > 0){
        finalReason += `Highlights: ${uniqueReasons.slice(0,2).join(', ')}.`;
     }
  }

  bestOutfit.reasonText = finalReason;
  if (shoppingSuggestions.length > 0) bestOutfit.shoppingSuggestions = shoppingSuggestions;
  
  return bestOutfit;
};

/**
 * Calculate Occasion/Category Harmony
 * Ensures formal items aren't blindly mixed with sports items unless athleisure.
 * @returns {Number} harmony score (-15 to 15)
 */
function calculateStyleHarmony(item1, item2) {
  if (!item1 || !item2) return 0;
  
  const cat1 = item1.category?.toLowerCase() || 'casual';
  const cat2 = item2.category?.toLowerCase() || 'casual';

  if (cat1 === cat2) return 15; // Perfect match

  const clashes = [
    ['sports', 'formal'],
    ['sports', 'ethnic'],
    ['sleepwear', 'formal'],
    ['sleepwear', 'ethnic'],
    ['sleepwear', 'sports'],
    ['sleepwear', 'casual']
  ];

  for (let clash of clashes) {
    if ((cat1 === clash[0] && cat2 === clash[1]) || (cat1 === clash[1] && cat2 === clash[0])) {
      return -20; // Heavy penalty for clashing styles (e.g. gym shorts with a tuxedo)
    }
  }

  // Acceptable mixes
  if ((cat1 === 'casual' && cat2 === 'sports') || (cat1 === 'sports' && cat2 === 'casual')) return 8; // Athleisure
  if ((cat1 === 'casual' && cat2 === 'formal') || (cat1 === 'formal' && cat2 === 'casual')) return 5; // Smart casual
  if ((cat1 === 'casual' && cat2 === 'ethnic') || (cat1 === 'ethnic' && cat2 === 'casual')) return 2; // Indo-western

  return -5; // Default slight penalty for disjointed styles
}

/**
 * Advanced Color Harmony Scorer (-10 to 15)
 * Uses high-end color wheel principles: Complementary, Analogous, Monochromatic, Neutral bridging.
 */
function calculateColorHarmony(color1, color2) {
  if (!color1 || !color2) return 5;
  const c1 = color1.toLowerCase();
  const c2 = color2.toLowerCase();
  
  if (c1 === c2) return 10; // Monochromatic (Safe & Stylish)

  const colorProfiles = {
    pureBlack: ['black'],
    pureWhite: ['white'],
    neutrals: ['gray', 'grey', 'beige', 'cream', 'tan', 'neutral', 'silver', 'khaki'],
    warm: ['red', 'orange', 'yellow', 'pink', 'burgundy', 'maroon', 'rust', 'peach', 'gold', 'mustard'],
    cool: ['blue', 'green', 'teal', 'navy', 'purple', 'cyan', 'indigo', 'olive', 'mint', 'turquoise'],
    browns: ['brown', 'chocolate', 'mocha']
  };

  const getProfile = (c) => {
    if (colorProfiles.pureBlack.some(n => c.includes(n))) return 'pureBlack';
    if (colorProfiles.pureWhite.some(n => c.includes(n))) return 'pureWhite';
    if (colorProfiles.neutrals.some(n => c.includes(n))) return 'neutrals';
    if (colorProfiles.warm.some(n => c.includes(n))) return 'warm';
    if (colorProfiles.cool.some(n => c.includes(n))) return 'cool';
    if (colorProfiles.browns.some(n => c.includes(n))) return 'browns';
    return 'unknown';
  };

  const p1 = getProfile(c1);
  const p2 = getProfile(c2);

  // Black rules
  if (p1 === 'pureBlack' || p2 === 'pureBlack') {
    const other = p1 === 'pureBlack' ? p2 : p1;
    if (other === 'pureWhite') return 15; // Classic
    if (other === 'browns' || (colorProfiles.cool.some(n => (p1 === 'pureBlack' ? c2 : c1).includes(n)) && (p1 === 'pureBlack' ? c2 : c1).includes('navy'))) return -10; // Black + Navy/Brown clash
    return 10; // Black + almost anything else
  }

  // White rules
  if (p1 === 'pureWhite' || p2 === 'pureWhite') {
    const other = p1 === 'pureWhite' ? p2 : p1;
    if (other === 'pureWhite' || other === 'neutrals' || other === 'browns') return 12;
    return 10; // White anchors everything
  }

  // Double Neutrals
  if ((p1 === 'neutrals' && p2 === 'neutrals') || (p1 === 'browns' && p2 === 'neutrals') || (p2 === 'browns' && p1 === 'neutrals')) return 12;

  // Neutral anchoring a color
  if (p1 === 'neutrals' || p2 === 'neutrals' || p1 === 'browns' || p2 === 'browns') {
    return 8;
  }

  // Analogous (Warm + Warm OR Cool + Cool)
  if (p1 === 'warm' && p2 === 'warm') {
    if ((c1.includes('red') && c2.includes('pink')) || (c1.includes('pink') && c2.includes('red'))) return -5; // Harsh clash
    return 6;
  }
  
  if (p1 === 'cool' && p2 === 'cool') {
    return 8; // Cool analogous (e.g. blue + green) generally works well
  }

  // Complementary (Warm + Cool)
  if ((p1 === 'warm' && p2 === 'cool') || (p1 === 'cool' && p2 === 'warm')) {
    // Bad clashes
    if ((c1.includes('red') && c2.includes('green')) || (c1.includes('green') && c2.includes('red'))) return -10; 
    if ((c1.includes('orange') && c2.includes('purple')) || (c1.includes('purple') && c2.includes('orange'))) return -8;
    
    // Good complements
    if (c1.includes('yellow') && c2.includes('purple') || c2.includes('yellow') && c1.includes('purple')) return 12;
    if (c1.includes('orange') && c2.includes('blue') || c2.includes('orange') && c1.includes('blue')) return 10;
    if ((c1.includes('burgundy') && c2.includes('olive')) || (c1.includes('olive') && c2.includes('burgundy'))) return 15;
    
    return 0; // Risky territory
  }

  return 5;
}

/**
 * Recommendation Service v2.0
 * Smart outfit recommendations based on weather, occasion, color harmony,
 * time-of-day, season, user preferences, and repetition avoidance.
 */
const aiService = require('./aiService');

// ──────────────────────────────────────────────
// ITEM TYPE CATEGORIES
// ──────────────────────────────────────────────
const TOPS = ['shirt', 't-shirt', 'sweater', 'kurta'];
const BOTTOMS = ['pants', 'skirt'];
const OUTERWEAR = ['jacket'];
const FULL_BODY = ['dress'];
const FOOTWEAR = ['shoes'];
const ACCESSORIES = ['watch', 'belt', 'sunglasses', 'cap', 'accessories'];

// ──────────────────────────────────────────────
// SEASON DETECTION (India-specific)
// ──────────────────────────────────────────────
function getIndianSeason(month) {
  if (month >= 3 && month <= 5) return 'summer';      // Mar–May
  if (month >= 6 && month <= 9) return 'monsoon';      // Jun–Sep
  if (month >= 10 && month <= 11) return 'autumn';     // Oct–Nov
  return 'winter';                                      // Dec–Feb
}

const SEASON_COLOR_BOOST = {
  summer:  ['white', 'light blue', 'yellow', 'pink', 'cream', 'beige', 'pastel'],
  monsoon: ['navy', 'olive', 'brown', 'rust', 'maroon', 'dark green', 'teal'],
  autumn:  ['orange', 'brown', 'rust', 'burgundy', 'gold', 'mustard', 'olive'],
  winter:  ['black', 'gray', 'navy', 'burgundy', 'maroon', 'dark blue', 'charcoal']
};

const SEASON_TYPE_BOOST = {
  summer:  ['t-shirt', 'shirt', 'skirt', 'sunglasses', 'cap'],
  monsoon: ['jacket', 'shoes'],
  autumn:  ['sweater', 'jacket', 'shirt'],
  winter:  ['sweater', 'jacket']
};

// ──────────────────────────────────────────────
// TIME-OF-DAY AWARENESS
// ──────────────────────────────────────────────
function getTimeOfDay(hour) {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

const TIME_COLOR_BOOST = {
  morning:   ['white', 'light blue', 'yellow', 'pink', 'cream', 'pastel'],
  afternoon: ['blue', 'green', 'gray', 'beige', 'khaki'],
  evening:   ['black', 'navy', 'burgundy', 'maroon', 'dark blue', 'charcoal'],
  night:     ['black', 'gray', 'navy', 'dark green']
};

const TIME_LABELS = {
  morning:   { emoji: '🌅', label: 'Morning-fresh', tip: 'Light and bright colors work great in the morning' },
  afternoon: { emoji: '☀️', label: 'Afternoon-ready', tip: 'Comfortable and weather-appropriate pieces for the day' },
  evening:   { emoji: '🌆', label: 'Evening-polished', tip: 'Darker, more refined tones set the evening mood' },
  night:     { emoji: '🌙', label: 'Night-relaxed', tip: 'Cozy and comfortable for winding down' }
};

// ──────────────────────────────────────────────
// OCCASION SCORING
// ──────────────────────────────────────────────
function getOccasionScore(item, occasion) {
  const reasons = [];
  let score = 0;

  switch (occasion) {
    case 'formal':
      if (['shirt', 'pants', 'jacket', 'dress'].includes(item.type)) {
        score = 25; reasons.push('Professional & polished');
      } else if (item.category === 'formal') {
        score = 25; reasons.push('Formal attire');
      } else if (item.type === 'sweater' && ['black', 'navy', 'gray', 'charcoal'].includes(item.color?.toLowerCase())) {
        score = 15; reasons.push('Works with formal wear');
      } else if (['watch', 'belt'].includes(item.type)) {
        score = 20; reasons.push('Essential formal accessory');
      } else if (item.type === 'shoes') {
        score = 15; reasons.push('Completes the formal look');
      }
      // Penalize casual-only items in formal context
      if (item.type === 't-shirt') { score -= 10; reasons.push('Too casual for formal'); }
      break;

    case 'casual':
      if (item.category === 'casual' || item.category === 'sports') {
        score = 25; reasons.push('Perfect for a casual day');
      } else if (['t-shirt', 'shirt', 'sweater'].includes(item.type)) {
        score = 20; reasons.push('Casual & comfortable');
      } else if (item.type === 'shoes') {
        score = 15; reasons.push('Comfortable footwear');
      } else if (['sunglasses', 'cap', 'watch'].includes(item.type)) {
        score = 15; reasons.push('Nice casual accessory');
      }
      break;

    case 'trendy':
      if (!['black', 'white', 'gray'].includes(item.color?.toLowerCase())) {
        score = 20; reasons.push('Bold & fashion-forward');
      }
      if (item.type === 'dress' || item.type === 'kurta') {
        score = 18; reasons.push('Eye-catching statement piece');
      }
      if (['sunglasses', 'watch', 'belt'].includes(item.type)) {
        score = 15; reasons.push('Trendy accessory');
      }
      if (item.category === 'formal' && item.type === 'jacket') {
        score = 20; reasons.push('Structured layers add edge');
      }
      break;

    case 'sporty':
      if (item.category === 'sports') {
        score = 30; reasons.push('Perfect for an active day');
      } else if (['t-shirt', 'shoes'].includes(item.type)) {
        score = 20; reasons.push('Athleisure-friendly');
      } else if (['sweater', 'pants'].includes(item.type)) {
        score = 15; reasons.push('Works for casual sports');
      } else if (item.type === 'cap') {
        score = 15; reasons.push('Great sporty accessory');
      }
      break;

    case 'festival':
      if (item.type === 'kurta') {
        score = 35; reasons.push('Perfect festive ethnic wear');
      } else if (item.category === 'ethnic') {
        score = 30; reasons.push('Traditional & festive');
      } else if (['red', 'gold', 'maroon', 'orange', 'yellow', 'pink', 'green'].includes(item.color?.toLowerCase())) {
        score = 20; reasons.push('Vibrant festive colors');
      } else if (item.category === 'formal') {
        score = 12; reasons.push('Can blend with ethnic wear');
      }
      break;

    case 'cozy':
      if (['sweater', 'jacket'].includes(item.type)) {
        score = 25; reasons.push('Warm & snug');
      } else if (item.type === 'pants') {
        score = 20; reasons.push('Comfortable for lounging');
      } else if (['black', 'brown', 'gray', 'navy', 'cream', 'beige'].includes(item.color?.toLowerCase())) {
        score = 15; reasons.push('Cozy earth tones');
      } else if (item.category === 'casual') {
        score = 12; reasons.push('Relaxed vibes');
      }
      break;

    case 'romantic':
      if (item.type === 'dress') {
        score = 28; reasons.push('Elegant & charming');
      } else if (['pink', 'red', 'burgundy', 'rose', 'maroon', 'white', 'cream'].includes(item.color?.toLowerCase())) {
        score = 22; reasons.push('Romantic hues');
      } else if (item.category === 'formal') {
        score = 18; reasons.push('Sophisticated choice');
      } else if (['watch', 'belt'].includes(item.type)) {
        score = 15; reasons.push('Refined accessory');
      }
      break;

    case 'auto':
    default:
      if (item.category === 'casual' || item.category === 'formal') {
        score = 15;
        reasons.push(`Good ${item.category} piece`);
      }
      break;
  }

  return { score: Math.max(0, Math.min(35, score)), reasons };
}

// ──────────────────────────────────────────────
// WEATHER SCORING (Enhanced)
// ──────────────────────────────────────────────
function getWeatherScore(item, weather) {
  let score = 15; // Base neutral
  const reasons = [];
  const temp = weather.temp || 25;
  const humidity = weather.humidity || 50;
  const condition = (weather.condition || 'clear').toLowerCase();
  const color = (item.color || '').toLowerCase();

  // ── Temperature scoring (5 granular ranges) ──
  if (temp > 35) {
    // Extreme heat
    if (['jacket', 'sweater'].includes(item.type)) { score -= 15; reasons.push('Way too hot for layers'); }
    else if (['t-shirt', 'shirt'].includes(item.type)) { score += 12; reasons.push('Light & breathable for extreme heat'); }
    if (item.type === 'skirt') { score += 8; }
    if (['white', 'light blue', 'yellow', 'cream', 'beige', 'pink'].includes(color)) { score += 5; reasons.push('Light color reflects heat'); }
    if (['black', 'dark blue', 'brown'].includes(color)) { score -= 5; }
    if (['sunglasses', 'cap'].includes(item.type)) { score += 15; reasons.push('Essential sun protection'); }
  } else if (temp > 28) {
    // Hot
    if (['jacket', 'sweater'].includes(item.type)) { score -= 10; reasons.push('Too warm for this weather'); }
    else if (['t-shirt', 'shirt'].includes(item.type)) { score += 10; reasons.push('Good for warm weather'); }
    if (['white', 'light blue', 'yellow', 'pink'].includes(color)) { score += 5; }
    if (['sunglasses', 'cap'].includes(item.type)) { score += 12; reasons.push('Great for sunny weather'); }
  } else if (temp >= 20) {
    // Pleasant / moderate
    score += 5; // Everything works
    if (item.type === 'jacket') score -= 3; // Maybe not needed
    if (['shirt', 't-shirt', 'sweater'].includes(item.type)) { score += 5; reasons.push('Perfect temperature for this'); }
  } else if (temp >= 10) {
    // Cool
    if (['jacket', 'sweater'].includes(item.type)) { score += 15; reasons.push('Good for cool weather'); }
    if (item.type === 't-shirt') { score -= 8; reasons.push('Too light for cool weather'); }
    if (item.type === 'skirt') { score -= 5; }
    if (['black', 'brown', 'dark green', 'navy', 'maroon'].includes(color)) { score += 5; reasons.push('Rich tone for cool weather'); }
  } else {
    // Cold (<10°C)
    if (['jacket', 'sweater'].includes(item.type)) { score += 20; reasons.push('Essential for cold weather'); }
    if (['t-shirt'].includes(item.type)) { score -= 15; reasons.push('Too cold for this'); }
    if (item.type === 'skirt') { score -= 10; }
    if (['black', 'brown', 'navy', 'gray', 'charcoal'].includes(color)) { score += 5; }
  }

  // ── Humidity scoring ──
  if (humidity > 75) {
    // Very humid
    if (['jacket', 'sweater'].includes(item.type) && temp > 22) { score -= 8; reasons.push('Too heavy for humid weather'); }
    if (['t-shirt', 'shirt'].includes(item.type)) { score += 5; reasons.push('Breathable for high humidity'); }
    if (color === 'white') { score -= 3; } // Sweat shows
  } else if (humidity < 30) {
    // Very dry
    if (['sweater'].includes(item.type)) { score += 3; }
  }

  // ── Weather condition scoring ──
  if (condition === 'rainy' || condition === 'rain') {
    if (color === 'white') { score -= 10; reasons.push('Avoid white in rain'); }
    if (item.type === 'jacket') { score += 12; reasons.push('Good rain protection'); }
    if (['shoes'].includes(item.type)) { score += 5; reasons.push('Closed footwear for rain'); }
  }
  if (condition === 'clear' || condition === 'sunny') {
    if (['sunglasses', 'cap'].includes(item.type)) { score += 8; reasons.push('Perfect for clear skies'); }
  }

  return { score: Math.max(0, Math.min(35, score)), reasons };
}

// ──────────────────────────────────────────────
// COLOR HARMONY (Enhanced with Indian fashion combos)
// ──────────────────────────────────────────────
function calculateColorHarmony(color1, color2) {
  if (!color1 || !color2) return 5;
  const c1 = color1.toLowerCase();
  const c2 = color2.toLowerCase();

  if (c1 === c2) return 10; // Monochromatic

  // ── PREMIUM COMBOS (Fashion-forward pairings) ──
  const premiumCombos = [
    ['black', 'white', 15, 'Timeless monochrome contrast'],
    ['navy', 'beige', 14, 'Nautical elegance'],
    ['navy', 'cream', 14, 'Refined navy & cream'],
    ['olive', 'cream', 13, 'Earth-tone sophistication'],
    ['olive', 'beige', 13, 'Natural harmony'],
    ['burgundy', 'gold', 15, 'Royal Indian classic'],
    ['maroon', 'gold', 15, 'Festive grandeur'],
    ['maroon', 'beige', 13, 'Rich & grounded'],
    ['rust', 'blue', 12, 'Complementary warmth'],
    ['rust', 'navy', 12, 'Deep contrast pairing'],
    ['mustard', 'navy', 13, 'Bold modern combo'],
    ['teal', 'cream', 12, 'Fresh & elegant'],
    ['charcoal', 'white', 14, 'Sharp & clean'],
    ['gray', 'pink', 12, 'Soft modern mix'],
    ['blue', 'white', 13, 'Classic freshness'],
    ['brown', 'cream', 12, 'Warm earth pairing'],
    ['black', 'red', 12, 'Bold & powerful'],
    ['white', 'blue', 13, 'Clean & crisp'],
    ['black', 'gold', 13, 'Luxurious contrast'],
  ];

  for (const [a, b, score, _reason] of premiumCombos) {
    if ((c1.includes(a) && c2.includes(b)) || (c1.includes(b) && c2.includes(a))) {
      return score;
    }
  }

  // ── COLOR PROFILE SYSTEM ──
  const colorProfiles = {
    pureBlack: ['black'],
    pureWhite: ['white'],
    neutrals: ['gray', 'grey', 'beige', 'cream', 'tan', 'neutral', 'silver', 'khaki', 'charcoal'],
    warm: ['red', 'orange', 'yellow', 'pink', 'burgundy', 'maroon', 'rust', 'peach', 'gold', 'mustard', 'coral'],
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

  // Black goes with almost everything
  if (p1 === 'pureBlack' || p2 === 'pureBlack') {
    const other = p1 === 'pureBlack' ? c2 : c1;
    if (other.includes('navy') || other.includes('brown')) return -8; // Classic clashes
    return 10;
  }

  // White anchors everything
  if (p1 === 'pureWhite' || p2 === 'pureWhite') return 11;

  // Neutrals pair well
  if (p1 === 'neutrals' && p2 === 'neutrals') return 12;
  if (p1 === 'neutrals' || p2 === 'neutrals') return 8;
  if (p1 === 'browns' && p2 === 'neutrals' || p2 === 'browns' && p1 === 'neutrals') return 10;
  if (p1 === 'browns' || p2 === 'browns') return 7;

  // Analogous
  if (p1 === 'warm' && p2 === 'warm') {
    if ((c1.includes('red') && c2.includes('pink')) || (c1.includes('pink') && c2.includes('red'))) return -5;
    return 6;
  }
  if (p1 === 'cool' && p2 === 'cool') return 8;

  // Complementary
  if ((p1 === 'warm' && p2 === 'cool') || (p1 === 'cool' && p2 === 'warm')) {
    if ((c1.includes('red') && c2.includes('green')) || (c1.includes('green') && c2.includes('red'))) return -10;
    if ((c1.includes('orange') && c2.includes('purple')) || (c1.includes('purple') && c2.includes('orange'))) return -8;
    if ((c1.includes('yellow') && c2.includes('purple')) || (c2.includes('yellow') && c1.includes('purple'))) return 12;
    if ((c1.includes('orange') && c2.includes('blue')) || (c2.includes('orange') && c1.includes('blue'))) return 10;
    if ((c1.includes('burgundy') && c2.includes('olive')) || (c1.includes('olive') && c2.includes('burgundy'))) return 15;
    return 0;
  }

  return 5;
}

// ──────────────────────────────────────────────
// STYLE HARMONY
// ──────────────────────────────────────────────
function calculateStyleHarmony(item1, item2) {
  if (!item1 || !item2) return 0;

  const cat1 = item1.category?.toLowerCase() || 'casual';
  const cat2 = item2.category?.toLowerCase() || 'casual';

  if (cat1 === cat2) return 15;

  const clashes = [
    ['sports', 'formal'], ['sports', 'ethnic'],
    ['sleepwear', 'formal'], ['sleepwear', 'ethnic'],
    ['sleepwear', 'sports'], ['sleepwear', 'casual']
  ];

  for (let clash of clashes) {
    if ((cat1 === clash[0] && cat2 === clash[1]) || (cat1 === clash[1] && cat2 === clash[0])) {
      return -20;
    }
  }

  if ((cat1 === 'casual' && cat2 === 'sports') || (cat1 === 'sports' && cat2 === 'casual')) return 8;
  if ((cat1 === 'casual' && cat2 === 'formal') || (cat1 === 'formal' && cat2 === 'casual')) return 5;
  if ((cat1 === 'casual' && cat2 === 'ethnic') || (cat1 === 'ethnic' && cat2 === 'casual')) return 2;

  return -5;
}

// ──────────────────────────────────────────────
// COLOR HARMONY REASON TEXT
// ──────────────────────────────────────────────
function getColorHarmonyReason(color1, color2, harmonyScore) {
  if (!color1 || !color2) return '';
  const c1 = color1.toLowerCase();
  const c2 = color2.toLowerCase();

  if (c1 === c2) return `Monochromatic ${c1} creates a sleek unified look.`;
  if (harmonyScore >= 14) return `${color1} & ${color2} is a premium fashion-forward combination.`;
  if (harmonyScore >= 12) return `${color1} paired with ${color2} creates a beautifully balanced palette.`;
  if (harmonyScore >= 8) return `${color1} and ${color2} complement each other naturally.`;
  if (harmonyScore >= 5) return `${color1} with ${color2} creates an interesting contrast.`;
  if (harmonyScore <= 0) return `Bold, experimental color blocking with ${color1} and ${color2}.`;
  return '';
}

// ──────────────────────────────────────────────
// MAIN RECOMMENDATION ENGINE
// ──────────────────────────────────────────────
exports.recommendOutfit = async (wardrobe, weather, occasion = 'casual', preferences = {}, recentHistory = [], userGender = 'other', currentHour = null) => {
  if (!wardrobe || wardrobe.length === 0) {
    return { error: 'Your wardrobe is empty. Please upload some clothes first!' };
  }

  // Determine time & season context
  const now = new Date();
  const istTime = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000);
  const hour = currentHour !== null ? currentHour : istTime.getHours();
  const month = istTime.getMonth() + 1; // 1-12
  const timeOfDay = getTimeOfDay(hour);
  const season = getIndianSeason(month);
  const timeInfo = TIME_LABELS[timeOfDay];

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
          confidencePercent: 95,
          reasonText: aiResult.reasoning || `Styled by AI for a ${occasion} ${timeOfDay} at ${weather?.temp}°C.`,
          timeContext: timeInfo,
          weatherTip: getWeatherTip(weather),
          shoppingSuggestions: []
        };
      }
    }
  } catch(e) {
    console.log("Generative AI skipped:", e.message);
  }

  // Filter wardrobe by gender
  const filteredWardrobe = wardrobe.filter(item => {
    if (userGender === 'other') return true;
    return !item.gender || item.gender === 'unisex' || item.gender === userGender;
  });

  // Separate into categories
  const itemsByCategory = {
    tops: filteredWardrobe.filter(item => TOPS.includes(item.type) && item.category !== 'sleepwear'),
    bottoms: filteredWardrobe.filter(item => BOTTOMS.includes(item.type)),
    outerwear: filteredWardrobe.filter(item => OUTERWEAR.includes(item.type)),
    fullBody: filteredWardrobe.filter(item => FULL_BODY.includes(item.type)),
    footwear: filteredWardrobe.filter(item => FOOTWEAR.includes(item.type)),
    accessories: filteredWardrobe.filter(item => ACCESSORIES.includes(item.type))
  };

  // Festival: kurta can act as full body
  if (occasion === 'festival') {
    const kurtas = itemsByCategory.tops.filter(i => i.type === 'kurta');
    if (kurtas.length > 0) {
      itemsByCategory.fullBody.push(...kurtas);
    }
  }

  // ── SCORE ALL ITEMS ──
  const scoredItems = filteredWardrobe.map(item => {
    let score = 0;
    const reasons = [];

    // --- Repetition Penalty (FIXED: uses clothingItems array) ---
    if (recentHistory && recentHistory.length > 0) {
      const wornEntries = recentHistory.filter(h => {
        if (!h.clothingItems || !Array.isArray(h.clothingItems)) return false;
        return h.clothingItems.some(ci => {
          const ciId = (typeof ci === 'object' && ci._id) ? ci._id.toString() : ci.toString();
          return ciId === item._id.toString();
        });
      });

      if (wornEntries.length > 0) {
        wornEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        const daysAgo = Math.floor((now - new Date(wornEntries[0].date)) / (1000 * 60 * 60 * 24));

        if (daysAgo === 0) {
          score -= 30; reasons.push('Worn today — let it rest!');
        } else if (daysAgo <= 2) {
          score -= 20; reasons.push('Worn very recently');
        } else if (daysAgo <= 4) {
          score -= 10; reasons.push('Worn a few days ago');
        } else if (daysAgo <= 7) {
          score -= 5;
        }
      }
    }

    // --- Weather Score ---
    const weatherResult = getWeatherScore(item, weather);
    score += weatherResult.score;
    reasons.push(...weatherResult.reasons);

    // --- Occasion Score ---
    const occasionResult = getOccasionScore(item, occasion);
    if (occasionResult.score > 0) {
      score += occasionResult.score;
      reasons.push(...occasionResult.reasons);
    }

    // --- AI Learning Modifier ---
    if (item.aiScoreModifier) {
      score += item.aiScoreModifier;
      if (item.aiScoreModifier >= 10) reasons.push('AI knows you love this! 👍');
      if (item.aiScoreModifier <= -10) reasons.push('Previously disliked');
    }

    // --- User Preferences ---
    if (preferences.favoriteColors && preferences.favoriteColors.some(c => item.color?.toLowerCase().includes(c.toLowerCase()))) {
      score += 10; reasons.push('Matches your favorite color');
    }
    if (preferences.style === item.category) {
      score += 5;
    }

    // --- Season Boost ---
    const seasonColors = SEASON_COLOR_BOOST[season] || [];
    if (seasonColors.some(sc => (item.color || '').toLowerCase().includes(sc))) {
      score += 5; reasons.push(`Perfect for ${season} season`);
    }
    const seasonTypes = SEASON_TYPE_BOOST[season] || [];
    if (seasonTypes.includes(item.type)) {
      score += 3;
    }

    // --- Time-of-Day Boost ---
    const timeColors = TIME_COLOR_BOOST[timeOfDay] || [];
    if (timeColors.some(tc => (item.color || '').toLowerCase().includes(tc))) {
      score += 4; reasons.push(`${timeInfo.emoji} Great ${timeOfDay} pick`);
    }

    return { item, score, reasons };
  });

  // Group and sort
  const scoredTops = scoredItems.filter(s => itemsByCategory.tops.some(i => i._id.toString() === s.item._id.toString())).sort((a,b) => b.score - a.score);
  const scoredBottoms = scoredItems.filter(s => itemsByCategory.bottoms.some(i => i._id.toString() === s.item._id.toString())).sort((a,b) => b.score - a.score);
  const scoredOuterwear = scoredItems.filter(s => itemsByCategory.outerwear.some(i => i._id.toString() === s.item._id.toString())).sort((a,b) => b.score - a.score);
  const scoredFullBody = scoredItems.filter(s => itemsByCategory.fullBody.some(i => i._id.toString() === s.item._id.toString())).sort((a,b) => b.score - a.score);
  const scoredFootwear = scoredItems.filter(s => itemsByCategory.footwear.some(i => i._id.toString() === s.item._id.toString())).sort((a,b) => b.score - a.score);
  const scoredAccessories = scoredItems.filter(s => itemsByCategory.accessories.some(i => i._id.toString() === s.item._id.toString())).sort((a,b) => b.score - a.score);

  // ── ASSEMBLE OUTFIT COMBINATIONS ──
  const candidateOutfits = [];

  // Two-piece: Top + Bottom
  if (scoredTops.length > 0 && scoredBottoms.length > 0) {
    for (let i = 0; i < Math.min(3, scoredTops.length); i++) {
      for (let j = 0; j < Math.min(3, scoredBottoms.length); j++) {
        const top = scoredTops[i];
        const bottom = scoredBottoms[j];

        const colorHarmonyScore = calculateColorHarmony(top.item.color, bottom.item.color);
        const styleHarmonyScore = calculateStyleHarmony(top.item, bottom.item);

        let totalScore = top.score + bottom.score + (colorHarmonyScore * 2) + (styleHarmonyScore * 1.5);

        if (totalScore < 0 && scoredTops.length > 3 && scoredBottoms.length > 3) continue;

        let outfit = {
          type: 'two-piece',
          top: top.item,
          bottom: bottom.item,
          score: totalScore,
          reasons: [...new Set([...top.reasons, ...bottom.reasons])],
          colorHarmony: colorHarmonyScore,
          styleHarmony: styleHarmonyScore,
          colorHarmonyReason: getColorHarmonyReason(top.item.color, bottom.item.color, colorHarmonyScore)
        };

        // Add outerwear if cold or raining
        if ((weather.temp < 20 || weather.condition === 'rain' || weather.condition === 'rainy') && scoredOuterwear.length > 0) {
          outfit.outerwear = scoredOuterwear[0].item;
          outfit.score += scoredOuterwear[0].score * 0.5;
          outfit.reasons.push(...scoredOuterwear[0].reasons);
        }

        if (scoredFootwear.length > 0) outfit.footwear = scoredFootwear[0].item;
        if (scoredAccessories.length > 0) {
          outfit.accessories = [scoredAccessories[0].item];
          outfit.score += scoredAccessories[0].score * 0.25;
        }

        candidateOutfits.push(outfit);
      }
    }
  }

  // One-piece: Dress / Kurta
  if (scoredFullBody.length > 0) {
    for (let i = 0; i < Math.min(3, scoredFullBody.length); i++) {
      const full = scoredFullBody[i];
      let outfit = {
        type: 'one-piece',
        fullBody: full.item,
        score: full.score * 2.2,
        reasons: full.reasons,
        colorHarmony: 10,
        colorHarmonyReason: 'Single-piece — inherently cohesive.'
      };

      if (weather.temp < 20 && scoredOuterwear.length > 0) {
        outfit.outerwear = scoredOuterwear[0].item;
        outfit.score += scoredOuterwear[0].score * 0.5;
        outfit.colorHarmony = calculateColorHarmony(full.item.color, outfit.outerwear.color);
        outfit.colorHarmonyReason = getColorHarmonyReason(full.item.color, outfit.outerwear.color, outfit.colorHarmony);
      }
      if (scoredFootwear.length > 0) outfit.footwear = scoredFootwear[0].item;
      if (scoredAccessories.length > 0) {
        outfit.accessories = [scoredAccessories[0].item];
        outfit.score += scoredAccessories[0].score * 0.25;
      }

      candidateOutfits.push(outfit);
    }
  }

  // ── SHOPPING SUGGESTIONS ──
  const getLink = (category) => {
    const prefix = userGender === 'male' ? 'men-' : (userGender === 'female' ? 'women-' : '');
    return `https://www.myntra.com/${prefix}${category}`;
  };

  let shoppingSuggestions = [];

  if (candidateOutfits.length === 0) {
    if (scoredTops.length === 0 && scoredFullBody.length === 0) {
      shoppingSuggestions.push({ type: 'tops', title: 'Shop for Tops & Shirts', reason: 'Your wardrobe needs more tops to create complete outfits.', link: getLink('shirts') });
    }
    if (scoredBottoms.length === 0 && scoredFullBody.length === 0) {
      shoppingSuggestions.push({ type: 'bottoms', title: 'Shop for Jeans & Trousers', reason: 'You need bottoms to complete your look.', link: getLink('trousers') });
    }

    if (scoredTops.length > 0) {
      const topChoices = scoredTops.slice(0, 3);
      const randomTop = topChoices[Math.floor(Math.random() * topChoices.length)];
      return { partial: true, top: randomTop.item, reasonText: "Not enough items for a full outfit.", shoppingSuggestions, timeContext: timeInfo, weatherTip: getWeatherTip(weather) };
    }
    if (scoredBottoms.length > 0) {
      const bottomChoices = scoredBottoms.slice(0, 3);
      const randomBottom = bottomChoices[Math.floor(Math.random() * bottomChoices.length)];
      return { partial: true, bottom: randomBottom.item, reasonText: "Not enough items for a full outfit.", shoppingSuggestions, timeContext: timeInfo, weatherTip: getWeatherTip(weather) };
    }

    return {
      error: 'Could not generate an outfit with current wardrobe items.',
      shoppingSuggestions: [
        { type: 'tops', title: 'Shop Tops', reason: 'Start your wardrobe with some basic tops.', link: getLink('tshirts') },
        { type: 'bottoms', title: 'Shop Bottoms', reason: 'Add some versatile jeans or trousers.', link: getLink('jeans') }
      ]
    };
  }

  // ── SELECT BEST OUTFIT ──
  candidateOutfits.sort((a, b) => b.score - a.score);
  const highestScore = candidateOutfits[0].score;
  const topCandidates = candidateOutfits.filter(o => o.score >= highestScore - 10).slice(0, 3);
  const bestOutfit = topCandidates[Math.floor(Math.random() * topCandidates.length)];

  // Upsell shopping
  if (weather.temp < 20 && !bestOutfit.outerwear) {
    shoppingSuggestions.push({ type: 'outerwear', title: 'Shop Winter Jackets', reason: 'It\'s cold outside, but no jacket found in your wardrobe!', link: getLink('jackets') });
  }

  if (shoppingSuggestions.length === 0) {
    if (occasion === 'formal') {
      shoppingSuggestions.push({ type: 'accessory', title: 'Elevate with a Premium Watch', reason: 'A perfect formal outfit needs a classic timepiece.', link: 'https://www.myntra.com/watches' });
    } else if (occasion === 'festival') {
      shoppingSuggestions.push({ type: 'footwear', title: 'Shop Ethnic Footwear', reason: 'Pair ethnic wear with traditional Mojaris or Kolhapuris.', link: 'https://www.myntra.com/ethnic-shoes' });
    } else if (weather.temp > 28) {
      shoppingSuggestions.push({ type: 'accessory', title: 'Trendy Sunglasses', reason: 'It\'s sunny! Protect your eyes and look stylish.', link: 'https://www.myntra.com/sunglasses' });
    } else {
      shoppingSuggestions.push({ type: 'footwear', title: 'Fresh Sneakers', reason: 'Upgrade your casual look with trending sneakers.', link: 'https://www.myntra.com/sneakers' });
    }
  }

  // ── CONFIDENCE SCORE ──
  const maxPossibleScore = 35 + 35 + 30 + 15; // occasion + weather + colorHarmony + preferences
  const confidencePercent = Math.min(98, Math.max(60, Math.round((bestOutfit.score / maxPossibleScore) * 100)));

  // ── GENERATE RICH REASONING ──
  const weatherTip = getWeatherTip(weather);
  let finalReason = '';

  // Weather context
  finalReason += `${timeInfo.emoji} ${timeInfo.label} outfit for ${weather.temp}°C ${weather.description || weather.condition} weather`;
  if (weather.city && weather.city !== 'Current Location') finalReason += ` in ${weather.city}`;
  finalReason += '. ';

  // Occasion context
  const occasionEmojis = { casual: '😎', formal: '💼', trendy: '✨', sporty: '⚡', festival: '🎉', cozy: '🏠', romantic: '💕', auto: '🤖' };
  finalReason += `${occasionEmojis[occasion] || '👔'} Curated for a ${occasion} vibe. `;

  // Color harmony
  if (bestOutfit.colorHarmonyReason) {
    finalReason += `🎨 ${bestOutfit.colorHarmonyReason} `;
  }

  // Style harmony
  if (bestOutfit.styleHarmony >= 15) finalReason += 'Perfect style sync between pieces. ';
  else if (bestOutfit.styleHarmony >= 5) finalReason += 'Smart-casual balance. ';
  else if (bestOutfit.styleHarmony <= -15) finalReason += 'Avant-garde mix! ';

  // Season
  finalReason += `📅 Tailored for the ${season} season.`;

  // Unique highlights
  const uniqueReasons = [...new Set(bestOutfit.reasons)].filter(r => r && !r.includes('Good') && !r.includes('Works'));
  if (uniqueReasons.length > 0) {
    finalReason += ` ✦ ${uniqueReasons.slice(0, 2).join(' • ')}`;
  }

  bestOutfit.reasonText = finalReason;
  bestOutfit.confidencePercent = confidencePercent;
  bestOutfit.timeContext = timeInfo;
  bestOutfit.weatherTip = weatherTip;
  bestOutfit.seasonContext = season;
  if (shoppingSuggestions.length > 0) bestOutfit.shoppingSuggestions = shoppingSuggestions;

  return bestOutfit;
};

// ──────────────────────────────────────────────
// WEATHER TIPS
// ──────────────────────────────────────────────
function getWeatherTip(weather) {
  if (!weather) return null;
  const temp = weather.temp || 25;
  const humidity = weather.humidity || 50;
  const condition = (weather.condition || 'clear').toLowerCase();

  if (humidity > 75 && temp > 25) return { icon: '💧', text: 'High humidity today — we picked breathable, lighter pieces' };
  if (temp > 35) return { icon: '🔥', text: 'Extreme heat! Light fabrics and bright colors are prioritized' };
  if (temp > 28) return { icon: '☀️', text: 'Warm day — lightweight and comfortable pieces selected' };
  if (temp < 10) return { icon: '🥶', text: 'Very cold! Warm layers and darker tones recommended' };
  if (temp < 20) return { icon: '🌬️', text: 'Cool weather — layering is key today' };
  if (condition === 'rainy' || condition === 'rain') return { icon: '🌧️', text: 'Rainy weather — darker colors and rain-friendly pieces prioritized' };
  if (condition === 'cloudy') return { icon: '☁️', text: 'Overcast skies — versatile mid-tone outfit selected' };
  return { icon: '✨', text: 'Perfect weather for any style — dressed you for the occasion!' };
}

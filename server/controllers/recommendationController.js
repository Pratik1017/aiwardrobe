const weatherService = require('../services/weatherService');
const recommendationService = require('../services/recommendationService');
const Clothing = require('../models/Clothing');
const User = require('../models/User');
const OutfitHistory = require('../models/OutfitHistory');

// Get outfit recommendation
exports.getRecommendation = async (req, res) => {
  try {
    const { occasion, city, lat, lon } = req.query;
    
    // Validate occasion if provided
    const validOccasions = ['auto', 'casual', 'formal', 'trendy', 'sporty', 'festival', 'cozy', 'romantic'];
    const finalOccasionPreference = occasion && validOccasions.includes(occasion) ? occasion : 'auto';
    
    // 1. Get user and their wardrobe
    const user = await User.findById(req.userId);
    const wardrobe = await Clothing.find({ user: req.userId, isDonated: { $ne: true } });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentHistory = await OutfitHistory.find({
      user: req.userId,
      date: { $gte: sevenDaysAgo }
    });

    if (!wardrobe || wardrobe.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Your wardrobe is empty. Please upload some clothes first to get recommendations.' 
      });
    }

    // Auto-detect occasion if requested
    let finalOccasion = finalOccasionPreference || 'casual';
    let autoDetectReason = null;
    
    if (finalOccasionPreference === 'auto') {
      const detected = autoDetectOccasion();
      finalOccasion = detected.occasion;
      autoDetectReason = detected.reason;
    }

    // 2. Get Weather
    let weather;
    if (lat && lon) {
      weather = await weatherService.getWeatherByCoords(lat, lon);
    } else {
      weather = await weatherService.getWeatherByCity(city || 'Mumbai');
    }

    // 3. Generate Recommendation
    const recommendation = await recommendationService.recommendOutfit(
      wardrobe, 
      weather, 
      finalOccasion, 
      user.preferences,
      recentHistory,
      user.gender
    );

    if (recommendation.error && !recommendation.shoppingSuggestions) {
      return res.status(400).json({ success: false, message: recommendation.error });
    }

    res.status(200).json({
      success: true,
      weather: {
        temp: weather.temp,
        condition: weather.condition,
        description: weather.description,
        icon: weather.icon,
        city: weather.city
      },
      recommendation,
      autoDetected: autoDetectReason ? { occasion: finalOccasion, reason: autoDetectReason } : null
    });

  } catch (error) {
    console.error('Recommendation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate recommendation', error: error.message });
  }
};

// Just get weather data (useful for frontend display without triggering full recommendation)
exports.getWeather = async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    let weather;
    if (lat && lon) {
      weather = await weatherService.getWeatherByCoords(lat, lon);
    } else {
      weather = await weatherService.getWeatherByCity(city || 'Mumbai');
    }
    
    res.status(200).json({ success: true, weather });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch weather', error: error.message });
  }
};

// Hardcoded India-specific festivals and occasions (Approximate 2026/2027 dates)
const FESTIVALS = {
  '01-14': { name: 'Makar Sankranti / Pongal', type: 'festival' },
  '01-26': { name: 'Republic Day', type: 'festival' },
  '02-14': { name: 'Valentine\'s Day', type: 'casual' },
  '03-03': { name: 'Holi', type: 'festival' }, 
  '08-15': { name: 'Independence Day', type: 'festival' },
  '08-28': { name: 'Raksha Bandhan', type: 'festival' }, 
  '09-05': { name: 'Teacher\'s Day', type: 'formal' },
  '10-18': { name: 'Navratri', type: 'festival' }, 
  '10-19': { name: 'Dussehra', type: 'festival' }, 
  '11-08': { name: 'Diwali', type: 'festival' }, 
  '12-25': { name: 'Christmas', type: 'festival' },
  '12-31': { name: 'New Year\'s Eve', type: 'casual' }
};

function autoDetectOccasion() {
  // Use Indian Standard Time (IST) offset for detection
  const now = new Date();
  // Adjust to IST (+5:30)
  const istTime = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000);
  
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const day = String(istTime.getDate()).padStart(2, '0');
  const dateStr = `${month}-${day}`;

  // 1. Check Festivals / Special Days
  if (FESTIVALS[dateStr]) {
    return {
      occasion: FESTIVALS[dateStr].type,
      reason: `Today is ${FESTIVALS[dateStr].name}! 🎉`
    };
  }

  // 2. Check Weekends
  const dayOfWeek = istTime.getDay(); // 0 is Sunday, 6 is Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      occasion: 'casual',
      reason: 'It\'s the weekend! Time to relax and dress casual. 🛋️'
    };
  }

  // 3. Weekdays
  return {
    occasion: 'formal',
    reason: 'It\'s a weekday. Perfect time for smart office wear. 💼'
  };
}

// Handle AI Feedback (Like/Dislike)
exports.submitFeedback = async (req, res) => {
  try {
    const { top, bottom, outerwear, fullBody, footwear, feedback } = req.body;
    
    // Determine modifier based on feedback
    const modifier = feedback === 'like' ? 10 : -15;

    // Collect all valid IDs
    const itemIds = [top, bottom, outerwear, fullBody, footwear].filter(id => id);

    if (itemIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided for feedback' });
    }

    // Update the aiScoreModifier for all items in the outfit
    await Clothing.updateMany(
      { _id: { $in: itemIds }, user: req.userId },
      { $inc: { aiScoreModifier: modifier } }
    );

    res.status(200).json({ 
      success: true, 
      message: `Feedback received. AI updated priorities by ${modifier > 0 ? '+' : ''}${modifier} points.`,
      modifier
    });

  } catch (error) {
    console.error('Feedback Error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
};

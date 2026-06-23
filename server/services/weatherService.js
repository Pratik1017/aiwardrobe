const axios = require('axios');

const weatherService = {
  getWeatherByCity: async (city) => {
    // Return mock data for now to ensure it runs without an API key
    return {
      temp: 25,
      condition: 'clear',
      description: 'Clear sky',
      icon: '01d',
      city: city || 'Mumbai',
      humidity: 50
    };
  },
  getWeatherByCoords: async (lat, lon) => {
    return {
      temp: 25,
      condition: 'clear',
      description: 'Clear sky',
      icon: '01d',
      city: 'Current Location',
      humidity: 50
    };
  },
  getWeatherRecommendations: async (temperature, weatherCondition) => {
    const recommendations = {
      cold: {
        items: ['outerwear', 'long sleeve', 'sweater'],
        colors: ['dark', 'navy', 'black', 'gray'],
      },
      hot: {
        items: ['short sleeve', 'light materials', 'shorts'],
        colors: ['light', 'white', 'pastels'],
      },
      rainy: {
        items: ['waterproof jacket', 'boots'],
        colors: ['any'],
      },
      sunny: {
        items: ['light clothing', 'sunglasses'],
        colors: ['light', 'bright'],
      },
    };

    return recommendations[weatherCondition?.toLowerCase()] || recommendations.hot;
  },

  getSeasonalRecommendations: (season) => {
    const seasonal = {
      spring: {
        colors: ['pastels', 'light', 'fresh'],
        materials: ['cotton', 'linen'],
      },
      summer: {
        colors: ['bright', 'vibrant', 'light'],
        materials: ['cotton', 'linen', 'silk'],
      },
      fall: {
        colors: ['warm', 'earth', 'brown', 'orange'],
        materials: ['wool', 'denim', 'cotton'],
      },
      winter: {
        colors: ['dark', 'jewel tones', 'neutrals'],
        materials: ['wool', 'fleece', 'thermals'],
      },
    };

    return seasonal[season?.toLowerCase()] || seasonal.summer;
  },
};

module.exports = weatherService;

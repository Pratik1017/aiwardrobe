const axios = require('axios');

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Parse OpenWeatherMap response into a clean weather object
 */
function parseWeatherResponse(data) {
  const conditionMap = {
    'Thunderstorm': 'rainy',
    'Drizzle': 'rainy',
    'Rain': 'rainy',
    'Snow': 'cold',
    'Mist': 'cloudy',
    'Smoke': 'cloudy',
    'Haze': 'cloudy',
    'Dust': 'cloudy',
    'Fog': 'cloudy',
    'Sand': 'cloudy',
    'Ash': 'cloudy',
    'Squall': 'rainy',
    'Tornado': 'rainy',
    'Clear': 'clear',
    'Clouds': 'cloudy',
  };

  const mainWeather = data.weather?.[0]?.main || 'Clear';

  return {
    temp: Math.round(data.main?.temp || 25),
    condition: conditionMap[mainWeather] || 'clear',
    description: data.weather?.[0]?.description || 'Clear sky',
    icon: data.weather?.[0]?.icon || '01d',
    city: data.name || 'Unknown',
    humidity: data.main?.humidity || 50,
  };
}

const weatherService = {
  getWeatherByCity: async (city) => {
    try {
      if (!API_KEY) {
        console.warn('⚠️ No OpenWeatherMap API key found, using mock data');
        return { temp: 25, condition: 'clear', description: 'Clear sky', icon: '01d', city: city || 'Mumbai', humidity: 50 };
      }

      const response = await axios.get(BASE_URL, {
        params: {
          q: city || 'Mumbai',
          appid: API_KEY,
          units: 'metric',
        },
      });

      return parseWeatherResponse(response.data);
    } catch (error) {
      console.error('Weather API error (city):', error.response?.data?.message || error.message);
      // Fallback to mock data on error
      return { temp: 25, condition: 'clear', description: 'Clear sky', icon: '01d', city: city || 'Mumbai', humidity: 50 };
    }
  },

  getWeatherByCoords: async (lat, lon) => {
    try {
      if (!API_KEY) {
        console.warn('⚠️ No OpenWeatherMap API key found, using mock data');
        return { temp: 25, condition: 'clear', description: 'Clear sky', icon: '01d', city: 'Current Location', humidity: 50 };
      }

      const response = await axios.get(BASE_URL, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric',
        },
      });

      return parseWeatherResponse(response.data);
    } catch (error) {
      console.error('Weather API error (coords):', error.response?.data?.message || error.message);
      // Fallback to mock data on error
      return { temp: 25, condition: 'clear', description: 'Clear sky', icon: '01d', city: 'Current Location', humidity: 50 };
    }
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

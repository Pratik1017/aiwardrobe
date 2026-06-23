const express = require('express');
const recommendationController = require('../controllers/recommendationController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/recommend/outfit - Get outfit recommendation
router.get('/outfit', authMiddleware, recommendationController.getRecommendation);

// GET /api/recommend/weather - Get weather data
router.get('/weather', authMiddleware, recommendationController.getWeather);

// POST /api/recommend/feedback - Submit feedback
router.post('/feedback', authMiddleware, recommendationController.submitFeedback);

module.exports = router;

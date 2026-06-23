const express = require('express');
const { signup, login, getCurrentUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);

// Protected test route
router.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'You have access to this protected route',
    userId: req.userId,
    timestamp: new Date()
  });
});

module.exports = router;

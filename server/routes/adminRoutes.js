const express = require('express');
const { getDashboardStats, getAllUsers, deleteUser, getAllDonations } = require('../controllers/adminController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes in this file require authentication and admin role
router.use(authMiddleware, isAdmin);

// Get platform statistics
router.get('/stats', getDashboardStats);

// Get all users
router.get('/users', getAllUsers);

// Get all donations
router.get('/donations', getAllDonations);

// Delete a user and their data
router.delete('/users/:id', deleteUser);

module.exports = router;

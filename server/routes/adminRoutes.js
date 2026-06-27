const express = require('express');
const {
  getDashboardStats, getAllUsers, deleteUser, updateUserRole,
  getUserWardrobe, getAllClothing, deleteClothingItem,
  getAllDonations, getAnalytics, getSystemInfo
} = require('../controllers/adminController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication + admin role
router.use(authMiddleware, isAdmin);

// Dashboard & Analytics
router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/system', getSystemInfo);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/users/:id/wardrobe', getUserWardrobe);
router.delete('/users/:id', deleteUser);

// Clothing Management
router.get('/clothing', getAllClothing);
router.delete('/clothing/:id', deleteClothingItem);

// Donations
router.get('/donations', getAllDonations);

module.exports = router;

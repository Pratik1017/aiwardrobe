const User = require('../models/User');
const Clothing = require('../models/Clothing');
const OutfitHistory = require('../models/OutfitHistory');
const cloudinary = require('../config/cloudinary');
const os = require('os');
const mongoose = require('mongoose');

// ──────────────────────────────────────────────
// DASHBOARD STATS
// ──────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalClothes, totalDonated, totalOutfits] = await Promise.all([
      User.countDocuments(),
      Clothing.countDocuments(),
      Clothing.countDocuments({ isDonated: true }),
      OutfitHistory.countDocuments()
    ]);

    const waterSavedLiters = totalDonated * 2700;
    const co2PreventedKg = totalDonated * 10;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalClothes,
        totalDonated,
        totalOutfits,
        impact: { waterSavedLiters, co2PreventedKg }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats', error: error.message });
  }
};

// ──────────────────────────────────────────────
// USER MANAGEMENT
// ──────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'clothings',
          localField: '_id',
          foreignField: 'user',
          as: 'wardrobe'
        }
      },
      {
        $lookup: {
          from: 'outfithistories',
          localField: '_id',
          foreignField: 'user',
          as: 'outfits'
        }
      },
      {
        $project: {
          name: 1, username: 1, email: 1, gender: 1, role: 1, createdAt: 1,
          preferences: 1,
          clothingCount: { $size: '$wardrobe' },
          outfitCount: { $size: '$outfits' },
          donatedCount: {
            $size: {
              $filter: { input: '$wardrobe', as: 'item', cond: { $eq: ['$$item.isDonated', true] } }
            }
          }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

// Update user role (promote/demote)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be "user" or "admin".' });
    }

    if (id === req.userId) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: `User role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update role', error: error.message });
  }
};

// Delete user and all their data
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId === req.userId) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Delete Cloudinary images
    const clothes = await Clothing.find({ user: userId });
    const deletePromises = clothes.map(item => {
      if (item.cloudinaryId) {
        return cloudinary.uploader.destroy(item.cloudinaryId).catch(err => console.error('Cloudinary delete error:', err));
      }
      return Promise.resolve();
    });
    await Promise.all(deletePromises);

    // Delete all related data
    await Promise.all([
      Clothing.deleteMany({ user: userId }),
      OutfitHistory.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId)
    ]);

    res.status(200).json({ success: true, message: 'User and all associated data deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};

// ──────────────────────────────────────────────
// USER WARDROBE INSPECTION
// ──────────────────────────────────────────────
exports.getUserWardrobe = async (req, res) => {
  try {
    const userId = req.params.id;
    const wardrobe = await Clothing.find({ user: userId }).sort({ createdAt: -1 });
    const user = await User.findById(userId).select('name email');

    res.status(200).json({
      success: true,
      user: user || { name: 'Unknown', email: 'N/A' },
      wardrobe,
      count: wardrobe.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user wardrobe', error: error.message });
  }
};

// ──────────────────────────────────────────────
// CLOTHING MANAGEMENT
// ──────────────────────────────────────────────
exports.getAllClothing = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.type) filter.type = req.query.type;
    if (req.query.color) filter.color = new RegExp(req.query.color, 'i');
    if (req.query.category) filter.category = req.query.category;
    if (req.query.donated === 'true') filter.isDonated = true;
    if (req.query.donated === 'false') filter.isDonated = { $ne: true };

    const [items, total] = await Promise.all([
      Clothing.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Clothing.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch clothing', error: error.message });
  }
};

exports.deleteClothingItem = async (req, res) => {
  try {
    const item = await Clothing.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    // Delete from Cloudinary
    if (item.cloudinaryId) {
      await cloudinary.uploader.destroy(item.cloudinaryId).catch(err => console.error('Cloudinary:', err));
    }

    await Clothing.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete item', error: error.message });
  }
};

// ──────────────────────────────────────────────
// DONATIONS
// ──────────────────────────────────────────────
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Clothing.find({ isDonated: true })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, donations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch donations', error: error.message });
  }
};

// ──────────────────────────────────────────────
// ANALYTICS
// ──────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    // Clothing by type
    const byType = await Clothing.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Clothing by category
    const byCategory = await Clothing.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Clothing by color
    const byColor = await Clothing.aggregate([
      { $group: { _id: '$color', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Top uploaders
    const topUploaders = await Clothing.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } },
      { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
      { $project: { count: 1, name: '$userInfo.name', email: '$userInfo.email' } }
    ]);

    // Recent activity (last 10 items added)
    const recentActivity = await Clothing.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name type color createdAt user');

    // Outfits per day (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const outfitActivity = await OutfitHistory.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      analytics: { byType, byCategory, byColor, topUploaders, recentActivity, outfitActivity }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
};

// ──────────────────────────────────────────────
// SYSTEM INFO
// ──────────────────────────────────────────────
exports.getSystemInfo = async (req, res) => {
  try {
    const dbName = mongoose.connection.db.databaseName;
    const dbStats = await mongoose.connection.db.stats();

    res.status(200).json({
      success: true,
      system: {
        nodeVersion: process.version,
        platform: os.platform(),
        uptime: Math.floor(process.uptime()),
        memoryUsage: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        },
        database: {
          name: dbName,
          collections: dbStats.collections,
          dataSize: Math.round(dbStats.dataSize / 1024),
          storageSize: Math.round(dbStats.storageSize / 1024),
          indexes: dbStats.indexes
        },
        env: {
          mongoConnected: mongoose.connection.readyState === 1,
          cloudinaryConfigured: !!process.env.CLOUDINARY_CLOUD_NAME,
          huggingfaceConfigured: !!process.env.HUGGINGFACE_API_KEY,
          weatherApiConfigured: !!process.env.OPENWEATHER_API_KEY
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch system info', error: error.message });
  }
};

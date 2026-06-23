const User = require('../models/User');
const Clothing = require('../models/Clothing');
const cloudinary = require('../config/cloudinary');

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalClothes = await Clothing.countDocuments();
    const totalDonated = await Clothing.countDocuments({ isDonated: true });
    
    // Calculate environmental impact (dummy formulas based on industry averages)
    // 1 item reused/donated = ~2700 liters of water saved, ~10kg CO2 prevented
    const waterSavedLiters = totalDonated * 2700;
    const co2PreventedKg = totalDonated * 10;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalClothes,
        totalDonated,
        impact: {
          waterSavedLiters,
          co2PreventedKg
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats', error: error.message });
  }
};

// Get All Users with their clothing count
exports.getAllUsers = async (req, res) => {
  try {
    // Aggregate users to include clothing count
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'clothings', // Collection name in MongoDB is usually lowercase plural
          localField: '_id',
          foreignField: 'user',
          as: 'wardrobe'
        }
      },
      {
        $project: {
          name: 1,
          username: 1,
          email: 1,
          gender: 1,
          role: 1,
          createdAt: 1,
          clothingCount: { $size: '$wardrobe' }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

// Delete a user and all their clothes
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Don't allow admin to delete themselves
    if (userId === req.userId) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find all clothing for user to delete from Cloudinary
    const clothes = await Clothing.find({ user: userId });
    
    // Delete images from Cloudinary in parallel
    const deletePromises = clothes.map(item => {
      if (item.cloudinaryId) {
        return cloudinary.uploader.destroy(item.cloudinaryId).catch(err => console.error('Cloudinary delete error:', err));
      }
      return Promise.resolve();
    });
    
    await Promise.all(deletePromises);

    // Delete clothing records from DB
    await Clothing.deleteMany({ user: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User and all associated data successfully deleted.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};

// Get specific user's wardrobe for inspection
exports.getUserWardrobe = async (req, res) => {
  try {
    const userId = req.params.id;
    const wardrobe = await Clothing.find({ user: userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      wardrobe
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user wardrobe', error: error.message });
  }
};

// Get all donations across the platform
exports.getAllDonations = async (req, res) => {
  try {
    // Find all items that are marked as donated
    const donations = await Clothing.find({ isDonated: true })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      donations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch donations', error: error.message });
  }
};

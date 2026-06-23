const Clothing = require('../models/Clothing');
const cloudinary = require('../config/cloudinary');
const aiService = require('../services/aiService');

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} buffer - Image buffer from multer memory storage
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Object>} - Cloudinary upload result with secure_url and public_id
 */
function uploadToCloudinary(buffer, folder = 'al-closet') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' } // Auto-optimize
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Delete image from Cloudinary by public_id
 */
async function deleteFromCloudinary(publicId) {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
      console.log(`🗑️  Deleted from Cloudinary: ${publicId}`);
    }
  } catch (err) {
    console.error('Failed to delete from Cloudinary:', err.message);
  }
}

// Upload clothing item
exports.uploadClothing = async (req, res) => {
  try {
    const { name, type, color, category, size, description, brand, purchaseDate, tags, gender } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const imageBuffer = req.file.buffer;

    // 1. Analyze image with AI (uses buffer directly)
    let aiAnalysis;
    try {
      aiAnalysis = await aiService.analyzeClothingImage(imageBuffer);
    } catch (aiErr) {
      console.error('AI analysis failed, using defaults:', aiErr.message);
      aiAnalysis = {
        type: 'shirt', color: 'neutral', category: 'casual',
        confidence: 0, detectedLabels: ['clothing'], error: aiErr.message
      };
    }

    // 2. Upload image to Cloudinary
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary(imageBuffer);
      console.log(`☁️  Uploaded to Cloudinary: ${cloudinaryResult.secure_url}`);
    } catch (uploadErr) {
      console.error('Cloudinary upload failed:', uploadErr.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image to cloud storage',
        error: uploadErr.message
      });
    }

    // 3. Determine final values (user input overrides AI)
    const detectedType = type || aiAnalysis.type;
    const detectedColor = color || aiAnalysis.color;
    const detectedCategory = category || aiAnalysis.category;

    if (!detectedType) {
      // Clean up Cloudinary upload since we're failing
      await deleteFromCloudinary(cloudinaryResult.public_id);
      return res.status(400).json({
        success: false,
        message: 'Unable to detect clothing type. Please specify manually.'
      });
    }

    const clothingName = name || `${detectedType.charAt(0).toUpperCase() + detectedType.slice(1)} (${detectedColor})`;

    // Parse tags safely
    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags.map(tag => String(tag).trim()).filter(Boolean);
      } else if (typeof tags === 'string') {
        parsedTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
    }

    // 4. Save to database with Cloudinary URL
    const clothing = await Clothing.create({
      user: req.userId,
      name: clothingName,
      type: detectedType,
      color: detectedColor,
      category: detectedCategory,
      size: size || 'One Size',
      imageUrl: cloudinaryResult.secure_url,
      cloudinaryId: cloudinaryResult.public_id,
      gender: gender || 'unisex',
      description: description || undefined,
      brand: brand || undefined,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      tags: parsedTags
    });

    res.status(201).json({
      success: true,
      message: 'Clothing item uploaded successfully',
      clothing,
      aiAnalysis: {
        detectedType: aiAnalysis.type,
        detectedColor: aiAnalysis.color,
        detectedCategory: aiAnalysis.category,
        confidence: aiAnalysis.confidence,
        detectedLabels: aiAnalysis.detectedLabels
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading clothing',
      error: error.message
    });
  }
};

// Get all clothing items for user (excluding donated items)
exports.getClothing = async (req, res) => {
  try {
    const clothing = await Clothing.find({ user: req.userId, isDonated: { $ne: true } }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: clothing.length, clothing });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching clothing', error: error.message });
  }
};

// Get clothing by ID
exports.getClothingById = async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);
    if (!clothing) {
      return res.status(404).json({ success: false, message: 'Clothing item not found' });
    }
    if (clothing.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to access this resource' });
    }
    res.status(200).json({ success: true, clothing });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching clothing', error: error.message });
  }
};

// Update clothing item
exports.updateClothing = async (req, res) => {
  try {
    let clothing = await Clothing.findById(req.params.id);
    if (!clothing) {
      return res.status(404).json({ success: false, message: 'Clothing item not found' });
    }
    if (clothing.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this resource' });
    }

    const { name, type, color, category, size, description, brand, purchaseDate, tags } = req.body;

    if (name) clothing.name = name;
    if (type) clothing.type = type;
    if (color) clothing.color = color;
    if (category) clothing.category = category;
    if (size) clothing.size = size;
    if (description !== undefined) clothing.description = description;
    if (brand !== undefined) clothing.brand = brand;
    if (purchaseDate) clothing.purchaseDate = new Date(purchaseDate);
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        clothing.tags = tags.map(tag => String(tag).trim()).filter(Boolean);
      } else if (typeof tags === 'string') {
        clothing.tags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
    }

    clothing = await clothing.save();
    res.status(200).json({ success: true, message: 'Clothing item updated successfully', clothing });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating clothing', error: error.message });
  }
};

// Delete clothing item
exports.deleteClothing = async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);
    if (!clothing) {
      return res.status(404).json({ success: false, message: 'Clothing item not found' });
    }
    if (clothing.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this resource' });
    }

    // Delete image from Cloudinary
    await deleteFromCloudinary(clothing.cloudinaryId);

    await Clothing.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Clothing item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting clothing', error: error.message });
  }
};

// Filter clothing (excluding donated items)
exports.filterClothing = async (req, res) => {
  try {
    const { type, color, category, size } = req.query;
    const filter = { user: req.userId, isDonated: { $ne: true } };
    if (type) filter.type = type;
    if (color) filter.color = new RegExp(color, 'i');
    if (category) filter.category = category;
    if (size) filter.size = size;

    const clothing = await Clothing.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: clothing.length, clothing });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error filtering clothing', error: error.message });
  }
};

// Get all donated clothing items
exports.getDonatedClothing = async (req, res) => {
  try {
    const donatedClothes = await Clothing.find({ user: req.userId, isDonated: true }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: donatedClothes.length, donatedClothes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching donated clothing', error: error.message });
  }
};

// Donate a clothing item
exports.donateClothing = async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);
    if (!clothing) {
      return res.status(404).json({ success: false, message: 'Clothing item not found' });
    }
    if (clothing.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this resource' });
    }

    const { ngoName, condition } = req.body;
    
    clothing.isDonated = true;
    clothing.donatedTo = ngoName || 'Unknown NGO';
    if (condition) clothing.condition = condition;
    
    await clothing.save();
    res.status(200).json({ success: true, message: 'Clothing marked as donated successfully', clothing });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error donating clothing', error: error.message });
  }
};

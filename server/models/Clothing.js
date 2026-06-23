const mongoose = require('mongoose');

const clothingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Please provide a clothing name'],
      trim: true
    },
    type: {
      type: String,
      enum: ['shirt', 't-shirt', 'pants', 'dress', 'skirt', 'jacket', 'sweater', 'shoes', 'accessories', 'kurta', 'watch', 'belt', 'sunglasses', 'cap', 'other'],
      required: true
    },
    color: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['casual', 'formal', 'sports', 'sleepwear', 'other'],
      required: true
    },
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'],
      default: 'One Size'
    },
    imageUrl: {
      type: String,
      required: true
    },
    cloudinaryId: {
      type: String,
      required: true
    },
    aiScoreModifier: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      trim: true
    },
    brand: {
      type: String,
      trim: true
    },
    purchaseDate: {
      type: Date
    },
    tags: [String],
    isDonated: {
      type: Boolean,
      default: false
    },
    donatedTo: {
      type: String,
      default: null
    },
    condition: {
      type: String,
      enum: ['Like New', 'Gently Used', 'Worn Out', null],
      default: null
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unisex'],
      default: 'unisex'
    }
  },
  { timestamps: true }
);

// Index for user queries
clothingSchema.index({ user: 1 });

module.exports = mongoose.model('Clothing', clothingSchema);

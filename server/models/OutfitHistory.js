const mongoose = require('mongoose');

const outfitHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clothingItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clothing',
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
    occasion: String,
    weather: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: String,
    photoUrl: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OutfitHistory', outfitHistorySchema);

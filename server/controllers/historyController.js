const OutfitHistory = require('../models/OutfitHistory');

const historyController = {
  saveOutfit: async (req, res) => {
    try {
      const { clothingItems, outfitType, top, bottom, fullBody, outerwear, footwear, occasion, weather, rating, notes, photoUrl } = req.body;

      const items = clothingItems || [top, bottom, fullBody, outerwear, footwear].filter(Boolean);

      const outfit = new OutfitHistory({
        user: req.userId,
        clothingItems: items,
        occasion,
        weather: weather ? weather.condition : null,
        rating,
        notes,
        photoUrl,
      });

      await outfit.save();
      res.status(201).json({ success: true, message: 'Outfit saved successfully', outfit });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getOutfitHistory: async (req, res) => {
    try {
      const outfits = await OutfitHistory.find({ user: req.userId })
        .populate('clothingItems')
        .sort({ date: -1 });
      res.status(200).json({ history: outfits });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getOutfitById: async (req, res) => {
    try {
      const outfit = await OutfitHistory.findById(req.params.id).populate('clothingItems');
      if (!outfit) {
        return res.status(404).json({ message: 'Outfit not found' });
      }
      res.status(200).json(outfit);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateOutfit: async (req, res) => {
    try {
      const { rating, notes } = req.body;

      const outfit = await OutfitHistory.findByIdAndUpdate(
        req.params.id,
        { rating, notes },
        { new: true }
      ).populate('clothingItems');

      if (!outfit) {
        return res.status(404).json({ message: 'Outfit not found' });
      }

      res.status(200).json({ message: 'Outfit updated', outfit });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteOutfit: async (req, res) => {
    try {
      const outfit = await OutfitHistory.findByIdAndDelete(req.params.id);
      if (!outfit) {
        return res.status(404).json({ message: 'Outfit not found' });
      }
      res.status(200).json({ message: 'Outfit deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = historyController;

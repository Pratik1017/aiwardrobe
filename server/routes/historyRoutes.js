const express = require('express');
const historyController = require('../controllers/historyController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, historyController.saveOutfit);
router.get('/', authMiddleware, historyController.getOutfitHistory);
router.get('/:id', authMiddleware, historyController.getOutfitById);
router.put('/:id', authMiddleware, historyController.updateOutfit);
router.delete('/:id', authMiddleware, historyController.deleteOutfit);

module.exports = router;

const express = require('express');
const {
  uploadClothing,
  getClothing,
  getClothingById,
  updateClothing,
  deleteClothing,
  filterClothing,
  getDonatedClothing,
  donateClothing
} = require('../controllers/clothingController');
const authMiddleware = require('../middleware/auth').authMiddleware || require('../middleware/auth');
const upload = require('../config/multer');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/upload', upload.single('image'), uploadClothing);
router.get('/', getClothing);
router.get('/donated', getDonatedClothing);
router.get('/filter', filterClothing);
router.get('/:id', getClothingById);
router.put('/:id', updateClothing);
router.delete('/:id', deleteClothing);
router.post('/:id/donate', donateClothing);

module.exports = router;

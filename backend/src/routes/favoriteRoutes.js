const express = require('express');
const favoriteController = require('../controllers/favoriteController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, favoriteController.getFavorites);
router.post('/', auth, favoriteController.addFavorite);
router.delete('/:apiId', auth, favoriteController.removeFavorite);

module.exports = router;
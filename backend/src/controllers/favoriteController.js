const favoriteService = require('../services/favoriteService');

exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await favoriteService.getFavoritesByUserId(req.user.id);
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.addFavorite = async (req, res, next) => {
  try {
    const { apiId } = req.body;
    console.log('Add favorite request:', { userId: req.user.id, apiId }); 
    if (!apiId) return res.status(400).json({ error: 'กรุณาระบุ apiId' });
    const favorite = await favoriteService.addFavorite(req.user.id, apiId);
    res.status(201).json(favorite);
  } catch (error) {
    console.error('Add favorite error:', error.message);
    res.status(error.message.includes('not found') || error.message.includes('already') ? 400 : 500).json({ error: error.message });
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const { apiId } = req.params;
    console.log('Remove favorite request:', { userId: req.user.id, apiId }); // Debug
    if (!apiId) return res.status(400).json({ error: 'กรุณาระบุ apiId' });
    const result = await favoriteService.removeFavorite(req.user.id, apiId);
    res.json(result);
  } catch (error) {
    console.error('Remove favorite error:', error.message);
    res.status(error.message.includes('not found') ? 400 : 500).json({ error: error.message });
  }
};
const express = require('express');
const movieController = require('../controllers/movieController');
const router = express.Router();

router.get('/', movieController.getAllMovies);
router.get('/search', movieController.searchMovies);
router.get('/:id', movieController.getMovieById);
router.post('/sync', movieController.syncMovie);

module.exports = router;
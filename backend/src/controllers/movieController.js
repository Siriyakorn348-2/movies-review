const movieService = require('../services/movieService');

exports.getAllMovies = async (req, res, next) => {
  try {
    console.log('Fetching all movies...');
    const movies = await movieService.getAllMovies();
    if (!movies || movies.length === 0) {
      return res.status(200).json([]); 
    }
    res.json(movies);
  } catch (error) {
    console.error('Error in getAllMovies:', error);
    next(error);
  }
};

exports.getMovieById = async (req, res, next) => {
  try {
    const movie = await movieService.getMovieById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'ไม่พบหนัง' });
    res.json(movie);
  } catch (error) {
    next(error);
  }
};

exports.searchMovies = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'กรุณาระบุคำค้นหา' });
    const movies = await movieService.searchMovies(query);
    res.json(movies);
  } catch (error) {
    next(error);
  }
};

exports.syncMovie = async (req, res, next) => {
  try {
    const { apiId, title, posterUrl, releaseDate } = req.body;
    if (!apiId || !title) {
      return res.status(400).json({ error: 'กรุณาระบุ apiId และ title' });
    }

    const movie = await movieService.syncMovieWithData({ apiId, title, posterUrl, releaseDate });
    if (!movie) {
      return res.status(500).json({ error: 'ไม่สามารถบันทึกภาพยนตร์ได้' });
    }
    res.status(201).json(movie);
  } catch (error) {
    console.error('Error in syncMovie:', error.message);
    res.status(500).json({ error: 'ไม่สามารถบันทึกภาพยนตร์ได้: ' + error.message });
  }
};
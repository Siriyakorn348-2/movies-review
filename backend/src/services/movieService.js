const { PrismaClient } = require('@prisma/client');
const tmdbService = require('./tmdbService');
const prisma = new PrismaClient();

const syncMovieWithTMDB = async (tmdbMovie) => {
  try {
    if (!tmdbMovie || !tmdbMovie.id || !tmdbMovie.title) {
      console.error('Invalid TMDB movie data:', tmdbMovie);
      throw new Error('ข้อมูลภาพยนตร์จาก TMDB ไม่สมบูรณ์');
    }

    let movie = await prisma.movies.findFirst({ where: { apiId: tmdbMovie.id.toString() } });
    if (!movie) {
      movie = await prisma.movies.create({
        data: {
          apiId: tmdbMovie.id.toString(),
          title: tmdbMovie.title,
          posterUrl: tmdbMovie.poster_path
            ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
            : null,
          releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
        },
      });
    }
    return movie;
  } catch (error) {
    console.error('Error syncing movie with TMDB:', error.message);
    throw error;
  }
};

const getAllMovies = async () => {
  try {
    console.log('Calling TMDB API...');
    const tmdbMovies = await tmdbService.getPopularMovies();
    const movies = await Promise.all(tmdbMovies.map(syncMovieWithTMDB));
    return movies.filter((movie) => movie !== null);
  } catch (error) {
    console.error('Error in getAllMovies:', error.message);
    throw error;
  }
};

const getMovieById = async (apiId) => {
  try {
    if (!apiId) {
      throw new Error('apiId ไม่ถูกต้อง');
    }

    let movie = await prisma.movies.findFirst({ where: { apiId } });
    if (!movie) {
      try {
        const tmdbMovie = await tmdbService.getMovieDetails(apiId);
        movie = await syncMovieWithTMDB(tmdbMovie);
      } catch (tmdbError) {
        console.error('Failed to fetch movie from TMDB:', tmdbError.message);
        throw new Error(`ไม่สามารถดึงข้อมูลภาพยนตร์จาก TMDB ได้: ${tmdbError.message}`);
      }
    }
    return movie;
  } catch (error) {
    console.error('Error in getMovieById:', error.message);
    throw error;
  }
};

const searchMovies = async (query) => {
  try {
    const tmdbMovies = await tmdbService.searchMovies(query);
    const movies = await Promise.all(tmdbMovies.map(syncMovieWithTMDB));
    return movies.filter((movie) => movie !== null);
  } catch (error) {
    console.error('Error in searchMovies:', error.message);
    throw error;
  }
};

const syncMovieWithData = async ({ apiId, title, posterUrl, releaseDate }) => {
  try {
    let movie = await prisma.movies.findFirst({ where: { apiId } });
    if (!movie) {
      movie = await prisma.movies.create({
        data: {
          apiId,
          title,
          posterUrl,
          releaseDate: releaseDate ? new Date(releaseDate) : null,
        },
      });
    }
    return movie;
  } catch (error) {
    console.error('Error in syncMovieWithData:', error.message);
    throw error;
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  searchMovies,
  syncMovieWithData, 
};
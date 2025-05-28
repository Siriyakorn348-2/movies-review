const axios = require('axios');
require('dotenv').config();

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

const getAxiosConfig = () => {
  if (!TMDB_ACCESS_TOKEN && !TMDB_API_KEY) {
    throw new Error('TMDB_ACCESS_TOKEN หรือ TMDB_API_KEY ไม่ได้ตั้งค่าใน .env');
  }

  if (TMDB_ACCESS_TOKEN) {
    return {
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      },
    };
  }
  return {
    params: {
      api_key: TMDB_API_KEY,
    },
  };
};

const tmdbService = {
  async getPopularMovies() {
    try {
      console.log('Fetching popular movies from TMDB...');
      const config = getAxiosConfig();
      const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, config);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching popular movies:', error.response?.data || error.message);
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('การยืนยันตัวตนกับ TMDB API ล้มเหลว: ตรวจสอบ TMDB_ACCESS_TOKEN หรือ TMDB_API_KEY');
      }
      if (error.response?.status === 429) {
        throw new Error('เกินขีดจำกัดการเรียก TMDB API (429 Too Many Requests)');
      }
      throw new Error('ไม่สามารถดึงข้อมูลหนังยอดนิยมได้: ' + (error.response?.data?.status_message || error.message));
    }
  },
  async getMovieDetails(movieId) {
    try {
      if (!movieId) {
        throw new Error('movieId ไม่ถูกต้อง');
      }
      const config = getAxiosConfig();

      config.params = {
        ...config.params,
        append_to_response: 'videos,credits,similar,watch/providers,keywords',
      };
      const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, config);
      return response.data;
    } catch (error) {
      console.error('Error fetching movie details:', error.response?.data || error.message);
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('การยืนยันตัวตนกับ TMDB API ล้มเหลว: ตรวจสอบ TMDB_ACCESS_TOKEN หรือ TMDB_API_KEY');
      }
      if (error.response?.status === 404) {
        throw new Error(`ไม่พบภาพยนตร์ที่มี ID: ${movieId} ใน TMDB`);
      }
      if (error.response?.status === 429) {
        throw new Error('เกินขีดจำกัดการเรียก TMDB API (429 Too Many Requests)');
      }
      throw new Error('ไม่สามารถดึงข้อมูลรายละเอียดหนังได้: ' + (error.response?.data?.status_message || error.message));
    }
  },
  async searchMovies(query) {
    try {
      if (!query) {
        throw new Error('กรุณาระบุคำค้นหา');
      }
      const config = getAxiosConfig();
      config.params = { ...config.params, query: encodeURIComponent(query) };
      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, config);
      return response.data.results;
    } catch (error) {
      console.error('Error searching movies:', error.response?.data || error.message);
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('การยืนยันตัวตนกับ TMDB API ล้มเหลว: ตรวจสอบ TMDB_ACCESS_TOKEN หรือ TMDB_API_KEY');
      }
      if (error.response?.status === 429) {
        throw new Error('เกินขีดจำกัดการเรียก TMDB API (429 Too Many Requests)');
      }
      throw new Error('ไม่สามารถค้นหาหนังได้: ' + (error.response?.data?.status_message || error.message));
    }
  },
};

module.exports = tmdbService;
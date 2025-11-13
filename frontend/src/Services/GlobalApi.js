import axios from "axios";

const movieBaseUrl = "https://api.themoviedb.org/3";
const api_key = import.meta.env.VITE_TMDB_API_KEY;

const backendBaseUrl = import.meta.env.VITE_API_BASE_URL;

// ดึงวิดีโอที่กำลังมาแรง
const getTrendingVideos = () =>
  axios.get(`${movieBaseUrl}/trending/all/day?api_key=${api_key}&language=th-TH`);

// ดึงภาพยนตร์ตามประเภท
const getMovieByGenreId = async (id) => {
  try {
    const response = await axios.get(
      `${movieBaseUrl}/discover/movie?api_key=${api_key}&with_genres=${id}&language=th-TH`
    );
    return response;
  } catch (error) {
    console.error(`Error fetching movies by genre ID ${id}:`, error.message);
    throw error;
  }
};

const getBlogPosts = () => axios.get(`${backendBaseUrl}/blog-posts`);
const getTags = () => axios.get(`${backendBaseUrl}/tags`);
const createBlogPost = (formData) =>
  axios.post(`${backendBaseUrl}/blog-posts`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
const getMovieDetails = (id) =>
  axios.get(`${movieBaseUrl}/movie/${id}?api_key=${api_key}&language=th-TH&append_to_response=videos,credits,similar,watch/providers,keywords`);

// ดึงภาพยนตร์ทั้งหมดจากทุกค่าย (เรียงตามความนิยม)
const getDisneyMovies = async () => {
  try {
    const response = await axios.get(
      `${movieBaseUrl}/discover/movie?api_key=${api_key}&language=th-TH&sort_by=popularity.desc`
    );
    return response;
  } catch (error) {
    console.error("Error fetching all movies:", error.message);
    throw error;
  }
};
const getMovieByKeyword = async (keyword) => {
  try {
    const response = await axios.get(
      `${movieBaseUrl}/search/movie?api_key=${api_key}&language=th-TH&query=${encodeURIComponent(
        keyword
      )}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching movies by keyword:", error.message);
    throw error;
  }
};

const getMovieByCompany = async (companyId) => {
  try {
    const response = await axios.get(
      `${movieBaseUrl}/discover/movie?api_key=${api_key}&with_companies=${companyId}&language=th-TH&sort_by=popularity.desc`
    );
    return response;
  } catch (error) {
    console.error(`Error fetching movies by company ${companyId}:`, error.message);
    throw error;
  }
};

export default {
  getTrendingVideos,
  getMovieByGenreId,
  getBlogPosts,
  getTags,
  createBlogPost,
  getMovieDetails,
  getDisneyMovies,
  getMovieByKeyword,
  getMovieByCompany,
};

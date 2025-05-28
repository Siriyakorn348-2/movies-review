import axios from "axios";

const movieBaseUrl = "https://api.themoviedb.org/3";
const api_key = '2ec0d66f5bdf1dd12eefa0723f1479cf';

const movieByGenreBaseURL = `${movieBaseUrl}/discover/movie?api_key=${api_key}`;

// ดึงวิดีโอที่กำลังมาแรง
const getTrendingVideos = axios.get(
  `${movieBaseUrl}/trending/all/day?api_key=${api_key}&language=th-TH`
);

// ดึงภาพยนตร์ตามประเภท
const getMovieByGenreId = async (id) => {
  try {
    const response = await axios.get(
      `${movieByGenreBaseURL}&with_genres=${id}&language=th-TH`
    );
    return response;
  } catch (error) {
    console.error(`Error fetching movies by genre ID ${id}:`, error.response || error.message);
    throw error;
  }
};

// ดึงภาพยนตร์ตาม keyword
const getMovieByKeyword = async (keywordId) => {
  try {
    const response = await axios.get(
      `${movieBaseUrl}/discover/movie?api_key=${api_key}&with_keywords=${keywordId}&language=th-TH`
    );
    return response;
  } catch (error) {
    console.error(`Error fetching movies by keyword ID ${keywordId}:`, error.response || error.message);
    throw error;
  }
};

// ดึงภาพยนตร์ของ Disney (ใช้ company ID ของ Walt Disney Pictures)
const getDisneyMovies = async () => {
  try {
    const response = await axios.get(
      `${movieBaseUrl}/discover/movie?api_key=${api_key}&with_companies=2&language=th-TH`
    );
    return response;
  } catch (error) {
    console.error('Error fetching Disney movies:', error.response || error.message);
    throw error;
  }
};

// ดึงรายละเอียดภาพยนตร์ตาม ID
const getMovieDetails = async (id) => {
  try {
    const response = await axios.get(
      `${movieBaseUrl}/movie/${id}?api_key=${api_key}&append_to_response=videos,credits,similar,watch/providers,reviews,keywords&language=th-TH`
    );
    return response;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${id}:`, error.response || error.message);
    throw error;
  }
};

// ดึงรายละเอียดบุคคลตาม ID
const getPersonDetails = async (id) => {
  try {
    const response = await axios.get(
      `${movieBaseUrl}/person/${id}?api_key=${api_key}&append_to_response=combined_credits&language=th-TH`
    );
    return response;
  } catch (error) {
    console.error(`Error fetching person details for ID ${id}:`, error.response || error.message);
    throw error;
  }
};

// ค้นหาภาพยนตร์, รายการทีวี, และบุคคล
const searchMulti = async (query) => {
  try {
    const response = await axios.get(
      `${movieBaseUrl}/search/multi?api_key=${api_key}&query=${encodeURIComponent(query)}&language=th-TH`
    );
    return response;
  } catch (error) {
    console.error(`Error searching for query ${query}:`, error.response || error.message);
    throw error;
  }
};

export default {
  getTrendingVideos,
  getMovieByGenreId,
  getMovieByKeyword,
  getDisneyMovies,
  getMovieDetails,
  getPersonDetails,
  searchMulti,
  getBlogPosts: () => axios.get('/api/blog-posts'),
  getTags: () => axios.get('/api/tags'),
  createBlogPost: (formData) =>
    axios.post('/api/blog-posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadBlogPostImage: (blogPostId, formData) =>
    axios.post(`/api/blog-posts/${blogPostId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};


import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import { motion, AnimatePresence } from 'framer-motion';

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; 
  const navigate = useNavigate();

  useEffect(() => {
    if (query) {
      const fetchSearchResults = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(
            `http://192.168.1.165:3000/api/movies/search?query=${encodeURIComponent(query)}`
          );
          setMovies(response.data);
          setCurrentPage(1);
        } catch (error) {
          console.error('Failed to search movies:', error);
          setError('การค้นหาล้มเหลว กรุณาลองใหม่');
        } finally {
          setLoading(false);
        }
      };
      fetchSearchResults();
    } else {
      setMovies([]);
    }
  }, [query]);

  const totalPages = Math.ceil(movies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMovies = movies.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1C29] text-white px-4 sm:px-6 md:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold mb-6"
        >
          ผลการค้นหา: <span className="text-red-600">"{query || 'ไม่มีคำค้นหา'}"</span>
        </motion.h1>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-900 bg-opacity-50 p-4 rounded-lg mb-6 text-center"
          >
            <p>{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
            >
              กลับไปหน้าแรก
            </button>
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mx-8">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="flex flex-col">
                <div className="w-[150px] md:w-[220px] h-[225px] md:h-[330px] bg-gray-800 animate-pulse rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {movies.length > 0 ? (
              <div>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mx-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  {currentMovies.map((movie) => (
                    <motion.div
                      key={movie.apiId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col"
                    >
                      <MovieCard movie={movie} />
                    </motion.div>
                  ))}
                </motion.div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-8 space-x-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-md text-sm ${
                        currentPage === 1
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      ก่อนหน้า
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => goToPage(index + 1)}
                        className={`px-4 py-2 rounded-md text-sm ${
                          currentPage === index + 1
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-md text-sm ${
                        currentPage === totalPages
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      ถัดไป
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64"
              >
                <p className="text-gray-400 text-lg mb-4">ไม่พบผลลัพธ์สำหรับ "{query}"</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
                >
                  ค้นหาใหม่
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default Search;
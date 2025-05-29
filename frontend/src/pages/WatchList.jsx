import { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

function WatchList() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; 

  useEffect(() => {
    if (user) {
      const fetchFavorites = async () => {
        try {
          setLoading(true);
          const response = await axios.get('http://192.168.1.165:3000/api/favorites', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setFavorites(response.data);
          setError(null);
        } catch (error) {
          console.error('Failed to fetch favorites:', error.response?.data || error.message);
          setError('ไม่สามารถโหลดรายการโปรดได้: ' + (error.response?.data?.error || error.message));
        } finally {
          setLoading(false);
        }
      };
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleRemove = async (movieId) => {
    try {
      await axios.delete(`http://192.168.1.165:3000/api/favorites/${movieId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setFavorites((prev) => prev.filter((f) => f.movie.apiId !== movieId));
    } catch (error) {
      console.error('Failed to remove favorite:', error.response?.data || error.message);
    }
  };

  const totalPages = Math.ceil(favorites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFavorites = favorites.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A1C29] text-white flex items-center justify-center">
        <p className="text-xl">กรุณาเข้าสู่ระบบเพื่อดูรายการโปรด</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1C29] text-white px-4 sm:px-6 md:px-8 py-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">รายการโปรด</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="flex flex-col">
              <div className="w-[150px] md:w-[220px] h-[225px] md:h-[330px] bg-gray-800 animate-pulse rounded-lg" />
              <div className="mt-2 w-full h-8 bg-gray-800 animate-pulse rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1A1C29] text-red-600 flex items-center justify-center">
        <p className="text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1C29] text-white px-4 sm:px-6 md:px-8 py-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold mb-6 ml-15"
      >
        รายการโปรด
      </motion.h1>
      {favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-64"
        >
          <p className="text-gray-400 text-lg mb-4">คุณยังไม่มีภาพยนตร์ในรายการโปรด</p>
          <button
            onClick={() => navigate('/search')}
            className="px- py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
          >
            ค้นหาภาพยนตร์
          </button>
        </motion.div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <AnimatePresence>
              {currentFavorites.map((favorite) => (
                <motion.div
                  key={favorite.movie.apiId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col"
                >
                  <MovieCard movie={favorite.movie} />
                  <button
                    onClick={() => handleRemove(favorite.movie.apiId)}
                    className="mt-2 w-full bg-red-600 text-white py-1.5 rounded-md hover:bg-red-700 transition text-sm md:text-base"
                  >
                    ลบออกจากรายการโปรด
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
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
      )}
    </div>
  );
}

export default WatchList;
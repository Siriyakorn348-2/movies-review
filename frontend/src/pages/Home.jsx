import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import Slider from '../components/Slider';
import GenreMovieList from '../components/GenreMovieList';
import ProductionHouse from '../components/ProductionHouse';

function Home() {
  const { user, loading: authLoading } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      const cachedMovies = localStorage.getItem('cachedMovies');
      if (cachedMovies) {
        setMovies(JSON.parse(cachedMovies));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:3000/api/movies');
        setMovies(response.data);
        localStorage.setItem('cachedMovies', JSON.stringify(response.data));
      } catch (error) {
        console.error('Failed to fetch movies:', error);
        if (error.response?.status === 429) {
          setError('ส่งคำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่');
        } else {
          setError('ไม่สามารถโหลดรายการภาพยนตร์ได้ กรุณาลองใหม่');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (authLoading) return <div className="text-center text-white">กำลังโหลด...</div>;
  if (loading) return <div className="text-center text-white">กำลังโหลด...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;

  return (
    <div>
      <Slider />
      <ProductionHouse />
      <GenreMovieList/>
  
      
    </div>
  );
}

export default Home;
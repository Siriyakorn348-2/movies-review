import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import GlobalApi from '../Services/GlobalApi';
import MovieCard from '../components/MovieCard';

function CategoryMovies() {
  const { categoryId } = useParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryMapping = {
    disney: { type: 'company', id: 2 }, 
    pixar: { type: 'company', id: 3 },   
    marvel: { type: 'company', id: 420 }, 
    starwars: { type: 'company', id: 1 }, 
    'national-geographic': { type: 'genre', id: 99 }, 
  };

  useEffect(() => {
    const fetchMoviesByCategory = async () => {
      setLoading(true);
      setError(null);
      try {
        const category = categoryMapping[categoryId];
        if (!category) {
          throw new Error('ไม่พบหมวดหมู่ที่เลือก');
        }

        let response;
      if (category.type === 'company') {
        response = await GlobalApi.getMovieByCompany(category.id);
      } else if (category.type === 'genre') {
        response = await GlobalApi.getMovieByGenreId(category.id);
      } else if (category.type === 'keyword') {
        response = await GlobalApi.getMovieByKeyword(category.id);
      }

        setMovies(response.data.results);
      } catch (err) {
        setError('ไม่สามารถโหลดรายการภาพยนตร์ได้: ' + (err.response?.data?.status_message || err.message));
        console.error('Error fetching movies by category:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMoviesByCategory();
  }, [categoryId]);

  if (loading) {
    return <div className="text-white text-center mt-10">กำลังโหลด...</div>;
  }

  if (error) {
    return <div className="text-white text-center mt-10">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-7 capitalize text-white ">
        ภาพยนตร์จาก {categoryId.replace('-', ' ')}
      </h1>
      {movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-7">
          {movies.map((movie) => (
            <Link to={`/movies/${movie.id}`} key={movie.id}>
              <MovieCard movie={movie} />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-white text-center">ไม่มีภาพยนตร์ในหมวดหมู่นี้</p>
      )}
    </div>
  );
}

export default CategoryMovies;
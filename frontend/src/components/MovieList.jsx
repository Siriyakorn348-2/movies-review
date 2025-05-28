import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import GlobalApi from '../Services/GlobalApi';
import MovieCard from './MovieCard';
import HrMovieCard from './HrMovieCard';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';

function MovieList({ genreId, index_ }) {
  const [movieList, setMovieList] = useState([]);
  const elementRef = useRef(null);

  useEffect(() => {
    getMovieByGenreId();
  }, [genreId]); 

  const getMovieByGenreId = async () => {
    try {
      const resp = await GlobalApi.getMovieByGenreId(genreId);
      setMovieList(resp.data.results);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const slideRight = (element) => {
    element.scrollLeft += 600; 
  };

  const slideLeft = (element) => {
    element.scrollLeft -= 600;
  };

  return (
    <div className="relative px-4 sm:px-6 md:px-8">

      <IoChevronBackOutline
        onClick={() => slideLeft(elementRef.current)}
        className={`text-[40px] sm:text-[50px] text-white p-2 z-10 cursor-pointer
        hidden md:block absolute left-0 top-1/2 -translate-y-1/2 bg-black/50
        hover:bg-black/80 transition-all rounded-full`}
      />

      <div
        ref={elementRef}
        className="flex overflow-x-auto gap-4 sm:gap-6 scrollbar-none scroll-smooth py-4"
      >
        {movieList.map((item) => (
          <Link to={`/movies/${item.id}`} key={item.id} className="flex-shrink-0">
            {index_ % 2 === 0 ? (
              <HrMovieCard movie={item} />
            ) : (
              <MovieCard movie={item} />
            )}
          </Link>
        ))}
      </div>

      <IoChevronForwardOutline
        onClick={() => slideRight(elementRef.current)}
        className={`text-[40px] sm:text-[50px] text-white p-2 z-10 cursor-pointer
        hidden md:block absolute right-0 top-1/2 -translate-y-1/2 bg-black/50
        hover:bg-black/80 transition-all rounded-full`}
      />
    </div>
  );
}

export default MovieList;
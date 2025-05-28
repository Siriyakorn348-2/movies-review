import React from 'react';
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

function HrMovieCard({ movie }) {
  return (
    <div className="relative group transition-transform duration-300 ease-in-out hover:scale-105 hover:z-10">
      <img
        src={`${IMAGE_BASE_URL}${movie.poster_path || movie.backdrop_path}`}
        alt={movie.title || movie.name || 'Movie poster'}
        className="w-[120px] sm:w-[160px] md:w-[200px] lg:w-[240px] rounded-md
        object-cover shadow-md cursor-pointer border-2 border-transparent
        group-hover:border-white/80 group-hover:shadow-lg transition-all"
        loading="lazy"
      />
    </div>
  );
}

export default HrMovieCard;
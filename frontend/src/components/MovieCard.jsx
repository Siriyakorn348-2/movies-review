import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER_IMAGE = '/placeholder.jpg'; 

function MovieCard({ movie }) {
  const movieId = movie.apiId || movie.id;
  const [imageSrc, setImageSrc] = useState(
    movie.posterUrl || (movie?.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : PLACEHOLDER_IMAGE)
  );
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleImageError = (e) => {
    if (e.target.src !== PLACEHOLDER_IMAGE) {
      setImageSrc(PLACEHOLDER_IMAGE);
    }
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
    <Link to={`/movies/${movieId}`} className="block group">
      <div className="relative overflow-hidden rounded-lg shadow-lg">
        <img
          src={imageSrc}
          className={`w-[150px] md:w-[220px] rounded-lg border-gray-600 cursor-pointer group-hover:scale-103 group-hover:border-[3px] transition-transform duration-200 ease-in object-cover aspect-[2/3] ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          alt={movie.title || 'Poster image not available'}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg" />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <p className="text-white text-sm md:text-base font-semibold text-center px-2">
            {movie.title || 'No title available'}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default MovieCard;
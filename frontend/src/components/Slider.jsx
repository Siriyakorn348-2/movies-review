import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import GlobalApi from '../Services/GlobalApi';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

function Slider() {
  const [movieList, setMovieList] = useState([]);
  const elementRef = useRef(null);
  const autoScrollRef = useRef(null);
  const itemWidthRef = useRef(0);

  useEffect(() => {
    getTrendingMovies();
    calculateItemWidth();
    startAutoScroll();

    window.addEventListener('resize', calculateItemWidth);
    return () => {
      stopAutoScroll();
      window.removeEventListener('resize', calculateItemWidth);
    };
  }, []);

  const getTrendingMovies = async () => {
    try {
      const resp = await GlobalApi.getTrendingVideos();
      setMovieList(resp.data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateItemWidth = () => {
    const w = window.innerWidth;
    if (w < 640) itemWidthRef.current = w - 32; 
    else if (w < 1024) itemWidthRef.current = w - 64; 
    else itemWidthRef.current = w - 128; 
  };

  const sliderRight = () => {
    const el = elementRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    if (el.scrollLeft >= maxScrollLeft - 10) el.scrollLeft = 0;
    else el.scrollLeft += itemWidthRef.current;
  };

  const sliderLeft = () => {
    const el = elementRef.current;
    if (!el) return;
    if (el.scrollLeft <= 0) el.scrollLeft = el.scrollWidth - el.clientWidth;
    else el.scrollLeft -= itemWidthRef.current;
  };

  const startAutoScroll = () => {
    if (!autoScrollRef.current) {
      autoScrollRef.current = setInterval(sliderRight, 3500);
    }
  };

  const stopAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={stopAutoScroll}
      onMouseLeave={startAutoScroll}
    >

      <HiChevronLeft
        className="hidden md:block text-white text-4xl absolute left-4 md:left-8 top-1/2 -translate-y-1/2 cursor-pointer z-10"
        onClick={sliderLeft}
      />
      <HiChevronRight
        className="hidden md:block text-white text-4xl absolute right-4 md:right-8 top-1/2 -translate-y-1/2 cursor-pointer z-10"
        onClick={sliderRight}
      />

 
      <div
        ref={elementRef}
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory px-2 sm:px-4 md:px-8"
        style={{ scrollbarWidth: 'none' }}
      >
        {movieList.map((item) => (
          <Link
            to={`/movies/${item.id}`}
            key={item.id}
            className="snap-center shrink-0 px-1 sm:px-2 md:px-4"
            style={{ width: itemWidthRef.current }}
          >
            <img
              src={IMAGE_BASE_URL + item.backdrop_path}
              alt={item.title || 'movie backdrop'}
              loading="lazy"
              className="w-full h-[200px] sm:h-[320px] md:h-[420px] lg:h-[550px] xl:h-[600px]
                         object-cover rounded-lg transition-all duration-200
                         hover:scale-[1.02] hover:border-4 border-gray-400"
            />
          </Link>
        ))}
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default Slider;

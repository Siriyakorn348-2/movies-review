import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom'; 
import GlobalApi from '../Services/GlobalApi';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";
const ITEM_WIDTH = 1650; 
const MARGIN_RIGHT = 32; 

function Slider() {
  const [movieList, setMovieList] = useState([]);
  const elementRef = useRef();
  const autoScrollRef = useRef(null);

  useEffect(() => {
    getTrendingMovies();
    startAutoScroll();
    return () => stopAutoScroll();
  }, []);

const getTrendingMovies = async () => {
  try {
    const resp = await GlobalApi.getTrendingVideos();
    console.log(resp.data.results);
    setMovieList(resp.data.results);
  } catch (err) {
    console.error(err);
  }
};

  const sliderRight = (element) => {
    const maxScrollLeft = element.scrollWidth - element.clientWidth;
    if (element.scrollLeft >= maxScrollLeft - 10) {
      element.scrollLeft = 0;
    } else {
      element.scrollLeft += ITEM_WIDTH + MARGIN_RIGHT;
    }
  };

  const sliderLeft = (element) => {
    if (element.scrollLeft <= 0) {
      element.scrollLeft = element.scrollWidth - element.clientWidth;
    } else {
      element.scrollLeft -= ITEM_WIDTH + MARGIN_RIGHT;
    }
  };

  const startAutoScroll = () => {
    if (!autoScrollRef.current) {
      autoScrollRef.current = setInterval(() => {
        if (elementRef.current) {
          sliderRight(elementRef.current);
        }
      }, 3000);
    }
  };

  const stopAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    stopAutoScroll();
  };

  const handleMouseLeave = () => {
    startAutoScroll();
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <HiChevronLeft
        className="hidden md:block text-white text-[40px] absolute left-8 top-[300px] cursor-pointer z-10"
        onClick={() => sliderLeft(elementRef.current)}
      />
      <HiChevronRight
        className="hidden md:block text-white text-[40px] absolute right-8 top-[300px] cursor-pointer z-10"
        onClick={() => sliderRight(elementRef.current)}
      />

      <div
        className="flex overflow-x-auto w-full px-16 py-4 scroll-smooth snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        ref={elementRef}
      >
        {movieList.map((item) => (
          <Link to={`/movies/${item.id}`} key={item.id}>
            <img
              src={IMAGE_BASE_URL + item.backdrop_path}
              className="min-w-[1650px] md:h-[600px] object-cover object-left-top mr-8 rounded-md hover:border-[4px] border-gray-400 transition-all duration-100 ease-in snap-center"
              alt={item.title || 'ภาพพื้นหลังภาพยนตร์'}
              loading="lazy"
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
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import GlobalApi from '../Services/GlobalApi';
import { useAuth } from '../context/AuthContext';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';



function MovieDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [backendMovieId, setBackendMovieId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: '', comment: '' });
  const [submitError, setSubmitError] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching movie details for TMDB ID:', id);
        if (!id) throw new Error('TMDB ID is missing');

        // ดึงข้อมูลภาพยนตร์จาก TMDB API
        const tmdbResponse = await GlobalApi.getMovieDetails(id);
        setMovie(tmdbResponse.data);

        let movieInDb;
        try {
          const backendResponse = await axios.get(`${API_BASE_URL}/movies/${id}`);
          movieInDb = backendResponse.data;
          setBackendMovieId(movieInDb.movieId);
        } catch (backendError) {
          console.warn('Movie not found in backend:', backendError.response?.data || backendError.message);
         
          try {
            const response = await axios.post(`${API_BASE_URL}/movies/sync`, {
              apiId: id,
              title: tmdbResponse.data.title,
              posterUrl: tmdbResponse.data.poster_path
                ? `https://image.tmdb.org/t/p/original${tmdbResponse.data.poster_path}`
                : null,
              releaseDate: tmdbResponse.data.release_date
                ? new Date(tmdbResponse.data.release_date)
                : null,
            });
            movieInDb = response.data;
            setBackendMovieId(movieInDb.movieId);
          } catch (syncError) {
            console.error('Error syncing movie with backend:', syncError.response?.data || syncError.message);
            setError('ไม่สามารถบันทึกภาพยนตร์ในระบบได้: ' + (syncError.response?.data?.error || syncError.message));
            setBackendMovieId(null);
          }
        }

        if (movieInDb && movieInDb.movieId) {
          try {
            const reviewsResponse = await axios.get(
              `${API_BASE_URL}/reviews?movieId=${movieInDb.movieId}`
            );
            setReviews(reviewsResponse.data);
          } catch (reviewError) {
            console.error('Error fetching reviews:', reviewError.response?.data || reviewError.message);
            if (reviewError.response?.status === 404) {
              setReviews([]); 
            } else {
              setError('ไม่สามารถโหลดรีวิวได้: ' + (reviewError.response?.data?.error || reviewError.message));
            }
          }
        }

        if (user) {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No token found');
          const favoritesResponse = await axios.get(`${API_BASE_URL}/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsFavorite(favoritesResponse.data.some((fav) => fav.movie.apiId === id));
        }
      } catch (err) {
        console.error('Error fetching movie details:', err.response?.data || err.message);
        setError('ไม่สามารถโหลดข้อมูลภาพยนตร์ได้: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบเพื่อเพิ่มรายการโปรด');
      return;
    }
    if (!id) {
      setError('ไม่สามารถเพิ่มรายการโปรดได้: ไม่พบ ID ภาพยนตร์');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setError('ไม่สามารถเพิ่มรายการโปรดได้: กรุณาเข้าสู่ระบบใหม่');
      return;
    }
    try {
      if (isFavorite) {
        await axios.delete(`${API_BASE_URL}/favorites/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavorite(false);
      } else {
        await axios.post(
          `${API_BASE_URL}/favorites`,
          { apiId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorite(true);
      }
      setError(null);
    } catch (error) {
      setError('ไม่สามารถเพิ่ม/ลบรายการโปรดได้: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('กรุณาเข้าสู่ระบบเพื่อรีวิว');
      return;
    }

    const ratingValue = parseFloat(reviewForm.rating);
    if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 10) {
      setSubmitError('คะแนนต้องอยู่ระหว่าง 0 ถึง 10');
      return;
    }

    if (!reviewForm.comment.trim()) {
      setSubmitError('กรุณากรอกความคิดเห็น');
      return;
    }

    if (!backendMovieId) {
      setSubmitError('ไม่สามารถส่งรีวิวได้: ภาพยนตร์นี้ยังไม่มีในระบบ');
      return;
    }

    try {
      setSubmitError(null);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/reviews`,
        {
          movieId: backendMovieId,
          rating: ratingValue,
          comment: reviewForm.comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviewForm({ rating: '', comment: '' });
      const reviewsResponse = await axios.get(
        `${API_BASE_URL}/reviews?movieId=${backendMovieId}`
      );
      setReviews(reviewsResponse.data);
    } catch (error) {
      console.error('Failed to submit review:', error.response?.data || error.message);
      setSubmitError(error.response?.data?.error || 'ไม่สามารถส่งรีวิวได้ กรุณาลองใหม่');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(reviews.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error('Failed to delete review:', error.response?.data || error.message);
      setSubmitError('ไม่สามารถลบรีวิวได้: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return <div className="text-white text-center mt-10">กำลังโหลด...</div>;
  }

  if (error && !movie) {
    return <div className="text-white text-center mt-10">{error}</div>;
  }

  if (!movie.videos || !movie.credits || !movie.similar) {
    console.warn('TMDB data incomplete:', movie);
    setError('ข้อมูลภาพยนตร์จาก TMDB ไม่ครบถ้วน');
    return <div className="text-white text-center mt-10">ข้อมูลภาพยนตร์ไม่ครบถ้วน</div>;
  }

  const trailer = movie.videos.results.find((video) => video.type === 'Trailer') || movie.videos.results[0];
  const cast = movie.credits.cast.slice(0, 6);
  const director = movie.credits.crew.find((crew) => crew.job === 'Director');
  const producer = movie.credits.crew.find((crew) => crew.job === 'Producer');
  const similarMovies = movie.similar.results.slice(0, 6);
  const providers = movie['watch/providers'].results.TH || movie['watch/providers'].results.US || {};
  const keywords = movie.keywords.keywords.slice(0, 10);

  return (
    <div className="bg-[#1A1C29] min-h-screen text-white p-8 md:p-16">
      {error && <div className="text-red-600 text-center mb-4">{error}</div>}
      <div
        className="relative bg-cover bg-center rounded-lg mb-8"
        style={{ backgroundImage: `url(${IMAGE_BASE_URL + movie.backdrop_path})` }}
      >
        <div className="bg-black bg-opacity-50 p-8 rounded-lg flex flex-col md:flex-row gap-8">
          <img
            src={IMAGE_BASE_URL + movie.poster_path}
            alt={movie.title}
            className="w-full md:w-[300px] rounded-lg"
          />
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold">{movie.title}</h1>
            <p className="mt-2 text-gray-400">{movie.tagline}</p>
            <p className="mt-4">{movie.overview}</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>วันที่ฉาย:</strong> {movie.release_date}</p>
              <p><strong>ความยาว:</strong> {movie.runtime} นาที</p>
              <p><strong>ประเภท:</strong> {movie.genres.map((g) => g.name).join(', ')}</p>
              <p><strong>คะแนน:</strong> {movie.vote_average.toFixed(1)}/10 ({movie.vote_count} โหวต)</p>
              <p><strong>งบประมาณ:</strong> {movie.budget ? `$${movie.budget.toLocaleString()}` : 'ไม่ระบุ'}</p>
              <p><strong>รายได้:</strong> {movie.revenue ? `$${movie.revenue.toLocaleString()}` : 'ไม่ระบุ'}</p>
            </div>
            <div className="mt-4 flex gap-4">
              {movie.homepage && (
                <a
                  href={movie.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-950 text-white px-4 py-2 rounded-md hover:bg-blue-300"
                >
                  เยี่ยมชมเว็บไซต์อย่างเป็นทางการ
                </a>
              )}
              <button
                onClick={toggleFavorite}
                className={`inline-block px-4 py-2 rounded-md ${
                  isFavorite ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
                disabled={!id || !user}
              >
                {isFavorite ? 'ลบจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {trailer && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">เทรลเลอร์</h2>
          <iframe
            src={`https://www.youtube.com/embed/${trailer.key}`}
            title={trailer.name}
            className="w-full h-[300px] md:h-[500px] rounded-lg"
            allowFullScreen
          />
        </div>
      )}

     {cast.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">นักแสดง</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {cast.map((actor) => (
              <div key={actor.id} className="text-center min-w-[150px] flex-shrink-0">
                <div className="w-[120px] h-[120px] mx-auto rounded-full overflow-hidden bg-gray-700">
                  <img
                    src={actor.profile_path ? IMAGE_BASE_URL + actor.profile_path : '/images/actorimg.jpg'}
                    alt={actor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-2 font-semibold">{actor.name}</p>
                <p className="text-gray-400">{actor.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}



      {(director || producer) && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">ทีมงาน</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {director && <p><strong>ผู้กำกับ:</strong> {director.name}</p>}
            {producer && <p><strong>ผู้อำนวยการสร้าง:</strong> {producer.name}</p>}
          </div>
        </div>
      )}

      {(providers.flatrate || providers.rent || providers.buy) && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">รับชมได้ที่</h2>
          <div className="flex flex-wrap gap-4">
            {providers.flatrate?.map((provider) => (
              <div key={provider.provider_id} className="flex items-center gap-2">
                <img
                  src={IMAGE_BASE_URL + provider.logo_path}
                  alt={provider.provider_name}
                  className="w-[40px] rounded"
                />
                <p>{provider.provider_name} (สตรีม)</p>
              </div>
            ))}
            {providers.rent?.map((provider) => (
              <div key={provider.provider_id} className="flex items-center gap-2">
                <img
                  src={IMAGE_BASE_URL + provider.logo_path}
                  alt={provider.provider_name}
                  className="w-[40px] rounded"
                />
                <p>{provider.provider_name} (เช่า)</p>
              </div>
            ))}
            {providers.buy?.map((provider) => (
              <div key={provider.provider_id} className="flex items-center gap-2">
                <img
                  src={IMAGE_BASE_URL + provider.logo_path}
                  alt={provider.provider_name}
                  className="w-[40px] rounded"
                />
                <p>{provider.provider_name} (ซื้อ)</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">รีวิวจากผู้ใช้</h2>
        {user ? (
          <form onSubmit={handleReviewSubmit} className="mb-6 bg-[#141414] p-4 rounded-lg">
            {submitError && <p className="text-red-600 mb-4">{submitError}</p>}
            <div className="mb-4">
              <label className="block mb-1">คะแนน (0-10)</label>
              <div className="flex gap-1">
                {[...Array(10)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <svg
                      key={ratingValue}
                      className={`w-6 h-6 cursor-pointer ${
                        ratingValue <= (hoverRating || parseFloat(reviewForm.rating) || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-400'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      onMouseEnter={() => setHoverRating(ratingValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setReviewForm({ ...reviewForm, rating: ratingValue })}
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  );
                })}
              </div>
              <p className="text-gray-400 mt-1">
                คะแนน: {parseFloat(reviewForm.rating) || 0}/10
              </p>
            </div>
            <div className="mb-4">
              <label className="block mb-1">ความคิดเห็น</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="w-full p-2 bg-[#2A2A2A] rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                rows="3"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700"
              disabled={!backendMovieId}
            >
              ส่งรีวิว
            </button>
            {!backendMovieId && (
              <p className="text-gray-400 mt-2">กำลังบันทึกภาพยนตร์ในระบบ...</p>
            )}
          </form>
        ) : (
          <p className="text-gray-400 mb-6">กรุณาเข้าสู่ระบบเพื่อรีวิว</p>
        )}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="bg-[#141414] p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">{review.user.username}</p>
                  {user && user.id === review.userId && (
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-red-600 hover:underline"
                    >
                      ลบ
                    </button>
                  )}
                </div>
                <p className="text-gray-400">คะแนน: {review.rating}/10</p>
                <p className="mt-2 text-gray-300">{review.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">ยังไม่มีรีวิวสำหรับภาพยนตร์นี้</p>
          )}
        </div>
      </div>

      {keywords.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">คำสำคัญ</h2>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <span
                key={keyword.id}
                className="bg-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {keyword.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {similarMovies.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">ภาพยนตร์ที่คล้ายกัน</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {similarMovies.map((movie) => (
              <Link
                to={`/movies/${movie.id}`}
                key={movie.id}
                className="min-w-[150px] flex-shrink-0"
              >
                <div className="w-[150px]">
                  <img
                    src={movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : '/placeholder.png'}
                    alt={movie.title}
                    className="w-full rounded-lg hover:border-[3px] border-gray-400"
                  />
                  <p
                    className="mt-2 text-center text-sm font-medium truncate"
                    title={movie.title}
                  >
                    {movie.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieDetails;
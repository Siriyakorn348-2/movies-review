import { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewCard from '../components/ReviewCard';
import { useAuth } from '../context/AuthContext';

function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({
    movieId: '',
    rating: '',
    comment: '',
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://192.168.1.165:3000/api/reviews');
        setReviews(response.data);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };
    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://192.168.1.165:3000/api/movies');
        setMovies(response.data);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      }
    };
    fetchReviews();
    fetchMovies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://192.168.1.165:3000/api/reviews', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setForm({ movieId: '', rating: '', comment: '' });
      const response = await axios.get('http://192.168.1.165:3000/api/reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://192.168.1.165:3000/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl mb-4">รีวิวภาพยนตร์</h1>
      {user && (
        <form onSubmit={handleSubmit} className="mb-6 bg-[#141414] p-4 rounded-lg shadow-lg">
          <div className="mb-4">
            <label className="block mb-1">เลือกภาพยนตร์</label>
            <select
              value={form.movieId}
              onChange={(e) => setForm({ ...form, movieId: e.target.value })}
              className="w-full p-2 bg-[#2A2A2A] rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            >
              <option value="">เลือกภาพยนตร์</option>
              {movies.map((movie) => (
                <option key={movie.apiId} value={movie.apiId}>
                  {movie.title}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1">คะแนน (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
              className="w-full p-2 bg-[#2A2A2A] rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">ความคิดเห็น</label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="w-full p-2 bg-[#2A2A2A] rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              rows="3"
            ></textarea>
          </div>
          <button type="submit" className="w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700">
            ส่งรีวิว
          </button>
        </form>
      )}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

export default Reviews;
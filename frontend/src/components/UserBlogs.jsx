import { useState, useEffect } from 'react';
import axios from 'axios';
import BlogPostCard from './BlogPostCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function UserBlogs() {
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchUserPosts = async () => {
        try {
          setLoading(true);
          const response = await axios.get('http://localhost:3000/api/blog-posts', {
            params: { userId: user.id },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          console.log('Fetched user posts:', response.data);
          setUserPosts(response.data);
          setError(null);
        } catch (error) {
          console.error('Failed to fetch user posts:', error);
          setError(error.response?.data?.error || 'ไม่สามารถโหลดบล็อกของฉันได้ กรุณาลองใหม่');
        } finally {
          setLoading(false);
        }
      };
      fetchUserPosts();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) return <div className="text-gray-400 text-center py-10">กรุณาเข้าสู่ระบบ</div>;

  return (
    <div className="space-y-6 mt-5">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">บล็อกของฉัน</h2>
        <Link
          to="/blogs/create"
          className="bg-blue-200 text-white px-5 py-2 rounded-lg hover:bg-blue-400 transition duration-300 shadow-md"
        >
          สร้างบล็อกใหม่
        </Link>
      </div>
      {loading ? (
        <div className="text-gray-400 text-center py-10">กำลังโหลด...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-10">{error}</div>
      ) : userPosts.length === 0 ? (
        <p className="text-gray-400">
          คุณยังไม่มีบล็อก{' '}
          <Link to="/blogs/create" className="text-blue-400 hover:underline">
            สร้างเลย!
          </Link>
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {userPosts.map((post) => (
            <BlogPostCard key={post.id} blogPost={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default UserBlogs;
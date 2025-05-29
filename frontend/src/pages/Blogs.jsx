import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import BlogPostCard from '../components/BlogPostCard';
import { useAuth } from '../context/AuthContext';

function Blogs() {
  const { user } = useAuth();
  const location = useLocation();
  const [blogPosts, setBlogPosts] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [error, setError] = useState(null);

  const POSTS_PER_PAGE = 10;
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  useEffect(() => {
  const fetchBlogPosts = async () => {
    try {
      const params = new URLSearchParams(location.search);
      const tagId = params.get('tag');
      let url = 'http://192.168.1.165:3000/api/blog-posts';
      if (tagId) {
        url = `http://192.168.1.165:3000/api/blog-posts/tag/${tagId}`;
      }
      const response = await axios.get(url);
      // เรียงลำดับโพสต์จากใหม่ไปเก่า
      const sortedPosts = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBlogPosts(sortedPosts);
      setError(null);
      setVisibleCount(POSTS_PER_PAGE);
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
      setError('ไม่สามารถโหลดบล็อกได้ กรุณาลองใหม่');
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get('http://192.168.1.165:3000/api/tags');
      setAvailableTags(response.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      setError('ไม่สามารถโหลดแท็กได้');
    }
  };

  fetchBlogPosts();
  fetchTags();
}, [location.search]);

  const handleDelete = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?')) return;
    try {
      await axios.delete(`http://192.168.1.165:3000/api/blog-posts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setBlogPosts((prev) => prev.filter((post) => post.id !== id));
      setError(null);
    } catch (error) {
      console.error('Failed to delete blog post:', error);
      const errorMessage = error.response?.data?.error || 'ไม่สามารถลบโพสต์ได้ กรุณาลองใหม่';
      setError(errorMessage);
    }
  };

  const showMore = () => {
    setVisibleCount((prev) => prev + POSTS_PER_PAGE);
  };

  const visiblePosts = blogPosts.slice(0, visibleCount);

  return (
    <div className="bg-[#1A1C29] text-white min-h-screen p-4 sm:p-6 md:p-8 font-['Sarabun']">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Blog</h1>
        {user && (
          <Link
            to="/blogs/create"
            className="bg-blue-200 text-white px-4 py-2 rounded-md hover:bg-blue-400 transition"
          >
            สร้างบล็อกใหม่
          </Link>
        )}
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {blogPosts.length === 0 && !error && <div>ไม่มีบล็อกในขณะนี้</div>}

      <div className="space-y-4">
        {visiblePosts.map((post) => (
          <BlogPostCard key={post.id} blogPost={post} onDelete={handleDelete} />
        ))}
      </div>

      {visibleCount < blogPosts.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={showMore}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded"
          >
            แสดงเพิ่มเติม
          </button>
        </div>
      )}
    </div>
  );
}

export default Blogs;
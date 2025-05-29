import { useState, useEffect } from 'react';
import axios from 'axios';
import BlogPostCard from '../components/BlogPostCard';
import { useAuth } from '../context/AuthContext';

function SavedBlogPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  const fetchSavedPosts = async () => {
    if (!user) return;
    try {
      const response = await axios.get('http://192.168.1.165:3000/api/saved-blog-posts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log('Fetched saved posts in SavedBlogPosts:', response.data);
      setPosts(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch saved posts:', error);
      setError('ไม่สามารถโหลดบล็อกที่บันทึกไว้ได้');
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, [user]);

  const handleRemove = async (blogPostId) => {
    try {
      await axios.delete(`http://192.168.1.165:3000/api/saved-blog-posts/${blogPostId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPosts((prev) => prev.filter((p) => p.blogPost.id !== blogPostId));
    } catch (error) {
      console.error('Failed to remove saved post:', error);
      setError('ไม่สามารถลบบล็อกที่บันทึกได้');
    }
  };

  if (!user) return <div className="text-gray-400 text-center py-10">กรุณาเข้าสู่ระบบเพื่อดูบล็อกที่บันทึก</div>;

  return (
    <div className="space-y-4 mt-5">
      <h2 className="text-2xl font-semibold text-white">บล็อกที่บันทึกไว้</h2>
      {error && <div className="text-red-500 text-center">{error}</div>}
      {posts.length === 0 ? (
        <p className="text-gray-400">คุณยังไม่มีบล็อกที่บันทึกไว้</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {posts.map((savedPost) => (
            <div key={savedPost.blogPost.id} className="relative">
              <BlogPostCard blogPost={savedPost.blogPost} />
              <button
                onClick={() => handleRemove(savedPost.blogPost.id)}
                className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700 transition text-sm shadow-md"
              >
                ลบ
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedBlogPosts;
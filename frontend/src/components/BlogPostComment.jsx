import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function BlogPostComment({ comment, onDelete }) {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDeleteComment = async () => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคอมเมนต์นี้?')) return;

    setIsDeleting(true);
    setError(null);

    try {
      await axios.delete(`http://localhost:3000/api/comments/${comment.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      onDelete(comment.id);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setError(error.response?.data?.error || 'ไม่สามารถลบคอมเมนต์ได้ กรุณาลองใหม่');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateTime = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Bangkok',
    };
    return new Date(dateString).toLocaleString('th-TH', options);
  };

  return (
    <div className="bg-black rounded-lg p-3 mb-2 border border-blue-950">
      {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <img
            src={`${comment.user?.img || 'https://cdn-icons-png.flaticon.com/512/164/164600.png'}?t=${new Date().getTime()}`}
            alt="User avatar"
            className="w-8 h-8 rounded-full"
            onError={(e) => (e.target.src = 'https://cdn-icons-png.flaticon.com/512/164/164600.png')} 
          />
          <div>
            <p className="text-gray-400">
              <strong>{comment.user?.username || 'ไม่ระบุผู้ใช้'}</strong>: {comment.content}
            </p>
            <p className="text-gray-500 text-sm">{formatDateTime(comment.createdAt)}</p>
          </div>
        </div>
        {user && user.id === comment.userId && (
          <div className="relative">
            <button
              onClick={toggleMenu}
              disabled={isDeleting}
              className={`text-white bg-gray-800 hover:bg-blue-900 hover:text-blue-400 p-2 rounded-full focus:outline-none transition ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="เมนูตัวเลือกคอมเมนต์"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                  d="M12 6h.01M12 12h.01M12 18h.01"
                />
              </svg>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-black rounded-md shadow-lg z-10 border border-blue-950">
                <button
                  onClick={handleDeleteComment}
                  disabled={isDeleting}
                  className={`block w-full text-left px-4 py-2 text-white hover:bg-gray-800 hover:text-blue-400 transition ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isDeleting ? 'กำลังลบ...' : 'ลบคอมเมนต์'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogPostComment;
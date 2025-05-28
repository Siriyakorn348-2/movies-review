
import { Link } from 'react-router-dom';

function BlogPostHeader({
  blogPost,
  user,
  isSaved,
  saveMessage,
  error,
  isMenuOpen,
  onSaveBlog,
  onToggleMenu,
  onEditToggle,
  onDelete,
  isSaveLoading,
}) {
  return (
    <div className="border-b border-blue-950 pb-6 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {blogPost.user?.img ? (
            <img
              src={blogPost.user.img}
              alt="User avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-600"
              onError={(e) => {
                console.error('Image load error for blogPost.user.img:', blogPost.user.img);
                e.target.src = 'https://cdn-icons-png.flaticon.com/512/164/164600.png';
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
              {blogPost.user?.username?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white break-words">{blogPost.title}</h1>
            <p className="text-gray-400 text-sm">
              โดย: {blogPost.user?.username || 'ไม่ระบุชื่อ'} •{' '}
              {new Date(blogPost.createdAt).toLocaleDateString('th-TH')} •{' '}
              {blogPost.views} ครั้งที่ดู
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && user.id !== blogPost.userId && (
            <button
              onClick={onSaveBlog}
              className={`px-5 py-2 rounded-lg text-white font-semibold transition shadow-md ${
                isSaved ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              } ${isSaveLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSaveLoading}
            >
              {isSaveLoading ? 'กำลังโหลด...' : isSaved ? 'ยกเลิกบันทึก' : 'บันทึกโพสต์'}
            </button>
          )}
          {user && user.id === blogPost.userId && (
            <div className="relative">
              <button
                onClick={onToggleMenu}
                className="text-white bg-gray-800 hover:bg-blue-900 hover:text-blue-400 p-2 rounded-full focus:outline-none transition"
                aria-label="เมนูตัวเลือก"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                    d="M12 6h.01M12 12h.01M12 18h.01"
                  />
                </svg>
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-black rounded-lg shadow-lg z-10 border border-blue-600">
                  <button
                    onClick={onEditToggle}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800 hover:text-blue-400"
                  >
                    แก้ไขโพสต์
                  </button>
                  <button
                    onClick={onDelete}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800 hover:text-blue-400"
                  >
                    ลบโพสต์
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {saveMessage && <div className="text-green-500 mt-4 text-center">{saveMessage}</div>}
      {error && <div className="text-red-600 mt-4 text-center">{error}</div>}
    </div>
  );
}

export default BlogPostHeader;
import { Link } from 'react-router-dom';
import { FaCommentDots } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function BlogPostCard({ blogPost, onDelete }) {
  const { user } = useAuth();

  const imageUrl = blogPost.images?.length > 0 
    ? blogPost.images[0].imageUrl 
    : null;

  return (
    <Link 
      to={`/blogs/${blogPost.id}`} 
      className="block bg-[#2C2F48] p-6 rounded-xl shadow-lg hover:bg-[#3B3F60] transition w-full max-w-5xl mx-auto mb-6 border border-gray-600"
    >
      <div className="flex flex-col w-full">
     
        <div className="flex items-center mb-4">
          {blogPost.user?.img ? (
            <img
              src={blogPost.user.img}
              alt="User avatar"
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-600 mr-4 flex-shrink-0"
              onError={(e) => {
                console.error('Image load error for blogPost.user.img:', blogPost.user.img);
                e.target.src = 'https://cdn-icons-png.flaticon.com/512/164/164600.png';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mr-4 flex-shrink-0">
              <span className="text-gray-300 text-lg font-semibold">
                {blogPost.user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-yellow-300 hover:text-yellow-400 text-lg truncate">
              {blogPost.user?.username || 'ไม่ระบุผู้ใช้'}
            </span>
            <span className="text-sm text-gray-400">
              {new Date(blogPost.createdAt).toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-yellow-300 mb-3 truncate">
          {blogPost.title}
        </h2>

        {imageUrl && (
          <img
            src={imageUrl}
            alt={blogPost.title}
            className="w-full h-80 object-cover rounded-lg mb-4"
          />
        )}

        <p className="text-gray-300 text-base mb-4 line-clamp-4">
          {blogPost.content?.substring(0, 200) || 'ไม่มีเนื้อหา'}...
        </p>

        {blogPost.tags?.length > 0 && (
          <div 
            className="flex gap-2 flex-wrap mb-4"
            onClick={(e) => e.stopPropagation()}
          >
            {blogPost.tags.map((tag) => (
              <Link
                key={tag.tag?.id || tag.id}
                to={`/blogs?tag=${tag.tag?.id || tag.id}`}
                className="text-sm bg-gray-700 text-white px-3 py-1.5 rounded-full hover:bg-red-600 transition"
              >
                {tag.tag?.name || tag.name || 'ไม่ระบุแท็ก'}
              </Link>
            ))}
          </div>
        )}

        <div 
          className="flex items-center gap-3 text-gray-400 text-sm border-t border-gray-600 pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            to={`/blogs/${blogPost.id}`}
            className="flex items-center gap-2 hover:text-blue-400 transition"
          >
            <FaCommentDots size={18} />
            <span>ความคิดเห็น {blogPost.comments?.length || 0}</span>
          </Link>
        </div>
      </div>
    </Link>
  );
}

export default BlogPostCard;
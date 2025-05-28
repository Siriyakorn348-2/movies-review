import { Link } from 'react-router-dom';
import { FaCommentDots } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function BlogPostCard({ blogPost, onDelete }) {
  const { user } = useAuth();

  const imageUrl = blogPost.images?.length > 0 
    ? blogPost.images[0].imageUrl 
    : null;

  return (
    <div className="flex bg-[#2C2F48] p-3 rounded-lg shadow-md hover:bg-[#3B3F60] transition w-full">
      <Link to={`/blogs/${blogPost.id}`} className="flex w-full">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={blogPost.title}
            className="w-28 h-20 object-cover rounded mr-4 flex-shrink-0"
          />
        )}
        <div className="flex-grow overflow-hidden">
          <div className="text-sm font-bold text-yellow-300 truncate">
            {blogPost.title}
          </div>
          <div className="text-gray-300 text-sm mt-1 line-clamp-2">
            {blogPost.content?.substring(0, 100) || 'ไม่มีเนื้อหา'}...
          </div>
          {blogPost.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2 overflow-hidden">
              {blogPost.tags.map((tag) => (
                <Link
                  key={tag.tag?.id || tag.id}
                  to={`/blogs?tag=${tag.tag?.id || tag.id}`}
                  className="text-xs bg-gray-700 text-white px-2 py-1 rounded-full hover:bg-red-600 transition flex-shrink-0"
                >
                  {tag.tag?.name || tag.name || 'Unknown Tag'}
                </Link>
              ))}
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span className="truncate">
              {blogPost.user?.username || 'ไม่ระบุผู้ใช้'} ·{' '}
              {new Date(blogPost.createdAt).toLocaleDateString('th-TH')}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <FaCommentDots />
              <span>{blogPost.comments?.length || 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default BlogPostCard;
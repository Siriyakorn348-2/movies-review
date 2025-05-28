
import { Link } from 'react-router-dom';

function BlogPostTags({ tags }) {
  if (!tags?.length) {
    return <p className="text-gray-400 mb-6">ไม่มีแท็กสำหรับโพสต์นี้</p>;
  }

  return (
    <div className="mb-6 flex gap-2 flex-wrap">
      {tags.map((tag, index) => (
        <Link
          key={tag.tag?.id || index}
          to={`/blogs?tag=${tag.tag?.id || ''}`}
          className="text-sm bg-gray-800 text-gray-200 px-3 py-1 rounded-full hover:bg-blue-900 hover:text-blue-400 transition"
        >
          {tag.tag?.name || 'Unknown Tag'}
        </Link>
      ))}
    </div>
  );
}

export default BlogPostTags;
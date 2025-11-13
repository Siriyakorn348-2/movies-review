
import { Link } from 'react-router-dom';
import BlogPostComment from '../../components/BlogPostComment';

function BlogPostCommentSection({
  user,
  comments,
  commentForm,
  onCommentChange,
  onCommentSubmit,
  onCommentDelete,
}) {
  return (
    <>
      {user ? (
        <form onSubmit={onCommentSubmit} className="mt-6 mb-8">
          <div className="flex items-start gap-4">
            {user?.img ? (
              <img
                src={user.img}
                alt="User avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-600"
                onError={(e) => {
                  console.error('Image load error for user.img:', user.img);
                  e.target.src = 'https://cdn-icons-png.flaticon.com/512/164/164600.png';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {user?.username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={commentForm}
                onChange={onCommentChange}
                className="w-full p-3 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="เขียนความคิดเห็น..."
                required
              />
              <button
                type="submit"
                style={{background:"#2A2A2A"}}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg mt-3 hover:bg-blue-700 transition shadow-md"
              >
                โพสต์
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="text-gray-400 mt-6">
          <Link to="/login" className="text-blue-400 hover:underline">
            กรุณาเข้าสู่ระบบ
          </Link>{' '}
          เพื่อแสดงความคิดเห็น
        </p>
      )}
      <div className="space-y-6">
        {comments.length === 0 && <p className="text-gray-400">ยังไม่มีความคิดเห็น</p>}
        {comments.map((comment) => (
          <BlogPostComment
            key={comment.id}
            comment={comment}
            onDelete={onCommentDelete}
          />
        ))}
      </div>
    </>
  );
}

export default BlogPostCommentSection;
import { useAuth } from '../context/AuthContext';

function ReviewCard({ review, onDelete }) {
  const { user } = useAuth();

  return (
    <div className="bg-[#141414] rounded-lg shadow-lg p-4 mb-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">{review.user.username}</h3>
        {user && user.id === review.userId && (
          <button
            onClick={() => onDelete(review.id)}
            className="text-red-600 hover:underline"
          >
            ลบ
          </button>
        )}
      </div>
      <p className="text-gray-400">คะแนน: {review.rating}/10</p>
      <p className="mt-2">{review.comment}</p>
    </div>
  );
}

export default ReviewCard;
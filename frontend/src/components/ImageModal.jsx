import { useState, useEffect } from 'react';

function ImageModal({ images, initialImageUrl, isOpen, onClose }) {
  const [currentImage, setCurrentImage] = useState(initialImageUrl || (images && images[0]?.imageUrl));

  useEffect(() => {
    if (isOpen && initialImageUrl) {
      setCurrentImage(initialImageUrl);
    }
  }, [isOpen, initialImageUrl]);

  if (!isOpen) return null;

  const currentIndex = images && Array.isArray(images) ? images.findIndex((img) => img.imageUrl === currentImage) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = images && Array.isArray(images) && currentIndex < images.length - 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="relative max-w-4xl w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-gray-800 hover:bg-blue-900 p-2 rounded-full"
          aria-label="ปิด"
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
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        {images && Array.isArray(images) && images.length > 1 && (
          <>
            {hasPrev && (
              <button
                onClick={() => setCurrentImage(images[currentIndex - 1].imageUrl)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-gray-800 hover:bg-blue-900 p-2 rounded-full"
                aria-label="รูปก่อนหน้า"
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
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
              </button>
            )}
            {hasNext && (
              <button
                onClick={() => setCurrentImage(images[currentIndex + 1].imageUrl)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-gray-800 hover:bg-blue-900 p-2 rounded-full"
                aria-label="รูปถัดไป"
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
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </button>
            )}
          </>
        )}
        <img src={currentImage} alt="Full size" className="w-full rounded-lg" />
      </div>
    </div>
  );
}

export default ImageModal;
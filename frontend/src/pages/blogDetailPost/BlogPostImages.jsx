
function BlogPostImages({ images, onOpenImage, onOpenAllImages }) {
  const imageCount = images?.length || 0;
  const hasMoreImages = imageCount > 3;

  if (!imageCount) return null;

  return (
    <div className="mb-6">
      {imageCount === 1 ? (
        <img
          src={images[0].imageUrl}
          alt="Blog post image"
          className="w-full h-96 object-cover rounded-lg cursor-pointer"
          onClick={() => onOpenImage(images[0].imageUrl)}
        />
      ) : imageCount === 2 ? (
        <div className="flex gap-3">
          {images.map((image) => (
            <img
              key={image.id}
              src={image.imageUrl}
              alt="Blog post image"
              className="w-1/2 h-96 object-cover rounded-lg cursor-pointer"
              onClick={() => onOpenImage(image.imageUrl)}
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-3">
          <img
            src={images[0].imageUrl}
            alt="Blog post image"
            className="w-1/2 h-96 object-cover rounded-lg cursor-pointer"
            onClick={() => onOpenImage(images[0].imageUrl)}
          />
          <div className="w-1/2 flex flex-col gap-3">
            <img
              src={images[1].imageUrl}
              alt="Blog post image"
              className="w-full h-48 object-cover rounded-lg cursor-pointer"
              onClick={() => onOpenImage(images[1].imageUrl)}
            />
            <div className="relative">
              <img
                src={images[2].imageUrl}
                alt="Blog post image"
                className="w-full h-48 object-cover rounded-lg cursor-pointer"
                onClick={() => onOpenImage(images[2].imageUrl)}
              />
              {hasMoreImages && (
                <div
                  className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-3xl font-bold rounded-lg cursor-pointer"
                  style={{ textShadow: '2px 2px 5px rgba(0, 0, 0, 0.8)' }}
                  onClick={onOpenAllImages}
                >
                  +{imageCount - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogPostImages;
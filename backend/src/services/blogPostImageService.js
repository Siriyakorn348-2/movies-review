const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const prisma = new PrismaClient();

const createBlogPostImage = async (blogPostId, userId, file) => {
  try {
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: Number(blogPostId), userId: Number(userId) },
    });
    if (!blogPost) throw new Error('Post not found or unauthorized');

    if (!file?.buffer) throw new Error('No file buffer provided');

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'blog-posts',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            resolve(result);
          }
        }
      );
      stream.end(file.buffer);
    });

    if (!result?.secure_url) {
      throw new Error('Cloudinary upload did not return a valid secure_url');
    }

    console.log('Cloudinary upload result:', {
      secure_url: result.secure_url,
      public_id: result.public_id,
    });

    return await prisma.blogPostImage.create({
      data: {
        blogPostId: Number(blogPostId),
        imageUrl: result.secure_url, 
        mimeType: result.format || file.mimetype,
        fileName: file.originalname,
        publicId: result.public_id || null,
      },
    });
  } catch (error) {
    console.error('Error in createBlogPostImage:', error);
    throw new Error(`Failed to create blog post image: ${error.message}`);
  }
};

const getImagesByBlogPostId = async (blogPostId) => {
  try {
    return await prisma.blogPostImage.findMany({
      where: { blogPostId: Number(blogPostId) },
    });
  } catch (error) {
    throw new Error(`Failed to fetch images: ${error.message}`);
  }
};

const deleteBlogPostImage = async (blogPostId, imageId, userId) => {
  try {
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: Number(blogPostId), userId: Number(userId) },
    });
    if (!blogPost) throw new Error('Post not found or unauthorized');

    const image = await prisma.blogPostImage.findUnique({
      where: { id: Number(imageId), blogPostId: Number(blogPostId) },
    });
    if (!image) throw new Error('Image not found');

    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
        console.log(`Deleted image from Cloudinary: ${image.publicId}`);
      } catch (cloudinaryError) {
        console.error(`Failed to delete image ${image.publicId}:`, cloudinaryError);
      }
    }

    await prisma.blogPostImage.delete({
      where: { id: Number(imageId) },
    });
  } catch (error) {
    console.error('Error in deleteBlogPostImage:', error);
    throw new Error(`Failed to delete blog post image: ${error.message}`);
  }
};

module.exports = { createBlogPostImage, getImagesByBlogPostId, deleteBlogPostImage };
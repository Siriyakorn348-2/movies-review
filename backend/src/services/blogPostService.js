const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const prisma = new PrismaClient();

const getAllBlogPosts = async () => {
  try {
    const blogPosts = await prisma.blogPost.findMany({
      include: {
        user: { select: { id: true, username: true, img: true } },
        comments: { include: { user: { select: { id: true, username: true, img: true } } } },
        images: true,
        tags: {
          include: {
            tag: { select: { id: true, name: true } }, // ลบ optional: true
          },
        },
      },
    });
    console.log('Fetched all blog posts:', blogPosts);
    return blogPosts;
  } catch (error) {
    console.error('Error in getAllBlogPosts:', error.message, error.stack);
    throw new Error(`Failed to fetch blog posts: ${error.message}`);
  }
};

const getBlogPostById = async (id) => {
  try {
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { id: true, username: true, img: true } },
        comments: { include: { user: { select: { id: true, username: true, img: true } } } },
        images: true,
        tags: {
          include: {
            tag: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!blogPost) throw new Error('ไม่พบโพสต์');
    console.log('Fetched blog post:', blogPost);
    return blogPost;
  } catch (error) {
    console.error('Error in getBlogPostById:', error.message, error.stack);
    throw new Error(`Failed to fetch blog post: ${error.message}`);
  }
};

const getBlogPostsByUserId = async (userId) => {
  try {
    // ตรวจสอบว่า userId มีอยู่ในฐานข้อมูล
    const userExists = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true },
    });
    if (!userExists) {
      console.warn(`User with ID ${userId} not found`);
      return []; // คืน array ว่างถ้าไม่มีผู้ใช้
    }

    const blogPosts = await prisma.blogPost.findMany({
      where: { userId: Number(userId) },
      include: {
        user: { select: { id: true, username: true, img: true } },
        comments: { include: { user: { select: { id: true, username: true, img: true } } } },
        images: true,
        tags: {
          include: {
            tag: { select: { id: true, name: true } },
          },
        },
      },
    });
    console.log(`Fetched blog posts for user ${userId}:`, blogPosts);
    return blogPosts;
  } catch (error) {
    console.error('Error in getBlogPostsByUserId:', error.message, error.stack);
    throw new Error(`Failed to fetch user blog posts: ${error.message}`);
  }
};

const createBlogPost = async (userId, data) => {
  try {
    const { title, content, tags } = data;
    return await prisma.blogPost.create({
      data: {
        title,
        content,
        userId: Number(userId),
        tags: {
          create: tags?.map((tagId) => ({
            tagId: Number(tagId),
          })) || [],
        },
      },
      include: {
        user: { select: { id: true, username: true, img: true } },
        images: true,
        tags: {
          include: {
            tag: { select: { id: true, name: true } },
          },
        },
      },
    });
  } catch (error) {
    console.error('Error in createBlogPost:', error.message, error.stack);
    throw new Error(`Failed to create blog post: ${error.message}`);
  }
};

const updateBlogPost = async (id, userId, data) => {
  try {
    const { title, content, tags } = data;
    await prisma.blogPostTag.deleteMany({ where: { blogPostId: Number(id) } });
    return await prisma.blogPost.update({
      where: { id: Number(id), userId: Number(userId) },
      data: {
        title,
        content,
        tags: {
          create: tags?.map((tagId) => ({
            tagId: Number(tagId),
          })) || [],
        },
      },
      include: {
        user: { select: { id: true, username: true, img: true } },
        comments: { include: { user: { select: { id: true, username: true, img: true } } } },
        images: true,
        tags: {
          include: {
            tag: { select: { id: true, name: true } },
          },
        },
      },
    });
  } catch (error) {
    console.error('Error in updateBlogPost:', error.message, error.stack);
    throw new Error(`Failed to update blog post: ${error.message}`);
  }
};

const deleteBlogPost = async (id, userId) => {
  try {
    console.log(`Attempting to delete blog post ID: ${id} by user ID: ${userId}`);

    const blogPost = await prisma.blogPost.findUnique({
      where: { id: Number(id), userId: Number(userId) },
      include: { images: true },
    });
    if (!blogPost) throw new Error('Blog post not found or unauthorized');

    if (blogPost.images.length > 0) {
      for (const image of blogPost.images) {
        if (image.publicId) {
          try {
            await cloudinary.uploader.destroy(image.publicId);
            console.log(`Deleted image from Cloudinary: ${image.publicId}`);
          } catch (cloudinaryError) {
            console.error(`Failed to delete image ${image.publicId}:`, cloudinaryError);
          }
        }
      }
    }

    await prisma.blogPostImage.deleteMany({ where: { blogPostId: Number(id) } });
    await prisma.comment.deleteMany({ where: { commentableId: Number(id), commentableType: 'BlogPost' } });
    await prisma.blogPostTag.deleteMany({ where: { blogPostId: Number(id) } });

    await prisma.blogPost.delete({
      where: { id: Number(id) },
    });
    console.log(`Blog post ID: ${id} deleted successfully`);
  } catch (error) {
    console.error('Error in deleteBlogPost:', error.message, error.stack);
    throw new Error(`Failed to delete blog post: ${error.message}`);
  }
};

const getBlogPostsByTag = async (tagId) => {
  try {
    return await prisma.blogPost.findMany({
      where: {
        tags: {
          some: {
            tagId: Number(tagId),
          },
        },
      },
      include: {
        user: { select: { id: true, username: true, img: true } },
        comments: { include: { user: { select: { id: true, username: true, img: true } } } },
        images: true,
        tags: {
          include: {
            tag: { select: { id: true, name: true } },
          },
        },
      },
    });
  } catch (error) {
    console.error('Error in getBlogPostsByTag:', error.message, error.stack);
    throw new Error(`Failed to fetch blog posts by tag: ${error.message}`);
  }
};

module.exports = {
  getAllBlogPosts,
  getBlogPostById,
  getBlogPostsByUserId,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogPostsByTag,
};
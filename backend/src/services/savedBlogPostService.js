// src/services/savedBlogPostService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSavedBlogPostsByUserId = async (userId) => {
  try {
    const savedPosts = await prisma.savedBlogPost.findMany({
      where: { userId },
      include: {
        blogPost: {
          include: {
            user: { select: { id: true, username: true, img: true } }, 
            images: true,
            tags: { include: { tag: { select: { id: true, name: true } } } },
          },
        },
      },
    });
    console.log('Fetched saved posts:', savedPosts); 
    return savedPosts; 
  } catch (error) {
    console.error('Error in getSavedBlogPostsByUserId:', error);
    throw new Error(`Failed to fetch saved posts: ${error.message}`);
  }
};

const saveBlogPost = async (userId, blogPostId) => {
  try {
    // ตรวจสอบว่า blogPost มีอยู่จริง
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: Number(blogPostId) },
    });
    if (!blogPost) {
      throw new Error('ไม่พบโพสต์ที่ต้องการบันทึก');
    }
    // ตรวจสอบว่าบันทึกซ้ำหรือไม่
    const existingSavedPost = await prisma.savedBlogPost.findUnique({
      where: { userId_blogPostId: { userId, blogPostId: Number(blogPostId) } },
    });
    if (existingSavedPost) {
      throw new Error('โพสต์นี้ถูกบันทึกแล้ว');
    }
    const savedPost = await prisma.savedBlogPost.create({
      data: {
        userId,
        blogPostId: Number(blogPostId),
      },
      include: {
        blogPost: {
          include: {
            user: { select: { id: true, username: true, img: true } },
            images: true,
          },
        },
      },
    });
    console.log('Saved post:', savedPost);
    return savedPost;
  } catch (error) {
    console.error('Error in saveBlogPost:', error);
    throw new Error(`Failed to save blog post: ${error.message}`);
  }
};

const removeSavedBlogPost = async (userId, blogPostId) => {
  try {
    const deleted = await prisma.savedBlogPost.delete({
      where: {
        userId_blogPostId: { userId, blogPostId: Number(blogPostId) },
      },
    });
    console.log('Removed saved post:', deleted); 
    return { message: 'ลบบล็อกที่บันทึกสำเร็จ' };
  } catch (error) {
    console.error('Error in removeSavedBlogPost:', error);
    throw new Error(`Failed to remove saved post: ${error.message}`);
  }
};

module.exports = {
  getSavedBlogPostsByUserId,
  saveBlogPost,
  removeSavedBlogPost,
};
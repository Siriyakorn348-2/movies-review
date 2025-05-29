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
            tag: { select: { id: true, name: true } },
          },
        },
      },
    });

    return blogPosts.map((post) => ({
      ...post,
      tags: post.tags.map((t) => ({ tag: { id: t.tag.id, name: t.tag.name } })),
    }));
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

    return {
      ...blogPost,
      tags: blogPost.tags.map((t) => ({ tag: { id: t.tag.id, name: t.tag.name } })),
    };
  } catch (error) {
    console.error('Error in getBlogPostById:', error.message, error.stack);
    throw new Error(`Failed to fetch blog post: ${error.message}`);
  }
};

const getBlogPostsByUserId = async (userId) => {
  try {
    const userExists = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true },
    });
    if (!userExists) {
      console.warn(`User with ID ${userId} not found`);
      return [];
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
    return blogPosts.map((post) => ({
      ...post,
      tags: post.tags.map((t) => ({ tag: { id: t.tag.id, name: t.tag.name } })),
    }));
  } catch (error) {
    console.error('Error in getBlogPostsByUserId:', error.message, error.stack);
    throw new Error(`Failed to fetch user blog posts: ${error.message}`);
  }
};

const createBlogPost = async (userId, data) => {
  try {
    const { title, content, tags } = data;
    let tagData = [];
    if (Array.isArray(tags) && tags.length) {
      const validTags = await prisma.tag.findMany({
        where: { id: { in: tags.map((id) => Number(id)) } },
        select: { id: true },
      });
      const validTagIds = validTags.map((tag) => tag.id);
      const invalidTagIds = tags.filter((tagId) => !validTagIds.includes(Number(tagId)));
      if (invalidTagIds.length) {
        throw new Error(`แท็กไม่ถูกต้อง: ${invalidTagIds.join(', ')}`);
      }
      tagData = tags.map((tagId) => ({ tagId: Number(tagId) }));
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        content,
        userId: Number(userId),
        tags: { create: tagData },
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
    console.log('Created blog post with tags:', post.tags);
    return {
      ...post,
      tags: post.tags.map((t) => ({ tag: { id: t.tag.id, name: t.tag.name } })),
    };
  } catch (error) {
    console.error('Error in createBlogPost:', error.message, error.stack);
    throw new Error(`Failed to create blog post: ${error.message}`);
  }
};

const updateBlogPost = async (id, userId, data) => {
  try {
    const { title, content, tags } = data;
    const postExists = await prisma.blogPost.findUnique({
      where: { id: Number(id), userId: Number(userId) },
    });
    if (!postExists) {
      throw new Error('โพสต์ไม่พบหรือคุณไม่มีสิทธิ์แก้ไข');
    }

    let tagData = [];
    if (Array.isArray(tags) && tags.length) {
      const validTags = await prisma.tag.findMany({
        where: { id: { in: tags.map((id) => Number(id)) } },
        select: { id: true },
      });
      const validTagIds = validTags.map((tag) => tag.id);
      const invalidTagIds = tags.filter((tagId) => !validTagIds.includes(Number(tagId)));
      if (invalidTagIds.length) {
        throw new Error(`แท็กไม่ถูกต้อง: ${invalidTagIds.join(', ')}`);
      }
      tagData = tags.map((tagId) => ({ tagId: Number(tagId) }));
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
        tags: {
          deleteMany: {}, 
          create: tagData, 
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
    console.log('Updated blog post with tags:', updatedPost.tags);
    return {
      ...updatedPost,
      tags: updatedPost.tags.map((t) => ({ tag: { id: t.tag.id, name: t.tag.name } })),
    };
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
    const blogPosts = await prisma.blogPost.findMany({
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
    return blogPosts.map((post) => ({
      ...post,
      tags: post.tags.map((t) => ({ tag: { id: t.tag.id, name: t.tag.name } })),
    }));
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
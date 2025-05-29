const blogPostService = require('../services/blogPostService');
const blogPostImageService = require('../services/blogPostImageService');

exports.getAllBlogPosts = async (req, res, next) => {
  try {
    const { userId } = req.query;
    console.log(`Fetching blog posts for userId: ${userId}`);
    let blogPosts;
    if (userId) {
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'userId ต้องเป็นตัวเลข' });
      }
      blogPosts = await blogPostService.getBlogPostsByUserId(Number(userId));
    } else {
      blogPosts = await blogPostService.getAllBlogPosts();
    }
    res.json(blogPosts);
  } catch (error) {
    console.error('Error in getAllBlogPosts:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'ไม่สามารถดึงข้อมูลบล็อกได้' });
  }
};

exports.getBlogPostById = async (req, res, next) => {
  try {
    const blogPost = await blogPostService.getBlogPostById(req.params.id);
    res.json(blogPost);
  } catch (error) {
    next(error);
  }
};

exports.createBlogPost = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body; 
    if (!title || !content) return res.status(400).json({ error: 'กรุณาระบุ title และ content' });
    if (tags && (!Array.isArray(tags) || tags.some((id) => isNaN(Number(id))))) {
      return res.status(400).json({ error: 'tags ต้องเป็น array ของตัวเลข' });
    }
    const blogPost = await blogPostService.createBlogPost(req.user.id, { title, content, tags });
    res.status(201).json(blogPost);
  } catch (error) {
    console.error('Error in createBlogPost:', error.message, error.stack);
    next(error);
  }
};

exports.updateBlogPost = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'กรุณาระบุ title และ content' });
    }
    // ตรวจสอบ tags
    let validTags = [];
    if (tags !== undefined && tags !== null) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({ error: 'tags ต้องเป็น array' });
      }
      validTags = tags
        .map((id) => Number(id))
        .filter((id) => !isNaN(id) && Number.isInteger(id));
      if (validTags.length !== tags.length) {
        return res.status(400).json({ error: 'tags ต้องมีแต่ตัวเลขจำนวนเต็ม' });
      }
    }
    const blogPost = await blogPostService.updateBlogPost(req.params.id, req.user.id, {
      title,
      content,
      tags: validTags,
    });
    res.json(blogPost);
  } catch (error) {
    console.error('Error in updateBlogPost:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      params: req.params,
      userId: req.user.id,
    });
    res.status(500).json({ error: error.message || 'ไม่สามารถอัปเดตโพสต์ได้' });
  }
};

exports.deleteBlogPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;
    console.log(`Deleting blog post ID: ${id} by user ID: ${user.id}`);
    await blogPostService.deleteBlogPost(id, user.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteBlogPost:', error);
    next(error);
  }
};

exports.uploadBlogPostImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'กรุณาอัปโหลดรูปภาพ' });
    const image = await blogPostImageService.createBlogPostImage(req.params.id, req.user.id, req.file);
    res.status(201).json(image);
  } catch (error) {
    next(error);
  }
};

exports.deleteBlogPostImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;
    await blogPostImageService.deleteBlogPostImage(id, imageId, req.user.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteBlogPostImage:', error);
    next(error);
  }
};

exports.getBlogPostsByTag = async (req, res, next) => {
  try {
    const { tagId } = req.params;
    const posts = await blogPostService.getBlogPostsByTag(tagId);
    res.json(posts);
  } catch (error) {
    next(error);
  }
};
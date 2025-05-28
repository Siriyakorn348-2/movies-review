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
    const { title, content, movieId } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'กรุณาระบุ title และ content' });
    const blogPost = await blogPostService.createBlogPost(req.user.id, { title, content, movieId });
    res.status(201).json(blogPost);
  } catch (error) {
    next(error);
  }
};

exports.updateBlogPost = async (req, res, next) => {
  try {
    const { title, content, movieId } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'กรุณาระบุ title และ content' });
    const blogPost = await blogPostService.updateBlogPost(req.params.id, req.user.id, { title, content, movieId });
    res.json(blogPost);
  } catch (error) {
    next(error);
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
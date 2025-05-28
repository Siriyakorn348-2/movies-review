const savedBlogPostService = require('../services/savedBlogPostService');

exports.getSavedBlogPosts = async (req, res, next) => {
  try {
    const savedPosts = await savedBlogPostService.getSavedBlogPostsByUserId(req.user.id);
    res.json(savedPosts);
  } catch (error) {
    console.error('Error in getSavedBlogPosts:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.saveBlogPost = async (req, res, next) => {
  try {
    const { blogPostId } = req.body;
    if (!blogPostId) return res.status(400).json({ error: 'กรุณาระบุ blogPostId' });
    const savedPost = await savedBlogPostService.saveBlogPost(req.user.id, blogPostId);
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error in saveBlogPost:', error);
    res.status(error.message.includes('ถูกบันทึกแล้ว') ? 400 : 500).json({ error: error.message });
  }
};

exports.removeSavedBlogPost = async (req, res, next) => {
  try {
    const result = await savedBlogPostService.removeSavedBlogPost(req.user.id, req.params.blogPostId);
    res.json(result);
  } catch (error) {
    console.error('Error in removeSavedBlogPost:', error);
    res.status(500).json({ error: error.message });
  }
};
const commentService = require('../services/commentService');

exports.getComments = async (req, res, next) => {
  try {
    const { blogPostId } = req.query;
    if (!blogPostId) return res.status(400).json({ error: 'กรุณาระบุ blogPostId' });
    const comments = await commentService.getCommentsByBlogPostId(blogPostId);
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    const { commentableId, commentableType, content } = req.body;
    if (!commentableId || !content) return res.status(400).json({ error: 'กรุณาระบุ commentableId และ content' });
    const comment = await commentService.createComment(req.user.id, { commentableId, commentableType, content });
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'กรุณาระบุ content' });
    const comment = await commentService.updateComment(req.params.id, req.user.id, { content });
    res.json(comment);
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const result = await commentService.deleteComment(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
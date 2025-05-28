const express = require('express');
const savedBlogPostController = require('../controllers/savedBlogPostController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, savedBlogPostController.getSavedBlogPosts);
router.post('/', auth, savedBlogPostController.saveBlogPost);
router.delete('/:blogPostId', auth, savedBlogPostController.removeSavedBlogPost);

module.exports = router;
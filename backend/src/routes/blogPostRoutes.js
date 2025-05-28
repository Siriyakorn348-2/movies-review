const express = require('express');
const multer = require('multer');
const blogPostController = require('../controllers/blogPostController');
const auth = require('../middleware/auth');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

router.get('/', blogPostController.getAllBlogPosts);
router.get('/:id', blogPostController.getBlogPostById);
router.post('/', auth, blogPostController.createBlogPost);
router.put('/:id', auth, blogPostController.updateBlogPost);
router.delete('/:id', auth, blogPostController.deleteBlogPost);
router.post('/:id/images', auth, upload.single('image'), blogPostController.uploadBlogPostImage);
router.delete('/:id/images/:imageId', auth, blogPostController.deleteBlogPostImage);
router.get('/tag/:tagId', blogPostController.getBlogPostsByTag);

module.exports = router;
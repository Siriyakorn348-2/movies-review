const express = require('express');
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', commentController.getComments);
router.post('/', auth, commentController.createComment);
router.put('/:id', auth, commentController.updateComment);
router.delete('/:id', auth, commentController.deleteComment);

module.exports = router;
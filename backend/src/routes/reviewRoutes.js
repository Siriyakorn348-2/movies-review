const express = require('express');
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', reviewController.getReviews);
router.post('/', auth, reviewController.createReview);
router.put('/:id', auth, reviewController.updateReview);
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
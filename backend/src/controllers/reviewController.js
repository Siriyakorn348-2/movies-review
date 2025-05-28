const reviewService = require('../services/reviewService');

exports.getReviews = async (req, res, next) => {
  try {
    const { movieId } = req.query;
    if (!movieId) return res.status(400).json({ error: 'กรุณาระบุ movieId' });
    const reviews = await reviewService.getReviewsByMovieId(movieId);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    res.status(500).json({ error: error.message || 'เกิดข้อผิดพลาดในการดึงรีวิว' });
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { movieId, rating, comment } = req.body;
    if (!movieId || rating === undefined) {
      return res.status(400).json({ error: 'กรุณาระบุ movieId และ rating' });
    }
    if (typeof rating !== 'number' || rating < 0 || rating > 10) {
      return res.status(400).json({ error: 'คะแนนต้องเป็นตัวเลขระหว่าง 0-10' });
    }
    const review = await reviewService.createReview(req.user.id, {
      movieId,
      rating,
      comment,
    });
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error.message);
    if (error.message === 'ไม่พบภาพยนตร์' || error.message === 'ไม่พบผู้ใช้' || error.message === 'คุณได้รีวิวภาพยนตร์นี้แล้ว') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการส่งรีวิว' });
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (rating === undefined) {
      return res.status(400).json({ error: 'กรุณาระบุ rating' });
    }
    if (typeof rating !== 'number' || rating < 0 || rating > 10) {
      return res.status(400).json({ error: 'คะแนนต้องเป็นตัวเลขระหว่าง 0-10' });
    }
    const review = await reviewService.updateReview(req.params.id, req.user.id, {
      rating,
      comment,
    });
    res.json(review);
  } catch (error) {
    console.error('Error updating review:', error.message);
    if (error.message === 'ไม่พบรีวิว' || error.message === 'คุณไม่มีสิทธิ์แก้ไขรีวิวนี้') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขรีวิว' });
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const result = await reviewService.deleteReview(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting review:', error.message);
    if (error.message === 'ไม่พบรีวิว' || error.message === 'คุณไม่มีสิทธิ์ลบรีวิวนี้') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบรีวิว' });
  }
};
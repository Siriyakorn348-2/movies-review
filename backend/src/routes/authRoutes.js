const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);
router.post('/logout', authController.logout);
router.put('/profile', auth, (req, res, next) => {
  authController.upload.single('img')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, authController.updateProfile);

module.exports = router;
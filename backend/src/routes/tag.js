const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const auth = require('../middleware/auth');

router.get('/', tagController.getAllTags);
router.post('/', auth, tagController.createTag);
router.put('/:id', auth, tagController.updateTag); 
router.delete('/:id', auth, tagController.deleteTag); 
module.exports = router;
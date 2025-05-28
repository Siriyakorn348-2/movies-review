const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); 

router.post('/profile/image', authMiddleware, upload.single('image'), async (req, res) => {
  const image = req.file;
  try {
    await prisma.userImage.deleteMany({ where: { userId: req.userId } });
    
    const userImage = await prisma.userImage.create({
      data: {
        userId: req.userId,
        imageData: image.buffer,
        mimeType: image.mimetype,
        fileName: image.originalname,
      },
    });
    res.json(userImage);
  } catch (error) {
    res.status(400).json({ error: 'Failed to upload profile image' });
  }
});

router.get('/profile/image', authMiddleware, async (req, res) => {
  try {
    const userImage = await prisma.userImage.findFirst({
      where: { userId: req.userId },
    });
    if (!userImage) return res.status(404).json({ error: 'No profile image found' });
    res.json({
      id: userImage.id,
      mimeType: userImage.mimeType,
      fileName: userImage.fileName,
      imageData: userImage.imageData.toString('base64'), 
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch profile image' });
  }
});

module.exports = router;
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors'); 
const authRoutes = require('./src/routes/authRoutes');
const movieRoutes = require('./src/routes/movieRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');
const blogPostRoutes = require('./src/routes/blogPostRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
const savedBlogPostRoutes = require('./src/routes/savedBlogPostRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const tagRouter = require('./src/routes/tag');
const cloudinary = require('cloudinary').v2;

const fs = require('fs');
const path = require('path');

const tempDir = path.join(__dirname, 'temp'); 

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log('Created temp directory:', tempDir);
}

const app = express();

app.use(
  cors({
    origin: 'https://movies-review-git-main-siriyakorn348-2s-projects.vercel.app', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true, 
  })
);

app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 500, 
    message: 'คุณส่งคำขอมากเกินไป กรุณาลองใหม่ในภายหลัง',
  })
);

app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/blog-posts', blogPostRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/saved-blog-posts', savedBlogPostRoutes);
app.use('/api/tags', tagRouter);


app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
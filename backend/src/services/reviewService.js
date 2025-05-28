const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getReviewsByMovieId = async (movieId) => {
  try {
    const movie = await prisma.movies.findUnique({
      where: { movieId: Number(movieId) },
    });
    if (!movie) {
      console.warn(`No movie found with movieId: ${movieId}`);
      return []; 
    }

    return await prisma.review.findMany({
      where: { movieId: movie.movieId },
      include: { user: { select: { username: true } } },
    });
  } catch (error) {
    console.error('Error in getReviewsByMovieId:', { movieId, error: error.message });
    throw error;
  }
};

const createReview = async (userId, data) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('ไม่พบผู้ใช้');
    }

    const movie = await prisma.movies.findUnique({
      where: { movieId: Number(data.movieId) },
    });
    if (!movie) {
      throw new Error('ไม่พบภาพยนตร์');
    }

    const existingReview = await prisma.review.findFirst({
      where: { userId, movieId: movie.movieId },
    });
    if (existingReview) {
      throw new Error('คุณได้รีวิวภาพยนตร์นี้แล้ว');
    }

    const comment = data.comment || '';

    return await prisma.review.create({
      data: {
        userId,
        movieId: movie.movieId, 
        rating: parseFloat(data.rating),
        comment,
      },
    });
  } catch (error) {
    console.error('Error in createReview:', { userId, movieId: data.movieId, error: error.message });
    throw error;
  }
};

const updateReview = async (id, userId, data) => {
  const review = await prisma.review.findUnique({ where: { id: Number(id) } });
  if (!review) {
    throw new Error('ไม่พบรีวิว');
  }
  if (review.userId !== userId) {
    throw new Error('คุณไม่มีสิทธิ์แก้ไขรีวิวนี้');
  }

  const comment = data.comment !== undefined ? data.comment : review.comment;

  return prisma.review.update({
    where: { id: Number(id) },
    data: {
      rating: parseFloat(data.rating),
      comment,
    },
  });
};

const deleteReview = async (id, userId) => {
  const review = await prisma.review.findUnique({ where: { id: Number(id) } });
  if (!review) {
    throw new Error('ไม่พบรีวิว');
  }
  if (review.userId !== userId) {
    throw new Error('คุณไม่มีสิทธิ์ลบรีวิวนี้');
  }

  await prisma.review.delete({ where: { id: Number(id) } });
  return { message: 'ลบรีวิวสำเร็จ' };
};

module.exports = {
  getReviewsByMovieId,
  createReview,
  updateReview,
  deleteReview,
};
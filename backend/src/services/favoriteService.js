const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getFavoritesByUserId = async (userId) => {
  try {
    if (!userId) throw new Error('userId is required');
    const favorites = await prisma.favoriteMovie.findMany({
      where: { userId },
      include: { movie: true },
    });
    return favorites;
  } catch (error) {
    console.error('Error in getFavoritesByUserId:', error.message);
    throw new Error(`Failed to fetch favorites: ${error.message}`);
  }
};

const addFavorite = async (userId, apiId) => {
  try {
    if (!userId) throw new Error('userId is required');
    if (!apiId) throw new Error('apiId is required');
    console.log('Adding favorite:', { userId, apiId }); 
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    const movie = await prisma.Movies.findFirst({
      where: { apiId: String(apiId) },
    });
    if (!movie) throw new Error(`Movie with apiId ${apiId} not found`);
    const existingFavorite = await prisma.favoriteMovie.findUnique({
      where: {
        userId_movieId: { userId, movieId: movie.movieId },
      },
    });
    if (existingFavorite) throw new Error('Movie already in favorites');
    const favorite = await prisma.favoriteMovie.create({
      data: {
        userId,
        movieId: movie.movieId,
      },
      include: { movie: true },
    });
    return favorite;
  } catch (error) {
    console.error('Error in addFavorite:', error.message);
    throw new Error(`Failed to add favorite: ${error.message}`);
  }
};

const removeFavorite = async (userId, apiId) => {
  try {
    if (!userId) throw new Error('userId is required');
    if (!apiId) throw new Error('apiId is required');
    console.log('Removing favorite:', { userId, apiId }); 
    const movie = await prisma.Movies.findFirst({
      where: { apiId: String(apiId) },
    });
    if (!movie) throw new Error(`Movie with apiId ${apiId} not found`);
    await prisma.favoriteMovie.delete({
      where: {
        userId_movieId: { userId, movieId: movie.movieId },
      },
    });
    return { message: 'ลบหนังโปรดสำเร็จ' };
  } catch (error) {
    console.error('Error in removeFavorite:', error.message);
    throw new Error(`Failed to remove favorite: ${error.message}`);
  }
};

module.exports = {
  getFavoritesByUserId,
  addFavorite,
  removeFavorite,
};
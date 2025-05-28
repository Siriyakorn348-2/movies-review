const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getCommentsByBlogPostId = async (blogPostId) => {
  return prisma.comment.findMany({
    where: { commentableId: Number(blogPostId), commentableType: 'BlogPost' },
    include: { user: { select: { username: true } } },
  });
};

const createComment = async (userId, data) => {
  return prisma.comment.create({
    data: {
      userId,
      commentableId: Number(data.commentableId),
      commentableType: data.commentableType || 'BlogPost',
      content: data.content,
    },
  });
};

const updateComment = async (id, userId, data) => {
  return prisma.comment.update({
    where: { id: Number(id), userId },
    data: { content: data.content },
  });
};

const deleteComment = async (id, userId) => {
  await prisma.comment.delete({ where: { id: Number(id), userId } });
  return { message: 'ลบคอมเมนต์สำเร็จ' };
};

module.exports = {
  getCommentsByBlogPostId,
  createComment,
  updateComment,
  deleteComment,
};
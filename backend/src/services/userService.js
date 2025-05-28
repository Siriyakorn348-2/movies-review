const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

const getAllUsers = async () => {
  const users = await prisma.user.findMany();
  return users.map((user) => ({
    id: user.id,
    email: user.email,
    username: user.username,
    img: user.img,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
};

const getUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    img: user.img || null,
    password: user.password, 
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const comparePassword = async (user, plainPassword) => {
  return bcrypt.compare(plainPassword, user.password);
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    img: user.img || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      username: data.username,
      img: data.img || null,
    },
  });
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    img: user.img,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const updateUser = async (id, data) => {
  const updateData = { ...data };
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  }
  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: updateData,
  });
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    img: user.img,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const deleteUser = async (id) => {
  await prisma.user.delete({ where: { id: Number(id) } });
  return { message: 'ลบผู้ใช้สำเร็จ' };
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  comparePassword,
};
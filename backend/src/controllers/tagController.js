const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllTags = async (req, res, next) => {
  try {
    const tags = await prisma.tag.findMany({
      select: { id: true, name: true },
    });
    res.json(tags);
  } catch (error) {
    console.error('Error in getAllTags:', error);
    next(error);
  }
};

exports.createTag = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'กรุณาระบุชื่อแท็ก' });
    }
    const existingTag = await prisma.tag.findUnique({
      where: { name: name.trim() },
    });
    if (existingTag) {
      return res.status(400).json({ error: 'ชื่อแท็กนี้มีอยู่แล้ว' });
    }
    const tag = await prisma.tag.create({
      data: { name: name.trim() },
    });
    res.status(201).json(tag);
  } catch (error) {
    console.error('Error in createTag:', error);
    next(error);
  }
};

exports.updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'กรุณาระบุชื่อแท็ก' });
    }
    const existingTag = await prisma.tag.findUnique({
      where: { id: Number(id) },
    });
    if (!existingTag) {
      return res.status(404).json({ error: 'ไม่พบแท็ก' });
    }
    const duplicateTag = await prisma.tag.findUnique({
      where: { name: name.trim() },
    });
    if (duplicateTag && duplicateTag.id !== Number(id)) {
      return res.status(400).json({ error: 'ชื่อแท็กนี้มีอยู่แล้ว' });
    }
    const tag = await prisma.tag.update({
      where: { id: Number(id) },
      data: { name: name.trim() },
    });
    res.json(tag);
  } catch (error) {
    console.error('Error in updateTag:', error);
    next(error);
  }
};

exports.deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tag = await prisma.tag.findUnique({
      where: { id: Number(id) },
    });
    if (!tag) {
      return res.status(404).json({ error: 'ไม่พบแท็ก' });
    }
    await prisma.blogPostTag.deleteMany({
      where: { tagId: Number(id) },
    });
    await prisma.tag.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteTag:', error);
    next(error);
  }
};
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllTags = async (req, res, next) => {
  try {
    const tags = await prisma.tag.findMany();
    res.json(tags);
  } catch (error) {
    next(error);
  }
};

exports.createTag = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'กรุณาระบุชื่อแท็ก' });
    }
    const tag = await prisma.tag.create({
      data: { name },
    });
    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
};

exports.updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'กรุณาระบุชื่อแท็ก' });
    }
    const tag = await prisma.tag.update({
      where: { id: Number(id) },
      data: { name },
    });
    res.json(tag);
  } catch (error) {
    next(error);
  }
};

exports.deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.tag.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllTags = async () => {
  try {
    return await prisma.tag.findMany({
      select: { id: true, name: true },
    });
  } catch (error) {
    console.error('Error in getAllTags:', error);
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }
};

const createTag = async (name) => {
  try {
    const existingTag = await prisma.tag.findUnique({
      where: { name: name.trim() },
    });
    if (existingTag) {
      return existingTag; 
    }
    return await prisma.tag.create({
      data: { name: name.trim() },
    });
  } catch (error) {
    console.error('Error in createTag:', error);
    throw new Error(`Failed to create tag: ${error.message}`);
  }
};

const updateTag = async (id, name) => {
  try {
    const existingTag = await prisma.tag.findUnique({
      where: { id: Number(id) },
    });
    if (!existingTag) {
      throw new Error('Tag not found');
    }
    const duplicateTag = await prisma.tag.findUnique({
      where: { name: name.trim() },
    });
    if (duplicateTag && duplicateTag.id !== Number(id)) {
      throw new Error('Tag name already exists');
    }
    return await prisma.tag.update({
      where: { id: Number(id) },
      data: { name: name.trim() },
    });
  } catch (error) {
    console.error('Error in updateTag:', error);
    throw new Error(`Failed to update tag: ${error.message}`);
  }
};

const deleteTag = async (id) => {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: Number(id) },
    });
    if (!tag) {
      throw new Error('Tag not found');
    }
    await prisma.blogPostTag.deleteMany({
      where: { tagId: Number(id) },
    });
    return await prisma.tag.delete({
      where: { id: Number(id) },
    });
  } catch (error) {
    console.error('Error in deleteTag:', error);
    throw new Error(`Failed to delete tag: ${error.message}`);
  }
};

module.exports = { getAllTags, createTag, updateTag, deleteTag };
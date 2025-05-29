import { useState, useEffect } from 'react';
import axios from 'axios';

function EditBlogPostForm({ blogPost, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: blogPost.title,
    content: blogPost.content,
  });
  const [tags, setTags] = useState(blogPost.tags?.map((tag) => tag.tag.id) || []);
  const [availableTags, setAvailableTags] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(blogPost.images || []);
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_IMAGES = 5;
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/tags');
        setAvailableTags(response.data);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
        setError('ไม่สามารถโหลดแท็กได้');
      }
    };
    fetchTags();
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        setError('กรุณาอัปโหลดเฉพาะไฟล์รูปภาพ');
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 5MB`);
        return false;
      }
      return true;
    });

    if (existingImages.length + images.length + validFiles.length > MAX_IMAGES) {
      setError(`คุณสามารถมีรูปภาพได้สูงสุด ${MAX_IMAGES} รูป`);
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);
    setError(null);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/blog-posts/${blogPost.id}/images/${imageId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setExistingImages((prev) => prev.filter((image) => image.id !== imageId));
      setError(null);
    } catch (error) {
      console.error('Failed to delete image:', error);
      setError(error.response?.data?.error || 'ไม่สามารถลบรูปภาพได้ กรุณาลองใหม่');
    }
  };

  const handleTagToggle = (tagId) => {
    setTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleNewTagSubmit = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) {
      setError('กรุณาระบุชื่อแท็ก');
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:3000/api/tags',
        { name: newTag.trim() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setAvailableTags((prev) => [...prev, response.data]);
      setTags((prev) => [...prev, response.data.id]);
      setNewTag('');
      setError(null);
    } catch (error) {
      console.error('Failed to create tag:', error);
      setError(error.response?.data?.error || 'ไม่สามารถสร้างแท็กได้ กรุณาลองใหม่');
    }
  };

  const handleEditTag = (tag) => {
    setEditingTag(tag);
    setNewTag(tag.name);
  };

  const handleUpdateTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) {
      setError('กรุณาระบุชื่อแท็ก');
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:3000/api/tags/${editingTag.id}`,
        { name: newTag.trim() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setAvailableTags((prev) =>
        prev.map((tag) => (tag.id === editingTag.id ? response.data : tag))
      );
      setNewTag('');
      setEditingTag(null);
      setError(null);
    } catch (error) {
      console.error('Failed to update tag:', error);
      setError(error.response?.data?.error || 'ไม่สามารถแก้ไขแท็กได้ กรุณาลองใหม่');
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบแท็กนี้?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/tags/${tagId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAvailableTags((prev) => prev.filter((tag) => tag.id !== tagId));
      setTags((prev) => prev.filter((id) => id !== tagId));
      setError(null);
    } catch (error) {
      console.error('Failed to delete tag:', error);
      setError(error.response?.data?.error || 'ไม่สามารถลบแท็กได้ กรุณาลองใหม่');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ ...form, tags });

      if (images.length > 0) {
        const uploadPromises = images.map(async (image, index) => {
          try {
            const imageFormData = new FormData();
            imageFormData.append('image', image);
            await axios.post(
              `http://localhost:3000/api/blog-posts/${blogPost.id}/images`,
              imageFormData,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                  'Content-Type': 'multipart/form-data',
                },
              }
            );
            return { success: true, index };
          } catch (error) {
            return {
              success: false,
              index,
              error: `การอัปโหลดรูปภาพ ${image.name} ล้มเหลว: ${
                error.response?.data?.error || error.message
              }`,
            };
          }
        });

        const results = await Promise.all(uploadPromises);
        const errors = results.filter((result) => !result.success);
        if (errors.length > 0) {
          setError(errors.map((e) => e.error).join('; '));
          return;
        }
      }

      const response = await axios.get(`http://localhost:3000/api/blog-posts/${blogPost.id}`);
      setExistingImages(response.data.images || []);
      onSubmit(response.data);
    } catch (error) {
      console.error('Failed to update blog post:', error);
      setError(error.response?.data?.error || 'ไม่สามารถแก้ไขโพสต์ได้ กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#141414] p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">แก้ไขบล็อก</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">หัวข้อ</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full p-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-600"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">เนื้อหา</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows="5"
            className="w-full p-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-600"
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block mb-1">แท็ก</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <div key={tag.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    tags.includes(tag.id) ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {tag.name}
                </button>
                <button
                  type="button"
                  onClick={() => handleEditTag(tag)}
                  className="text-blue-600 hover:underline text-xs"
                >
                  แก้ไข
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTag(tag.id)}
                  className="text-red-600 hover:underline text-xs"
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1">{editingTag ? 'แก้ไขแท็ก' : 'เพิ่มแท็กใหม่'}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="w-full p-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder={editingTag ? 'แก้ไขชื่อแท็ก' : 'ป้อนชื่อแท็กใหม่'}
            />
            <button
              type="button"
              onClick={editingTag ? handleUpdateTag : handleNewTagSubmit}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              {editingTag ? 'บันทึก' : 'เพิ่มแท็ก'}
            </button>
            {editingTag && (
              <button
                type="button"
                onClick={() => {
                  setNewTag('');
                  setEditingTag(null);
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                ยกเลิก
              </button>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1">รูปภาพที่มีอยู่ (สูงสุด {MAX_IMAGES} รูป)</label>
          {existingImages.length > 0 ? (
            <div className="flex gap-2 flex-wrap">
              {existingImages.map((image) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.imageUrl}
                    alt="Existing image"
                    className="w-[80px] h-[80px] rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(image.id)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">ไม่มีรูปภาพ</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1">อัปโหลดรูปภาพเพิ่มเติม</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-2 bg-[#2A2A2A] rounded-md text-white"
          />
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="w-[80px] h-[80px] rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 disabled:bg-gray-600"
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditBlogPostForm;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function BlogCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '' });
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [images, setImages] = useState([]);
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

    if (images.length + validFiles.length > MAX_IMAGES) {
      setError(`คุณสามารถอัปโหลดรูปภาพได้สูงสุด ${MAX_IMAGES} รูป`);
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);
    setError(null);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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
    if (!user) {
      setError('กรุณาเข้าสู่ระบบ');
      return;
    }
    setIsSubmitting(true);
    try {
      const postResponse = await axios.post(
        'http://localhost:3000/api/blog-posts',
        {
          title: form.title,
          content: form.content,
          tags,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (images.length > 0) {
        const uploadPromises = images.map(async (image, index) => {
          try {
            const imageFormData = new FormData();
            imageFormData.append('image', image);
            await axios.post(
              `http://localhost:3000/api/blog-posts/${postResponse.data.id}/images`,
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

      navigate('/blogs');
    } catch (error) {
      console.error('Failed to create blog post:', error);
      setError(error.response?.data?.error || 'ไม่สามารถสร้างบล็อกได้ กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/blogs');
  };

  if (!user) return <div className="text-white text-center">กรุณาเข้าสู่ระบบเพื่อสร้างบล็อก</div>;

  return (
    <div className="max-w-5xl	 mx-auto bg-[#141414] p-10 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">สร้างบล็อกใหม่</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
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
          <label className="block mb-1">อัปโหลดรูปภาพ (สูงสุด {MAX_IMAGES} รูป)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-2 bg-[#2A2A2A] rounded-md text-white"
          />
          {images.length > 0 ? (
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
          ) : (
            <p className="text-gray-400">ไม่มีรูปภาพ</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 disabled:bg-gray-600"
          >
            {isSubmitting ? 'กำลังสร้าง...' : 'สร้าง'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}

export default BlogCreate;
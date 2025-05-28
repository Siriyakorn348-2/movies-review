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
    setImages(files);
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
        for (const image of images) {
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

  if (!user) return <div className="text-white text-center">กรุณาเข้าสู่ระบบเพื่อสร้างบล็อก</div>;

  return (
    <div className="bg-[#1A1C29] text-white min-h-screen p-4 sm:p-6 md:p-8 font-['Sarabun']">
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-[#141414] p-6 rounded-lg shadow-lg"
      >
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
                  onClick={() => handleDeleteTag(tag.id)}
                  className="text-red-600 hover:underline text-xs"
                >
                  X
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
          <label className="block mb-1">อัปโหลดรูปภาพ</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-2 bg-[#2A2A2A] rounded-md text-white"
          />
          {images.length > 0 && (
            <div className="flex gap-2 mt-2">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="w-[80px] h-[80px] rounded-md object-cover"
                />
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700 disabled:bg-gray-600"
        >
          {isSubmitting ? 'กำลังสร้าง...' : 'สร้าง'}
        </button>
      </form>
    </div>
  );
}

export default BlogCreate;
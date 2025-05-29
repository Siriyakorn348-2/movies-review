import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function EditBlogPostForm({ blogPost, onSubmit, onCancel }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '' });
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_IMAGES = 5;
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  useEffect(() => {
    if (!blogPost) {
      setError('ไม่มีข้อมูลโพสต์');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('กรุณาเข้าสู่ระบบ');
      navigate('/login');
      return;
    }

    setForm({
      title: blogPost.title || '',
      content: blogPost.content || '',
    });
    setExistingImages(blogPost.images || []);

    const initialTags = Array.isArray(blogPost.tags)
      ? blogPost.tags
          .map((t) => {
            const id = Number(t?.tag?.id || t?.id);
            return !isNaN(id) && Number.isInteger(id) ? id : null;
          })
          .filter((id) => id !== null)
      : [];
    setTags(initialTags);
    console.log('Initialized tags:', initialTags);

    const fetchTags = async () => {
      try {
        console.log('Fetching all tags');
        const response = await axios.get('http://192.168.1.165:3000/api/tags', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched available tags:', response.data);
        setAvailableTags(response.data);
      } catch (error) {
        console.error('Failed to fetch tags:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setError('ไม่สามารถโหลดแท็กได้ กรุณาลองใหม่');
      }
    };
    fetchTags();
  }, [blogPost, navigate]);

  useEffect(() => {
    if (newTag.trim()) {
      const filtered = availableTags.filter((tag) =>
        tag.name.toLowerCase().includes(newTag.trim().toLowerCase())
      );
      setSuggestions(filtered);
      console.log('Suggestions updated:', filtered);
    } else {
      setSuggestions([]);
    }
  }, [newTag, availableTags]);

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
      setError(`คุณสามารถรวมรูปภาพได้สูงสุด ${MAX_IMAGES} รูป`);
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);
    setError(null);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteImage = async (e, imageId) => {
    e.preventDefault();
    if (!window.confirm('ยืนยันการลบรูปภาพ?')) return;
    try {
      await axios.delete(`http://192.168.1.165:3000/api/blog-posts/${blogPost.id}/images/${imageId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setExistingImages((prev) => prev.filter((image) => image.id !== imageId));
      console.log('Deleted image:', imageId);
      setError(null);
    } catch (error) {
      console.error('Failed to delete image:', error);
      setError(error.response?.data?.error || 'ไม่สามารถลบรูปภาพได้ กรุณาลองใหม่');
    }
  };

  const handleNewTagSubmit = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) {
      setError('กรุณาระบุชื่อแท็ก');
      return;
    }

    const existingTag = availableTags.find(
      (tag) => tag.name.toLowerCase() === newTag.trim().toLowerCase()
    );

    if (existingTag) {
      if (!tags.includes(existingTag.id)) {
        setTags((prev) => {
          const newTags = [...prev, existingTag.id];
          console.log('Added existing tag:', newTags);
          return newTags;
        });
      }
      setNewTag('');
      setSuggestions([]);
      setError(null);
      return;
    }

    try {
      const response = await axios.post(
        'http://192.168.1.165:3000/api/tags',
        { name: newTag.trim() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const newTagData = response.data;
      setAvailableTags((prev) => [...prev, newTagData]);
      setTags((prev) => {
        const newTags = [...prev, newTagData.id];
        console.log('Added new tag:', newTags);
        return newTags;
      });
      setNewTag('');
      setSuggestions([]);
      setError(null);
    } catch (error) {
      console.error('Failed to create tag:', error);
      setError(error.response?.data?.error || 'ไม่สามารถสร้างแท็กได้ กรุณาลองใหม่');
    }
  };

  const handleSelectSuggestion = (tag) => {
    if (!tags.includes(tag.id)) {
      setTags((prev) => {
        const newTags = [...prev, tag.id];
        console.log('Selected suggestion:', newTags);
        return newTags;
      });
    }
    setNewTag('');
    setSuggestions([]);
  };

  const handleRemoveTag = (tagId) => {
    setTags((prev) => {
      const newTags = prev.filter((id) => id !== tagId);
      console.log('Removed tag:', newTags);
      return newTags;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!Array.isArray(tags) || tags.some((id) => isNaN(id) || !Number.isInteger(id))) {
        setError('รูปแบบ ID แท็กไม่ถูกต้อง');
        return;
      }

      const updatedPost = {
        title: form.title,
        content: form.content,
        tags,
      };
      console.log('Submitting edit:', updatedPost);

      await onSubmit(updatedPost);

  
      if (images.length > 0) {
        const uploadPromises = images.map(async (image, index) => {
          try {
            const imageFormData = new FormData();
            imageFormData.append('image', image);
            await axios.post(
              `http://192.168.1.165:3000/api/blog-posts/${blogPost.id}/images`,
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
              error: `ไม่สามารถอัปโหลดรูปภาพ ${image.name}: ${
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

      setImages([]); 
    } catch (error) {
      console.error('Failed to update blog post:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setError(error.response?.data?.error || 'ไม่สามารถอัปเดตโพสต์ได้ กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-[#141414] p-10 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">แก้ไขโพสต์</h2>
        {error && <div className="text-red-400 mb-4">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1">หัวข้อ</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full p-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">เนื้อหา</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows="5"
            className="w-full p-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-gray-700"
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block mb-1">แท็ก (เลือกแล้ว: {tags.length})</label>
          <div className="relative">
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tagId) => {
                const tag = availableTags.find((t) => t.id === tagId);
                return tag ? (
                  <div
                    key={tagId}
                    className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full text-sm"
                  >
                    <span>{tag.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tagId)}
                      className="text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ) : null;
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="w-full p-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="ป้อนแท็กใหม่หรือค้นหา"
              />
              <button
                type="button"
                onClick={handleNewTagSubmit}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                เพิ่มแท็ก
              </button>
            </div>
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-[#2A2A2A] rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                {suggestions.map((tag) => (
                  <li
                    key={tag.id}
                    onClick={() => handleSelectSuggestion(tag)}
                    className="px-3 py-2 text-white hover:bg-red-600 cursor-pointer"
                  >
                    {tag.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1">รูปภาพที่มีอยู่ (สูงสุด {MAX_IMAGES} รูป)</label>
          {existingImages.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {existingImages.map((image) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.url}
                    alt="Existing image"
                    className="w-[80px] h-[80px] rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleDeleteImage(e, image.id)}
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
          <label className="block mb-1">อัปโหลดรูปภาพเพิ่ม</label>
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
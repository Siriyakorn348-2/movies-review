import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function EditProfile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        username: user.username || '',
      });
      setPreview(user.img || '');
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(selectedFile.type)) {
        setError('กรุณาอัปโหลดไฟล์รูปภาพ (.jpg, .jpeg, .png เท่านั้น)');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('ไฟล์มีขนาดใหญ่เกิน 5MB');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      if (!formData.email || !formData.username) {
        setError('กรุณากรอกอีเมลและชื่อผู้ใช้');
        return;
      }

      const data = new FormData();
      data.append('email', formData.email);
      data.append('username', formData.username);
      if (file) data.append('img', file);

      for (let [key, value] of data.entries()) {
        console.log(`FormData: ${key}=`, value);
      }

      const response = await axios.put(`${API_BASE_URL}/auth/profile`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Update profile response:', response.data);
      await refreshUser();
      alert('แก้ไขโปรไฟล์สำเร็จ');
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update profile:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data,
        },
      });
      setError(
        error.response?.data?.error ||
          error.message ||
          'ไม่สามารถแก้ไขโปรไฟล์ได้ กรุณาลองใหม่'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-center py-10 text-white">กรุณาเข้าสู่ระบบ</div>;

  return (
    <div className="max-w-md mx-auto bg-black p-6 rounded-lg shadow-md mt-10 font-['Helvetica Neue', 'Sarabun']">
      <h2 className="text-2xl font-semibold text-white mb-6 text-center">แก้ไขโปรไฟล์</h2>
      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
      <form onSubmit={handleSubmit}>
       <div className="mb-4 flex justify-center">
        {preview && preview !== '' && preview !== 'null' && preview !== 'undefined' ? (
          <img
            src={preview}
            alt="Profile preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = ''; 
            }}
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-3xl">
            {formData.username ? formData.username.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
      </div>

        <div className="mb-4">
          <label className="block text-gray-400 mb-2">รูปโปรไฟล์</label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
            className="w-full p-2 bg-gray-800 rounded-md text-white"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">อีเมล</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">ชื่อ</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Username"
            required
          />
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            style={{background:"#2A2A2A"}}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{background:"#2A2A2A"}}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
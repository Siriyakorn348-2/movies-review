import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function EditProfile() {
  const { user, setUser, refreshUser } = useAuth(); 
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user?.img || '');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        username: user.username || '',
        password: '',
      });
      setPreview(user.img || 'https://cdn-icons-png.flaticon.com/512/164/164600.png');
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      if (!token) {
        setError('กรุณาเข้าสู่ระบบใหม่');
        setLoading(false);
        return;
      }

      const data = new FormData();
      data.append('email', formData.email);
      data.append('username', formData.username);
      if (formData.password) data.append('password', formData.password);
      if (file) data.append('img', file);

      const response = await axios.put('http://localhost:3000/api/auth/profile', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // อัปเดต user ใน AuthContext และรีเฟรชข้อมูล
      setUser(response.data.user);
      await refreshUser(); // เรียก refreshUser เพื่อดึงข้อมูลล่าสุดจาก API
      alert('แก้ไขโปรไฟล์สำเร็จ');
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError(error.response?.data?.error || 'ไม่สามารถแก้ไขโปรไฟล์ได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-center py-10">กรุณาเข้าสู่ระบบ</div>;

  return (
    <div className="max-w-md mx-auto bg-black p-6 rounded-lg shadow-md mt-10 font-['Helvetica Neue', 'Sarabun']">
      <h2 className="text-2xl font-semibold text-white mb-6 text-center">แก้ไขโปรไฟล์</h2>
      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4 flex justify-center">
          <img
            src={preview}
            alt="Profile preview"
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">รูปโปรไฟล์ (รองรับ .jpg, .jpeg, .png)</label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
            className="w-full p-3 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            placeholder="กรอกอีเมล"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">ชื่อผู้ใช้</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="กรอกชื่อผู้ใช้"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">รหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="กรอกรหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)"
          />
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading}
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
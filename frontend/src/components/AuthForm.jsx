import React, { useState } from 'react';
import axios from 'axios';

function AuthForm() {
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password || (!isLogin && !formData.username)) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      localStorage.setItem('token', response.data.token);
      window.location.href = '/';
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
      }
      console.error('Authentication failed:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-[#141414] rounded-lg">
      <h2 className="text-2xl text-white mb-4">{isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-white mb-1">อีเมล</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-600"
            required
          />
        </div>
        {!isLogin && (
          <div className="mb-4">
            <label className="block text-white mb-1">ชื่อผู้ใช้</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-white mb-1">รหัสผ่าน</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 bg-[#2A2A2A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-600"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700"
        >
          {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
        </button>
      </form>
      <button
        onClick={() => setIsLogin(!isLogin)}
        className="mt-4 text-blue-400 hover:underline"
      >
        {isLogin ? 'สมัครสมาชิก' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
      </button>
    </div>
  );
}

export default AuthForm;
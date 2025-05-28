// src/pages/Profile.js
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserBlogs from '../components/UserBlogs';
import SavedBlogPosts from './SavedBlogPosts'; 
import { useState } from 'react';

function Profile() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('myBlogs');

  // รอจนกว่า loading จะเสร็จ
  if (loading) {
    return <div className="text-gray-400 text-center py-10">กำลังโหลด...</div>;
  }

  // ถ้าไม่มี user หลังจากโหลดเสร็จ ให้ redirect
  if (!user) return <Navigate to="/login" />;

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  console.log('User in Profile:', user);

  return (
    <div className="max-w-5xl mx-auto bg-black p-8 rounded-xl shadow-2xl mt-10 mb-10 font-['Helvetica Neue', 'Sarabun'] text-white">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 border-b border-blue-950 pb-6">
        <img
          src={`${user.img || 'https://cdn-icons-png.flaticon.com/512/164/164600.png'}?t=${Date.now()}`}
          alt="User avatar"
          className="w-24 h-24 rounded-full object-cover border-4 border-blue-900 shadow-md"
          onError={(e) => {
            console.error('Image load error for user.img:', user.img);
            e.target.src = 'https://cdn-icons-png.flaticon.com/512/164/164600.png';
          }}
        />
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-white mb-2">{user.username}</h1>
          <p className="text-gray-400 text-lg">{user.email}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-10">
        <button
          onClick={handleEditProfile}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
        >
          แก้ไขโปรไฟล์
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-300 shadow-md"
        >
          ออกจากระบบ
        </button>
      
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex border-b border-blue-950">
          <button
            className={`px-6 py-3 text-lg font-medium transition duration-300 ${
              activeTab === 'myBlogs'
                ? 'border-b-2 border-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('myBlogs')}
          >
            บล็อกของฉัน
          </button>
          <button
            className={`px-6 py-3 text-lg font-medium transition duration-300 ${
              activeTab === 'savedBlogs'
                ? 'border-b-2 border-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('savedBlogs')}
          >
            บล็อกที่บันทึก
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'myBlogs' ? <UserBlogs /> : <SavedBlogPosts />}
      </div>
    </div>
  );
}

export default Profile;
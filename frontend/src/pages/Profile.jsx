import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserBlogs from '../components/UserBlogs';
import SavedBlogPosts from './SavedBlogPosts';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab } from '@mui/material';

function Profile() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [value, setValue] = useState('1');
  const tab1Ref = useRef(null);
  const tab2Ref = useRef(null);
  const [tab1Width, setTab1Width] = useState(0);
  const [tab2Width, setTab2Width] = useState(0);
  const [tab1Left, setTab1Left] = useState(0);
  const [tab2Left, setTab2Left] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (tab1Ref.current) {
      const rect1 = tab1Ref.current.getBoundingClientRect();
      setTab1Width(rect1.width);
      setTab1Left(rect1.left - tab1Ref.current.parentElement.getBoundingClientRect().left);
    }
    if (tab2Ref.current) {
      const rect2 = tab2Ref.current.getBoundingClientRect();
      setTab2Width(rect2.width);
      setTab2Left(rect2.left - tab2Ref.current.parentElement.getBoundingClientRect().left);
    }
  }, []);

  if (loading) {
    return <div className="text-gray-400 text-center py-10">กำลังโหลด...</div>;
  }

  if (!user) return <Navigate to="/login" />;

  const handleEditProfile = () => {
    navigate('/edit-profile');
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
        <button
          onClick={handleEditProfile}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md sm:ml-auto"
        >
          แก้ไขโปรไฟล์
        </button>
      </div>

      {/* Tab Section with Material-UI */}
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', position: 'relative' }}>
          <TabList
            onChange={handleChange}
            aria-label="profile tabs"
            sx={{
              '& .MuiTab-root': {
                color: 'gray',
                fontSize: '1.125rem', 
                fontWeight: 500, 
                fontFamily: "'Helvetica Neue', 'Sarabun'",
                padding: '12px 24px', 
                marginRight: '32px', 
                textTransform: 'none',
                outline: 'none', 
                '&:hover': {
                  color: 'white',
                },
                '&:focus': {
                  outline: 'none', 
                },
                '&:active': {
                  outline: 'none', 
                },
              },
              '& .Mui-selected': {
                color: 'white', 
                outline: 'none', 
              },
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
            <Tab label="บล็อกของฉัน" value="1" ref={tab1Ref} />
            <Tab label="บล็อกที่บันทึก" value="2" ref={tab2Ref} />
          </TabList>

          <motion.div
            className="absolute bottom-0 h-1 bg-blue-400"
            initial={false}
            animate={{
              left: value === '1' ? tab1Left : tab2Left,
              width: value === '1' ? tab1Width : tab2Width,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </Box>
        <TabPanel value="1" sx={{ padding: 0 }}>
          <UserBlogs />
        </TabPanel>
        <TabPanel value="2" sx={{ padding: 0 }}>
          <SavedBlogPosts />
        </TabPanel>
      </TabContext>
    </div>
  );
}

export default Profile;
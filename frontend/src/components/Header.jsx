import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiDotsVertical } from 'react-icons/hi';

import logo from '../assets/Images/logo.png';
import {
  HiHome,
  HiMagnifyingGlass,
  HiPlus,
  HiChatBubbleLeftRight,
  HiArrowRightOnRectangle,
  HiOutlineUserCircle,
  HiOutlineChartPie,
} from 'react-icons/hi2';
import { FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function Header() {
  const [toggle, setToggle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();

  const menu = [
    { name: 'หน้าแรก', icon: HiHome, path: '/' },
    { name: 'รายการที่อยากดู', icon: HiPlus, path: '/watchlist' },
    { name: 'บล็อก', icon: HiChatBubbleLeftRight, path: '/blogs' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        const input = searchRef.current?.querySelector('input');
        if (input) input.focus();
      }, 100);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (authLoading) {
    return <div className="bg-[#1A1C29] h-16"></div>;
  }

  return (
    <div className="flex items-center justify-between px-2 py-3 md:p-4 bg-[#1A1C29] shadow-md relative z-20">
      <Link to="/">
        <img
          src={logo}
          className="w-[60px] md:w-[100px] object-contain transition-transform duration-300 hover:scale-105"
          alt="Movie Review Logo"
        />
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-4">
        {menu.map((item) => (
          <Link to={item.path} key={item.name}>
            <button
              onClick={() => navigate(item.path)}
              className="flex items-center space-x-2 px-5 py-2 rounded-full transition duration-300 font-medium text-sm tracking-wide cursor-pointer bg-black text-white shadow-md"
            >
              <item.icon className="text-lg" />
              <span>{item.name}</span>
            </button>
          </Link>
        ))}
      </div>

      {/* Mobile  */}
      <div className="flex md:hidden gap-3 items-center">
        {menu.map((item) => (
          <Link to={item.path} key={item.name}>
            <button className="text-gray-300 hover:text-white transition-colors p-1">
              <item.icon className="text-xl" />
            </button>
          </Link>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center space-x-4 relative">
        <div className="relative" ref={searchRef}>
          <button
            onClick={toggleSearch}
            className="text-gray-300 hover:text-white focus:outline-none"
          >
            <HiMagnifyingGlass className="text-2xl" />
          </button>
          {isSearchOpen && (
            <form
              onSubmit={handleSearch}
              className="absolute right-0 top-full mt-2 bg-[#141414] border border-gray-700 rounded-md p-2 w-[300px] z-[1000] shadow-lg transition-all duration-300"
            >
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="ค้นหาภาพยนตร์หรือรีวิว..."
                  className="w-full pl-10 pr-4 py-2 bg-[#2A2A2A] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-300"
                />
              </div>
            </form>
          )}
        </div>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 px-5 py-2 rounded-full focus:outline-none hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                {user.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="text-sm font-medium text-white">{user.username || user.name}</span>
              <FaChevronDown style={{ color: '#DC2626' }} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#2A2A2A] rounded-lg shadow-lg py-2 z-[1000]">
                <Link
                  to="/profile"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center px-4 py-2 border-b border-gray-600 hover:bg-gray-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl mr-3">
                    {user.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <span className="text-sm font-medium text-white">{user.username || user.name}</span>
                </Link>
                <div className="mt-2">
                  <button
                    onClick={() => {
                      navigate('/edit-profile');
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 transition-colors"
                  >
                    <HiOutlineUserCircle className="text-lg" color="#ffffff" />
                    แก้ไขโปรไฟล์
                  </button>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 transition-colors"
                  >
                    <HiArrowRightOnRectangle className="text-lg" color="#ffffff" />
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 text-white bg-red-600 rounded-full hover:bg-red-700 transition duration-300 font-medium text-sm tracking-wide hover:shadow-md cursor-pointer"
          >
            เข้าสู่ระบบ
          </button>
        )}
      </div>
        
      {/* Mobile  */}
      <div className="md:hidden flex items-center">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {user.username?.charAt(0).toUpperCase() || '?'}
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-3 bg-[#141414] border border-gray-700 p-3 px-5 py-4 z-[1000] rounded-lg shadow-lg min-w-[200px]">
                <Link
                  to="/profile"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white py-2"
                >
                  <HiOutlineUserCircle className="text-lg" />
                  <span>โปรไฟล์</span>
                </Link>
                <button
                  onClick={() => {
                    navigate('/edit-profile');
                    setShowDropdown(false);
                  }}
                  className="flex items-center gap-2 text-gray-300 hover:text-white py-2 w-full text-left"
                >
                  <HiOutlineUserCircle className="text-lg" />
                  <span>แก้ไขโปรไฟล์</span>
                </button>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setShowDropdown(false);
                  }}
                  className="flex items-center gap-2 text-gray-300 hover:text-white py-2 w-full text-left"
                >
                  <HiArrowRightOnRectangle className="text-lg" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <HiOutlineUserCircle className="text-2xl" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Header;
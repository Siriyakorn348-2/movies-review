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
    <div className="flex items-center justify-between p-4 bg-[#1A1C29] shadow-md relative z-20">
      <Link to="/">
        <img
          src={logo}
          className="w-[80px] md:w-[100px] object-contain transition-transform duration-300 hover:scale-105"
          alt="Movie Review Logo"
        />
      </Link>

      <div className="hidden md:flex gap-4">
        {menu.map((item) => (
          <Link to={item.path} key={item.name}>
            <button
              onClick={() => navigate(item.path)}
              className={`flex items-center space-x-2 px-5 py-2 rounded-full transition duration-300 font-medium text-sm tracking-wide cursor-pointer
                ${
                  window.location.pathname === item.path
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-300 bg-transparent border border-red-600 hover:bg-red-600 hover:text-white hover:shadow-md'
                }`}
            >
              <item.icon className="text-lg" />
              <span>{item.name}</span>
            </button>
          </Link>
        ))}
      </div>

      {/* Mobile Menu */}
      <div className="flex md:hidden gap-5 items-center">
        {menu.slice(0, 2).map((item) => (
          <Link to={item.path} key={item.name}>
            <button className="text-gray-300">
              <item.icon className="text-2xl" />
            </button>
          </Link>
        ))}
        <div className="md:hidden" onClick={() => setToggle(!toggle)}>
          <button className="text-gray-300">
            <HiDotsVertical className="text-2xl" />
          </button>
          {toggle && (
            <div className="absolute right-4 top-16 mt-3 bg-[#141414] border border-gray-700 p-3 px-5 py-4 z-[1000] rounded-lg shadow-lg">
              {menu.slice(2).map((item) => (
                <Link
                  to={item.path}
                  key={item.name}
                  onClick={() => setToggle(false)}
                >
                  <div className="flex items-center gap-2 text-gray-300 hover:text-white py-2">
                    <item.icon className="text-lg" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              ))}
              {user && (
                <button
                  onClick={() => {
                    handleLogout();
                    setToggle(false);
                  }}
                  className="flex items-center gap-2 text-gray-300 hover:text-white py-2"
                >
                  <HiArrowRightOnRectangle className="text-lg" />
                  <span>ออกจากระบบ</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

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
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <img
                src={user.img || 'https://cdn-icons-png.flaticon.com/512/164/164600.png'}
                alt={user.username || user.name}
                className="w-10 h-10 rounded-full object-cover border-2 "
                onError={(e) => {
                  e.target.src = 'https://cdn-icons-png.flaticon.com/512/164/164600.png';
                }}
              />
              <span className="text-sm font-medium text-white">{user.username || user.name}</span>
              <FaChevronDown className="text-red-600" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#2A2A2A] rounded-lg shadow-lg py-2 z-10">
                <Link
                  to="/profile"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center px-4 py-2 border-b border-gray-600 hover:bg-gray-600"
                >
                  <img
                    src={user.img || 'https://cdn-icons-png.flaticon.com/512/164/164600.png'}
                    alt={user.username || user.name}
                    className="w-8 h-8 rounded-full object-cover mr-2"
                    onError={(e) => {
                      e.target.src = 'https://cdn-icons-png.flaticon.com/512/164/164600.png';
                    }}
                  />
                  <span className="text-sm font-medium text-white">{user.username || user.name}</span>
                </Link>
                <div className="mt-2">
                  <button
                    onClick={() => {
                      navigate('/edit-profile');
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                  >
                    <HiOutlineUserCircle className="text-lg text-white" />
                    แก้ไขโปรไฟล์
                  </button>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                  >
                    <HiArrowRightOnRectangle className="text-lg text-white" />
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

      <div className="md:hidden flex items-center space-x-4">
        {user ? (
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <img
              src={user.img || 'https://cdn-icons-png.flaticon.com/512/164/164600.png'}
              alt={user.username || user.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-red-600"
              onError={(e) => {
                e.target.src = 'https://cdn-icons-png.flaticon.com/512/164/164600.png';
              }}
            />
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="text-gray-300"
          >
            <HiOutlineUserCircle className="text-2xl" />
          </button>
        )}
        {showDropdown && (
          <div className="absolute right-4 top-16 mt-3 bg-[#141414] border border-gray-700 p-3 px-5 py-4 z-[1000] rounded-lg shadow-lg">
            {user && (
              <>
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
                  className="flex items-center gap-2 text-gray-300 hover:text-white py-2"
                >
                  <HiOutlineUserCircle className="text-lg" />
                  <span>แก้ไขโปรไฟล์</span>
                </button>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setShowDropdown(false);
                  }}
                  className="flex items-center gap-2 text-gray-300 hover:text-white py-2"
                >
                  <HiArrowRightOnRectangle className="text-lg" />
                  <span>ออกจากระบบ</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
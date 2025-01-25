// src/components/Dashboard/Sidebar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaCog,
  FaUsers,
  FaBook,
  FaFileAlt,
  FaBars,
  FaTimes,
  FaHourglassStart,
} from 'react-icons/fa';
import { SiFacebookgaming } from 'react-icons/si';
import elepziaLogo from '../../assets/logoEscapeF.png';
import mascotAvatar from '../../assets/mascotAvatar.jpg'; // Ensure this image exists
import { fetchProfile } from '../../services/userService'; // Import your service

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();

  // Menu items for admin
  const adminMenuItems = [
    { name: 'Reservations', path: '/dashboard/reservations', icon: SiFacebookgaming },
    { name: 'Users', path: '/dashboard/users', icon: FaUsers },
    { name: 'Scenarios', path: '/dashboard/scenarios', icon: FaBook },
    { name: 'Chapters', path: '/dashboard/chapters', icon: FaFileAlt },
    { name: 'Time Slots', path: '/dashboard/timeslots', icon: FaHourglassStart },
    { name: 'Settings', path: '/dashboard/settings', icon: FaCog },
    { name: 'Prices', path: '/dashboard/prices', icon: FaCog },
  ];

  // Menu items for subadmins
  const subadminMenuItems = [
    { name: 'Reservations', path: '/dashboard/reservations', icon: SiFacebookgaming },
  ];

  useEffect(() => {
    // Fetch current user profile on mount
    const getCurrentUser = async () => {
      try {
        const user = await fetchProfile();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching current user profile:', error);
      }
    };

    getCurrentUser();
  }, []);

  // Determine menu items based on user type
  const menuItems = currentUser?.usertype === 'subadmin' ? subadminMenuItems : adminMenuItems;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden p-4 text-gray-800 bg-white fixed top-4 left-4 z-40 focus:outline-none rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close Sidebar' : 'Open Sidebar'}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Fixed Sidebar */}
      <div
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 
          fixed 
          z-30 
          inset-y-0 
          left-0 
          w-64 
          bg-gradient-to-b from-orange-500 to-orange-600 
          text-white 
          transform 
          transition-transform 
          duration-300 
          shadow-lg 
          flex 
          flex-col 
          overflow-hidden
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center p-6 border-b border-orange-700">
          <img
            src={elepziaLogo}
            alt="Elepzia Logo"
            className="w-50 h-20 transition-transform duration-300 transform hover:scale-110 hover:rotate-12"
          />
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 space-y-2 flex-grow">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`
                flex items-center p-4 rounded-lg mx-4 my-2 transition-all duration-200 
                ${
                  location.pathname === item.path
                    ? 'bg-orange-700 text-white'
                    : 'hover:bg-orange-700 hover:text-white text-orange-200'
                }
              `}
            >
              <item.icon className="text-white mr-3 transition-transform duration-200 transform hover:scale-110" />
              <span className="text-white">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Info Section */}
        {currentUser && (
          <div className="p-4 border-t border-orange-700 flex items-center space-x-4">
            <img
              src={currentUser.avatarUrl || mascotAvatar}
              alt="User Avatar"
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <div>
              <p className="text-sm font-semibold">{`${currentUser.firstName} ${currentUser.lastName}`}</p>
              <p className="text-xs text-orange-200">{currentUser.email}</p>
            </div>
          </div>
        )}

        {/* Watermark */}
        <div className="p-4 border-t border-orange-700 text-center">
          <span className="text-white text-sm opacity-75">Powered by Elepzia Team</span>
        </div>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
};

export default Sidebar;

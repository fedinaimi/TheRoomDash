import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCog, FaUsers, FaBook, FaFileAlt, FaBars, FaTimes, FaHourglassStart } from 'react-icons/fa';
import { SiFacebookgaming } from 'react-icons/si';
import elepziaLogo from '../../assets/thumbnail_LOGOELPEZIAONLYWHITE.png';
import { fetchProfile } from '../../services/userService'; // Import the service to fetch current user profile

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // State to hold current user data
  const location = useLocation();

  // Default menu items for admin
  const adminMenuItems = [
    { name: 'Reservations', path: '/dashboard/reservations', icon: SiFacebookgaming },
    { name: 'Users', path: '/dashboard/users', icon: FaUsers },
    { name: 'Scenarios', path: '/dashboard/scenarios', icon: FaBook },
    { name: 'Chapters', path: '/dashboard/chapters', icon: FaFileAlt },
    { name: 'Time Slots', path: '/dashboard/timeslots', icon: FaHourglassStart },
    { name: 'Settings', path: '/dashboard/settings', icon: FaCog },
  ];

  // Menu items for subadmins
  const subadminMenuItems = [
    { name: 'Reservations', path: '/dashboard/reservations', icon: SiFacebookgaming },
  ];

  useEffect(() => {
    // Fetch current user profile on component mount
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
    <div className="flex h-screen">
      {/* Toggle Button */}
      <button
        className="md:hidden p-6 text-gray-500 bg-white fixed top-0 left-0 z-20 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative fixed z-30 inset-y-0 left-0 w-64 bg-indigo-600 text-white transform transition-transform duration-300 shadow-lg flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center p-6 border-b border-indigo-700 space-x-3">
          <img
            src={elepziaLogo}
            alt="Elepzia Logo"
            className="w-20 h-20 transition-transform duration-300 transform hover:scale-110 hover:rotate-12"
          />
          <span className="text-2xl font-semibold">Elepzia</span>
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-2 flex-grow">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center p-4 rounded-lg mx-4 transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-indigo-500 text-white'
                  : 'hover:bg-indigo-500 hover:text-white text-indigo-200'
              }`}
            >
              <item.icon className="mr-3 transition-transform duration-200 transform hover:scale-110" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Current User Info (Fixed at Bottom) */}
        {currentUser && (
          <div className="p-4 border-t border-indigo-700 flex items-center space-x-4">
            <img
              src={currentUser.avatarUrl || 'https://via.placeholder.com/50'}
              alt="User Avatar"
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <div>
              <p className="text-sm font-semibold">{`${currentUser.firstName} ${currentUser.lastName}`}</p>
              <p className="text-xs text-indigo-200">{currentUser.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Sidebar;

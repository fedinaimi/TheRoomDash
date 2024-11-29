// src/components/Dashboard/Sidebar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUsers, FaBook, FaFileAlt, FaBars, FaTimes, FaHourglassStart } from 'react-icons/fa';
import { SiFacebookgaming } from 'react-icons/si';
import elepziaLogo from '../../assets/thumbnail_LOGOELPEZIAONLYWHITE.png'; // Adjust path as necessary

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Reservations', path: '/dashboard/reservations', icon: SiFacebookgaming },
    { name: 'Users', path: '/dashboard/users', icon: FaUsers },
    { name: 'Scenarios', path: '/dashboard/scenarios', icon: FaBook },
    { name: 'Chapters', path: '/dashboard/chapters', icon: FaFileAlt },
    { name: 'Time Slots', path: '/dashboard/timeslots', icon: FaHourglassStart },
  ];

  return (
    <div className="flex">
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
        } md:translate-x-0 md:relative fixed z-30 inset-y-0 left-0 w-64 bg-indigo-600 text-white transform transition-transform duration-300 shadow-lg`}
      >
        <div className="flex items-center justify-center p-6 border-b border-indigo-700 space-x-3">
          <img
            src={elepziaLogo}
            alt="Elepzia Logo"
            className="w-20 h-20 transition-transform duration-300 transform hover:scale-110 hover:rotate-12" // Animation classes
          />
          <span className="text-2xl font-semibold">Elepzia</span>
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-2">
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

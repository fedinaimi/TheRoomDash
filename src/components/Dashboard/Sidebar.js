// src/components/Dashboard/Sidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaBook, FaFileAlt, FaBars, FaTimes, FaTimesCircle, FaHourglassStart } from 'react-icons/fa';
import { SiFacebookgaming } from 'react-icons/si';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex">
      <button
        className="md:hidden p-6 text-gray-500 bg-white fixed top-0 left-0 z-20"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative fixed z-30 inset-y-0 left-0 w-64 bg-indigo-600 text-white transform transition-transform duration-300`}
      >
        <div className="p-6 text-lg font-bold text-center border-b border-indigo-700">
          Elepzia Dashboard
        </div>
        <nav className="mt-6 space-y-2">
          <Link
            to="/dashboard/reservations"
            className="flex items-center p-4 hover:bg-indigo-500 transition-colors"
          >
            <SiFacebookgaming className="mr-3" />
            Reservation
          </Link>
          <Link
            to="/dashboard/timeslots"
            className="flex items-center p-4 hover:bg-indigo-500 transition-colors"
          >
            <FaHourglassStart className="mr-3" />
            Time Slot
          </Link>
          <Link
            to="/dashboard/users"
            className="flex items-center p-4 hover:bg-indigo-500 transition-colors"
          >
            <FaUsers className="mr-3" />
            Users
          </Link>
          <Link
            to="/dashboard/scenarios"
            className="flex items-center p-4 hover:bg-indigo-500 transition-colors"
          >
            <FaBook className="mr-3" />
            Scenarios
          </Link>
          <Link
            to="/dashboard/chapters"
            className="flex items-center p-4 hover:bg-indigo-500 transition-colors"
          >
            <FaFileAlt className="mr-3" />
            Chapters
          </Link>
        </nav>
      </div>

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

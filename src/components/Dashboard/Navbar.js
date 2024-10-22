import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService';
import { FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login'); 
  };

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="text-lg font-bold text-indigo-600"></div>

          
          <button
          onClick={handleLogout}
          className="flex items-center bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
        >
          <FaSignOutAlt className="mr-2" /> 
          Logout
        </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

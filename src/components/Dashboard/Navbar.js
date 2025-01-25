// src/components/Dashboard/Navbar.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";
import { FaSignOutAlt, FaBell } from "react-icons/fa";
import NotificationSystem from "../NotificationSystem";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-64 right-0 z-20 border-b ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="text-lg font-bold text-orange-600">
        </div>
        
      <div className="flex items-center space-x-4">
          <NotificationSystem />
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="Logout"
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

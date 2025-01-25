// src/pages/Dashboard.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import Navbar from '../components/Dashboard/Navbar';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64">
        {/* Fixed Navbar at the top */}
        <Navbar />

        {/* Content Padding */}
        <div className="pt-16 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

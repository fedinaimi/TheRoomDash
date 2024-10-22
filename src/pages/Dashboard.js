// src/pages/Dashboard.js
import React from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import Navbar from '../components/Dashboard/Navbar';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-grow ml-64 md:ml-0 bg-gray-100">
        <Navbar />
        <div className="p-6 mt-16">
          
          
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

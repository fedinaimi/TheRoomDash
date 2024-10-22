// src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-lg mb-4">Page Not Found</p>
        <Link to="/dashboard" className="text-indigo-600 hover:underline">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

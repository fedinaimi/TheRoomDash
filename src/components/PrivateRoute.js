// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // You may want to use cookies instead for security

  // If no token is found, redirect to login page
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If token is present, render the children (dashboard, etc.)
  return children;
};

export default PrivateRoute;

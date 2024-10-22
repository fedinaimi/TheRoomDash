// src/components/PublicRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService'; // A utility function to check authentication

const PublicRoute = ({ children }) => {
  // If user is authenticated, redirect to dashboard
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" />;
  }

  return children; // Render children if not authenticated (show login page)
};

export default PublicRoute;

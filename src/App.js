// src/App.js
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Navbar from './components/Dashboard/Navbar';
import { isAuthenticated } from './services/authService'; // Import isAuthenticated
import PricesPage from './pages/PricesPage';

// Lazy-loaded pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const UsersPage = React.lazy(() => import('./pages/UsersPage'));
const ScenariosPage = React.lazy(() => import('./pages/ScenariosPage'));
const ChaptersPage = React.lazy(() => import('./pages/ChaptersPage'));
const ReservationsPage = React.lazy(() => import('./pages/ReservationsPage'));
const TimeSlotPage = React.lazy(() => import('./pages/TimeSlotPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

const AppContent = () => {
  const auth = isAuthenticated(); // Check if user is authenticated

  return (
    <>
      {auth && <Navbar />} {/* Render Navbar only if authenticated */}
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          {/* Nested Routes within Dashboard */}
          <Route path="users" element={<UsersPage />} />
          <Route path="scenarios" element={<ScenariosPage />} />
          <Route path="chapters" element={<ChaptersPage />} />
          <Route path="reservations/:id" element={<ReservationsPage />} /> {/* Dynamic Reservation ID */}
          <Route path="reservations" element={<ReservationsPage />} /> {/* General Reservations */}
          <Route path="timeslots" element={<TimeSlotPage />} />
          <Route path="settings" element={<SettingsPage />} /> {/* Settings Page */}
          <Route path="prices" element={<PricesPage />} />

        </Route>

        {/* Redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
        <AppContent />
      </Suspense>
    </Router>
  );
};

export default App;

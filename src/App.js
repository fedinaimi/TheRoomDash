import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Navbar from './components/Dashboard/Navbar';

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
  const location = useLocation();

  // Render Navbar conditionally based on route
  const shouldShowNavbar = !['/login', '/forgot-password', '/reset-password'].includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />} {/* Navbar hidden on public routes */}
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
          path="/reset-password"
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
          <Route path="reservations" element={<ReservationsPage />} />
          <Route path="timeslots" element={<TimeSlotPage />} />
          <Route path="settings" element={<SettingsPage />} /> {/* Settings Page */}
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
      <Suspense fallback={<div>Loading...</div>}>
        <AppContent />
      </Suspense>
    </Router>
  );
};

export default App;

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Navbar from './components/Dashboard/Navbar';

// Lazy-loaded pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const UsersPage = React.lazy(() => import('./pages/UsersPage'));
const ScenariosPage = React.lazy(() => import('./pages/ScenariosPage'));
const ChaptersPage = React.lazy(() => import('./pages/ChaptersPage'));
const ReservationsPage = React.lazy(() => import('./pages/ReservationsPage'));
const TimeSlotPage = React.lazy(() => import('./pages/TimeSlotPage'));

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Navbar />
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

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route path="users" element={<UsersPage />} />
            <Route path="scenarios" element={<ScenariosPage />} />
            <Route path="chapters" element={<ChaptersPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="timeslots" element={<TimeSlotPage />} />
          </Route>

          {/* Redirect all other paths to login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;

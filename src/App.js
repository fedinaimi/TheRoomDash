// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ScenariosPage from './pages/ScenariosPage';
import ChaptersPage from './pages/ChaptersPage';
import ReservationsPage from './pages/ReservationsPage'; // New admin page for reservations
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute'; // Protect routes
import PublicRoute from './components/PublicRoute';   // Prevent access to login if authenticated
import TimeSlotPage from './pages/TimeSlotPage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public route for login */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

  

        {/* Protected dashboard routes */}
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
          <Route path="reservations" element={<ReservationsPage />} /> {/* New admin route for reservations */}
          <Route path="timeslots" element={<TimeSlotPage />} /> {/* New admin route for reservations */}

        </Route>

        {/* Default route (redirect to login) */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;

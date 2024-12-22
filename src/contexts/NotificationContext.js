// src/contexts/NotificationContext.js

import React, { createContext, useContext, useState } from "react";
import NotificationSystem from "../components/NotificationSystem"; // Import NotificationSystem

// Create the context
const NotificationContext = createContext();

// Custom hook to use the NotificationContext
export const useNotification = () => useContext(NotificationContext);

// Provider component
export const NotificationProvider = ({ children }) => {
  const [localNotifications, setLocalNotifications] = useState([]);

  // Method to add a notification
  const addLocalNotification = (notification) => {
    const id = Date.now();
    setLocalNotifications((prev) => [{ id, ...notification }, ...prev]);

    // Automatically remove the notification after 5 seconds
    setTimeout(() => {
      removeLocalNotification(id);
    }, 5000);
  };

  // Method to remove a notification
  const removeLocalNotification = (id) => {
    setLocalNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addLocalNotification }}>
      {children}
      {/* Render the NotificationSystem here */}
      <NotificationSystem localNotifications={localNotifications} />
    </NotificationContext.Provider>
  );
};

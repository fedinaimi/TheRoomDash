import React, { useState, useEffect } from "react";
import { FaBell, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import io from "socket.io-client";
import axiosInstance from "../services/axiosInstance";
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

const socket = io("http://localhost:5000"); // Update with your backend URL

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false); // State to toggle dropdown visibility
  const [expandedNotification, setExpandedNotification] = useState(null); // State to track expanded notification

  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await axiosInstance.get("/notifications");
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    socket.on("reservationCreated", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });
    return () => socket.disconnect();
  }, []);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  // Expand or collapse notification details
  const toggleDetails = (id) => {
    setExpandedNotification((prev) => (prev === id ? null : id));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest(".notification-dropdown")) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <div className="relative notification-dropdown">
      <button
        onClick={toggleDropdown}
        className="relative flex items-center bg-gray-100 p-2 rounded-full hover:bg-gray-200"
      >
        <FaBell size={20} />
        {notifications.some((n) => !n.read) && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {notifications.filter((n) => !n.read).length}
          </span>
        )}
      </button>
      {dropdownVisible && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md z-50">
          <div className="p-4 text-gray-700 font-semibold">Notifications</div>
          <ul className="max-h-60 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="p-4 text-gray-500 text-sm text-center">
                No notifications
              </li>
            )}
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`p-4 border-b text-gray-600 ${
                  notification.read ? "opacity-50" : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <span
                    onClick={() => markAsRead(notification._id)}
                    className="cursor-pointer hover:text-indigo-500"
                  >
                    {notification.message}
                  </span>
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => toggleDetails(notification._id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedNotification === notification._id ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </button>
                </div>
                {expandedNotification === notification._id && (
                  <div className="mt-2 text-sm text-gray-500">
                    <p>
                      <strong>Details:</strong> {notification.details || "N/A"}
                    </p>
                    <p>
                      <strong>Time:</strong> {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;

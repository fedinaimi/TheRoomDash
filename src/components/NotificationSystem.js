// src/components/NotificationSystem.jsx

import React, { useState, useEffect } from "react";
import { FaBell, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import io from "socket.io-client";
import ConfirmationModal from "./ConfirmationModal"; // Import the modal

const SOCKET_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile to determine role
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data } = await axiosInstance.get("/user/profile"); // Adjust the endpoint as needed
        setUserRole(data.usertype);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (!userRole) return; // Wait until userRole is fetched

    const socket = io(SOCKET_URL);

    // Join the appropriate room based on user role
    if (userRole === "admin" || userRole === "subadmin") {
      socket.emit("joinRoom", "admins");
    } else {
      socket.emit("joinRoom", "users");
    }

    socket.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userRole]);

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

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const openConfirmDelete = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const closeConfirmDelete = () => {
    setConfirmDelete({ isOpen: false, id: null });
  };

  const handleDelete = async () => {
    const { id } = confirmDelete;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      closeConfirmDelete();
    } catch (error) {
      console.error("Error deleting notification:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const toggleDetails = (e, id) => {
    e.stopPropagation(); // Prevent the click from closing the dropdown
    setExpandedNotification((prev) => (prev === id ? null : id));
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    setDropdownVisible(false);
    navigate(`/dashboard/reservations/${notification.reservationId}`); // Navigate to specific reservation
  };

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
        className="relative flex items-center bg-gray-100 p-2 rounded-full hover:bg-gray-200 focus:outline-none transition-colors duration-200"
        aria-label="Toggle Notifications Dropdown"
      >
        <FaBell size={20} />
        {notifications.some((n) => !n.isRead) && (
          <span
            className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            aria-label={`${notifications.filter((n) => !n.isRead).length} unread notifications`}
          >
            {notifications.filter((n) => !n.isRead).length}
          </span>
        )}
      </button>
      {dropdownVisible && (
        <div
          className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-md z-50 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notifications-title"
        >
          <div className="p-4 border-b border-gray-200 text-gray-700 font-semibold" id="notifications-title">
            Notifications
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="p-4 text-gray-500 text-sm text-center">
                No notifications
              </li>
            )}
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`p-4 border-b border-gray-200 ${
                  notification.isRead ? "bg-gray-100 text-gray-600" : "bg-white text-gray-800 font-semibold"
                } transition-colors duration-200 cursor-pointer`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex justify-between items-center">
                  <div className={`flex-1 hover:text-indigo-500`}>
                    <p className="font-medium">{notification.message}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        openConfirmDelete(notification._id);
                        e.stopPropagation(); // Prevent navigation
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      title="Delete Notification"
                      aria-label="Delete Notification"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={(e) => toggleDetails(e, notification._id)}
                      className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      title="Toggle Details"
                      aria-label="Toggle Notification Details"
                    >
                      {expandedNotification === notification._id ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </button>
                  </div>
                </div>
                {expandedNotification === notification._id && (
                  <div
                    className="mt-2 text-sm text-gray-500 overflow-hidden transition-all duration-300"
                    aria-label="Notification Details"
                  >
                    <p>
                      <strong>Name:</strong> {notification.details.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {notification.details.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {notification.details.phone}
                    </p>
                    <p>
                      <strong>People:</strong> {notification.details.people}
                    </p>
                    <p>
                      <strong>Scenario:</strong> {notification.details.scenario}
                    </p>
                    <p>
                      <strong>Chapter:</strong> {notification.details.chapter}

                    </p>
                    <p>
  <strong>Created At:</strong> {new Date(notification.createdAt).toLocaleString()}
</p>

                    
                    <p>
                      <strong>Time Slot:</strong>{" "}
                      {notification.details.timeSlot
                        ? `${new Date(notification.details.timeSlot.startTime).toLocaleString()} - ${new Date(notification.details.timeSlot.endTime).toLocaleString()}`
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Status:</strong> {notification.details.status || "N/A"}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Confirmation Modal */}
      {confirmDelete.isOpen && (
        <ConfirmationModal
          title="Delete Notification"
          message="Are you sure you want to delete this notification?"
          onConfirm={handleDelete}
          onCancel={closeConfirmDelete}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default NotificationSystem;

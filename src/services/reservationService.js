// src/services/reservationService.js

import axiosInstance from "./axiosInstance";

// Fetch Chapter Details
export const fetchChapterDetails = async (chapterId) => {
  const response = await axiosInstance.get(`/chapters/${chapterId}`);
  return response.data;
};

// Fetch Time Slots for a Chapter and Date
export const fetchTimeSlots = async (chapterId, date) => {
  try {
    const response = await axiosInstance.get(`/timeSlots`, {
      params: { chapterId, date },
    });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching time slots:", error);
    return [];
  }
};

// Create a Reservation
export const createReservation = async (reservationData) => {
  try {
    const response = await axiosInstance.post(`/reservations`, reservationData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      // Pass backend error message
      throw new Error(error.response.data.message);
    }
    // Fallback for unexpected errors
    throw new Error("Une erreur s'est produite. Veuillez réessayer.");
  }
};

// Fetch All Chapters
export const fetchChapters = async () => {
  try {
    const response = await axiosInstance.get(`/chapters`);
    return response.data; // The list of chapters from the backend
  } catch (error) {
    console.error("Error fetching chapters:", error);
    throw error;
  }
};

// Get All Reservations (Admin Access)
export const getAllReservations = async () => {
  try {
    const response = await axiosInstance.get('/reservations');
    return response.data;
  } catch (error) {
    console.error("Error fetching reservations:", error);
    throw error;
  }
};

// Get Reservation by ID (Admin Access)
export const getReservationById = async (id) => {
  try {
    const response = await axiosInstance.get(`/reservations/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reservation with ID ${id}:`, error);
    throw error;
  }
};

// Update Reservation Status (Admin Access)
export const updateReservationStatus = async (source, reservationId, status) => {
  try {
    const response = await axiosInstance.put(
      `/reservations/${source}/${reservationId}/status`,
      { status }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating status for reservation ID ${reservationId}:`, error);
    throw error;
  }
};

// Delete a Reservation (Admin Access)
export const deleteReservation = async (source, reservationId) => {
  try {
    const response = await axiosInstance.delete(`/reservations/${source}/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting reservation ID ${reservationId}:`, error);
    throw error;
  }
};

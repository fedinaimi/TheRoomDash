// src/services/reservationService.js
import axiosInstance from './axiosInstance';

// Create a reservation (public access)
export const createReservation = async (reservationData) => {
  const response = await axiosInstance.post('/reservations', reservationData);
  return response.data;
};

// Get all reservations (admin access)
export const getAllReservations = async () => {
  const response = await axiosInstance.get('/reservations');
  return response.data;
};

// Get reservation by ID (admin access)
export const getReservationById = async (id) => {
  const response = await axiosInstance.get(`/reservations/${id}`);
  return response.data;
};

// Update reservation status (admin access)
export const updateReservationStatus = async (id, status) => {
  const response = await axiosInstance.put(`/reservations/${id}/status`, { status });
  return response.data;
};

// Delete a reservation (admin access)
export const deleteReservation = async (id) => {
  const response = await axiosInstance.delete(`/reservations/${id}`);
  return response.data;
};

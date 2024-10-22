// src/services/timeSlotService.js
import axiosInstance from './axiosInstance';

// Create time slots (admin access)
export const createTimeSlots = async (scenarioId, date, timeRanges) => {
  const response = await axiosInstance.post('/timeSlots', {
    scenarioId,
    date,
    timeRanges,
  });
  return response.data;
};

// Get available time slots for a scenario by date (public access)
export const getTimeSlotsByDate = async (scenarioId, date) => {
  const response = await axiosInstance.get(`/timeSlots/scenario/${scenarioId}/date?date=${date}`);
  return response.data;
};

// Update a time slot (admin access)
export const updateTimeSlot = async (id, updatedData) => {
  const response = await axiosInstance.put(`/timeSlots/${id}`, updatedData);
  return response.data;
};

// Delete a time slot (admin access)
export const deleteTimeSlot = async (id) => {
  const response = await axiosInstance.delete(`/timeSlots/${id}`);
  return response.data;
};

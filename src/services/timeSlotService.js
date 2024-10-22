import axiosInstance from './axiosInstance';

// Create time slots (admin access)
// Create time slots (admin access)
/*export const createTimeSlots = async (scenarioId, dateRange, weekdayTime, weekendTime) => {
  const response = await axiosInstance.post('/timeSlots', {
    scenarioId,
    dateRange,
    weekdayTime,
    weekendTime
  });
  return response.data;
};
*/
export const createTimeSlots = async (scenarioId, dateRange, weekdayTime, weekendTime) => {
  // Check if scenarioId is an object and extract its value
  const scenarioIdString = typeof scenarioId === 'object' ? scenarioId._id : scenarioId;

  const response = await axiosInstance.post('/timeSlots', {
    scenarioId: scenarioIdString,  // Ensure it's a string
    dateRange,
    weekdayTime,
    weekendTime
  });
  return response.data;
};
export const toggleAvailability = async (timeSlotId, isAvailable) => {
  const response = await axiosInstance.put(`/timeSlots/${timeSlotId}/toggle-availability`, {
    isAvailable,
  });
  return response.data;
};

// Get available time slots for a scenario by date (public access)
export const getTimeSlotsByDate = async (scenarioId, date) => {
  const response = await axiosInstance.get(`/timeSlots/scenario/${scenarioId}/date?date=${date}`);
  return response.data;
};

// Get all time slots for a specific scenario (admin access)
export const getAllTimeSlotsByScenario = async (scenarioId) => {
  const response = await axiosInstance.get(`/timeSlots/scenario/${scenarioId}`);
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

// Get time slots with availability information for a scenario by date range (public access)
export const getTimeSlotsWithAvailability = async (scenarioId, from, to) => {
  const response = await axiosInstance.get('/timeSlots/availability', {
    params: { scenarioId, from, to },
  });
  return response.data;
};

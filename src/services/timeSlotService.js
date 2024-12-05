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

export const createTimeSlots = async (chapterId, dateRange, weekdayTime, weekendTime) => {
  try {
    const response = await axiosInstance.post('/timeSlots', {
      chapterId,
      dateRange, // { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
      weekdayTime, // { startTime: 'HH:mm', endTime: 'HH:mm' }
      weekendTime, // { startTime: 'HH:mm', endTime: 'HH:mm' }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating time slots:', error.response?.data || error.message);
    throw error;
  }
};




export const toggleAvailability = async (id, isAvailable) => {
  const response = await axiosInstance.put(`/timeSlots/${id}/toggle-availability`, { isAvailable });
  return response.data;
};


export const getTimeSlotsByChapterAndDate = async (chapterId, date) => {
  try {
    const response = await axiosInstance.get(`/timeSlots/chapter/${chapterId}/date?date=${date}`);
    return response.data; // Return the fetched data
  } catch (error) {
    console.error('Error fetching time slots by chapter and date:', error);
    throw error;  // Throw error to handle it in the calling function
  }
};
export const getAllTimeSlotsByChapter = async (chapterId, date) => {
  const response = await axiosInstance.get(`/timeSlots?chapterId=${chapterId}&date=${date}`);
  return response.data;
};


// Get available time slots for a scenario by date (public access)
export const getTimeSlotsByDate = async (scenarioId, date) => {
  const response = await axiosInstance.get(`/timeSlots/scenario/${scenarioId}/date?date=${date}`);
  return response.data;
};


// Get all time slots for a specific scenario (admin access)
export const getAllTimeSlotsByScenario = async (scenarioId) => {
  const response = await axiosInstance.get(`/timeslots/scenario/${scenarioId}`);
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

// Clear all time slots for a chapter
export const clearAllTimeSlotsForChapter = async (chapterId) => {
  try {
    const response = await axiosInstance.delete(`/timeSlots/clear-all/${chapterId}`);
    return response.data;
  } catch (error) {
    console.error('Error clearing all time slots for chapter:', error.response?.data || error.message);
    throw error;
  }
};

// Disable all time slots for a specific day
export const disableTimeSlotsForDay = async (chapterId, date) => {
  try {
    const response = await axiosInstance.put(`/timeSlots/disable-day/${chapterId}`, { date });
    return response.data;
  } catch (error) {
    console.error("Error disabling time slots:", error.response?.data || error.message);
    throw error;
  }
};

// Clear all time slots for a specific day
export const clearTimeSlotsForDay = async (chapterId, date) => {
  try {
    const response = await axiosInstance.delete(`/timeSlots/clear-day/${chapterId}`, { data: { date } });
    return response.data;
  } catch (error) {
    console.error("Error clearing time slots:", error.response?.data || error.message);
    throw error;
  }
};

export const enableTimeSlotsForDay = async (chapterId, date) => {
  try {
    const response = await axiosInstance.put(`/timeSlots/enable-day/${chapterId}`, { date });
    return response.data;
  } catch (error) {
    console.error("Error enabling time slots for day:", error.response?.data || error.message);
    throw error;
  }
};
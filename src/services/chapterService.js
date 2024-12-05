import axiosInstance from './axiosInstance'; // Assume axiosInstance is set up with your base URL and token

export const getAllChapters = async () => {
  const response = await axiosInstance.get('/chapters');
  return response.data;
};

// Create a new chapter
export const createChapter = async (formData) => {
  const response = await axiosInstance.post('/chapters', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateChapter = async (id, formData) => {
  const response = await axiosInstance.put(`/chapters/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Update a chapter by ID


// Delete a chapter by ID
export const deleteChapter = async (id) => {
  const response = await axiosInstance.delete(`/chapters/${id}`);
  return response.data;
};
import axiosInstance from './axiosInstance'; // Assume axiosInstance is set up with your base URL and token

export const getAllChapters = async () => {
  const response = await axiosInstance.get('/chapters');
  return response.data;
};

// Create a new chapter
export const createChapter = async (chapter) => {
  const response = await axiosInstance.post('/chapters', chapter);
  return response.data;
};

// Update a chapter by ID
export const updateChapter = async (id, chapter) => {
  const response = await axiosInstance.put(`/chapters/${id}`, chapter);
  return response.data;
};

// Delete a chapter by ID
export const deleteChapter = async (id) => {
  const response = await axiosInstance.delete(`/chapters/${id}`);
  return response.data;
};
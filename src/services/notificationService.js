import axiosInstance from './axiosInstance';

export const fetchNotifications = async () => {
  const response = await axiosInstance.get('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  await axiosInstance.put(`/notifications/${id}/read`);
};

export const clearNotifications = async () => {
  await axiosInstance.delete('/notifications');
};

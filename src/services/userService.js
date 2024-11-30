import axiosInstance from './axiosInstance';

export const fetchAllUsers = async () => {
  const response = await axiosInstance.get('/users');
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axiosInstance.post('/users', userData);
  return response.data;
};

export const updateUserVerification = async (userId, verified) => {
  const response = await axiosInstance.put(`/users/${userId}/verification`, { verified });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/users/${userId}`);
  return response.data;
};
export const updateUserDetails = async (userId, userData) => {
    const response = await axiosInstance.put(`/users/${userId}`, userData);
    return response.data;
  };
  
  export const updateUserPassword = async (userId, passwords) => {
    const response = await axiosInstance.put(`/users/${userId}/password`, passwords);
    return response.data;
  };
  export const fetchProfile = async () => {
    const response = await axiosInstance.get('/fetch-profile');
    return response.data;
  };
  
import axiosInstance from './axiosInstance';

export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post('/signin', { email, password });

    // Store token if provided
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  // Remove token from localStorage
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token; // Returns true if token exists
};

export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post('/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error.response?.data || error.message);
    throw error;
  }
};

export const resetPassword = async (resetCode, newPassword, confirmPassword) => {
  try {
    const response = await axiosInstance.post('/reset-password', {
      code: resetCode,
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error.response?.data || error.message);
    throw error;
  }
};

export const changePassword = async (oldPassword, newPassword, confirmPassword) => {
  try {
    const response = await axiosInstance.post('/modify-password', {
      oldPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    console.error('Change password error:', error.response?.data || error.message);
    throw error;
  }
};

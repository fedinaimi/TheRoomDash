import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_APII_BASE_URL, // Use the REACT_APP_API_BASE_URL from the .env file
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;

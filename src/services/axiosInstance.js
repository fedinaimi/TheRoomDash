import axios from 'axios';

// Create an Axios instance with the base URL from the environment variables
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // Use the environment variable
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Retrieve token from localStorage
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // Attach token to headers
  }
  return config;
});

export default axiosInstance;

import axiosInstance from './axiosInstance';

export const login = async (email, password) => {
    const response = await axiosInstance.post('/signin', { email, password });
  
    // If your backend sends the token as part of the response body (and not in cookies), store it
    localStorage.setItem('token', response.data.token);
  
    // Return the response in case other info needs to be handled
    return response.data;
  };
  
  // Logout function
  export const logout = async () => {
    localStorage.removeItem('token');
  };
// Check if the user is authenticated by verifying the cookie/token
export const isAuthenticated = () => {
  return document.cookie.includes('token='); // Check if token exists in cookies
};

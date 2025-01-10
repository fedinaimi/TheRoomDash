import axiosInstance from './axiosInstance';

// Fetch all prices
export const getAllPrices = async () => {
  const response = await axiosInstance.get('/prices');
  return response.data;
};

// Fetch a single price by ID
export const getPriceById = async (id) => {
  const response = await axiosInstance.get(`/prices/${id}`);
  return response.data;
};

// Create a new price
export const createPrice = async (priceData) => {
  const response = await axiosInstance.post('/prices', priceData);
  return response.data;
};

// Update an existing price
export const updatePrice = async (id, priceData) => {
  const response = await axiosInstance.put(`/prices/${id}`, priceData);
  return response.data;
};

// Delete a price
export const deletePrice = async (id) => {
  const response = await axiosInstance.delete(`/prices/${id}`);
  return response.data;
};

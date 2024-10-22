import axiosInstance from './axiosInstance';

// Function to get all scenarios
export const getAllScenarios = async () => {
  const response = await axiosInstance.get('/scenarios');
  return response.data;
};

// Function to create a new scenario
export const createScenario = async (scenario) => {
  const response = await axiosInstance.post('/scenarios', scenario); // Pass name and category only
  return response.data;
};

// Function to update an existing scenario
export const updateScenario = async (id, scenario) => {
  const response = await axiosInstance.put(`/scenarios/${id}`, scenario); // Pass name and category
  return response.data;
};

// Function to delete a scenario
export const deleteScenario = async (id) => {
  const response = await axiosInstance.delete(`/scenarios/${id}`);
  return response.data;
};

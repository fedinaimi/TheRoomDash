// src/components/ChapterForm.js

import React, { useEffect, useState } from 'react';
import { getAllScenarios } from '../services/scenarioService';
import LoaderButton from './LoaderButton';

const ChapterForm = ({ onSubmit, onClose, chapter }) => {
  const [scenarios, setScenarios] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    minPlayerNumber: '',
    maxPlayerNumber: '',
    percentageOfSuccess: '',
    time: '',
    difficulty: '',
    description: '',
    comment: '',
    place: '',
    image: null,
    video: null,
    scenarioId: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchScenarios() {
      try {
        const scenariosData = await getAllScenarios();
        setScenarios(scenariosData);
      } catch (error) {
        console.error('Error fetching scenarios:', error);
        alert('Failed to fetch scenarios. Please try again later.');
      }
    }
    fetchScenarios();

    if (chapter) {
      setFormData({
        name: chapter.name || '',
        minPlayerNumber: chapter.minPlayerNumber || '',
        maxPlayerNumber: chapter.maxPlayerNumber || '',
        percentageOfSuccess: chapter.percentageOfSuccess || '',
        time: chapter.time || '',
        difficulty: chapter.difficulty || '',
        description: chapter.description || '',
        comment: chapter.comment || '',
        place: chapter.place || '',
        image: chapter.image || null, // Existing image path or null
        video: chapter.video || null, // Existing video path or null
        scenarioId: chapter.scenario?._id || '',
      });
    }
  }, [chapter]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    if (!formData.scenarioId) {
      newErrors.scenarioId = 'Scenario is required';
    }
    if (!formData.minPlayerNumber) {
      newErrors.minPlayerNumber = 'Minimum players is required';
    }
    if (!formData.maxPlayerNumber) {
      newErrors.maxPlayerNumber = 'Maximum players is required';
    }
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    if (!formData.difficulty) {
      newErrors.difficulty = 'Difficulty is required';
    }
    if (!formData.description) {
      newErrors.description = 'Description is required';
    }
    if (!formData.place) {
      newErrors.place = 'Place is required';
    }

    if (formData.minPlayerNumber && formData.maxPlayerNumber) {
      if (parseInt(formData.minPlayerNumber) > parseInt(formData.maxPlayerNumber)) {
        newErrors.minPlayerNumber = 'Minimum players must not exceed maximum players';
      }
    }

    if (formData.percentageOfSuccess) {
      const percentage = parseInt(formData.percentageOfSuccess, 10);
      if (percentage < 0 || percentage > 100) {
        newErrors.percentageOfSuccess = 'Percentage of success must be between 0 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' })); // Clear the error for that field
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    const maxSize = 25 * 1024 * 1024; // 25MB in bytes

    if (file) {
      if (file.size > maxSize) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [type]: 'File size must be less than 25MB',
        }));
      } else {
        setFormData((prev) => ({ ...prev, [type]: file }));
        setErrors((prevErrors) => ({ ...prevErrors, [type]: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      try {
        // Prepare data to send
        const submissionData = { ...formData };

        // If editing an existing chapter and no new file was chosen,
        // preserve the existing image/video path from `chapter`
        if (chapter) {
          if (!submissionData.image) {
            submissionData.image = chapter.image;
          }
          if (!submissionData.video) {
            submissionData.video = chapter.video;
          }
        }

        await onSubmit(submissionData);
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('Failed to submit form. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-md w-full max-w-4xl mx-auto shadow-lg overflow-auto max-h-[90vh]">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {chapter ? 'Edit Chapter' : 'Add Chapter'}
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Name */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">Name</label>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
              errors.name ? 'border-red-500' : ''
            }`}
            placeholder="Chapter name"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        {/* Scenario */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">Scenario</label>
          <select
            name="scenarioId"
            value={formData.scenarioId}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
              errors.scenarioId ? 'border-red-500' : ''
            }`}
          >
            <option value="">Select a scenario</option>
            {scenarios.map((scenario) => (
              <option key={scenario._id} value={scenario._id}>
                {scenario.name}
              </option>
            ))}
          </select>
          {errors.scenarioId && <p className="text-red-500 text-sm">{errors.scenarioId}</p>}
        </div>

        {/* Min Player Number */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">Min Player Number</label>
          <input
            name="minPlayerNumber"
            type="number"
            value={formData.minPlayerNumber}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
              errors.minPlayerNumber ? 'border-red-500' : ''
            }`}
            placeholder="Minimum players"
            min="1"
          />
          {errors.minPlayerNumber && (
            <p className="text-red-500 text-sm">{errors.minPlayerNumber}</p>
          )}
        </div>

        {/* Max Player Number */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">Max Player Number</label>
          <input
            name="maxPlayerNumber"
            type="number"
            value={formData.maxPlayerNumber}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
              errors.maxPlayerNumber ? 'border-red-500' : ''
            }`}
            placeholder="Maximum players"
            min="1"
          />
          {errors.maxPlayerNumber && (
            <p className="text-red-500 text-sm">{errors.maxPlayerNumber}</p>
          )}
        </div>

        {/* Percentage of Success */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">Success Percentage</label>
          <input
            name="percentageOfSuccess"
            type="number"
            value={formData.percentageOfSuccess}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
              errors.percentageOfSuccess ? 'border-red-500' : ''
            }`}
            placeholder="Success percentage"
            min="0"
            max="100"
          />
          {errors.percentageOfSuccess && (
            <p className="text-red-500 text-sm">{errors.percentageOfSuccess}</p>
          )}
        </div>

        {/* Time */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">Time (minutes)</label>
          <input
            name="time"
            type="number"
            value={formData.time}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
              errors.time ? 'border-red-500' : ''
            }`}
            placeholder="Time in minutes"
            min="1"
          />
          {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
              errors.difficulty ? 'border-red-500' : ''
            }`}
          >
            <option value="">Select difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          {errors.difficulty && <p className="text-red-500 text-sm">{errors.difficulty}</p>}
        </div>

        {/* Description */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
              errors.description ? 'border-red-500' : ''
            }`}
            placeholder="Describe the chapter"
            rows="4"
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
        </div>

        {/* Place */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">Place</label>
          <input
            name="place"
            type="text"
            value={formData.place}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
              errors.place ? 'border-red-500' : ''
            }`}
            placeholder="Enter the location"
          />
          {errors.place && <p className="text-red-500 text-sm">{errors.place}</p>}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'image')}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
          
          {/* Preview for new image upload */}
          {formData.image && formData.image instanceof File && (
            <img
              src={URL.createObjectURL(formData.image)}
              alt="Chapter"
              className="mt-2 h-32 w-full object-cover rounded-md"
            />
          )}

          {/* Display existing image if editing and no new image is uploaded */}
          {chapter && formData.image && typeof formData.image === 'string' && (
            <img
              src={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}${formData.image}`}
              alt="Chapter"
              className="mt-2 h-32 w-full object-cover rounded-md"
            />
          )}
        </div>

        {/* Video Upload */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">Video</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => handleFileChange(e, 'video')}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          {errors.video && <p className="text-red-500 text-sm">{errors.video}</p>}
          
          {/* Preview for new video upload */}
          {formData.video && formData.video instanceof File && (
            <div className="mt-2 max-w-xs max-h-[150px] overflow-hidden rounded-md mx-auto">
              <video controls className="h-full w-full object-contain">
                <source src={URL.createObjectURL(formData.video)} type="video/mp4" />
              </video>
            </div>
          )}

          {/* Display existing video if editing and no new video is uploaded */}
          {chapter && formData.video && typeof formData.video === 'string' && (
            <div className="mt-2 max-w-xs max-h-[150px] overflow-hidden rounded-md mx-auto">
              <video controls className="h-full w-full object-contain">
                <source
                  src={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}${formData.video}`}
                  type="video/mp4"
                />
              </video>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="col-span-1 md:col-span-2 flex justify-end space-x-4">
          <LoaderButton
            onClick={onClose}
            isLoading={false} // Cancel button has no loader
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200"
          >
            Cancel
          </LoaderButton>
          <LoaderButton
            type="submit"
            onClick={handleSubmit}
            isLoading={isLoading} // Show loader on submission
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
          >
            {chapter ? 'Update' : 'Add'}
          </LoaderButton>
        </div>
      </form>
    </div>
  );
};

export default ChapterForm;

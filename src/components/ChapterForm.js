import React, { useState, useEffect } from 'react';
import { getAllScenarios } from '../services/scenarioService';

const ChapterForm = ({ onSubmit, onClose, chapter }) => {
  const [scenarios, setScenarios] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    playerNumber: '',
    time: '',
    difficulty: '',
    description: '',
    comment: '',
    place: '',
    image: null,
    video: null,
    scenarioId: '',
  });

  useEffect(() => {
    async function fetchScenarios() {
      try {
        const scenariosData = await getAllScenarios();
        setScenarios(scenariosData);
      } catch (error) {
        console.error('Error fetching scenarios:', error);
      }
    }
    fetchScenarios();

    if (chapter) {
      setFormData({
        name: chapter.name || '',
        playerNumber: chapter.playerNumber || '',
        time: chapter.time || '',
        difficulty: chapter.difficulty || '',
        description: chapter.description || '',
        comment: chapter.comment || '',
        place: chapter.place || '',
        image: chapter.image || null,
        video: chapter.video || null,
        scenarioId: chapter.scenario?._id || '',
      });
    }
  }, [chapter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [type]: file });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.place) {
      alert('Place is required!');
      return;
    }
    onSubmit(formData);
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
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
            placeholder="Chapter name"
            required
          />
        </div>

        {/* Scenario */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">Scenario</label>
          <select
            name="scenarioId"
            value={formData.scenarioId}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
            required
          >
            <option value="">Select a scenario</option>
            {scenarios.map((scenario) => (
              <option key={scenario._id} value={scenario._id}>
                {scenario.name}
              </option>
            ))}
          </select>
        </div>

        {/* Player Number */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">Player Number</label>
          <input
            name="playerNumber"
            type="number"
            value={formData.playerNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
            placeholder="Number of players"
            required
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">Time (minutes)</label>
          <input
            name="time"
            type="number"
            value={formData.time}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
            placeholder="Time in minutes"
            required
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
            required
          >
            <option value="">Select difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Description */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
            placeholder="Describe the chapter"
            required
          />
        </div>

        {/* Place */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">Place</label>
          <input
            name="place"
            type="text"
            value={formData.place}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
            placeholder="Enter the location"
            required
          />
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
          {formData.image && formData.image instanceof File && (
            <img
              src={URL.createObjectURL(formData.image)}
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
          {formData.video && formData.video instanceof File && (
            <div className="mt-2 max-w-xs max-h-[150px] overflow-hidden rounded-md mx-auto">
              <video controls className="h-full w-full object-contain">
                <source src={URL.createObjectURL(formData.video)} type="video/mp4" />
              </video>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="col-span-1 md:col-span-2 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
          >
            {chapter ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChapterForm;

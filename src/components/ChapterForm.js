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
    image: '',
    video: '',
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
        name: chapter.name,
        playerNumber: chapter.playerNumber,
        time: chapter.time,
        difficulty: chapter.difficulty,
        description: chapter.description,
        comment: chapter.comment,
        place: chapter.place,
        image: chapter.image,
        video: chapter.video,
        scenarioId: chapter.scenario?._id || '',
      });
    }
  }, [chapter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, video: reader.result });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const submitForm = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-md w-full max-w-lg mx-4 sm:mx-auto animate-slide-in shadow-lg overflow-auto">
      <h2 className="text-xl font-bold mb-4">
        {chapter ? 'Edit Chapter' : 'Add Chapter'}
      </h2>
      <form onSubmit={submitForm} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-bold mb-2">Name</label>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="Chapter name"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">Scenario</label>
          <select
            name="scenarioId"
            value={formData.scenarioId}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
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

        <div>
          <label className="block text-gray-700 font-bold mb-2">Player Number</label>
          <input
            name="playerNumber"
            type="number"
            value={formData.playerNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="Number of players"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">Time (minutes)</label>
          <input
            name="time"
            type="number"
            value={formData.time}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="Time in minutes"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          >
            <option value="">Select difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="col-span-1 sm:col-span-2">
          <label className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="Describe the chapter"
            required
          />
        </div>

        <div className="col-span-1 sm:col-span-2">
          <label className="block text-gray-700 font-bold mb-2">Comment</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="Additional comments"
          />
        </div>

        <div className="col-span-1 sm:col-span-2">
          <label className="block text-gray-700 font-bold mb-2">Place</label>
          <input
            name="place"
            type="text"
            value={formData.place}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="Location for the chapter"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border rounded-md"
          />
          {formData.image && (
            <img
              src={formData.image}
              alt="Chapter"
              className="mt-2 h-32 w-full object-cover"
            />
          )}
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">Video</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="w-full px-4 py-2 border rounded-md"
          />
          {formData.video && (
            <video controls className="mt-2 w-full">
              <source src={formData.video} type="video/mp4" />
            </video>
          )}
        </div>

        <div className="col-span-1 sm:col-span-2 flex justify-end space-x-4">
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

// src/pages/TimeSlotPage.js
import React, { useState, useEffect } from 'react';
import { getTimeSlotsByDate, createTimeSlots, deleteTimeSlot } from '../services/timeSlotService';
import { getAllScenarios } from '../services/scenarioService';
import { FaEdit, FaTrash } from 'react-icons/fa';

const TimeSlotPage = () => {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState('');
  const [date, setDate] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [timeRanges, setTimeRanges] = useState([{ startTime: '', endTime: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // To handle errors

  useEffect(() => {
    async function fetchScenarios() {
      const scenariosData = await getAllScenarios();
      setScenarios(scenariosData);
    }
    fetchScenarios();
  }, []);

  const handleAddTimeRange = () => {
    setTimeRanges([...timeRanges, { startTime: '', endTime: '' }]);
  };

  const handleTimeRangeChange = (index, field, value) => {
    const updatedRanges = timeRanges.map((range, i) =>
      i === index ? { ...range, [field]: value } : range
    );
    setTimeRanges(updatedRanges);
  };

  const handleFetchTimeSlots = async () => {
    setLoading(true);
    setError(null); // Reset error state
    try {
      const slots = await getTimeSlotsByDate(selectedScenario, date);
      setTimeSlots(slots);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError('Failed to fetch time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTimeSlots = async () => {
    setError(null); // Reset error state
    try {
      if (!selectedScenario || !date) {
        setError('Please select a scenario and a date.');
        return;
      }

      const validTimeRanges = timeRanges.filter(
        (range) => range.startTime && range.endTime
      );
      if (validTimeRanges.length === 0) {
        setError('Please add at least one valid time range.');
        return;
      }

      await createTimeSlots({ scenarioId: selectedScenario, date, timeRanges: validTimeRanges });
      handleFetchTimeSlots(); // Refresh time slots after creation
    } catch (error) {
      console.error('Error creating time slots:', error);
      setError('Failed to create time slots.');
    }
  };

  const handleDeleteTimeSlot = async (timeSlotId) => {
    try {
      await deleteTimeSlot(timeSlotId);
      handleFetchTimeSlots(); // Refresh time slots after deletion
    } catch (error) {
      console.error('Error deleting time slot:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Time Slot Management</h1>

      {/* Error Display */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Select Scenario */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Scenario</label>
        <select
          value={selectedScenario}
          onChange={(e) => setSelectedScenario(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a scenario</option>
          {scenarios.map((scenario) => (
            <option key={scenario._id} value={scenario._id}>
              {scenario.name}
            </option>
          ))}
        </select>
      </div>

      {/* Select Date */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Add Time Ranges */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Time Ranges</h3>
        {timeRanges.map((range, index) => (
          <div key={index} className="flex mb-2 space-x-4">
            <input
              type="time"
              value={range.startTime}
              onChange={(e) => handleTimeRangeChange(index, 'startTime', e.target.value)}
              className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="time"
              value={range.endTime}
              onChange={(e) => handleTimeRangeChange(index, 'endTime', e.target.value)}
              className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <button
          onClick={handleAddTimeRange}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200 mt-2"
        >
          Add Time Range
        </button>
      </div>

      {/* Create Time Slots */}
      <button
        onClick={handleCreateTimeSlots}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-6 hover:bg-blue-600 transition duration-200"
      >
        Create Time Slots
      </button>

      {/* Fetch Time Slots */}
      <button
        onClick={handleFetchTimeSlots}
        className="bg-gray-500 text-white px-4 py-2 rounded mb-6 hover:bg-gray-600 transition duration-200"
      >
        Fetch Time Slots
      </button>

      {/* Time Slots List */}
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="loader">Loading...</div>
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-bold mb-4">Available Time Slots</h3>
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Start Time</th>
                <th className="px-4 py-2 border">End Time</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot._id} className="hover:bg-gray-100 transition duration-200">
                  <td className="px-4 py-2 border">{slot.startTime}</td>
                  <td className="px-4 py-2 border">{slot.endTime}</td>
                  <td className="px-4 py-2 border flex space-x-2">
                    <button
                      onClick={() => handleDeleteTimeSlot(slot._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                    >
                      <FaTrash />
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600"
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPage;

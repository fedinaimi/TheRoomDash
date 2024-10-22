import React, { useState, useEffect } from 'react';
import { getAllTimeSlotsByScenario, createTimeSlots, deleteTimeSlot, updateTimeSlot, toggleAvailability } from '../services/timeSlotService';
import { getAllScenarios } from '../services/scenarioService';
import { FaTrash, FaEdit, FaEye, FaToggleOn, FaToggleOff, FaPlus } from 'react-icons/fa';
import Modal from 'react-modal';
import { format, parseISO, getYear, getMonth, getDate } from 'date-fns';

// Custom styles for Modal
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const TimeSlotPage = () => {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Modal for adding slots
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [weekdayTime, setWeekdayTime] = useState({ startTime: '', endTime: '' });
  const [weekendTime, setWeekendTime] = useState({ startTime: '', endTime: '' });
  const [editingSlot, setEditingSlot] = useState(null); // For editing slot
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month
  const [selectedDay, setSelectedDay] = useState(new Date().getDate()); // Current day

  useEffect(() => {
    async function fetchScenarios() {
      try {
        const scenariosData = await getAllScenarios();
        setScenarios(scenariosData);
      } catch (err) {
        setError('Failed to fetch scenarios');
      }
    }
    fetchScenarios();
  }, []);

  const handleFetchTimeSlots = async () => {
    if (!selectedScenario) {
      setError('Please select a scenario.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const slots = await getAllTimeSlotsByScenario(selectedScenario._id);
      const filteredSlots = slots.filter((slot) => {
        const slotDate = parseISO(slot.date);
        return (
          getYear(slotDate) === selectedYear &&
          getMonth(slotDate) + 1 === selectedMonth &&
          getDate(slotDate) === selectedDay
        );
      });
      setTimeSlots(filteredSlots);
      setIsDetailVisible(true);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError('Failed to fetch time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (timeSlotId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await toggleAvailability(timeSlotId, newStatus);
      handleFetchTimeSlots();
    } catch (error) {
      console.error('Error toggling availability:', error);
      setError('Failed to toggle availability.');
    }
  };

  const handleDeleteTimeSlot = async (timeSlotId) => {
    try {
      await deleteTimeSlot(timeSlotId);
      handleFetchTimeSlots();
    } catch (error) {
      console.error('Error deleting time slot:', error);
      setError('Failed to delete time slot.');
    }
  };

  // Handle opening and closing the Add Slot Modal
  const handleAddSlotModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddSlotModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCreateTimeSlots = async () => {
    if (!selectedScenario || !dateRange.from || !dateRange.to || !weekdayTime.startTime || !weekdayTime.endTime) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      await createTimeSlots(selectedScenario._id, dateRange, weekdayTime, weekendTime);
      handleFetchTimeSlots();
      closeAddSlotModal();
    } catch (error) {
      console.error('Error creating time slots:', error);
      setError('Failed to create time slots.');
    }
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setIsModalOpen(true);
  };

  const handleUpdateSlot = async () => {
    if (!editingSlot.startTime || !editingSlot.endTime) {
      setError('Please fill in the time slot details.');
      return;
    }
    try {
      await updateTimeSlot(editingSlot._id, {
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
      });
      setEditingSlot(null);
      setIsModalOpen(false);
      handleFetchTimeSlots();
    } catch (error) {
      console.error('Error updating time slot:', error);
      setError('Failed to update time slot.');
    }
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value, 10));
    handleFetchTimeSlots();
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value, 10));
    handleFetchTimeSlots();
  };

  const handleDayChange = (event) => {
    setSelectedDay(parseInt(event.target.value, 10));
    handleFetchTimeSlots();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Scenario Time Slot Management</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <h3 className="text-xl font-bold mb-4">Scenarios</h3>
      <table className="min-w-full bg-white border border-gray-300 rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Scenario Name</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((scenario) => (
            <tr key={scenario._id} className="hover:bg-gray-100 transition duration-200">
              <td className="px-4 py-2 border">{scenario.name}</td>
              <td className="px-4 py-2 border flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedScenario(scenario);
                    handleFetchTimeSlots();
                  }}
                  className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                >
                  <FaEye /> Details
                </button>
                <button
                  onClick={handleAddSlotModal}
                  className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600"
                >
                  <FaPlus /> Add Slot
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Date Selectors */}
      <div className="mt-4 flex space-x-4">
        <div>
          <label className="block mb-2 font-semibold">Select Year</label>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold">Select Month</label>
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {format(new Date(2024, month - 1), 'MMMM')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold">Select Day</label>
          <select
            value={selectedDay}
            onChange={handleDayChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isDetailVisible && (
        <div>
          <h3 className="text-xl font-bold mb-4">Available Time Slots for {selectedScenario.name}</h3>
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Start Time</th>
                <th className="px-4 py-2 border">End Time</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot._id} className="hover:bg-gray-100 transition duration-200">
                  <td className="px-4 py-2 border">{format(parseISO(slot.date), 'MMMM d, yyyy')}</td>
                  <td className="px-4 py-2 border">{slot.startTime}</td>
                  <td className="px-4 py-2 border">{slot.endTime}</td>
                  <td className="px-4 py-2 border">
                    {slot.isAvailable ? (
                      <span className="text-green-600">Available</span>
                    ) : (
                      <span className="text-red-600">Not Available</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border flex space-x-2">
                    <button
                      onClick={() => handleToggleAvailability(slot._id, slot.isAvailable)}
                      className={`${
                        slot.isAvailable ? 'bg-red-500' : 'bg-green-500'
                      } text-white px-2 py-1 rounded-md hover:${
                        slot.isAvailable ? 'bg-red-600' : 'bg-green-600'
                      }`}
                    >
                      {slot.isAvailable ? <FaToggleOff /> : <FaToggleOn />}
                    </button>
                    <button
                      onClick={() => handleEditSlot(slot)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteTimeSlot(slot._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Slot Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={closeAddSlotModal}
        style={customStyles}
        contentLabel="Add Time Slot"
      >
        <h2 className="text-xl font-bold mb-4">Add Time Slot</h2>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Date Range</label>
          <div className="flex space-x-4">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">Weekday Time</label>
          <div className="flex space-x-4">
            <input
              type="time"
              value={weekdayTime.startTime}
              onChange={(e) => setWeekdayTime({ ...weekdayTime, startTime: e.target.value })}
              className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="time"
              value={weekdayTime.endTime}
              onChange={(e) => setWeekdayTime({ ...weekdayTime, endTime: e.target.value })}
              className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">Weekend Time</label>
          <div className="flex space-x-4">
            <input
              type="time"
              value={weekendTime.startTime}
              onChange={(e) => setWeekendTime({ ...weekendTime, startTime: e.target.value })}
              className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="time"
              value={weekendTime.endTime}
              onChange={(e) => setWeekendTime({ ...weekendTime, endTime: e.target.value })}
              className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleCreateTimeSlots}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Slot
        </button>
      </Modal>

      {/* Edit Slot Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={customStyles}
        contentLabel="Edit Time Slot"
      >
        <h2 className="text-xl font-bold mb-4">Edit Time Slot</h2>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Start Time</label>
          <input
            type="time"
            value={editingSlot?.startTime}
            onChange={(e) => setEditingSlot({ ...editingSlot, startTime: e.target.value })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">End Time</label>
          <input
            type="time"
            value={editingSlot?.endTime}
            onChange={(e) => setEditingSlot({ ...editingSlot, endTime: e.target.value })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleUpdateSlot}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
      </Modal>
    </div>
  );
};

export default TimeSlotPage;

import React, { useState, useEffect } from 'react';
import {
  getAllTimeSlotsByScenario,
  createTimeSlots,
  deleteTimeSlot,
  updateTimeSlot,
  toggleAvailability,
} from '../services/timeSlotService';
import { getAllScenarios } from '../services/scenarioService';
import { FaTrash, FaEdit, FaEye, FaToggleOn, FaToggleOff, FaPlus } from 'react-icons/fa';
import Modal from 'react-modal';
import { format, parseISO, getYear, getMonth, getDate } from 'date-fns';
import LoaderButton from '../components/LoaderButton';

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [weekdayTime, setWeekdayTime] = useState({ startTime: '', endTime: '' });
  const [weekendTime, setWeekendTime] = useState({ startTime: '', endTime: '' });
  const [editingSlot, setEditingSlot] = useState(null);
  const [error, setError] = useState(null);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const [loadingStates, setLoadingStates] = useState({
    fetchTimeSlots: false,
    toggleAvailability: {},
    deleteTimeSlot: {},
    createTimeSlots: false,
    updateSlot: false,
  });

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

    setLoadingStates((prev) => ({ ...prev, fetchTimeSlots: true }));
    setError(null);

    try {
      const slots = await getAllTimeSlotsByScenario(selectedScenario._id);

      // Filter based on the exact day (ignoring time)
      const filteredSlots = slots.filter((slot) => {
        const slotDate = parseISO(slot.date);
        const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay);

        return (
          slotDate.getFullYear() === selectedDate.getFullYear() &&
          slotDate.getMonth() === selectedDate.getMonth() &&
          slotDate.getDate() === selectedDate.getDate()
        );
      });

      const formattedSlots = filteredSlots.map((slot) => ({
        ...slot,
        _id: slot.id,
        formattedDate: format(parseISO(slot.date), 'MMMM d, yyyy'),
        formattedStartTime: format(parseISO(slot.startTime), 'hh:mm a'),
        formattedEndTime: format(parseISO(slot.endTime), 'hh:mm a'),
      }));

      setTimeSlots(formattedSlots);
      setIsDetailVisible(true);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError('Failed to fetch time slots');
    } finally {
      setLoadingStates((prev) => ({ ...prev, fetchTimeSlots: false }));
    }
  };

  const handleToggleAvailability = async (timeSlotId, currentStatus) => {
    try {
      // Optimistic UI update: toggle availability immediately in the state
      setTimeSlots((prevSlots) =>
        prevSlots.map((slot) =>
          slot._id === timeSlotId
            ? { ...slot, available: !currentStatus }
            : slot
        )
      );

      // Set loading state for the specific time slot
      setLoadingStates((prev) => ({
        ...prev,
        toggleAvailability: { ...prev.toggleAvailability, [timeSlotId]: true },
      }));

      // Send toggle request to the server
      const newStatus = !currentStatus;
      await toggleAvailability(timeSlotId, newStatus);

      // Optionally, refetch time slots to confirm the change
      // handleFetchTimeSlots(); // Uncomment if you want to refetch after the toggle

    } catch (error) {
      console.error('Error toggling availability:', error);
      setError('Failed to toggle availability.');

      // Revert optimistic UI update if something goes wrong
      setTimeSlots((prevSlots) =>
        prevSlots.map((slot) =>
          slot._id === timeSlotId
            ? { ...slot, available: currentStatus } // Revert to original state
            : slot
        )
      );
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        toggleAvailability: { ...prev.toggleAvailability, [timeSlotId]: false },
      }));
    }
  };

  const handleDeleteTimeSlot = async (timeSlotId) => {
    try {
      setLoadingStates((prev) => ({
        ...prev,
        deleteTimeSlot: { ...prev.deleteTimeSlot, [timeSlotId]: true },
      }));
      await deleteTimeSlot(timeSlotId);
      handleFetchTimeSlots();
    } catch (error) {
      console.error('Error deleting time slot:', error);
      setError('Failed to delete time slot.');
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        deleteTimeSlot: { ...prev.deleteTimeSlot, [timeSlotId]: false },
      }));
    }
  };

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

    setLoadingStates((prev) => ({ ...prev, createTimeSlots: true }));
    try {
      await createTimeSlots(selectedScenario._id, dateRange, weekdayTime, weekendTime);
      handleFetchTimeSlots();
      closeAddSlotModal();
    } catch (error) {
      console.error('Error creating time slots:', error);
      setError('Failed to create time slots.');
    } finally {
      setLoadingStates((prev) => ({ ...prev, createTimeSlots: false }));
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

    setLoadingStates((prev) => ({ ...prev, updateSlot: true }));
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
    } finally {
      setLoadingStates((prev) => ({ ...prev, updateSlot: false }));
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
            <tr key={scenario._id}>
              <td className="px-4 py-2 border">{scenario.name}</td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => {
                    setSelectedScenario(scenario);
                    handleFetchTimeSlots();
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Select
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedScenario && (
        <div className="mt-6">
          <h3 className="text-xl font-bold">Time Slots for {selectedScenario.name}</h3>
          <div className="flex space-x-4 my-4">
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="px-4 py-2 border rounded-md"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="px-4 py-2 border rounded-md"
            >
              {[...Array(12)].map((_, index) => (
                <option key={index} value={index + 1}>
                  {new Date(2024, index).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={selectedDay}
              onChange={handleDayChange}
              className="px-4 py-2 border rounded-md"
            >
              {[...Array(31)].map((_, index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddSlotModal}
            className="px-4 py-2 bg-green-500 text-white rounded-md mb-4"
          >
            <FaPlus /> Add New Time Slot
          </button>

          {loadingStates.fetchTimeSlots ? (
            <div>Loading...</div>
          ) : (
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Start Time</th>
                  <th className="px-4 py-2 border">End Time</th>
                  <th className="px-4 py-2 border">Availability</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot) => (
                  <tr key={slot._id}>
                    <td className="px-4 py-2 border">{slot.formattedDate}</td>
                    <td className="px-4 py-2 border">{slot.formattedStartTime}</td>
                    <td className="px-4 py-2 border">{slot.formattedEndTime}</td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => handleToggleAvailability(slot._id, slot.available)}
                        disabled={loadingStates.toggleAvailability[slot._id]}
                        className={`px-2 py-1 rounded-md ${
                          slot.available ? 'bg-red-500' : 'bg-green-500'
                        } text-white`}
                      >
                        {loadingStates.toggleAvailability[slot._id] ? (
                          'Loading...'
                        ) : slot.available ? (
                          <FaToggleOff />
                        ) : (
                          <FaToggleOn />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => handleEditSlot(slot)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-md mr-2"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteTimeSlot(slot._id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Slot Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={closeAddSlotModal}
        style={customStyles}
      >
        <h2>Add Time Slots</h2>
        <div className="mb-4">
          <label>From:</label>
          <input
            type="date"
            className="border px-4 py-2 w-full"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label>To:</label>
          <input
            type="date"
            className="border px-4 py-2 w-full"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <h3>Weekday Time:</h3>
          <label>Start:</label>
          <input
            type="time"
            className="border px-4 py-2"
            value={weekdayTime.startTime}
            onChange={(e) =>
              setWeekdayTime({ ...weekdayTime, startTime: e.target.value })
            }
          />
          <label>End:</label>
          <input
            type="time"
            className="border px-4 py-2"
            value={weekdayTime.endTime}
            onChange={(e) =>
              setWeekdayTime({ ...weekdayTime, endTime: e.target.value })
            }
          />
        </div>
        <div className="mb-4">
          <h3>Weekend Time:</h3>
          <label>Start:</label>
          <input
            type="time"
            className="border px-4 py-2"
            value={weekendTime.startTime}
            onChange={(e) =>
              setWeekendTime({ ...weekendTime, startTime: e.target.value })
            }
          />
          <label>End:</label>
          <input
            type="time"
            className="border px-4 py-2"
            value={weekendTime.endTime}
            onChange={(e) =>
              setWeekendTime({ ...weekendTime, endTime: e.target.value })
            }
          />
        </div>
        <button
          onClick={handleCreateTimeSlots}
          className="px-4 py-2 bg-green-500 text-white rounded-md"
        >
          Add Time Slots
        </button>
        <button
          onClick={closeAddSlotModal}
          className="px-4 py-2 bg-red-500 text-white rounded-md ml-2"
        >
          Cancel
        </button>
      </Modal>

      {/* Edit Time Slot Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={customStyles}
      >
        <h2>Edit Time Slot</h2>
        <div className="mb-4">
          <label>Start Time:</label>
          <input
            type="time"
            value={editingSlot?.startTime}
            onChange={(e) =>
              setEditingSlot({ ...editingSlot, startTime: e.target.value })
            }
            className="border px-4 py-2"
          />
        </div>
        <div className="mb-4">
          <label>End Time:</label>
          <input
            type="time"
            value={editingSlot?.endTime}
            onChange={(e) =>
              setEditingSlot({ ...editingSlot, endTime: e.target.value })
            }
            className="border px-4 py-2"
          />
        </div>
        <button
          onClick={handleUpdateSlot}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Update Slot
        </button>
        <button
          onClick={() => setIsModalOpen(false)}
          className="px-4 py-2 bg-red-500 text-white rounded-md ml-2"
        >
          Cancel
        </button>
      </Modal>
    </div>
  );
};

export default TimeSlotPage;

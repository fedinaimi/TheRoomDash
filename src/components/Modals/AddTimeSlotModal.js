import React, { useState } from 'react';
import Modal from 'react-modal';
import Loader from '../Loader'; // Assuming the loader component is in the same directory

const AddTimeSlotModal = ({
  isOpen,
  onClose,
  dateRange,
  setDateRange,
  weekdayTime,
  setWeekdayTime,
  weekendTime,
  setWeekendTime,
  onSave,
}) => {
  const [isLoading, setIsLoading] = useState(false); // Track button loading state

  const resetForm = () => {
    setDateRange({ from: "", to: "" });
    setWeekdayTime({ startTime: "", endTime: "" });
    setWeekendTime({ startTime: "", endTime: "" });
  };

  const handleSave = async () => {
    setIsLoading(true); // Start loading
    try {
      await onSave(); // Execute the save logic passed as a prop
      resetForm(); // Clear the form fields after save
    } catch (error) {
      console.error('Error saving time slots:', error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{ content: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } }}
    >
      <h2>Add Time Slots</h2>
      <label>From:</label>
      <input
        type="date"
        value={dateRange.from}
        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
        className="border px-4 py-2 w-full mb-4"
      />
      <label>To:</label>
      <input
        type="date"
        value={dateRange.to}
        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
        className="border px-4 py-2 w-full mb-4"
      />
      <h3>Weekday Time:</h3>
      <label>Start Time:</label>
      <input
        type="time"
        value={weekdayTime.startTime}
        onChange={(e) => setWeekdayTime({ ...weekdayTime, startTime: e.target.value })}
        className="border px-4 py-2 mb-4"
      />
      <label>End Time:</label>
      <input
        type="time"
        value={weekdayTime.endTime}
        onChange={(e) => setWeekdayTime({ ...weekdayTime, endTime: e.target.value })}
        className="border px-4 py-2 mb-4"
      />
      <h3>Weekend Time:</h3>
      <label>Start Time:</label>
      <input
        type="time"
        value={weekendTime.startTime}
        onChange={(e) => setWeekendTime({ ...weekendTime, startTime: e.target.value })}
        className="border px-4 py-2 mb-4"
      />
      <label>End Time:</label>
      <input
        type="time"
        value={weekendTime.endTime}
        onChange={(e) => setWeekendTime({ ...weekendTime, endTime: e.target.value })}
        className="border px-4 py-2 mb-4"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded-md"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-500 text-white rounded-md ml-2"
          disabled={isLoading} // Prevent close while saving
        >
          Cancel
        </button>
      </div>
      {isLoading && <Loader />} {/* Show loader if loading */}
    </Modal>
  );
};

export default AddTimeSlotModal;

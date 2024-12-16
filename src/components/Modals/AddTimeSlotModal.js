import React, { useState } from 'react';
import Modal from 'react-modal';

const AddTimeSlotModal = ({
  isOpen,
  onClose,
  dateRange,
  setDateRange,
  weekdayTime,
  setWeekdayTime,
  onSave,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setDateRange({ from: '', to: '' });
    setWeekdayTime({ startTime: '', endTime: '' });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave();
      resetForm();
    } catch (error) {
      console.error('Error saving time slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{ content: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } }}
    >
      <h2 className="text-2xl font-bold mb-4">Add Time Slots</h2>
      <label className="block mb-2">From:</label>
      <input
        type="date"
        value={dateRange.from}
        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
        className="border px-4 py-2 w-full mb-4"
      />
      <label className="block mb-2">To:</label>
      <input
        type="date"
        value={dateRange.to}
        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
        className="border px-4 py-2 w-full mb-4"
      />
      <h3 className="text-lg font-semibold mb-2">Time Configuration:</h3>
      <label className="block mb-2">Start Time:</label>
      <input
        type="time"
        value={weekdayTime.startTime}
        onChange={(e) => setWeekdayTime({ ...weekdayTime, startTime: e.target.value })}
        className="border px-4 py-2 mb-4 w-full"
      />
      <label className="block mb-2">End Time:</label>
      <input
        type="time"
        value={weekdayTime.endTime}
        onChange={(e) => setWeekdayTime({ ...weekdayTime, endTime: e.target.value })}
        className="border px-4 py-2 mb-4 w-full"
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
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default AddTimeSlotModal;

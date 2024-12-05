import React, { useEffect, useState } from 'react';

const EditTimeSlotModal = ({ isOpen, onClose, editingSlot, onSave }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Populate fields when editingSlot changes
  useEffect(() => {
    if (editingSlot) {
      setStartTime(editingSlot.startTime.slice(11, 16)); // Extract HH:mm from ISO string
      setEndTime(editingSlot.endTime.slice(11, 16)); // Extract HH:mm from ISO string
    }
  }, [editingSlot]);

  const handleSave = () => {
    onSave({
      ...editingSlot,
      startTime: `${editingSlot.date}T${startTime}:00Z`, // Reconstruct full ISO string
      endTime: `${editingSlot.date}T${endTime}:00Z`,
    });
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Edit Time Slot</h2>
          <div className="mb-4">
            <label>Start Time:</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border px-4 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label>End Time:</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border px-4 py-2 w-full"
            />
          </div>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-md">
            Save
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded-md ml-2">
            Cancel
          </button>
        </div>
      </div>
    )
  );
};

export default EditTimeSlotModal;

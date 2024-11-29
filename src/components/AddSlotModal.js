import React, { useState } from 'react';

const ModalAddSlot = ({ onClose, onSubmit }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const handleSubmit = () => {
    onSubmit({ startTime, endTime });
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add New Time Slot</h2>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          placeholder="Start Time"
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          placeholder="End Time"
        />
        <button onClick={handleSubmit}>Add Slot</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ModalAddSlot;

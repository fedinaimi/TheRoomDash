// EditSlotModal.js
import React from 'react';
import Modal from 'react-modal';
// Define custom modal styles
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
const EditSlotModal = ({ isOpen, onClose, onSubmit, editingSlot, setEditingSlot }) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles} contentLabel="Edit Time Slot">
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

      <button onClick={onSubmit} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Save Changes
      </button>
    </Modal>
  );
};

export default EditSlotModal;

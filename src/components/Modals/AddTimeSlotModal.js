import React from 'react';
import Modal from 'react-modal';

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
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={{ content: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } }}>
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
      <button onClick={onSave} className="px-4 py-2 bg-green-500 text-white rounded-md">
        Save
      </button>
      <button onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded-md ml-2">
        Cancel
      </button>
    </Modal>
  );
};

export default AddTimeSlotModal;

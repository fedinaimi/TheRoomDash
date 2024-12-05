import React from 'react';

const CalendarSelector = ({ currentDate, setCurrentDate }) => {
  const handleDateChange = (event) => {
    setCurrentDate(new Date(event.target.value));
  };

  return (
    <div className="flex space-x-4 mb-4">
      <input
        type="date"
        value={currentDate.toISOString().split('T')[0]}
        onChange={handleDateChange}
        className="border px-4 py-2 rounded-md"
      />
    </div>
  );
};

export default CalendarSelector;

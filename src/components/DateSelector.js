import React from 'react';
import { format } from 'date-fns';

const DateSelector = ({ selectedYear, selectedMonth, selectedDay, onYearChange, onMonthChange, onDayChange }) => {
  return (
    <div className="mt-4 flex space-x-4">
      <div>
        <label className="block mb-2 font-semibold">Select Year</label>
        <select
          value={selectedYear}
          onChange={onYearChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: 2 }, (_, i) => new Date().getFullYear() + i).map((year) => (
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
          onChange={onMonthChange}
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
          onChange={onDayChange}
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
  );
};

export default DateSelector;

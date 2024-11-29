import React from 'react';
import { FaTrash, FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const TimeSlotTable = ({ timeSlots, onToggleAvailability, onEditSlot, onDeleteTimeSlot }) => {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Available Time Slots</h3>
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
              <td className="px-4 py-2 border">{slot.formattedDate}</td>
              <td className="px-4 py-2 border">{slot.formattedStartTime}</td>
              <td className="px-4 py-2 border">{slot.formattedEndTime}</td>
              <td className="px-4 py-2 border">
                {slot.isAvailable ? (
                  <span className="text-green-600">Available</span>
                ) : (
                  <span className="text-red-600">Not Available</span>
                )}
              </td>
              <td className="px-4 py-2 border flex space-x-2">
                <button
                  onClick={() => onToggleAvailability(slot._id, slot.isAvailable)}
                  className={`${
                    slot.isAvailable ? 'bg-red-500' : 'bg-green-500'
                  } text-white px-2 py-1 rounded-md hover:${
                    slot.isAvailable ? 'bg-red-600' : 'bg-green-600'
                  }`}
                >
                  {slot.isAvailable ? <FaToggleOff /> : <FaToggleOn />}
                </button>
                <button
                  onClick={() => onEditSlot(slot)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDeleteTimeSlot(slot._id)}
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
  );
};

export default TimeSlotTable;

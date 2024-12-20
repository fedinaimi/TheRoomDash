import React from 'react';
import { FaTrash, FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const TimeSlotTable = ({
  timeSlots,
  onEdit,
  onDelete,
  onToggleAvailability,
  selectedSlots,
  onSelectSlot,
  selectAll,
  onSelectAll,
}) => {
  return (
    <table className="min-w-full bg-white border border-gray-300 rounded-lg">
      <thead>
        <tr>
          <th className="px-4 py-2 border">
            <input type="checkbox" checked={selectAll} onChange={onSelectAll} />
          </th>
          <th className="px-4 py-2 border">Date</th>
          <th className="px-4 py-2 border">Start Time</th>
          <th className="px-4 py-2 border">End Time</th>
          <th className="px-4 py-2 border">Availability</th>
          <th className="px-4 py-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {timeSlots.map((slot) => {
          const isSelected = selectedSlots.includes(slot._id);
          return (
            <tr key={slot._id}>
              <td className="px-4 py-2 border">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelectSlot(slot._id)}
                />
              </td>
              <td className="px-4 py-2 border">{slot.formattedDate}</td>
              <td className="px-4 py-2 border">{slot.formattedStartTime}</td>
              <td className="px-4 py-2 border">{slot.formattedEndTime}</td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => onToggleAvailability(slot._id, slot.isAvailable)}
                  className={`px-2 py-1 rounded-md ${
                    slot.isAvailable ? 'bg-red-500' : 'bg-green-500'
                  } text-white`}
                >
                  {slot.isAvailable ? <FaToggleOff /> : <FaToggleOn />}
                </button>
              </td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => onEdit(slot)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md mr-2"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDelete(slot._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TimeSlotTable;

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaTrashAlt, FaCalendarAlt, FaBan, FaCheck } from "react-icons/fa";

const ChapterList = ({
  chapters,
  setSelectedChapter,
  onClearAllSlots,
  onClearDaySlots,
  onDisableDaySlots,
  onEnableDaySlots,
}) => {
  const [selectedDate, setSelectedDate] = useState(null); // Selected date for actions
  const [activeChapter, setActiveChapter] = useState(null); // Current chapter for the action
  const [actionType, setActionType] = useState(null); // Action type (clear, disable, enable)

  const handleAction = () => {
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }

    const formattedDate = selectedDate.toISOString().split("T")[0];
    if (actionType === "clearDay") {
      onClearDaySlots(activeChapter, formattedDate);
    } else if (actionType === "disableDay") {
      onDisableDaySlots(activeChapter, formattedDate);
    } else if (actionType === "enableDay") {
      onEnableDaySlots(activeChapter, formattedDate);
    }

    // Reset state after action
    setSelectedDate(null);
    setActiveChapter(null);
    setActionType(null);
  };

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-4">Manage Chapters</h3>
      <table className="w-full bg-white border border-gray-300 rounded-lg text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Chapter Name</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {chapters.map((chapter) => (
            <tr key={chapter._id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">
                <button
                  onClick={() => setSelectedChapter(chapter)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md"
                >
                  <FaCalendarAlt />
                  {chapter.name}
                </button>
              </td>
              <td className="px-4 py-2 border flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => {
                    setActiveChapter(chapter._id);
                    setActionType("clearDay");
                  }}
                  className="flex items-center gap-2 px-3 py-1 bg-yellow-500 text-white rounded-md"
                >
                  <FaTrashAlt />
                  Clear Day
                </button>
                <button
                  onClick={() => {
                    setActiveChapter(chapter._id);
                    setActionType("disableDay");
                  }}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md"
                >
                  <FaBan />
                  Disable Day
                </button>
                <button
                  onClick={() => {
                    setActiveChapter(chapter._id);
                    setActionType("enableDay");
                  }}
                  className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-md"
                >
                  <FaCheck />
                  Enable Day
                </button>
                <button
                  onClick={() => onClearAllSlots(chapter._id)}
                  className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md"
                >
                  <FaTrashAlt />
                  Clear All
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Date Picker Modal for Day Actions */}
      {actionType && activeChapter && (
        <div className="mt-6 p-4 border rounded-md bg-gray-50 shadow-md max-w-md mx-auto">
          <h4 className="text-lg font-bold mb-4 text-center">
            Select a Date to{" "}
            {actionType === "clearDay"
              ? "Clear Slots"
              : actionType === "disableDay"
              ? "Disable Slots"
              : "Enable Slots"}
          </h4>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            className="w-full border rounded-md px-3 py-2"
            dateFormat="yyyy-MM-dd"
            placeholderText="Select Date"
          />
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={handleAction}
              className="px-4 py-2 bg-green-500 text-white rounded-md"
            >
              Confirm
            </button>
            <button
              onClick={() => {
                setSelectedDate(null);
                setActiveChapter(null);
                setActionType(null);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterList;

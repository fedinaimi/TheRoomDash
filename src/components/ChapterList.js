import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaTrashAlt, FaCalendarAlt, FaBan, FaCheck } from "react-icons/fa";

const ChapterList = ({
  chapters,
  onChapterSelected,
  selectedChapters,
  onSelectChapter,
  selectAllChapters,
  onSelectAllChapters,
  onClearAllSlots,
  onClearDaySlots,
  onDisableDaySlots,
  onEnableDaySlots,
  onBulkAdd,
}) => {
  const [selectedDate, setSelectedDate] = useState(null); // Date for actions
  const [actionType, setActionType] = useState(null); // Type of action (clear, disable, etc.)
  const [showConfirmation, setShowConfirmation] = useState(false); // Show/hide confirmation modal
  const [loading, setLoading] = useState(false); // Loading state for processing actions
  const [activeChapter, setActiveChapter] = useState(null); // Currently clicked chapter

  // Reset modal state
  const resetState = () => {
    setSelectedDate(null);
    setActionType(null);
    setShowConfirmation(false);
    setActiveChapter(null);
  };

  // Handle confirmation actions
  const handleAction = async () => {
    if (!selectedDate && actionType !== "clearAll") {
      alert("Please select a date.");
      return;
    }

    setLoading(true);

    try {
      const formattedDate = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : null;

      if (actionType === "clearDay") {
        await onClearDaySlots(formattedDate);
      } else if (actionType === "disableDay") {
        await onDisableDaySlots(formattedDate);
      } else if (actionType === "enableDay") {
        await onEnableDaySlots(formattedDate);
      } else if (actionType === "clearAll") {
        await onClearAllSlots();
      }
    } catch (error) {
      alert("Action failed. Please try again.");
    } finally {
      setLoading(false);
      resetState();
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-4">Manage Chapters</h3>

      {/* Bulk Actions for Selected Chapters */}
      <div className="mb-4 flex space-x-4">
        {selectedChapters.length > 0 && (
          <>
            <button
              onClick={() => {
                setActionType("clearAll");
                setShowConfirmation(true);
              }}
              className="px-3 py-1 bg-red-500 text-white rounded-md flex items-center gap-2"
            >
              <FaTrashAlt />
              Clear All (Selected)
            </button>
            <button
              onClick={() => {
                setActionType("clearDay");
                setShowConfirmation(true);
              }}
              className="px-3 py-1 bg-yellow-500 text-white rounded-md flex items-center gap-2"
            >
              <FaTrashAlt />
              Clear Day (Selected)
            </button>
            <button
              onClick={() => {
                setActionType("disableDay");
                setShowConfirmation(true);
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded-md flex items-center gap-2"
            >
              <FaBan />
              Disable Day (Selected)
            </button>
            <button
              onClick={() => {
                setActionType("enableDay");
                setShowConfirmation(true);
              }}
              className="px-3 py-1 bg-green-500 text-white rounded-md flex items-center gap-2"
            >
              <FaCheck />
              Enable Day (Selected)
            </button>
            <button
              onClick={onBulkAdd}
              className="px-3 py-1 bg-green-500 text-white rounded-md flex items-center gap-2"
            >
              <FaCalendarAlt />
              Add Time Slots (Selected)
            </button>
          </>
        )}
      </div>

      {/* Chapter Table */}
      <table className="w-full bg-white border border-gray-300 rounded-lg text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">
              <input type="checkbox" checked={selectAllChapters} onChange={onSelectAllChapters} />
            </th>
            <th className="px-4 py-2 text-left">Chapter Name</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {chapters.map((chapter) => {
            const isSelected = selectedChapters.includes(chapter._id);
            const isCurrentSelectedChapter = activeChapter === chapter._id;

            // Define row and button styles
            let rowClass = "";
            if (isCurrentSelectedChapter) {
              rowClass = "bg-green-200"; // Green for clicked chapter
            } else if (isSelected) {
              rowClass = "bg-blue-100"; // Blue for bulk-selected chapters
            }

            const chapterButtonClass = isCurrentSelectedChapter
              ? "flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-md"
              : "flex items-center gap-2 px-3 py-1 bg-gray-500 text-white rounded-md";

            return (
              <tr key={chapter._id} className={`hover:bg-gray-50 ${rowClass}`}>
                <td className="px-4 py-2 border">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelectChapter(chapter._id)}
                  />
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => {
                      setActiveChapter(chapter._id);
                      onChapterSelected(chapter);
                    }}
                    className={chapterButtonClass}
                  >
                    <FaCalendarAlt />
                    {chapter.name}
                  </button>
                </td>
                <td className="px-4 py-2 border flex flex-wrap justify-center gap-2">
                  {/* Individual chapter actions */}
                  <button
                    onClick={() => {
                      setActiveChapter(chapter._id);
                      setActionType("clearDay");
                      setShowConfirmation(true);
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
                      setShowConfirmation(true);
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
                      setShowConfirmation(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-md"
                  >
                    <FaCheck />
                    Enable Day
                  </button>
                  <button
                    onClick={() => {
                      setActiveChapter(chapter._id);
                      setActionType("clearAll");
                      setShowConfirmation(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md"
                  >
                    <FaTrashAlt />
                    Clear All
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <h4 className="text-lg font-bold mb-4">
              Confirm{" "}
              {actionType === "clearDay"
                ? "Clearing Slots"
                : actionType === "disableDay"
                ? "Disabling Slots"
                : actionType === "enableDay"
                ? "Enabling Slots"
                : "Clearing All Slots"}{" "}
              for Selected Chapter
            </h4>
            {actionType !== "clearAll" && (
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                className="w-full border rounded-md px-3 py-2 mb-4"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select Date"
              />
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={resetState}
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className={`px-4 py-2 text-white rounded-md ${
                  loading ? "bg-gray-400" : "bg-green-500"
                }`}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterList;

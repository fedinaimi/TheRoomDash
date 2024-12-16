import React, { useState, useEffect } from "react";
import ChapterList from "../components/ChapterList";
import CalendarSelector from "../components/CalendarSelector";
import TimeSlotTable from "../components/TimeSlotTable";
import AddTimeSlotModal from "../components/Modals/AddTimeSlotModal";
import EditTimeSlotModal from "../components/Modals/EditTimeSlotModal";
import {
  getAllTimeSlotsByChapter,
  createTimeSlots,
  deleteTimeSlot,
  updateTimeSlot,
  toggleAvailability,
  disableTimeSlotsForDay,
  clearTimeSlotsForDay,
  clearAllTimeSlotsForChapter,
  enableTimeSlotsForDay,
} from "../services/timeSlotService";
import { getAllChapters } from "../services/chapterService";

const TimeSlotPage = () => {
  const [chapters, setChapters] = useState([]); // List of chapters
  const [selectedChapter, setSelectedChapter] = useState(null); // Currently selected chapter
  const [timeSlots, setTimeSlots] = useState([]); // Time slots for the selected chapter
  const [currentDate, setCurrentDate] = useState(new Date()); // Currently selected date
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null); // Slot being edited
  const [dateRange, setDateRange] = useState({ from: "", to: "" }); // Range for adding slots
  const [weekdayTime, setWeekdayTime] = useState({
    startTime: "",
    endTime: "",
  }); // Weekday times

  const [error, setError] = useState(null); // Error message
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch all chapters on load
  useEffect(() => {
    async function fetchChapters() {
      try {
        const chapters = await getAllChapters();
        setChapters(chapters);
      } catch (err) {
        setError("Failed to fetch chapters.");
      }
    }
    fetchChapters();
  }, []);

  // Fetch time slots for the selected chapter and date
  const fetchTimeSlots = async () => {
    if (!selectedChapter) {
      setError("Please select a chapter.");
      return;
    }
    setLoading(true);
    try {
      const date = currentDate.toISOString().split("T")[0];
      const slots = await getAllTimeSlotsByChapter(selectedChapter._id, date);
      if (slots.length === 0) {
        setError("No time slots available for the selected chapter and date.");
        setTimeSlots([]);
        return;
      }
      setTimeSlots(
        slots.map((slot) => ({
          ...slot,
          formattedDate: slot.date,
          formattedStartTime: new Date(slot.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          formattedEndTime: new Date(slot.endTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }))
      );
      setError(null);
    } catch (err) {
      console.error("Error fetching time slots:", err);
      setError("Failed to fetch time slots.");
    } finally {
      setLoading(false);
    }
  };

  // Clear time slots and set a new chapter
  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
    setTimeSlots([]); // Clear time slots immediately
    setError(null); // Clear previous errors
  };
  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      // Call the API to toggle the availability
      await toggleAvailability(id, !currentStatus); // Toggle the `isAvailable` status
      // Fetch updated time slots to refresh the table
      fetchTimeSlots();
    } catch (error) {
      console.error("Error toggling availability:", error);
      setError("Failed to toggle availability.");
    }
  };

  // Trigger time slot fetch when chapter or date changes
  useEffect(() => {
    if (selectedChapter) fetchTimeSlots();
  }, [selectedChapter, currentDate]);
  const handleClearAllSlots = async (chapterId) => {
    try {
      const result = await clearAllTimeSlotsForChapter(chapterId);
      alert(result.message);
      fetchTimeSlots(); // Refresh the time slots
    } catch (error) {
      console.error("Error clearing all slots:", error);
      setError("Failed to clear all slots for the chapter.");
    }
  };
  
  const handleClearDaySlots = async (chapterId, date) => {
    try {
      const result = await clearTimeSlotsForDay(chapterId, date);
      alert(result.message);
      fetchTimeSlots(); // Refresh the time slots
    } catch (error) {
      console.error("Error clearing day slots:", error);
      setError(`Failed to clear slots for ${date}.`);
    }
  };
  
  const handleDisableDaySlots = async (chapterId, date) => {
    try {
      const result = await disableTimeSlotsForDay(chapterId, date);
      alert(result.message);
      fetchTimeSlots(); // Refresh the time slots
    } catch (error) {
      console.error("Error disabling day slots:", error);
      setError(`Failed to disable slots for ${date}.`);
    }
  };
  const handleEnableDaySlots = async (chapterId, date) => {
    try {
      const result = await enableTimeSlotsForDay(chapterId, date);
      alert(result.message);
      fetchTimeSlots(); // Refresh time slots
    } catch (error) {
      console.error('Error enabling day slots:', error);
      setError(`Failed to enable slots for ${date}.`);
    }
  };
  
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Chapter Time Slot Management
      </h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <ChapterList
  chapters={chapters}
  setSelectedChapter={handleChapterSelect}
  onClearAllSlots={handleClearAllSlots}
  onClearDaySlots={handleClearDaySlots}
  onDisableDaySlots={handleDisableDaySlots}
  onEnableDaySlots={handleEnableDaySlots} // Pass the enable function
/>

      <CalendarSelector
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />

      {selectedChapter && (
        <>
          <h3 className="text-xl font-bold mt-6 mb-4">
            Time Slots for {selectedChapter.name}
          </h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-md mb-4"
          >
            Add Time Slots
          </button>

          {loading ? (
            <div>Loading...</div>
          ) : timeSlots.length === 0 ? (
            <div>
              No time slots available for the selected chapter and date.
            </div>
          ) : (
            <TimeSlotTable
              timeSlots={timeSlots}
              onEdit={(slot) => {
                setEditingSlot(slot); // Set the slot being edited
                setIsEditModalOpen(true); // Open the edit modal
              }}
              onDelete={async (id) => {
                await deleteTimeSlot(id);
                fetchTimeSlots();
              }}
              onToggleAvailability={async (id, status) => {
                await toggleAvailability(id, !status);
                fetchTimeSlots();
              }}
            />
          )}

          <AddTimeSlotModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            dateRange={dateRange}
            setDateRange={setDateRange}
            weekdayTime={weekdayTime}
            setWeekdayTime={setWeekdayTime}
            onSave={async () => {
              await createTimeSlots(
                selectedChapter._id,
                dateRange,
                weekdayTime,
              );
              fetchTimeSlots();
              setIsAddModalOpen(false);
            }}
          />
          <EditTimeSlotModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            editingSlot={editingSlot} // Pass the selected slot data
            onSave={async (updatedSlot) => {
              await updateTimeSlot(updatedSlot._id, updatedSlot); // Save changes to the backend
              fetchTimeSlots(); // Refresh the time slots
              setIsEditModalOpen(false); // Close the modal
            }}
          />
        </>
      )}
    </div>
  );
};

export default TimeSlotPage;

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
  const [chapters, setChapters] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectAllChapters, setSelectAllChapters] = useState(false);

  const [selectedChapter, setSelectedChapter] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [weekdayTime, setWeekdayTime] = useState({
    startTime: "",
    endTime: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Time slot selection
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectAllSlots, setSelectAllSlots] = useState(false);

  // Fetch chapters on load
  useEffect(() => {
    async function fetchChapters() {
      try {
        const chapterList = await getAllChapters();
        setChapters(chapterList);
      } catch (err) {
        setError("Failed to fetch chapters.");
      }
    }
    fetchChapters();
  }, []);

  // Fetch time slots for selected chapter and date
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
      setSelectedSlots([]);
      setSelectAllSlots(false);
    }
  };

  useEffect(() => {
    if (selectedChapter) fetchTimeSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChapter, currentDate]);

  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
    setTimeSlots([]);
    setError(null);
    setSelectedSlots([]);
    setSelectAllSlots(false);
  };

  // Chapter selection logic for bulk actions
  const handleSelectChapter = (chapterId) => {
    setSelectedChapters((prev) =>
      prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]
    );
  };

  const handleSelectAllChapters = () => {
    setSelectAllChapters(!selectAllChapters);
    if (!selectAllChapters) {
      const allIds = chapters.map((c) => c._id);
      setSelectedChapters(allIds);
    } else {
      setSelectedChapters([]);
    }
  };

  // Time slot selection logic
  const handleSelectSlot = (id) => {
    setSelectedSlots((prev) =>
      prev.includes(id) ? prev.filter((slotId) => slotId !== id) : [...prev, id]
    );
  };

  const handleSelectAllSlots = () => {
    setSelectAllSlots(!selectAllSlots);
    if (!selectAllSlots) {
      const allIds = timeSlots.map((slot) => slot._id);
      setSelectedSlots(allIds);
    } else {
      setSelectedSlots([]);
    }
  };

  // Chapter Bulk Actions
  const handleClearAllSlotsForSelectedChapters = async () => {
    for (const chapterId of selectedChapters) {
      await clearAllTimeSlotsForChapter(chapterId);
    }
    if (selectedChapter) fetchTimeSlots();
    alert("Cleared all slots for selected chapters.");
  };

  const handleClearDaySlotsForSelectedChapters = async (date) => {
    for (const chapterId of selectedChapters) {
      await clearTimeSlotsForDay(chapterId, date);
    }
    if (selectedChapter) fetchTimeSlots();
    alert(`Cleared day slots for ${date} for selected chapters.`);
  };

  const handleDisableDaySlotsForSelectedChapters = async (date) => {
    for (const chapterId of selectedChapters) {
      await disableTimeSlotsForDay(chapterId, date);
    }
    if (selectedChapter) fetchTimeSlots();
    alert(`Disabled day slots for ${date} for selected chapters.`);
  };

  const handleEnableDaySlotsForSelectedChapters = async (date) => {
    for (const chapterId of selectedChapters) {
      await enableTimeSlotsForDay(chapterId, date);
    }
    if (selectedChapter) fetchTimeSlots();
    alert(`Enabled day slots for ${date} for selected chapters.`);
  };

  // Time slot bulk actions
  const handleBulkDeleteSlots = async () => {
    for (const id of selectedSlots) {
      await deleteTimeSlot(id);
    }
    fetchTimeSlots();
    alert("Deleted selected time slots.");
  };

  const handleBulkToggleAvailability = async () => {
    for (const id of selectedSlots) {
      const slot = timeSlots.find((t) => t._id === id);
      await toggleAvailability(id, slot ? !slot.isAvailable : false);
    }
    fetchTimeSlots();
    alert("Toggled availability for selected time slots.");
  };

  const handleBulkDisableSlots = async () => {
    for (const id of selectedSlots) {
      const slot = timeSlots.find((t) => t._id === id);
      if (slot && slot.isAvailable) {
        await toggleAvailability(id, false);
      }
    }
    fetchTimeSlots();
    alert("Disabled selected time slots.");
  };

  const handleBulkEnableSlots = async () => {
    for (const id of selectedSlots) {
      const slot = timeSlots.find((t) => t._id === id);
      if (slot && !slot.isAvailable) {
        await toggleAvailability(id, true);
      }
    }
    fetchTimeSlots();
    alert("Enabled selected time slots.");
  };

  // Bulk Add Time Slots to Selected Chapters
  const handleBulkAddTimeSlotsToChapters = async () => {
    // Add the same time slots to all selected chapters
    for (const chapterId of selectedChapters) {
      await createTimeSlots(chapterId, dateRange, weekdayTime);
    }
    if (selectedChapter) fetchTimeSlots();
    alert("Added time slots to selected chapters.");
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Chapter Time Slot Management</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <ChapterList
        chapters={chapters}
        onChapterSelected={handleChapterSelect}
        selectedChapters={selectedChapters}
        onSelectChapter={handleSelectChapter}
        selectAllChapters={selectAllChapters}
        onSelectAllChapters={handleSelectAllChapters}
        onClearAllSlots={handleClearAllSlotsForSelectedChapters}
        onClearDaySlots={handleClearDaySlotsForSelectedChapters}
        onDisableDaySlots={handleDisableDaySlotsForSelectedChapters}
        onEnableDaySlots={handleEnableDaySlotsForSelectedChapters}
        onBulkAdd={() => setIsAddModalOpen(true)} // Open modal to add to all selected chapters
      />

      <CalendarSelector currentDate={currentDate} setCurrentDate={setCurrentDate} />

      {selectedChapters.length > 0 && (
        <div className="mb-4 flex space-x-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-md"
          >
            Add Time Slots to Selected Chapters
          </button>
        </div>
      )}

      {selectedChapter && (
        <>
          <h3 className="text-xl font-bold mt-6 mb-4">Time Slots for {selectedChapter.name}</h3>
          <div className="mb-4 flex space-x-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-md"
            >
              Add Time Slots
            </button>
            {selectedSlots.length > 0 && (
              <>
                <button
                  onClick={handleBulkDeleteSlots}
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  Delete Selected
                </button>
                <button
                  onClick={handleBulkToggleAvailability}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Toggle Availability (Selected)
                </button>
                <button
                  onClick={handleBulkDisableSlots}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md"
                >
                  Disable Selected
                </button>
                <button
                  onClick={handleBulkEnableSlots}
                  className="px-4 py-2 bg-green-500 text-white rounded-md"
                >
                  Enable Selected
                </button>
              </>
            )}
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : timeSlots.length === 0 ? (
            <div>No time slots available for the selected chapter and date.</div>
          ) : (
            <TimeSlotTable
              timeSlots={timeSlots}
              onEdit={(slot) => {
                setEditingSlot(slot);
                setIsEditModalOpen(true);
              }}
              onDelete={async (id) => {
                await deleteTimeSlot(id);
                fetchTimeSlots();
              }}
              onToggleAvailability={async (id, status) => {
                await toggleAvailability(id, !status);
                fetchTimeSlots();
              }}
              selectedSlots={selectedSlots}
              onSelectSlot={handleSelectSlot}
              selectAllSlots={selectAllSlots}
              onSelectAllSlots={handleSelectAllSlots}
            />
          )}
        </>
      )}

      {/* AddModal can serve both single and multi-chapter addition */}
      <AddTimeSlotModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        dateRange={dateRange}
        setDateRange={setDateRange}
        weekdayTime={weekdayTime}
        setWeekdayTime={setWeekdayTime}
        onSave={async () => {
          if (selectedChapters.length > 0) {
            // Bulk add to selected chapters
            await handleBulkAddTimeSlotsToChapters();
          } else if (selectedChapter) {
            // Add to current selected chapter
            await createTimeSlots(selectedChapter._id, dateRange, weekdayTime);
            fetchTimeSlots();
          }
          setIsAddModalOpen(false);
        }}
      />
      <EditTimeSlotModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editingSlot={editingSlot}
        onSave={async (updatedSlot) => {
          await updateTimeSlot(updatedSlot._id, updatedSlot);
          fetchTimeSlots();
          setIsEditModalOpen(false);
        }}
      />
    </div>
  );
};

export default TimeSlotPage;

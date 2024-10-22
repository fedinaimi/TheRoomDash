import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar'; // React Calendar library
import { getTimeSlotsWithAvailability } from '../services/timeSlotService'; // API call to fetch time slots with availability
import 'react-calendar/dist/Calendar.css';

const TimeSlotCalendar = ({ scenarioId }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch time slots for the selected date range when the component loads
    fetchTimeSlots(selectedDate);
  }, [selectedDate]);

  const fetchTimeSlots = async (date) => {
    setLoading(true);
    setError(null);

    try {
      const from = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const to = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const timeSlotsData = await getTimeSlotsWithAvailability(scenarioId, from, to);
      setTimeSlots(timeSlotsData);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setError('Failed to fetch time slots');
    } finally {
      setLoading(false);
    }
  };

  // Group the time slots by date to show in the calendar
  const groupTimeSlotsByDate = () => {
    const groupedSlots = {};
    timeSlots.forEach(slot => {
      if (!groupedSlots[slot.date]) {
        groupedSlots[slot.date] = [];
      }
      groupedSlots[slot.date].push(slot);
    });
    return groupedSlots;
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const renderTileContent = ({ date }) => {
    const day = date.toISOString().split('T')[0];
    const slots = groupTimeSlotsByDate()[day] || [];

    return (
      <ul>
        {slots.map((slot, index) => (
          <li key={index} className={`slot-item ${slot.isAvailable ? 'available' : 'reserved'}`}>
            {slot.startTime} - {slot.endTime} ({slot.isAvailable ? 'Available' : 'Reserved'})
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Time Slot Calendar</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={renderTileContent}
          minDetail="month"
        />
      )}
    </div>
  );
};

export default TimeSlotCalendar;

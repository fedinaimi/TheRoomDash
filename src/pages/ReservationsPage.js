import React, { useState, useEffect } from 'react';
import {
  getAllReservations,
  updateReservationStatus,
  deleteReservation,
} from '../services/reservationService';
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const data = await getAllReservations();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateReservationStatus(id, status);
      fetchReservations(); // Refresh after status update
    } catch (error) {
      console.error('Error updating reservation status:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReservation(id);
      fetchReservations(); // Refresh after deletion
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Reservations</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Phone</th>
              <th className="px-4 py-2 border">Scenario</th>
              <th className="px-4 py-2 border">Chapter</th>
              <th className="px-4 py-2 border">Time Slot</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation._id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border">{reservation.name}</td>
                <td className="px-4 py-2 border">{reservation.email}</td>
                <td className="px-4 py-2 border">{reservation.phone}</td>
                <td className="px-4 py-2 border">{reservation.scenario?.name || 'N/A'}</td>
                <td className="px-4 py-2 border">{reservation.chapter?.name || 'N/A'}</td>
                <td className="px-4 py-2 border">
                  {reservation.timeSlot
                    ? `${reservation.timeSlot.startTime} - ${reservation.timeSlot.endTime}`
                    : 'No time slot'}
                </td>
                <td className="px-4 py-2 border">{reservation.status}</td>
                <td className="px-4 py-2 border flex space-x-2">
                  <button
                    onClick={() => handleUpdateStatus(reservation._id, 'approved')}
                    className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600"
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(reservation._id, 'declined')}
                    className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600"
                  >
                    <FaTimes />
                  </button>
                  <button
                    onClick={() => handleDelete(reservation._id)}
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
    </div>
  );
};

export default ReservationsPage;

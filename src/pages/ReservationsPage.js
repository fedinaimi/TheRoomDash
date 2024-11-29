import React, { useState, useEffect } from 'react';
import {
  getAllReservations,
  updateReservationStatus,
  deleteReservation,
} from '../services/reservationService';
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns'; // Import date-fns for formatting
import LoaderButton from '../components/LoaderButton'; // Import LoaderButton component

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState({}); // Track loading state for each button
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [reservationsPerPage] = useState(10); // Number of reservations per page
  const [searchQuery, setSearchQuery] = useState(''); // Search query
  const [statusFilter, setStatusFilter] = useState(''); // Status filter

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const data = await getAllReservations();
      // Sort reservations by creation date (descending)
      const sortedReservations = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Reverse the sorted array to ensure the last reservation is shown first
      const reversedReservations = sortedReservations.reverse();
      
      setReservations(reversedReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const formatTime = (isoString) => {
    try {
      return format(new Date(isoString), 'h:mm a'); // Format as "2:00 PM"
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setLoading((prev) => ({ ...prev, [id]: true })); // Set loading for this reservation
    try {
      await updateReservationStatus(id, status);
      fetchReservations(); // Refresh after status update
    } catch (error) {
      console.error('Error updating reservation status:', error);
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false })); // Clear loading state
    }
  };

  const handleDelete = async (id) => {
    setLoading((prev) => ({ ...prev, [id]: true })); // Set loading for this reservation
    try {
      await deleteReservation(id);
      fetchReservations(); // Refresh after deletion
    } catch (error) {
      console.error('Error deleting reservation:', error);
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false })); // Clear loading state
    }
  };

  // Filter reservations based on search query and status filter
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearchQuery =
      reservation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatusFilter = statusFilter
      ? reservation.status.toLowerCase() === statusFilter.toLowerCase()
      : true;

    return matchesSearchQuery && matchesStatusFilter;
  });

  // Pagination logic
  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = filteredReservations.slice(indexOfFirstReservation, indexOfLastReservation);

  const totalPages = Math.ceil(filteredReservations.length / reservationsPerPage);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Reservations</h1>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Status Filter */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="declined">Declined</option>
        </select>
      </div>

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
            {currentReservations.map((reservation) => (
              <tr key={reservation._id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border">{reservation.name}</td>
                <td className="px-4 py-2 border">{reservation.email}</td>
                <td className="px-4 py-2 border">{reservation.phone}</td>
                <td className="px-4 py-2 border">{reservation.scenario?.name || 'N/A'}</td>
                <td className="px-4 py-2 border">{reservation.chapter?.name || 'N/A'}</td>
                <td className="px-4 py-2 border">
                  {reservation.timeSlot
                    ? `${formatTime(reservation.timeSlot.startTime)} - ${formatTime(
                        reservation.timeSlot.endTime
                      )}`
                    : 'No time slot'}
                </td>
                <td className="px-4 py-2 border">{reservation.status}</td>
                <td className="px-4 py-2 border flex space-x-2">
                  {/* Approve Button */}
                  <LoaderButton
                    onClick={() => handleUpdateStatus(reservation._id, 'approved')}
                    isLoading={loading[reservation._id]}
                    className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600"
                  >
                    <FaCheck />
                  </LoaderButton>
                  {/* Decline Button */}
                  <LoaderButton
                    onClick={() => handleUpdateStatus(reservation._id, 'declined')}
                    isLoading={loading[reservation._id]}
                    className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600"
                  >
                    <FaTimes />
                  </LoaderButton>
                  {/* Delete Button */}
                  <LoaderButton
                    onClick={() => handleDelete(reservation._id)}
                    isLoading={loading[reservation._id]}
                    className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                  >
                    <FaTrash />
                  </LoaderButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded-md disabled:bg-gray-400"
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 rounded-md disabled:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ReservationsPage;

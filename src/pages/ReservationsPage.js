import React, { useState, useEffect } from "react";
import {
  getAllReservations,
  updateReservationStatus,
  deleteReservation,
} from "../services/reservationService";
import { FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import { format } from "date-fns"; // For date formatting
import LoaderButton from "../components/LoaderButton"; // Reusable button with loading indicator

const ReservationsPage = () => {
  const [data, setData] = useState({
    reservations: [],
    approvedReservations: [],
    declinedReservations: [],
  });
  const [currentTable, setCurrentTable] = useState("reservations"); // Current displayed table
  const [loading, setLoading] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [reservationsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [scenarioFilter, setScenarioFilter] = useState("");

  useEffect(() => {
    fetchAllReservations();
  }, [dateFilter]);

  const fetchAllReservations = async () => {
    try {
      const fetchedData = await getAllReservations();
      setData(fetchedData);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const formatTime = (isoString) => {
    try {
      return format(new Date(isoString), "yyyy-MM-dd HH:mm:ss");
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid time";
    }
  };

  const handleUpdateStatus = async (reservationId, status, source) => {
    setLoading((prev) => ({ ...prev, [reservationId]: true }));
    try {
      await updateReservationStatus(source, reservationId, status); // Pass source and status
      fetchAllReservations(); // Refresh reservations after status update
    } catch (error) {
      console.error("Error updating reservation status:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [reservationId]: false }));
    }
  };

  const handleDelete = async (reservationId, source) => {
    setLoading((prev) => ({ ...prev, [reservationId]: true }));
    try {
      await deleteReservation(source, reservationId); // Pass source and ID
      fetchAllReservations(); // Refresh data
    } catch (error) {
      console.error("Error deleting reservation:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [reservationId]: false }));
    }
  };

  // Filter reservations for the currently selected table
  const filteredReservations =
    data[currentTable]?.filter((reservation) => {
      const matchesSearchQuery =
        reservation.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDateFilter = dateFilter
        ? reservation.timeSlot?.date === dateFilter
        : true;
      const matchesScenarioFilter = scenarioFilter
        ? reservation.scenario?.name?.toLowerCase() ===
          scenarioFilter.toLowerCase()
        : true;

      return matchesSearchQuery && matchesDateFilter && matchesScenarioFilter;
    }) || [];

  // Pagination logic
  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = filteredReservations.slice(
    indexOfFirstReservation,
    indexOfLastReservation
  );
  const totalPages = Math.ceil(
    filteredReservations.length / reservationsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Reservations</h1>

      {/* Filter Buttons for Table Selection */}
      <div className="mb-6 flex space-x-4">
        {["reservations", "approvedReservations", "declinedReservations"].map(
          (table) => (
            <button
              key={table}
              onClick={() => {
                setCurrentTable(table);
                setCurrentPage(1); // Reset to the first page
              }}
              className={`px-4 py-2 rounded-md ${
                currentTable === table
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {table === "reservations"
                ? "Pending Reservations"
                : table === "approvedReservations"
                ? "Approved Reservations"
                : "Declined Reservations"}
            </button>
          )
        )}
      </div>

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

      {/* Scenario Filter */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by scenario"
          value={scenarioFilter}
          onChange={(e) => setScenarioFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Date Filter for Time Slot Date */}
      <div className="mb-4">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
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
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentReservations.map((reservation) => (
              <tr key={reservation._id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border">{reservation.name}</td>
                <td className="px-4 py-2 border">{reservation.email}</td>
                <td className="px-4 py-2 border">{reservation.phone}</td>
                <td className="px-4 py-2 border">
                  {reservation.scenario?.name || "N/A"}
                </td>
                <td className="px-4 py-2 border">
                  {reservation.chapter?.name || "N/A"}
                </td>
                <td className="px-4 py-2 border">
                  {reservation.timeSlot
                    ? `${formatTime(
                        reservation.timeSlot.startTime
                      )} - ${formatTime(reservation.timeSlot.endTime)}`
                    : "No time slot"}
                </td>
                <td className="px-4 py-2 border flex space-x-2">
                  {currentTable === "reservations" && (
                    <>
                      <LoaderButton
                        onClick={() =>
                          handleUpdateStatus(
                            reservation._id,
                            "approved",
                            currentTable
                          )
                        }
                        isLoading={loading[reservation._id]}
                        className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600"
                      >
                        <FaCheck />
                      </LoaderButton>
                      <LoaderButton
                        onClick={() =>
                          handleUpdateStatus(
                            reservation._id,
                            "declined",
                            currentTable
                          )
                        }
                        isLoading={loading[reservation._id]}
                        className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600"
                      >
                        <FaTimes />
                      </LoaderButton>
                    </>
                  )}
                  {currentTable === "approvedReservations" && (
                    <LoaderButton
                      onClick={() =>
                        handleUpdateStatus(
                          reservation._id,
                          "declined",
                          currentTable
                        )
                      }
                      isLoading={loading[reservation._id]}
                      className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600"
                    >
                      <FaTimes />
                    </LoaderButton>
                  )}
                  {currentTable === "declinedReservations" && (
                    <LoaderButton
                      onClick={() =>
                        handleUpdateStatus(
                          reservation._id,
                          "approved",
                          currentTable
                        )
                      }
                      isLoading={loading[reservation._id]}
                      className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600"
                    >
                      <FaCheck />
                    </LoaderButton>
                  )}
                  <LoaderButton
                    onClick={() => handleDelete(reservation._id, currentTable)} // Pass source (currentTable)
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

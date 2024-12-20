import React, { useState, useEffect } from "react";
import {
  getAllReservations,
  updateReservationStatus,
  deleteReservation,
} from "../services/reservationService";
import { fetchProfile } from "../services/userService"; // Service to fetch current user
import { FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import LoaderButton from "../components/LoaderButton"; // Reusable button with loading indicator

const ReservationsPage = () => {
  const [data, setData] = useState({
    reservations: [],
    approvedReservations: [],
    declinedReservations: [],
    deletedReservations: [],
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [currentTable, setCurrentTable] = useState("reservations");
  const [loading, setLoading] = useState({});
  const [popupLoading, setPopupLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reservationsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [scenarioFilter, setScenarioFilter] = useState("");

  const [selectedReservations, setSelectedReservations] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const user = await fetchProfile();
        setCurrentUser(user);
        await fetchAllReservations();
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchUserAndData();
  }, [dateFilter]);

  const fetchAllReservations = async () => {
    try {
      const fetchedData = await getAllReservations();
      setData(fetchedData);
      setSelectedReservations([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const toLocalTimeString = (isoString) => {
    try {
      return new Date(isoString).toLocaleString(); // local time
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid time";
    }
  };

  const handleUpdateStatus = async (reservationId, status, source) => {
    setLoading((prev) => ({ ...prev, [reservationId]: true }));
    try {
      await updateReservationStatus(source, reservationId, status);
      await fetchAllReservations();
    } catch (error) {
      console.error("Error updating reservation status:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [reservationId]: false }));
    }
  };

  const handleDelete = async (reservationId, source) => {
    setLoading((prev) => ({ ...prev, [reservationId]: true }));
    try {
      await deleteReservation(source, reservationId);
      await fetchAllReservations();
    } catch (error) {
      console.error("Error deleting reservation:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [reservationId]: false }));
    }
  };

  const confirmAction = (actionType, payload) => {
    setConfirmation({
      actionType,
      payload,
    });
  };

  const executeConfirmationAction = async () => {
    const { actionType, payload } = confirmation;
    setPopupLoading(true);

    try {
      if (actionType === "updateStatus") {
        await handleUpdateStatus(payload._id, payload.status, currentTable);
      } else if (actionType === "delete") {
        await handleDelete(payload._id, currentTable);
      } else if (actionType === "bulkAction") {
        const { status, deleteAction, reservations } = payload;
        for (const r of reservations) {
          if (deleteAction) {
            await handleDelete(r._id, currentTable);
          } else {
            await handleUpdateStatus(r._id, status, currentTable);
          }
        }
      }
      setConfirmation(null);
      setSelectedReservations([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error executing action:", error);
    } finally {
      setPopupLoading(false);
    }
  };

  const cancelConfirmationAction = () => {
    setConfirmation(null);
  };

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

  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = filteredReservations.slice(
    indexOfFirstReservation,
    indexOfLastReservation
  );
  const totalPages = Math.ceil(filteredReservations.length / reservationsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedReservations([]);
    setSelectAll(false);
  };

  const role = currentUser?.usertype === "subadmin" ? "subadmin" : "admin";

  const canBulkAction =
    role === "admin" &&
    currentTable !== "deletedReservations" &&
    filteredReservations.length > 0;

  const canActOnIndividual =
    (role === "admin" && currentTable !== "deletedReservations") ||
    (role === "subadmin" && currentTable === "reservations");

  const handleSelectReservation = (id) => {
    setSelectedReservations((prev) =>
      prev.includes(id) ? prev.filter((resId) => resId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      const allOnPage = currentReservations.map((r) => r._id);
      setSelectedReservations(allOnPage);
    } else {
      setSelectedReservations([]);
    }
  };

  const getBulkReservations = () => {
    if (selectedReservations.length > 0) {
      return filteredReservations.filter((r) =>
        selectedReservations.includes(r._id)
      );
    } else {
      return filteredReservations;
    }
  };

  const handleBulkAction = (action) => {
    const reservations = getBulkReservations();
    if (reservations.length === 0) return;
    if (action === "delete") {
      confirmAction("bulkAction", { deleteAction: true, reservations });
    } else {
      const status = action === "approve" ? "approved" : "declined";
      confirmAction("bulkAction", { status, reservations });
    }
  };

  // CSV Export Logic
  const exportToCSV = (reservations, filename) => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Players",
      "Scenario",
      "Chapter",
      "Time Slot Start",
      "Time Slot End",
      "Status",
    ];
    const rows = reservations.map((r) => [
      r.name,
      r.email,
      r.phone,
      r.people,
      r.scenario?.name || "",
      r.chapter?.name || "",
      r.timeSlot ? new Date(r.timeSlot.startTime).toLocaleString() : "",
      r.timeSlot ? new Date(r.timeSlot.endTime).toLocaleString() : "",
      r.status || "",
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper functions to get date ranges
  const getTodayFilter = () => {
    const today = new Date().toISOString().split("T")[0];
    return filteredReservations.filter((r) => r.timeSlot?.date === today);
  };

  const getWeekFilter = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
    startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return filteredReservations.filter((r) => {
      const startTime = r.timeSlot ? new Date(r.timeSlot.startTime) : null;
      return (
        startTime &&
        startTime >= startOfWeek &&
        startTime < endOfWeek
      );
    });
  };

  const getMonthFilter = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return filteredReservations.filter((r) => {
      const startTime = r.timeSlot ? new Date(r.timeSlot.startTime) : null;
      return startTime && startTime >= startOfMonth && startTime < endOfMonth;
    });
  };

  // Color Coding Reservations by Status
  const getRowColorClass = (reservation) => {
    // Example logic:
    // approved = light green background
    // declined = light gray background
    // pending (reservations table) = white
    if (currentTable === "approvedReservations") return "bg-green-100";
    if (currentTable === "declinedReservations") return "bg-gray-100";
    // default white for others
    return "";
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Reservations</h1>

      {/* Table Selection Buttons */}
      <div className="mb-6 flex space-x-4">
        {["reservations", "approvedReservations", "declinedReservations", "deletedReservations"].map(
          (table) => (
            <button
              key={table}
              onClick={() => {
                setCurrentTable(table);
                setCurrentPage(1);
                setSelectedReservations([]);
                setSelectAll(false);
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
                : table === "declinedReservations"
                ? "Declined Reservations"
                : "Deleted Reservations"}
            </button>
          )
        )}
      </div>

      {/* Filters */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          placeholder="Filter by scenario"
          value={scenarioFilter}
          onChange={(e) => setScenarioFilter(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
        />
      </div>

      {/* Export Buttons */}
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => exportToCSV(getTodayFilter(), "reservations_today.csv")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Export Today's Reservations (CSV)
        </button>
        <button
          onClick={() => exportToCSV(getWeekFilter(), "reservations_week.csv")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Export This Week (CSV)
        </button>
        <button
          onClick={() => exportToCSV(getMonthFilter(), "reservations_month.csv")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Export This Month (CSV)
        </button>
      </div>

      {/* Bulk Actions for Admin */}
      {canBulkAction && (
        <div className="mb-4 flex space-x-4">
          <button
            onClick={() => handleBulkAction("approve")}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Approve {selectedReservations.length > 0 ? "Selected" : "All"}
          </button>
          <button
            onClick={() => handleBulkAction("decline")}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Decline {selectedReservations.length > 0 ? "Selected" : "All"}
          </button>
          <button
            onClick={() => handleBulkAction("delete")}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete {selectedReservations.length > 0 ? "Selected" : "All"}
          </button>
        </div>
      )}

      {/* Reservations Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              {canBulkAction && (
                <th className="px-4 py-2 border">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Phone</th>
              <th className="px-4 py-2 border">Players</th>
              <th className="px-4 py-2 border">Scenario</th>
              <th className="px-4 py-2 border">Chapter</th>
              <th className="px-4 py-2 border">Time Slot</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentReservations.map((reservation) => {
              const isSelected = selectedReservations.includes(reservation._id);
              const rowColorClass = getRowColorClass(reservation);
              return (
                <tr
                  key={reservation._id}
                  className={`hover:bg-gray-100 ${rowColorClass}`}
                >
                  {canBulkAction && (
                    <td className="px-4 py-2 border">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectReservation(reservation._id)}
                      />
                    </td>
                  )}
                  <td className="px-4 py-2 border">{reservation.name}</td>
                  <td className="px-4 py-2 border">{reservation.email}</td>
                  <td className="px-4 py-2 border">{reservation.phone}</td>
                  <td className="px-4 py-2 border">{reservation.people}</td>
                  <td className="px-4 py-2 border">
                    {reservation.scenario?.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">
                    {reservation.chapter?.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">
                    {reservation.timeSlot
                      ? `${toLocalTimeString(
                          reservation.timeSlot.startTime
                        )} - ${toLocalTimeString(reservation.timeSlot.endTime)}`
                      : "No time slot"}
                  </td>
                  <td className="px-4 py-2 border flex space-x-2">
                    {canActOnIndividual ? (
                      <>
                        {currentTable !== "deletedReservations" && (
                          <LoaderButton
                            onClick={() =>
                              confirmAction("updateStatus", {
                                ...reservation,
                                status:
                                  currentTable === "approvedReservations"
                                    ? "declined"
                                    : "approved",
                              })
                            }
                            isLoading={loading[reservation._id]}
                            className={`px-2 py-1 rounded-md ${
                              currentTable === "approvedReservations"
                                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                          >
                            {currentTable === "approvedReservations" ? (
                              <FaTimes />
                            ) : (
                              <FaCheck />
                            )}
                          </LoaderButton>
                        )}

                        {role === "admin" &&
                          currentTable !== "deletedReservations" && (
                            <LoaderButton
                              onClick={() => confirmAction("delete", reservation)}
                              isLoading={loading[reservation._id]}
                              className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                            >
                              <FaTrash />
                            </LoaderButton>
                          )}
                      </>
                    ) : (
                      <span className="text-gray-500">No actions</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

      {/* Confirmation Modal */}
      {confirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            {confirmation.actionType === "delete" && (
              <>
                <h4 className="text-lg font-bold mb-4">
                  Are you sure you want to delete this reservation?
                </h4>
                <ReservationDetails
                  reservation={confirmation.payload}
                  toLocalTimeString={toLocalTimeString}
                />
              </>
            )}

            {confirmation.actionType === "updateStatus" && (
              <>
                <h4 className="text-lg font-bold mb-4">
                  Are you sure you want to{" "}
                  {confirmation.payload.status === "approved"
                    ? "approve"
                    : "decline"}{" "}
                  this reservation?
                </h4>
                <ReservationDetails
                  reservation={confirmation.payload}
                  toLocalTimeString={toLocalTimeString}
                />
              </>
            )}

            {confirmation.actionType === "bulkAction" && (
              <>
                <h4 className="text-lg font-bold mb-4">
                  Are you sure you want to{" "}
                  {confirmation.payload.deleteAction
                    ? "delete"
                    : confirmation.payload.status === "approved"
                    ? "approve"
                    : "decline"}{" "}
                  {confirmation.payload.reservations.length} reservation(s)?
                </h4>
                <p className="mb-4">This action cannot be undone.</p>
              </>
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={cancelConfirmationAction}
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
              >
                Cancel
              </button>
              <LoaderButton
                onClick={executeConfirmationAction}
                isLoading={popupLoading}
                className="px-4 py-2 bg-green-500 text-white rounded-md"
              >
                Confirm
              </LoaderButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ReservationDetails = ({ reservation, toLocalTimeString }) => (
  <div className="mb-4">
    <p>
      <strong>Name:</strong> {reservation.name}
    </p>
    <p>
      <strong>Email:</strong> {reservation.email}
    </p>
    <p>
      <strong>Phone:</strong> {reservation.phone}
    </p>
    <p>
      <strong>Scenario:</strong> {reservation.scenario?.name || "N/A"}
    </p>
    <p>
      <strong>Chapter:</strong> {reservation.chapter?.name || "N/A"}
    </p>
    <p>
      <strong>Time Slot:</strong>{" "}
      {reservation.timeSlot
        ? `${toLocalTimeString(reservation.timeSlot.startTime)} - ${toLocalTimeString(
            reservation.timeSlot.endTime
          )}`
        : "No time slot"}
    </p>
  </div>
);

export default ReservationsPage;

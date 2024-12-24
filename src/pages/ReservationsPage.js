// src/components/ReservationsPage.js

import React, { useState, useEffect } from "react";
import {
  getAllReservations,
  updateReservationStatus,
  deleteReservation,
  fetchChapters,
  fetchTimeSlots,
  createReservation,
} from "../services/reservationService";
import { fetchProfile } from "../services/userService"; // Service to fetch current user
import { FaCheck, FaTimes, FaTrash, FaPlus } from "react-icons/fa"; // Added FaPlus for Add Reservation button
import LoaderButton from "../components/LoaderButton"; // Reusable button with loading indicator
import { useParams } from "react-router-dom"; // Import useParams
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ReservationsPage = () => {
  const { id: reservationIdFromRoute } = useParams(); // Get reservation ID from route
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
  const [languageFilter, setLanguageFilter] = useState(""); // New Language Filter

  const [selectedReservations, setSelectedReservations] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [highlightedReservationId, setHighlightedReservationId] = useState(null);

  // States for Add Reservation Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [timeSlots, setTimeSlots] = useState({});
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+216",
    people: 1,
    language: "fr",
  });
  const [addFormErrors, setAddFormErrors] = useState({});
  const [addFormLoading, setAddFormLoading] = useState(false);
  const [addFormErrorMessage, setAddFormErrorMessage] = useState("");
  const [addFormSuccessMessage, setAddFormSuccessMessage] = useState(false);

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const user = await fetchProfile();
        setCurrentUser(user);
        await fetchAllReservations();
        await loadChapters(); // Fetch chapters on mount
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchUserAndData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (reservationIdFromRoute) {
      setHighlightedReservationId(reservationIdFromRoute);
      setCurrentTable("reservations"); // Ensure we're on the reservations table
      setCurrentPage(1); // Reset to first page
    }
  }, [reservationIdFromRoute]);

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
        ? new Date(reservation.timeSlot.startTime).toISOString().split("T")[0] === dateFilter
        : true;
      const matchesScenarioFilter = scenarioFilter
        ? reservation.scenario?.name?.toLowerCase().includes(
            scenarioFilter.toLowerCase()
          )
        : true;
      const matchesLanguageFilter = languageFilter
        ? reservation.language?.toUpperCase() === languageFilter.toUpperCase()
        : true;

      return (
        matchesSearchQuery &&
        matchesDateFilter &&
        matchesScenarioFilter &&
        matchesLanguageFilter
      );
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
  const exportToXLSX = (reservations, filename) => {
    // Define the headers
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Players",
      "Scenario",
      "Chapter",
      "Time Slot Start",
      "Time Slot End",
      "Language",
      "Status",
    ];
  
    // Map reservation data to rows
    const rows = reservations.map((r) => ({
      Name: r.name,
      Email: r.email,
      Phone: r.phone,
      Players: r.people,
      Scenario: r.scenario?.name || "",
      Chapter: r.chapter?.name || "",
      "Time Slot Start": r.timeSlot ? new Date(r.timeSlot.startTime).toLocaleString() : "",
      "Time Slot End": r.timeSlot ? new Date(r.timeSlot.endTime).toLocaleString() : "",
      Language: r.language ? r.language.toUpperCase() : "",
      Status: r.status || "",
    }));
  
    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  
    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reservations");
  
    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  
    // Create a blob from the buffer
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  
    // Trigger file download
    saveAs(data, filename);
  };
  

  // Helper functions to get date ranges
  const getTodayFilter = () => {
    const today = new Date().toISOString().split("T")[0];
    return filteredReservations.filter(
      (r) => new Date(r.timeSlot.startTime).toISOString().split("T")[0] === today
    );
  };

  const getWeekFilter = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return filteredReservations.filter((r) => {
      const startTime = r.timeSlot ? new Date(r.timeSlot.startTime) : null;
      return startTime && startTime >= startOfWeek && startTime < endOfWeek;
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
    if (currentTable === "approvedReservations") return "bg-green-100";
    if (currentTable === "declinedReservations") return "bg-gray-100";
    if (currentTable === "reservations")
      return reservation.status === "pending" ? "bg-white" : "";
    // Add more conditions as needed
    return "";
  };

  // Scroll to and highlight reservation if highlightedReservationId is present
  useEffect(() => {
    if (highlightedReservationId) {
      const reservationRow = document.getElementById(`reservation-${highlightedReservationId}`);
      if (reservationRow) {
        reservationRow.scrollIntoView({ behavior: "smooth", block: "center" });
        reservationRow.classList.add("bg-yellow-200"); // Highlight with yellow background
        setTimeout(() => {
          reservationRow.classList.remove("bg-yellow-200");
        }, 3000); // Remove highlight after 3 seconds
      }
    }
  }, [highlightedReservationId, currentReservations]);

  // Fetch chapters for Add Reservation
  const loadChapters = async () => {
    try {
      const fetchedChapters = await fetchChapters();
      setChapters(fetchedChapters);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    }
  };

  // Fetch time slots based on selected chapter and date
  const loadTimeSlotsForAddReservation = async (chapterId, date) => {
    try {
      const fetchedTimeSlots = await fetchTimeSlots(chapterId, date);
      setTimeSlots((prev) => ({
        ...prev,
        [chapterId]: fetchedTimeSlots.filter(slot => slot.status === "available"),
      }));
    } catch (error) {
      console.error("Error fetching time slots:", error);
      setTimeSlots((prev) => ({
        ...prev,
        [chapterId]: [],
      }));
    }
  };

  // Handle Add Reservation Form Input Changes
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "selectedTimeSlot") {
      setSelectedTimeSlot(value);
    } else if (name === "selectedChapter") {
      setSelectedChapter(value);
      setSelectedTimeSlot("");
      if (value && selectedDate) {
        loadTimeSlotsForAddReservation(value, selectedDate);
      }
    } else if (name === "selectedDate") {
      setSelectedDate(value);
      if (selectedChapter && value) {
        loadTimeSlotsForAddReservation(selectedChapter, value);
      }
    } else {
      setAddFormData({ ...addFormData, [name]: value });
    }
  };

  // Handle Add Reservation Form Submission
  const handleAddFormSubmit = async (e) => {
    e.preventDefault();
    setAddFormLoading(true);
    setAddFormErrors({});
    setAddFormErrorMessage("");
    setAddFormSuccessMessage(false);

    const validationErrors = validateAddForm();
    if (Object.keys(validationErrors).length > 0) {
      setAddFormErrors(validationErrors);
      setAddFormLoading(false);
      return;
    }

    try {
      const reservationData = {
        scenario: chapters.find(c => c._id === selectedChapter)?.scenario?._id || "",
        chapter: selectedChapter,
        timeSlot: selectedTimeSlot,
        name: addFormData.name,
        email: addFormData.email,
        phone: `${addFormData.countryCode}${addFormData.phone}`,
        people: addFormData.people,
        language: addFormData.language,
      };

      await createReservation(reservationData);
      setAddFormSuccessMessage(true);
      setTimeout(() => {
        setAddFormSuccessMessage(false);
      }, 3000);
      setIsAddModalOpen(false);
      await fetchAllReservations();
    } catch (error) {
      console.error("Error creating reservation:", error.message);
      setAddFormErrorMessage(error.message || "Error creating reservation.");
      setTimeout(() => {
        setAddFormErrorMessage("");
      }, 5000);
    } finally {
      setAddFormLoading(false);
    }
  };

  // Form validation
  const validateAddForm = () => {
    const newErrors = {};
    if (!addFormData.name.trim()) newErrors.name = "Name is required.";
    if (!addFormData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(addFormData.email)) {
      newErrors.email = "Invalid email address.";
    }
    if (!addFormData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d+$/.test(addFormData.phone)) {
      newErrors.phone = "Phone number must contain only digits.";
    }
    if (!selectedChapter) newErrors.selectedChapter = "Chapter is required.";
    if (!selectedTimeSlot) newErrors.selectedTimeSlot = "Time slot is required.";
    if (!addFormData.people || addFormData.people < 1)
      newErrors.people = "Number of people must be at least 1.";
    // Add more validations as needed
    return newErrors;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Reservations</h1>

      {/* Add Reservation Button (Visible only to Admins) */}
      {role === "admin" && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            <FaPlus className="mr-2" />
            Add Reservation
          </button>
        </div>
      )}

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
                setHighlightedReservationId(null); // Reset highlight
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
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          placeholder="Filter by scenario"
          value={scenarioFilter}
          onChange={(e) => setScenarioFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
        {/* New Language Filter */}
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Languages</option>
          <option value="EN">English</option>
          <option value="FR">French</option>
          {/* Add more languages as needed */}
        </select>
      </div>

      {/* Export Buttons */}
      <div className="mb-4 flex space-x-4">
      <button
    onClick={() => exportToXLSX(getTodayFilter(), "reservations_today.xlsx")}
    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
  >
    Export Today's Reservations (XLSX)
  </button>
  <button
    onClick={() => exportToXLSX(getWeekFilter(), "reservations_week.xlsx")}
    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
  >
    Export This Week (XLSX)
  </button>
  <button
    onClick={() => exportToXLSX(getMonthFilter(), "reservations_month.xlsx")}
    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
  >
    Export This Month (XLSX)
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
              {/* New Language Column Header */}
              <th className="px-4 py-2 border">Language</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentReservations.length === 0 && (
              <tr>
                <td
                  colSpan={canBulkAction ? 10 : 9} // Updated to include the new Language column
                  className="p-4 text-gray-500 text-sm text-center"
                >
                  No reservations found.
                </td>
              </tr>
            )}
            {currentReservations.map((reservation) => {
              const isSelected = selectedReservations.includes(reservation._id);
              const rowColorClass = getRowColorClass(reservation);
              const isHighlighted = reservation._id === highlightedReservationId;
              return (
                <tr
                  key={reservation._id}
                  id={`reservation-${reservation._id}`}
                  className={`hover:bg-gray-100 ${rowColorClass} ${
                    isHighlighted ? "bg-yellow-200" : ""
                  }`}
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
                  {/* New Language Data Cell */}
                  <td className="px-4 py-2 border">
                    {reservation.language
                      ? reservation.language.toUpperCase()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2 border flex space-x-2">
                    {canActOnIndividual ? (
                      <>
                        {/* Admin Actions */}
                        {role === "admin" && (
                          <>
                            {/* Approve Button for Pending Reservations */}
                            {currentTable === "reservations" && (
                              <LoaderButton
                                onClick={() =>
                                  confirmAction("updateStatus", {
                                    ...reservation,
                                    status: "approved",
                                  })
                                }
                                isLoading={loading[reservation._id]}
                                className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600"
                                title="Approve Reservation"
                              >
                                <FaCheck />
                              </LoaderButton>
                            )}

                            {/* Decline Button for Pending and Approved Reservations */}
                            {(currentTable === "reservations" ||
                              currentTable === "approvedReservations") && (
                              <LoaderButton
                                onClick={() =>
                                  confirmAction("updateStatus", {
                                    ...reservation,
                                    status: "declined",
                                  })
                                }
                                isLoading={loading[reservation._id]}
                                className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600"
                                title="Decline Reservation"
                              >
                                <FaTimes />
                              </LoaderButton>
                            )}

                            {/* Approve Button for Declined Reservations */}
                            {currentTable === "declinedReservations" && (
                              <LoaderButton
                                onClick={() =>
                                  confirmAction("updateStatus", {
                                    ...reservation,
                                    status: "approved",
                                  })
                                }
                                isLoading={loading[reservation._id]}
                                className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600"
                                title="Approve Reservation"
                              >
                                <FaCheck />
                              </LoaderButton>
                            )}

                            {/* Delete Button */}
                            {currentTable !== "deletedReservations" && (
                              <LoaderButton
                                onClick={() => confirmAction("delete", reservation)}
                                isLoading={loading[reservation._id]}
                                className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                                title="Delete Reservation"
                              >
                                <FaTrash />
                              </LoaderButton>
                            )}
                          </>
                        )}

                        {/* Subadmin Actions */}
                        {role === "subadmin" && currentTable === "reservations" && (
                          <>
                            {/* Accept Button (Equivalent to Approve) */}
                            <LoaderButton
                              onClick={() =>
                                confirmAction("updateStatus", {
                                  ...reservation,
                                  status: "approved",
                                })
                              }
                              isLoading={loading[reservation._id]}
                              className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600"
                              title="Accept Reservation"
                            >
                              <FaCheck />
                            </LoaderButton>
                          </>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

      {/* Add Reservation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-96 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Reservation</h2>
            <form onSubmit={handleAddFormSubmit}>
              <div className="mb-4">
                <label className="block mb-1">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={addFormData.name}
                  onChange={handleAddFormChange}
                  placeholder="Enter name"
                  className={`w-full px-3 py-2 border ${
                    addFormErrors.name ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  required
                />
                {addFormErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{addFormErrors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block mb-1">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={addFormData.email}
                  onChange={handleAddFormChange}
                  placeholder="Enter email"
                  className={`w-full px-3 py-2 border ${
                    addFormErrors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  required
                />
                {addFormErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{addFormErrors.email}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block mb-1">Phone:</label>
                <div className="flex">
                  <select
                    name="countryCode"
                    value={addFormData.countryCode}
                    onChange={handleAddFormChange}
                    className={`px-2 py-2 border ${
                      addFormErrors.phone ? "border-red-500" : "border-gray-300"
                    } rounded-l-md`}
                  >
                    <option value="+216">+216</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    {/* Add more country codes as needed */}
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={addFormData.phone}
                    onChange={handleAddFormChange}
                    placeholder="Enter phone number"
                    className={`w-full px-3 py-2 border-t border-b border-r ${
                      addFormErrors.phone ? "border-red-500" : "border-gray-300"
                    } rounded-r-md`}
                    required
                  />
                </div>
                {addFormErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{addFormErrors.phone}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block mb-1">Number of People:</label>
                <input
                  type="number"
                  name="people"
                  value={addFormData.people}
                  onChange={handleAddFormChange}
                  placeholder="Enter number of people"
                  className={`w-full px-3 py-2 border ${
                    addFormErrors.people ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  min="1"
                  required
                />
                {addFormErrors.people && (
                  <p className="text-red-500 text-sm mt-1">{addFormErrors.people}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block mb-1">Language:</label>
                <select
                  name="language"
                  value={addFormData.language}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  {/* Add more languages as needed */}
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-1">Chapter:</label>
                <select
                  name="selectedChapter"
                  value={selectedChapter}
                  onChange={(e) => {
                    handleAddFormChange(e);
                    const chapterId = e.target.value;
                    if (chapterId && selectedDate) {
                      loadTimeSlotsForAddReservation(chapterId, selectedDate);
                    } else {
                      setTimeSlots({});
                      setSelectedTimeSlot("");
                    }
                  }}
                  className={`w-full px-3 py-2 border ${
                    addFormErrors.selectedChapter ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  required
                >
                  <option value="">Select Chapter</option>
                  {chapters.map((chapter) => (
                    <option key={chapter._id} value={chapter._id}>
                      {chapter.name}
                    </option>
                  ))}
                </select>
                {addFormErrors.selectedChapter && (
                  <p className="text-red-500 text-sm mt-1">
                    {addFormErrors.selectedChapter}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block mb-1">Date:</label>
                <input
                  type="date"
                  name="selectedDate"
                  value={selectedDate}
                  onChange={handleAddFormChange}
                  className={`w-full px-3 py-2 border ${
                    addFormErrors.selectedDate ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  required
                />
                {addFormErrors.selectedDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {addFormErrors.selectedDate}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block mb-1">Time Slot:</label>
                <select
                  name="selectedTimeSlot"
                  value={selectedTimeSlot}
                  onChange={handleAddFormChange}
                  className={`w-full px-3 py-2 border ${
                    addFormErrors.selectedTimeSlot ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  required
                  disabled={!selectedChapter || !selectedDate}
                >
                  <option value="">Select Time Slot</option>
                  {selectedChapter &&
                    timeSlots[selectedChapter]?.map((slot) => (
                      <option key={slot._id} value={slot._id}>
                        {new Date(slot.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(slot.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </option>
                    ))}
                </select>
                {addFormErrors.selectedTimeSlot && (
                  <p className="text-red-500 text-sm mt-1">
                    {addFormErrors.selectedTimeSlot}
                  </p>
                )}
              </div>

              {/* Success and Error Messages */}
              {addFormSuccessMessage && (
                <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md">
                  Reservation created successfully!
                </div>
              )}
              {addFormErrorMessage && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
                  {addFormErrorMessage}
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  disabled={addFormLoading}
                >
                  {addFormLoading ? (
                    <span className="loader mr-2"></span> // Ensure you have the loader CSS
                  ) : null}
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
      <strong>People:</strong> {reservation.people}
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
    {/* New Language Field */}
    <p>
      <strong>Language:</strong> {reservation.language ? reservation.language.toUpperCase() : "N/A"}
    </p>
    {reservation.status && (
      <p>
        <strong>Status:</strong> {reservation.status}
      </p>
    )}
  </div>
);

export default ReservationsPage;

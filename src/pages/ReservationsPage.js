// src/components/ReservationsPage.js
import React, { useEffect, useState } from "react";
import { FaCheck, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { useParams } from "react-router-dom";
import LoaderButton from "../components/LoaderButton";
/**
 * If you get "Workbook is not a constructor" errors in the browser,
 * try importing from "exceljs/dist/exceljs.min.js" instead:
 *   import ExcelJS from "exceljs/dist/exceljs.min.js";
 */
import ExcelJS from "exceljs/dist/exceljs.min.js";
import { saveAs } from "file-saver";

import {
  createReservation,
  deleteReservation,
  fetchChapters,
  fetchTimeSlots,
  getAllReservations,
  updateReservationStatus,
} from "../services/reservationService";
import { fetchProfile } from "../services/userService";

/** Helper: get weekday name in French. */
const getDayName = (isoString) => {
  try {
    return new Date(isoString).toLocaleDateString("fr-FR", {
      weekday: "long",
    });
  } catch {
    return "";
  }
};

/** Helper: format date/time in local FR-FR. */
const toLocalTimeString = (isoString) => {
  try {
    return new Date(isoString).toLocaleString("fr-FR", {
      timeZone: "Africa/Tunis",
    });
  } catch {
    return "Invalid time";
  }
};

/** Helper: format "Created At" in local FR-FR. */
const formatCreatedAt = (isoString) => {
  try {
    return new Date(isoString).toLocaleString("fr-FR", {
      timeZone: "Africa/Tunis",
    });
  } catch {
    return "Invalid date";
  }
};

/** Helper: Calculate price per person based on number of players */
const calculatePricePerPerson = (players) => {
  if (players >= 4) return 30;
  if (players === 3) return 35;
  return 40; // for 2 players
};

/** Helper: Calculate total price */
const calculateTotalPrice = (players) => {
  return calculatePricePerPerson(players) * players;
};

/** Group reservations by day (YYYY-MM-DD). */
const groupReservationsByDay = (reservations) => {
  const grouped = {};
  for (const r of reservations) {
    if (r.timeSlot) {
      const dateKey = new Date(r.timeSlot.startTime).toISOString().split("T")[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(r);
    }
  }
  return grouped;
};

const ReservationsPage = () => {
  // ------------------- States & Variables -------------------
  const { id: reservationIdFromRoute } = useParams();
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

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [createdAtFilter, setCreatedAtFilter] = useState("");
  const [scenarioFilter, setScenarioFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");

  // Bulk selection
  const [selectedReservations, setSelectedReservations] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [highlightedReservationId, setHighlightedReservationId] = useState(null);

  // Add Reservation Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [timeSlots, setTimeSlots] = useState({});
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
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

  // ------------------- Fetching Data -------------------
  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const user = await fetchProfile();
        setCurrentUser(user);
        await fetchAllReservations();
        await loadChapters(); // For Add Reservation modal
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchUserAndData();
  }, []);

  useEffect(() => {
    if (reservationIdFromRoute) {
      setHighlightedReservationId(reservationIdFromRoute);
      setCurrentTable("reservations");
      setCurrentPage(1);
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

  // ------------------- Update Reservation Status -------------------
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

  // ------------------- Delete Reservation -------------------
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

  // ------------------- Confirmation Modal -------------------
  const confirmAction = (actionType, payload) => {
    setConfirmation({ actionType, payload });
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

  // ------------------- Filtering & Sorting -------------------
  const filteredReservations =
    (data[currentTable] || []).filter((reservation) => {
      const matchesSearchQuery =
        reservation.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDateFilter = dateFilter
        ? new Date(reservation.timeSlot.startTime)
            .toISOString()
            .split("T")[0] === dateFilter
        : true;
      const matchesCreatedAtFilter = createdAtFilter
        ? new Date(reservation.createdAt)
            .toISOString()
            .split("T")[0] === createdAtFilter
        : true;
      const matchesScenarioFilter = scenarioFilter
        ? reservation.scenario?.name
            ?.toLowerCase()
            .includes(scenarioFilter.toLowerCase())
        : true;
      const matchesLanguageFilter = languageFilter
        ? reservation.language?.toUpperCase() === languageFilter.toUpperCase()
        : true;
      return (
        matchesSearchQuery &&
        matchesDateFilter &&
        matchesCreatedAtFilter &&
        matchesScenarioFilter &&
        matchesLanguageFilter
      );
    }) || [];

  // Sort by endTime descending
  const sortedReservations = filteredReservations.sort((a, b) => {
    const aEnd = a.timeSlot ? new Date(a.timeSlot.endTime) : new Date(0);
    const bEnd = b.timeSlot ? new Date(b.timeSlot.endTime) : new Date(0);
    return bEnd - aEnd;
  });

  // Pagination
  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = sortedReservations.slice(
    indexOfFirstReservation,
    indexOfLastReservation
  );
  const totalPages = Math.ceil(sortedReservations.length / reservationsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedReservations([]);
    setSelectAll(false);
  };

  // Determine user role
  const role = currentUser?.usertype === "subadmin" ? "subadmin" : "admin";

  // Admin can do bulk actions (except in deletedReservations)
  const canBulkAction =
    role === "admin" &&
    currentTable !== "deletedReservations" &&
    sortedReservations.length > 0;

  // Subadmin can only act on "reservations"; Admin can act on all except "deletedReservations"
  const canActOnIndividual =
    (role === "admin" && currentTable !== "deletedReservations") ||
    (role === "subadmin" && currentTable === "reservations");

  // ------------------- Checkbox Selection (Bulk) -------------------
  const handleSelectReservation = (id) => {
    setSelectedReservations((prev) =>
      prev.includes(id)
        ? prev.filter((resId) => resId !== id)
        : [...prev, id]
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
    return selectedReservations.length > 0
      ? sortedReservations.filter((r) => selectedReservations.includes(r._id))
      : sortedReservations;
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

  // ------------------- Date-based Filtering Helpers for Export -------------------
  const getTodayFilter = () => {
    const today = new Date().toISOString().split("T")[0];
    return sortedReservations.filter(
      (r) =>
        new Date(r.timeSlot.startTime).toISOString().split("T")[0] === today
    );
  };

  const getWeekFilter = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday-based
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return sortedReservations.filter((r) => {
      const startTime = r.timeSlot ? new Date(r.timeSlot.startTime) : null;
      return startTime && startTime >= startOfWeek && startTime < endOfWeek;
    });
  };

  const getMonthFilter = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return sortedReservations.filter((r) => {
      const startTime = r.timeSlot ? new Date(r.timeSlot.startTime) : null;
      return startTime && startTime >= startOfMonth && startTime < endOfMonth;
    });
  };

  const getYearFilter = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);

    return sortedReservations.filter((r) => {
      const startTime = r.timeSlot ? new Date(r.timeSlot.startTime) : null;
      return startTime && startTime >= startOfYear && startTime < endOfYear;
    });
  };

  // ------------------- Excel Export (All Days on One Sheet) -------------------
  const exportFormattedReservations = async (reservations, filename) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Emploi du Temps");

    // Initialize columns first with specific widths
    worksheet.columns = [
      { header: 'Time Slot', key: 'timeSlot', width: 15 },
      { header: 'Chapter', key: 'chapter', width: 20 },
    ];

    // Set default row height and text wrapping
    worksheet.properties.defaultRowHeight = 18;
    worksheet.columns.forEach((col) => {
      col.alignment = { wrapText: true, vertical: "top" };
    });

    // 1) Group all reservations by day
    const groupedByDay = groupReservationsByDay(reservations);

    // 2) Sort day keys (e.g. "2025-01-02", "2025-01-03", etc.)
    const sortedDays = Object.keys(groupedByDay).sort();

    // We'll keep track of our current row in the sheet
    let currentRowNumber = 1;

    for (const dayKey of sortedDays) {
      const dayReservations = groupedByDay[dayKey];
      if (dayReservations.length === 0) continue;

      // Determine the weekday name, e.g. "jeudi"
      const sampleRes = dayReservations[0];
      const dayName = sampleRes?.timeSlot
        ? getDayName(sampleRes.timeSlot.startTime)
        : "";

      // Insert a header row for this day, e.g. "Day: 2025-01-02 - jeudi"
      const dayHeaderRow = worksheet.getRow(currentRowNumber);
      dayHeaderRow.getCell(1).value = `Day: ${dayKey} - ${dayName}`;
      // Some styling
      dayHeaderRow.height = 25;
      dayHeaderRow.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
      dayHeaderRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF008080" }, // Teal-like color
      };
      // Merge the first few columns so it's more visible
      worksheet.mergeCells(currentRowNumber, 1, currentRowNumber, 5);

      currentRowNumber++;

      // Blank row for spacing
      currentRowNumber++;

      // Collect unique chapters and times
      const chaptersSet = new Set();
      const timesSet = new Set();

      dayReservations.forEach((r) => {
        if (r.chapter?.name) {
          chaptersSet.add(r.chapter.name);
        }
        if (r.timeSlot) {
          const timeStr = new Date(r.timeSlot.startTime).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          timesSet.add(timeStr);
        }
      });

      const chaptersArray = Array.from(chaptersSet).sort();
      const timesArray = Array.from(timesSet).sort();

      // Create header row for the day: "Time Slot" + each chapter
      const headerRow = worksheet.getRow(currentRowNumber);
      headerRow.getCell(1).value = "Time Slot";
      // Fill columns
      for (let i = 0; i < chaptersArray.length; i++) {
        headerRow.getCell(i + 2).value = chaptersArray[i];
      }
      // Style the header row
      headerRow.height = 20;
      headerRow.font = { bold: true, color: { argb: "FF000000" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      // Add thin borders for each cell in header
      for (let i = 1; i <= chaptersArray.length + 1; i++) {
        const cell = headerRow.getCell(i);
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { wrapText: true, vertical: "middle" };
      }

      currentRowNumber++;

      // Now for each time, create a row
      timesArray.forEach((time) => {
        const row = worksheet.getRow(currentRowNumber);
        row.getCell(1).value = time; // first column = time

        // For each chapter, fill the intersection
        chaptersArray.forEach((chapterName, idx) => {
          // Find all reservations that match this time + chapter
          const cellReservations = dayReservations.filter((res) => {
            if (!res.chapter?.name) return false;
            const resTime = new Date(res.timeSlot.startTime).toLocaleTimeString(
              "fr-FR",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            );
            return res.chapter.name === chapterName && resTime === time;
          });

          let cellText = "";
          cellReservations.forEach((res) => {
            cellText += `Name: ${res.name}\nEmail: ${res.email}\nPhone: ${res.phone}\nPlayers: ${res.people}\nPrice: ${calculatePricePerPerson(res.people)} TND/person\nTotal: ${calculateTotalPrice(res.people)} TND\n\n`;
          });

          // Put in cell
          const cell = row.getCell(idx + 2);
          cell.value = cellText.trim();
          // Wrap text & add border
          cell.alignment = { wrapText: true, vertical: "top" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        // Also style the first cell (time cell)
        const firstCell = row.getCell(1);
        firstCell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        firstCell.alignment = { wrapText: true, vertical: "middle" };

        currentRowNumber++;
      });

      // Blank row after each day's table
      currentRowNumber++;
    }

    // Finally, generate the Excel and prompt download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, filename);
  };

  // ------------------- Add Reservation Functions -------------------
  const loadChapters = async () => {
    try {
      const fetchedChapters = await fetchChapters();
      setChapters(fetchedChapters);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    }
  };

  const loadTimeSlotsForAddReservation = async (chapterId, date) => {
    try {
      const fetchedTimeSlots = await fetchTimeSlots(chapterId, date);
      setTimeSlots((prev) => ({
        ...prev,
        [chapterId]: fetchedTimeSlots.filter(
          (slot) => slot.status === "available"
        ),
      }));
    } catch (error) {
      console.error("Error fetching time slots:", error);
      setTimeSlots((prev) => ({ ...prev, [chapterId]: [] }));
    }
  };

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
    return newErrors;
  };

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
        scenario:
          chapters.find((c) => c._id === selectedChapter)?.scenario?._id || "",
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

  // ------------------- Scroll to Highlighted Reservation -------------------
  useEffect(() => {
    if (highlightedReservationId) {
      const reservationRow = document.getElementById(
        `reservation-${highlightedReservationId}`
      );
      if (reservationRow) {
        reservationRow.scrollIntoView({ behavior: "smooth", block: "center" });
        reservationRow.classList.add("bg-yellow-200");
        setTimeout(() => {
          reservationRow.classList.remove("bg-yellow-200");
        }, 3000);
      }
    }
  }, [highlightedReservationId, currentReservations]);

  // ------------------- JSX Rendering -------------------
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Reservations</h1>

      {/* Add Reservation Button (Admins Only) */}
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
                setHighlightedReservationId(null);
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
      <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search by Name or Email
          </label>
          <input
            type="text"
            id="search"
            placeholder="Enter name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor="dateFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Filter by Time Slot Start Date
          </label>
          <input
            type="date"
            id="dateFilter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor="createdAtFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Filter by Creation Date
          </label>
          <input
            type="date"
            id="createdAtFilter"
            value={createdAtFilter}
            onChange={(e) => setCreatedAtFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor="scenarioFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Filter by Scenario
          </label>
          <input
            type="text"
            id="scenarioFilter"
            placeholder="Enter scenario name"
            value={scenarioFilter}
            onChange={(e) => setScenarioFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor="languageFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Filter by Language
          </label>
          <select
            id="languageFilter"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Languages</option>
            <option value="EN">English</option>
            <option value="FR">French</option>
          </select>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() =>
            exportFormattedReservations(getTodayFilter(), "reservations_today.xlsx")
          }
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Export Today
        </button>
        <button
          onClick={() =>
            exportFormattedReservations(getWeekFilter(), "reservations_week.xlsx")
          }
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Export This Week
        </button>
        <button
          onClick={() =>
            exportFormattedReservations(getMonthFilter(), "reservations_month.xlsx")
          }
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Export This Month
        </button>
        <button
          onClick={() =>
            exportFormattedReservations(getYearFilter(), "reservations_year.xlsx")
          }
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Export This Year
        </button>
      </div>

      {/* Bulk Actions (Admins Only) */}
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
              <th className="px-4 py-2 border">Price</th>
              <th className="px-4 py-2 border">Scenario</th>
              <th className="px-4 py-2 border">Chapter</th>
              <th className="px-4 py-2 border">Time Slot</th>
              <th className="px-4 py-2 border">Language</th>
              <th className="px-4 py-2 border">Created At</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentReservations.length === 0 && (
              <tr>
                <td
                  colSpan={canBulkAction ? 11 : 10}
                  className="p-4 text-gray-500 text-sm text-center"
                >
                  No reservations found.
                </td>
              </tr>
            )}
            {currentReservations.map((reservation) => {
              const isSelected = selectedReservations.includes(reservation._id);
              const isHighlighted = reservation._id === highlightedReservationId;
              return (
                <tr
                  key={reservation._id}
                  id={`reservation-${reservation._id}`}
                  className={`hover:bg-gray-100 ${
                    isHighlighted ? "bg-yellow-200" : ""
                  }`}
                >
                  {canBulkAction && (
                    <td className="px-4 py-2 border">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          handleSelectReservation(reservation._id)
                        }
                      />
                    </td>
                  )}
                  <td className="px-4 py-2 border">{reservation.name}</td>
                  <td className="px-4 py-2 border">{reservation.email}</td>
                  <td className="px-4 py-2 border">{reservation.phone}</td>
                  <td className="px-4 py-2 border">{reservation.people}</td>
                  <td className="px-4 py-2 border">
                    {calculatePricePerPerson(reservation.people)} TND/person
                    <br />
                    Total: {calculateTotalPrice(reservation.people)} TND
                  </td>
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
                        )} - ${toLocalTimeString(
                          reservation.timeSlot.endTime
                        )}`
                      : "No time slot"}
                  </td>
                  <td className="px-4 py-2 border">
                    {reservation.language
                      ? reservation.language.toUpperCase()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2 border">
                    {reservation.createdAt
                      ? formatCreatedAt(reservation.createdAt)
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2 border flex space-x-2">
                    {canActOnIndividual ? (
                      <>
                        {role === "admin" && (
                          <>
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
                            {currentTable !== "deletedReservations" && (
                              <LoaderButton
                                onClick={() =>
                                  confirmAction("delete", reservation)
                                }
                                isLoading={loading[reservation._id]}
                                className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                                title="Delete Reservation"
                              >
                                <FaTrash />
                              </LoaderButton>
                            )}
                          </>
                        )}
                        {role === "subadmin" &&
                          currentTable === "reservations" && (
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
              {/* --- Name Field --- */}
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name:
                </label>
                <input
                  type="text"
                  id="name"
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
                  <p className="text-red-500 text-sm mt-1">
                    {addFormErrors.name}
                  </p>
                )}
              </div>
              {/* --- Email Field --- */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
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
                  <p className="text-red-500 text-sm mt-1">
                    {addFormErrors.email}
                  </p>
                )}
              </div>
              {/* --- Phone Field --- */}
              <div className="mb-4">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone:
                </label>
                <div className="flex">
                  <select
                    id="countryCode"
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
                    {/* add more as needed */}
                  </select>
                  <input
                    type="tel"
                    id="phone"
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
                  <p className="text-red-500 text-sm mt-1">
                    {addFormErrors.phone}
                  </p>
                )}
              </div>
              {/* --- People Field --- */}
              <div className="mb-4">
                <label
                  htmlFor="people"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Number of People:
                </label>
                <input
                  type="number"
                  id="people"
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
                  <p className="text-red-500 text-sm mt-1">
                    {addFormErrors.people}
                  </p>
                )}
              </div>
              {/* --- Language Field --- */}
              <div className="mb-4">
                <label
                  htmlFor="language"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Language:
                </label>
                <select
                  id="language"
                  name="language"
                  value={addFormData.language}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
              {/* --- Chapter Field --- */}
              <div className="mb-4">
                <label
                  htmlFor="selectedChapter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Chapter:
                </label>
                <select
                  id="selectedChapter"
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
                    addFormErrors.selectedChapter
                      ? "border-red-500"
                      : "border-gray-300"
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
              {/* --- Date Field --- */}
              <div className="mb-4">
                <label
                  htmlFor="selectedDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date:
                </label>
                <input
                  type="date"
                  id="selectedDate"
                  name="selectedDate"
                  value={selectedDate}
                  onChange={handleAddFormChange}
                  className={`w-full px-3 py-2 border ${
                    addFormErrors.selectedDate
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md`}
                  required
                />
                {addFormErrors.selectedDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {addFormErrors.selectedDate}
                  </p>
                )}
              </div>
              {/* --- Time Slot Field --- */}
              <div className="mb-4">
                <label
                  htmlFor="selectedTimeSlot"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Time Slot:
                </label>
                <select
                  id="selectedTimeSlot"
                  name="selectedTimeSlot"
                  value={selectedTimeSlot}
                  onChange={handleAddFormChange}
                  className={`w-full px-3 py-2 border ${
                    addFormErrors.selectedTimeSlot
                      ? "border-red-500"
                      : "border-gray-300"
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

              {/* --- Success / Error Messages --- */}
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

              {/* --- Submit & Cancel Buttons --- */}
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
                  {addFormLoading && <span className="loader mr-2"></span>}
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/** Confirmation Modal: Reservation details. */
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
      <strong>Price:</strong> {calculatePricePerPerson(reservation.people)} TND per person
      <br />
      <strong>Total:</strong> {calculateTotalPrice(reservation.people)} TND
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
    <p>
      <strong>Language:</strong>{" "}
      {reservation.language ? reservation.language.toUpperCase() : "N/A"}
    </p>
    {reservation.status && (
      <p>
        <strong>Status:</strong> {reservation.status}
      </p>
    )}
    <p>
      <strong>Created At:</strong>{" "}
      {reservation.createdAt
        ? new Date(reservation.createdAt).toLocaleString("fr-FR", {
            timeZone: "Africa/Tunis",
          })
        : "N/A"}
    </p>
  </div>
);

export default ReservationsPage;
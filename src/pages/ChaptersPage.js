import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaEdit, FaEye } from 'react-icons/fa';
import {
  getAllChapters,
  createChapter,
  updateChapter,
  deleteChapter,
} from '../services/chapterService';
import ChapterForm from '../components/ChapterForm';
import ChapterDetails from '../components/ChapterDetails';
import LoaderButton from '../components/LoaderButton';
import ConfirmDialog from '../components/ConfirmDialog';

const ChaptersPage = () => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [chaptersPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editChapter, setEditChapter] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState(null);

  // Fetch chapters on component mount
  useEffect(() => {
    fetchChapters();
  }, []);

  // Fetch all chapters
  const fetchChapters = async () => {
    try {
      const data = await getAllChapters();
      setChapters(data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  // Add a new chapter
  const handleAddChapter = async (chapterData) => {
    setLoading((prev) => ({ ...prev, add: true }));
    try {
      await createChapter(chapterData);
      fetchChapters();
      setIsFormOpen(false);
      setEditChapter(null);
    } catch (error) {
      console.error('Error adding chapter:', error);
    } finally {
      setLoading((prev) => ({ ...prev, add: false }));
    }
  };

  // Update an existing chapter
  const handleUpdateChapter = async (chapterData) => {
    setLoading((prev) => ({ ...prev, update: true }));
    try {
      await updateChapter(editChapter._id, chapterData);
      fetchChapters();
      setIsFormOpen(false);
      setEditChapter(null);
    } catch (error) {
      console.error('Error updating chapter:', error);
    } finally {
      setLoading((prev) => ({ ...prev, update: false }));
    }
  };

  // Delete a chapter
  const handleDeleteChapter = async () => {
    setLoading((prev) => ({ ...prev, [chapterToDelete._id]: true }));
    try {
      await deleteChapter(chapterToDelete._id);
      fetchChapters();
      setIsConfirmOpen(false);
      setChapterToDelete(null);
    } catch (error) {
      console.error('Error deleting chapter:', error);
    } finally {
      setLoading((prev) => ({ ...prev, [chapterToDelete._id]: false }));
    }
  };

  // Filter chapters based on the search query
  const filteredChapters = chapters.filter((chapter) =>
    chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chapter.scenario?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastChapter = currentPage * chaptersPerPage;
  const indexOfFirstChapter = indexOfLastChapter - chaptersPerPage;
  const currentChapters = filteredChapters.slice(indexOfFirstChapter, indexOfLastChapter);
  const totalPages = Math.ceil(filteredChapters.length / chaptersPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Close form modal
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditChapter(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Chapters</h1>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by chapter name or scenario"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Add Chapter Button */}
      <LoaderButton
        onClick={() => setIsFormOpen(true)}
        isLoading={loading.add}
        className="bg-green-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-green-600 transition duration-200"
      >
        <FaPlus className="inline mr-2" /> Add Chapter
      </LoaderButton>

      {/* Chapter Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Scenario</th>
              <th className="px-4 py-2 border">Players</th>
              <th className="px-4 py-2 border">Time</th>
              <th className="px-4 py-2 border">Difficulty</th>
              <th className="px-1 py-2 border">percentage of Success </th>

              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentChapters.map((chapter) => (
              <tr key={chapter._id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border">{chapter.name}</td>
                <td className="px-4 py-2 border">{chapter.scenario?.name || 'N/A'}</td>
                <td className="px-4 py-2 border">{chapter.playerNumber}</td>
                <td className="px-4 py-2 border">{chapter.time} mins</td>
                <td className="px-4 py-2 border">{chapter.difficulty}</td>
                <td className="px-4 py-2 border">{chapter.percentageOfSuccess}</td>

                <td className="px-4 py-2 border flex space-x-2">
                  <LoaderButton
                    onClick={() => {
                      setSelectedChapter(chapter);
                      setIsDetailsOpen(true);
                    }}
                    isLoading={false}
                    className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                  >
                    <FaEye />
                  </LoaderButton>

                  <LoaderButton
                    onClick={() => {
                      setEditChapter(chapter);
                      setIsFormOpen(true);
                    }}
                    isLoading={loading.update}
                    className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600"
                  >
                    <FaEdit />
                  </LoaderButton>

                  <LoaderButton
                    onClick={() => {
                      setChapterToDelete(chapter);
                      setIsConfirmOpen(true);
                    }}
                    isLoading={loading[chapter._id]}
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

      {/* Add/Edit Chapter Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <ChapterForm
            onSubmit={editChapter ? handleUpdateChapter : handleAddChapter}
            onClose={handleCloseForm}
            chapter={editChapter}
          />
        </div>
      )}

      {/* Chapter Details Modal */}
      {isDetailsOpen && selectedChapter && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <ChapterDetails
            chapter={selectedChapter}
            onClose={() => {
              setIsDetailsOpen(false);
              setSelectedChapter(null);
            }}
          />
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {isConfirmOpen && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          title="Confirm Delete"
          message="Are you sure you want to delete this chapter?"
          onConfirm={handleDeleteChapter}
          onCancel={() => {
            setIsConfirmOpen(false);
            setChapterToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default ChaptersPage;

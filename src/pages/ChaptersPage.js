import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import {
  getAllChapters,
  createChapter,
  updateChapter,
  deleteChapter,
} from '../services/chapterService';
import ChapterForm from '../components/ChapterForm';
import ChapterDetails from '../components/ChapterDetails';
import ConfirmDialog from '../components/ConfirmDialog';

const ChaptersPage = () => {
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState(null);
  const [editChapter, setEditChapter] = useState(null);

  useEffect(() => {
    async function fetchChapters() {
      const chaptersData = await getAllChapters();
      setChapters(chaptersData);
    }
    fetchChapters();
  }, []);

  const handleAddChapter = async (chapterData) => {
    try {
      await createChapter(chapterData);
      setIsFormOpen(false);
      setEditChapter(null);
      const chaptersData = await getAllChapters();
      setChapters(chaptersData);
    } catch (error) {
      console.error('Error adding chapter:', error);
    }
  };

  const handleUpdateChapter = async (chapterData) => {
    try {
      await updateChapter(editChapter._id, chapterData);
      setIsFormOpen(false);
      setEditChapter(null);
      const chaptersData = await getAllChapters();
      setChapters(chaptersData);
    } catch (error) {
      console.error('Error updating chapter:', error);
    }
  };

  const handleDeleteChapter = async () => {
    try {
      await deleteChapter(chapterToDelete._id);
      setIsConfirmOpen(false);
      setChapterToDelete(null);
      const chaptersData = await getAllChapters();
      setChapters(chaptersData);
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Chapters</h1>

      <button
        onClick={() => setIsFormOpen(true)}
        className="bg-green-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-green-600 transition duration-200"
      >
        <FaPlus className="inline mr-2" /> Add Chapter
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Scenario</th>
              <th className="px-4 py-2 border">Players</th>
              <th className="px-4 py-2 border">Time</th>
              <th className="px-4 py-2 border">Difficulty</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map((chapter) => (
              <tr key={chapter._id} className="hover:bg-gray-100 transition duration-200">
                <td className="px-4 py-2 border">{chapter.name}</td>
                <td className="px-4 py-2 border">{chapter.scenario?.name || 'N/A'}</td>
                <td className="px-4 py-2 border">{chapter.playerNumber}</td>
                <td className="px-4 py-2 border">{chapter.time} mins</td>
                <td className="px-4 py-2 border">{chapter.difficulty}</td>
                <td className="px-4 py-2 border flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedChapter(chapter);
                      setIsDetailsOpen(true);
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 transition duration-200"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => {
                      setEditChapter(chapter);
                      setIsFormOpen(true);
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600 transition duration-200"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => {
                      setChapterToDelete(chapter);
                      setIsConfirmOpen(true);
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition duration-200"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <ChapterForm
            onSubmit={editChapter ? handleUpdateChapter : handleAddChapter}
            onClose={() => {
              setIsFormOpen(false);
              setEditChapter(null);
            }}
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

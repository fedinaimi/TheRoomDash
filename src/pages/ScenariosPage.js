import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import {
  getAllScenarios,
  createScenario,
  updateScenario,
  deleteScenario,
} from '../services/scenarioService'; // Import services
import ConfirmDialog from '../components/ConfirmDialog'; // Import ConfirmDialog component
import LoaderButton from '../components/LoaderButton'; // Import LoaderButton component

const ScenariosPage = () => {
  const [scenarios, setScenarios] = useState([]);
  const [editScenario, setEditScenario] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newScenario, setNewScenario] = useState({
    name: '',
    category: '',
  });

  // Confirmation Dialog State
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState({});
  const [loading, setLoading] = useState(false); // General loader for modal actions
  const [deleteLoading, setDeleteLoading] = useState({}); // Track delete loaders for each row

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [scenariosPerPage] = useState(10);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch scenarios when component loads
  useEffect(() => {
    async function fetchScenarios() {
      try {
        const data = await getAllScenarios();
        setScenarios(data);
      } catch (error) {
        console.error('Error fetching scenarios:', error);
      }
    }
    fetchScenarios();
  }, []);

  // Filtered and Paginated Scenarios
  const filteredScenarios = scenarios.filter(
    (scenario) =>
      scenario.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenario.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastScenario = currentPage * scenariosPerPage;
  const indexOfFirstScenario = indexOfLastScenario - scenariosPerPage;
  const currentScenarios = filteredScenarios.slice(indexOfFirstScenario, indexOfLastScenario);

  const totalPages = Math.ceil(filteredScenarios.length / scenariosPerPage);

  // Open modal for adding or editing
  const openModal = (scenario = null) => {
    setEditScenario(scenario);
    setNewScenario(scenario ? scenario : { name: '', category: '' });
    setIsModalOpen(true);
  };

  // Handle form submission for adding/editing scenario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader for modal action
    try {
      if (editScenario) {
        await updateScenario(editScenario._id, newScenario);
      } else {
        await createScenario(newScenario);
      }
      setIsModalOpen(false);
      const data = await getAllScenarios(); // Refresh scenarios
      setScenarios(data);
    } catch (error) {
      console.error('Error saving scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    setDeleteLoading((prev) => ({ ...prev, [actionToConfirm.id]: true })); // Show loader for specific row
    try {
      await deleteScenario(actionToConfirm.id);
      setScenarios(scenarios.filter((scenario) => scenario._id !== actionToConfirm.id));
      setIsConfirmDialogOpen(false); // Close confirmation dialog after action
    } catch (error) {
      console.error('Error deleting scenario:', error);
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [actionToConfirm.id]: false })); // Remove loader
    }
  };

  // Open confirmation dialog
  const openConfirmDialog = (id, actionType) => {
    setActionToConfirm({ id, actionType });
    setIsConfirmDialogOpen(true);
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setIsConfirmDialogOpen(false);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Scenarios</h1>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or category"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <LoaderButton
        onClick={() => openModal()}
        isLoading={false} // Always false for this button
        className="bg-green-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-green-600 transition duration-200"
      >
        <FaPlus className="inline mr-2" /> Add Scenario
      </LoaderButton>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentScenarios.map((scenario) => (
              <tr key={scenario._id}>
                <td className="px-4 py-2 border">{scenario.name}</td>
                <td className="px-4 py-2 border">{scenario.category}</td>
                <td className="px-4 py-2 border">
                  <div className="flex space-x-2"> {/* Use flex and spacing */}
                    <LoaderButton
                      onClick={() => openModal(scenario)}
                      isLoading={false} // No loader needed for edit
                      className="bg-yellow-500 text-white px-2 py-1 rounded-md mr-2 hover:bg-yellow-600"
                    >
                      <FaEdit />
                    </LoaderButton>
                    <LoaderButton
                      onClick={() => openConfirmDialog(scenario._id, 'delete')}
                      isLoading={deleteLoading[scenario._id]} // Show loader for delete
                      className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                    >
                      <FaTrash />
                    </LoaderButton>
                  </div>
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

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-96">
            <h2 className="text-xl font-bold mb-4">{editScenario ? 'Edit Scenario' : 'Add Scenario'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Name</label>
                <input
                  type="text"
                  value={newScenario.name}
                  onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Category</label>
                <input
                  type="text"
                  value={newScenario.category}
                  onChange={(e) => setNewScenario({ ...newScenario, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <LoaderButton
                  onClick={handleSubmit}
                  isLoading={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                >
                  {editScenario ? 'Update' : 'Add'}
                </LoaderButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title={`Confirm ${actionToConfirm.actionType === 'delete' ? 'Delete' : 'Update'}`}
        message={`Are you sure you want to ${actionToConfirm.actionType} this scenario?`}
        onConfirm={handleDeleteConfirm}
        onCancel={closeConfirmDialog}
      />
    </div>
  );
};

export default ScenariosPage;

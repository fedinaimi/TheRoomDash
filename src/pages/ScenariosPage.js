import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { getAllScenarios, createScenario, updateScenario, deleteScenario } from '../services/scenarioService'; // Import services
import ConfirmDialog from '../components/ConfirmDialog'; // Import ConfirmDialog component

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

  // Open modal for adding or editing
  const openModal = (scenario = null) => {
    setEditScenario(scenario);
    setNewScenario(scenario ? scenario : { name: '', category: '' });
    setIsModalOpen(true);
  };

  // Handle form submission for adding/editing scenario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editScenario) {
        await updateScenario(editScenario._id, newScenario);
      } else {
        await createScenario(newScenario);
      }
      setIsModalOpen(false);
      window.location.reload(); // Refresh to show the updated list
    } catch (error) {
      console.error('Error saving scenario:', error);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      await deleteScenario(actionToConfirm.id);
      setScenarios(scenarios.filter((scenario) => scenario._id !== actionToConfirm.id));
      setIsConfirmDialogOpen(false); // Close confirmation dialog after action
    } catch (error) {
      console.error('Error deleting scenario:', error);
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

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Scenarios</h1>

      <button
        onClick={() => openModal()}
        className="bg-green-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-green-600 transition duration-200"
      >
        <FaPlus className="inline mr-2" /> Add Scenario
      </button>

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
            {scenarios.map((scenario) => (
              <tr key={scenario._id}>
                <td className="px-4 py-2 border">{scenario.name}</td>
                <td className="px-4 py-2 border">{scenario.category}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => openModal(scenario)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded-md mr-2 hover:bg-yellow-600"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => openConfirmDialog(scenario._id, 'delete')} // Open confirmation dialog for delete
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
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                >
                  {editScenario ? 'Update' : 'Add'}
                </button>
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

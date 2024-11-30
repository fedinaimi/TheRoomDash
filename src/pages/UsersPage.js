import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchAllUsers,
  createUser,
  updateUserDetails,
  deleteUser,
} from '../services/userService';
import UserForm from '../components/UserForm';
import ConfirmDialog from '../components/ConfirmDialog';
import LoaderButton from '../components/LoaderButton';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Fetch users function wrapped with useCallback
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Add fetchUsers to dependency array

  const handleSaveUser = async (userData) => {
    try {
      if (editUser) {
        // Update existing user
        await updateUserDetails(editUser._id, userData);
      } else {
        // Create new user
        await createUser(userData);
      }
      fetchUsers();
      setIsFormOpen(false);
      setEditUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(userToDelete._id);
      fetchUsers();
      setUserToDelete(null);
      setIsConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {/* Add User Button */}
      <LoaderButton
        onClick={() => setIsFormOpen(true)}
        isLoading={false}
        className="bg-green-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-green-600"
      >
        <FaPlus className="inline mr-2" /> Add User
      </LoaderButton>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Role</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-4 py-2 border">{`${user.firstName} ${user.lastName}`}</td>
                <td className="px-4 py-2 border">{user.email}</td>
                <td className="px-4 py-2 border">{user.usertype}</td>
                <td className="px-4 py-2 border flex space-x-2">
                  <button
                    onClick={() => {
                      setEditUser(user);
                      setIsFormOpen(true);
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded-md"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => {
                      setUserToDelete(user);
                      setIsConfirmOpen(true);
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded-md"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal */}
      {isFormOpen && (
        <UserForm
          user={editUser}
          onSave={handleSaveUser}
          onClose={() => {
            setIsFormOpen(false);
            setEditUser(null);
          }}
        />
      )}

      {/* Confirm Delete Dialog */}
      {isConfirmOpen && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          title="Confirm Delete"
          message={`Are you sure you want to delete ${userToDelete?.firstName} ${userToDelete?.lastName}?`}
          onConfirm={handleDeleteUser}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </div>
  );
};

export default UsersPage;

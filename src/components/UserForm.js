import React, { useState } from 'react';

const UserForm = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState(
    user || { firstName: '', lastName: '', email: '', usertype: 'subadmin', newPassword: '' }
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-96">
      <h2 className="text-xl font-bold mb-4">{user ? 'Edit User' : 'Add User'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="border p-2 mb-4 w-full"
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="border p-2 mb-4 w-full"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 mb-4 w-full"
          required
        />
        <select
          name="usertype"
          value={formData.usertype}
          onChange={handleChange}
          className="border p-2 mb-4 w-full"
        >
          <option value="admin">Admin</option>
          <option value="subadmin">Subadmin</option>
          <option value="user">User</option>
        </select>

        {/* Password Field for Admin */}
        <input
          type="password"
          name="newPassword"
          placeholder="New Password (Optional)"
          value={formData.newPassword}
          onChange={handleChange}
          className="border p-2 mb-4 w-full"
        />

        <div className="flex justify-between">
          <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;

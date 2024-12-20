import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const UserForm = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState(
    user || { firstName: '', lastName: '', email: '', usertype: 'subadmin', newPassword: '' }
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData); // Simulate save operation
    } finally {
      setLoading(false); // Ensure loading stops even if an error occurs
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
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
        </select>

        {/* Password Field for Admin */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="newPassword"
            placeholder="New Password (Optional)"
            value={formData.newPassword}
            onChange={handleChange}
            className="border p-2 mb-4 w-full pr-10"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-2 top-3 text-gray-600"
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        </div>

        <div className="flex justify-between">
          <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded ${
              loading ? 'bg-gray-400 text-white' : 'bg-blue-500 text-white'
            }`}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;

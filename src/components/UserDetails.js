// src/components/UserDetails.js
import React from 'react';

const UserDetails = ({ user, onClose }) => {
  return (
    <div className="bg-white p-6 rounded shadow-md w-96">
      <h2 className="text-xl font-bold mb-4">User Details</h2>
      <p>
        <strong>Name:</strong> {user.firstName} {user.lastName}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Role:</strong> {user.usertype}
      </p>
      <p>
        <strong>Status:</strong> {user.verified ? 'Enabled' : 'Disabled'}
      </p>
      <div className="mt-4">
        <button onClick={onClose} className="bg-blue-500 text-white px-4 py-2 rounded">
          Close
        </button>
      </div>
    </div>
  );
};

export default UserDetails;

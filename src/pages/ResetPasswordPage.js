// src/pages/ResetPasswordPage.js
import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPasswordPage = () => {
  const { token } = useParams(); // Assuming the reset code is passed as a token in the URL
  const [resetCode, setResetCode] = useState(token || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await resetPassword(resetCode, newPassword);
      setMessage(response.message || 'Password reset successful. Redirecting...');
      setError('');
      setTimeout(() => navigate('/login'), 3000); // Redirect after 3 seconds
    } catch (error) {
      setError(error.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white-400 to-orange-600">
      <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-orange-600">Reset Password</h2>
        {message && (
          <div className="bg-green-100 text-green-700 p-3 mb-4 rounded-lg flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 5.707 8.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 mb-4 rounded-lg flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0V9a1 1 0 112 0v5zm-1-7a1 1 0 112 0 1 1 0 01-2 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleResetPassword}>
          {/* Reset Code Field */}
          <div className="mb-5">
            <label
              htmlFor="resetCode"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Reset Code
            </label>
            <input
              type="text"
              id="resetCode"
              aria-label="Reset Code"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
              } transition duration-200`}
              placeholder="Enter your reset code"
              required
            />
          </div>
          {/* New Password Field */}
          <div className="mb-5 relative">
            <label
              htmlFor="newPassword"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              New Password
            </label>
            <input
              type={showNewPassword ? 'text' : 'password'}
              id="newPassword"
              aria-label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
              } transition duration-200`}
              placeholder="Enter your new password"
              required
            />
            <span
              className="absolute right-4 top-11 cursor-pointer text-gray-600"
              onClick={() => setShowNewPassword(!showNewPassword)}
              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {/* Confirm Password Field */}
          <div className="mb-5 relative">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              aria-label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
              } transition duration-200`}
              placeholder="Confirm your new password"
              required
            />
            <span
              className="absolute right-4 top-11 cursor-pointer text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition duration-200 flex items-center justify-center disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"
                viewBox="0 0 24 24"
              ></svg>
            ) : null}
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>
        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-orange-600 hover:underline font-semibold"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

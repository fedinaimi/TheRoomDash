// src/pages/ForgotPasswordPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await forgotPassword(email);
      setMessage(response.message || 'Reset code sent to your email.');
      setError('');
      // Optionally, navigate to reset password page with token or other mechanism
      setTimeout(() => navigate('/reset-password'), 2000); // Redirect after 2 seconds
    } catch (error) {
      setError(error.response?.data?.message || 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white-400 to-orange-600">
      <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-orange-600">Forgot Password</h2>
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
        <form onSubmit={handleForgotPassword}>
          {/* Email Field */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              aria-label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
              } transition duration-200`}
              placeholder="Enter your email"
              required
            />
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
            {loading ? 'Sending...' : 'Send Reset Code'}
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

export default ForgotPasswordPage;

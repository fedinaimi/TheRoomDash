// src/components/PriceForm.js
import React, { useState, useEffect } from 'react';
import LoaderButton from './LoaderButton';

const PriceForm = ({ onSubmit, onClose, price }) => {
  const [formData, setFormData] = useState({
    playersCount: '',
    isAndAbove: false,
    pricePerPerson: '',
    currency: 'TND',
  });

  useEffect(() => {
    if (price) {
      setFormData({
        playersCount: price.playersCount || '',
        isAndAbove: price.isAndAbove || false,
        pricePerPerson: price.pricePerPerson || '',
        currency: price.currency || 'TND',
      });
    }
  }, [price]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <label>
        Players Count:
        <input
          type="number"
          name="playersCount"
          value={formData.playersCount}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </label>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="isAndAbove"
          checked={formData.isAndAbove}
          onChange={handleChange}
        />
        <span>isAndAbove?</span>
      </label>

      <label>
        Price Per Person:
        <input
          type="number"
          name="pricePerPerson"
          value={formData.pricePerPerson}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </label>

      <label>
        Currency:
        <input
          type="text"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </label>

      <div className="flex space-x-2">
        <LoaderButton
          type="submit"
          isLoading={false}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          {price ? 'Update Price' : 'Create Price'}
        </LoaderButton>

        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PriceForm;

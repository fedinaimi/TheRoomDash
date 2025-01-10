// src/pages/PricesPage.js
import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaEdit, FaEye } from 'react-icons/fa';
import {
  getAllPrices,
  createPrice,
  updatePrice,
  deletePrice,
} from '../services/priceService';
import LoaderButton from '../components/LoaderButton';
import ConfirmDialog from '../components/ConfirmDialog';
// Optionally import a PriceForm and PriceDetails if you want separate components
 import PriceForm from '../components/PriceForm';
// import PriceDetails from '../components/PriceDetails';

const PricesPage = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pricesPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editPrice, setEditPrice] = useState(null);

  // For details modal (if desired)
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // For confirm delete dialog
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [priceToDelete, setPriceToDelete] = useState(null);

  // Fetch prices on mount
  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const data = await getAllPrices();
      setPrices(data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const handleAddPrice = async (priceData) => {
    setLoading((prev) => ({ ...prev, add: true }));
    try {
      await createPrice(priceData);
      fetchPrices(); // Refresh the list
      setIsFormOpen(false);
      setEditPrice(null);
    } catch (error) {
      console.error('Error adding price:', error);
    } finally {
      setLoading((prev) => ({ ...prev, add: false }));
    }
  };

  const handleUpdatePrice = async (priceData) => {
    if (!editPrice) return;
    setLoading((prev) => ({ ...prev, update: true }));
    try {
      await updatePrice(editPrice._id, priceData);
      fetchPrices();
      setIsFormOpen(false);
      setEditPrice(null);
    } catch (error) {
      console.error('Error updating price:', error);
    } finally {
      setLoading((prev) => ({ ...prev, update: false }));
    }
  };

  const handleDeletePrice = async () => {
    if (!priceToDelete) return;
    setLoading((prev) => ({ ...prev, [priceToDelete._id]: true }));
    try {
      await deletePrice(priceToDelete._id);
      fetchPrices();
      setIsConfirmOpen(false);
      setPriceToDelete(null);
    } catch (error) {
      console.error('Error deleting price:', error);
    } finally {
      setLoading((prev) => ({ ...prev, [priceToDelete._id]: false }));
    }
  };

  // Filter prices by search query
  const filteredPrices = prices.filter((price) => {
    // You can customize which fields to search in
    const playersCountStr = price.playersCount?.toString().toLowerCase() || '';
    const pricePerPersonStr = price.pricePerPerson?.toString().toLowerCase() || '';
    const currencyStr = price.currency?.toLowerCase() || '';
    const search = searchQuery.toLowerCase();

    return (
      playersCountStr.includes(search) ||
      pricePerPersonStr.includes(search) ||
      currencyStr.includes(search)
    );
  });

  // Pagination
  const indexOfLastPrice = currentPage * pricesPerPage;
  const indexOfFirstPrice = indexOfLastPrice - pricesPerPage;
  const currentPrices = filteredPrices.slice(indexOfFirstPrice, indexOfLastPrice);
  const totalPages = Math.ceil(filteredPrices.length / pricesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditPrice(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Prices</h1>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by playersCount, pricePerPerson, currency..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Add Price Button */}
      <LoaderButton
        onClick={() => {
          setIsFormOpen(true);
          setEditPrice(null);
        }}
        isLoading={loading.add}
        className="bg-green-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-green-600 transition duration-200 flex items-center"
      >
        <FaPlus className="inline mr-2" /> Add Price
      </LoaderButton>

      {/* Prices Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Players Count</th>
              <th className="px-4 py-2 border">isAndAbove</th>
              <th className="px-4 py-2 border">Price Per Person</th>
              <th className="px-4 py-2 border">Currency</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPrices.map((price) => (
              <tr key={price._id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border">{price.playersCount}</td>
                <td className="px-4 py-2 border">{price.isAndAbove ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2 border">{price.pricePerPerson}</td>
                <td className="px-4 py-2 border">{price.currency}</td>
                <td className="px-4 py-2 border flex space-x-2">
                  {/* Details Button (optional) */}
                  <LoaderButton
                    onClick={() => {
                      setSelectedPrice(price);
                      setIsDetailsOpen(true);
                    }}
                    isLoading={false}
                    className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                  >
                    <FaEye />
                  </LoaderButton>

                  {/* Edit Button */}
                  <LoaderButton
                    onClick={() => {
                      setEditPrice(price);
                      setIsFormOpen(true);
                    }}
                    isLoading={loading.update}
                    className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600"
                  >
                    <FaEdit />
                  </LoaderButton>

                  {/* Delete Button */}
                  <LoaderButton
                    onClick={() => {
                      setPriceToDelete(price);
                      setIsConfirmOpen(true);
                    }}
                    isLoading={loading[price._id]} 
                    className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                  >
                    <FaTrash />
                  </LoaderButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

      {/* Add/Edit Price Modal (if using a separate component) */}
      {isFormOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50 overflow-auto">
          {/*
            Here you would render your <PriceForm> component, similar to <ChapterForm>,
            or do everything inline.
          */}
          {/* Example inline approach: */}
          <div className="bg-white p-6 rounded-md w-96">
            <h2 className="text-xl font-bold mb-4">
              {editPrice ? 'Edit Price' : 'Add Price'}
            </h2>
            {/* Simple form inline */}
            {/* You can manage form state with useState or useForm libs */}
            <PriceForm
              onSubmit={editPrice ? handleUpdatePrice : handleAddPrice}
              onClose={handleCloseForm}
              price={editPrice}
            />
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsOpen && selectedPrice && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50 overflow-auto">
          <div className="bg-white p-6 rounded-md w-96">
            <h2 className="text-xl font-bold mb-4">Price Details</h2>
            {/* 
              Either create a <PriceDetails> component
              or just show them inline
            */}
            <p>Players Count: {selectedPrice.playersCount}</p>
            <p>isAndAbove: {selectedPrice.isAndAbove ? 'Yes' : 'No'}</p>
            <p>Price Per Person: {selectedPrice.pricePerPerson}</p>
            <p>Currency: {selectedPrice.currency}</p>
            <button
              onClick={() => {
                setIsDetailsOpen(false);
                setSelectedPrice(null);
              }}
              className="mt-4 px-4 py-2 bg-gray-300 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {isConfirmOpen && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          title="Confirm Delete"
          message="Are you sure you want to delete this price?"
          onConfirm={handleDeletePrice}
          onCancel={() => {
            setIsConfirmOpen(false);
            setPriceToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default PricesPage;

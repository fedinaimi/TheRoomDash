import React from 'react';
import {
  FaUsers,
  FaClock,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaVideo,
  FaImage,
  FaBook,
} from 'react-icons/fa';

const ChapterDetails = ({ chapter, onClose }) => {
  if (!chapter) return null;

  return (
    <div className="bg-white p-6 rounded-md w-full max-w-2xl mx-auto md:mx-4 lg:mx-auto shadow-lg animate-fade-in overflow-auto max-h-[90vh]">
      <h2 className="text-2xl font-bold mb-4 text-center">{chapter.name}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Image */}
        {chapter.image && (
          <div className="h-48 w-full">
            <FaImage className="inline-block mr-2" />
            <img
              src={chapter.image}
              alt="Chapter"
              className="h-full w-full object-cover mt-2 rounded-md"
            />
          </div>
        )}

        {/* Video */}
        {chapter.video && (
          <div className="h-48 w-full">
            <FaVideo className="inline-block mr-2" />
            <video controls className="h-full w-full object-cover mt-2 rounded-md">
              <source src={chapter.video} type="video/mp4" />
            </video>
          </div>
        )}
      </div>

      <div className="mt-4">
        {/* Scenario */}
        <p className="mb-2 flex items-center">
          <FaBook className="inline-block mr-2" />
          <strong>Scenario:</strong>
          <span className="ml-1">{chapter.scenario.name}</span>
        </p>

        {/* Players */}
        <p className="mb-2 flex items-center">
          <FaUsers className="inline-block mr-2" />
          <strong>Players:</strong>
          <span className="ml-1">{chapter.playerNumber}</span>
        </p>
        <p className="mb-2 flex items-center">
          <FaUsers className="inline-block mr-2" />
          <strong>Max Players:</strong>
          <span className="ml-1">{chapter. maxPlayerNumber}</span>
        </p>
        <p className="mb-2 flex items-center">
          <FaUsers className="inline-block mr-2" />
          <strong>Min Players:</strong>
          <span className="ml-1">{chapter. minPlayerNumber}</span>
        </p>
       
        {/* Time */}
        <p className="mb-2 flex items-center">
          <FaClock className="inline-block mr-2" />
          <strong>Time:</strong>
          <span className="ml-1">{chapter.time} mins</span>
        </p>

        {/* Difficulty */}
        <p className="mb-2 flex items-center">
          <FaInfoCircle className="inline-block mr-2" />
          <strong>Difficulty:</strong>
          <span className="ml-1">{chapter.difficulty}</span>
        </p>

        {/* Place */}
        <p className="mb-2 flex items-center">
          <FaMapMarkerAlt className="inline-block mr-2" />
          <strong>Place:</strong>
          <span className="ml-1">{chapter.place}</span>
        </p>

        {/* Description */}
        {chapter.description && (
          <p className="mb-2">
            <strong>Description:</strong>
            <span className="ml-1">{chapter.description}</span>
          </p>
        )}

        {/* Comment */}
        {chapter.comment && (
          <p className="mb-2">
            <strong>Comment:</strong>
            <span className="ml-1">{chapter.comment}</span>
          </p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200 block mx-auto lg:mx-0"
      >
        Close
      </button>
    </div>
  );
};

export default ChapterDetails;

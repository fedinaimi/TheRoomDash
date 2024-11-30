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
    <div className="bg-white p-6 rounded-md w-full max-w-md animate-fade-in">
      <h2 className="text-2xl font-bold mb-4">{chapter.name}</h2>
      {/* Image */}
      {chapter.image && (
        <div className="mb-4">
          <FaImage className="inline-block mr-2" />
          <img src={chapter.image} alt="Chapter" className="h-48 w-full object-cover mt-2 rounded-md" />
        </div>
      )}
      {/* Video */}
      {chapter.video && (
        <div className="mb-4">
          <FaVideo className="inline-block mr-2" />
          <video controls className="w-full mt-2 rounded-md">
            <source src={chapter.video} type="video/mp4" />
          </video>
        </div>
      )}
      {/* Details */}
      <p className="mb-2">
        <FaBook className="inline-block mr-2" />
        <strong>Scenario:</strong> {chapter.scenario.name}
      </p>
      <p className="mb-2">
        <FaUsers className="inline-block mr-2" />
        <strong>Players:</strong> {chapter.playerNumber}
      </p>
      <p className="mb-2">
        <FaClock className="inline-block mr-2" />
        <strong>Time:</strong> {chapter.time} mins
      </p>
      <p className="mb-2">
        <FaInfoCircle className="inline-block mr-2" />
        <strong>Difficulty:</strong> {chapter.difficulty}
      </p>
      <p className="mb-2">
        <FaMapMarkerAlt className="inline-block mr-2" />
        <strong>Place:</strong> {chapter.place}
      </p>
      {chapter.description && (
        <p className="mb-2">
          <strong>Description:</strong> {chapter.description}
        </p>
      )}
      {chapter.comment && (
        <p className="mb-2">
          <strong>Comment:</strong> {chapter.comment}
        </p>
      )}
      {/* Close Button */}
      <button
        onClick={onClose}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200"
      >
        Close
      </button>
    </div>
  );
};

export default ChapterDetails;

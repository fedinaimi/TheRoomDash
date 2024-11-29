import React from 'react';

const LoaderButton = ({ onClick, isLoading, disabled, children, className }) => {
  return (
    <button
      onClick={onClick}
      className={`${className} flex items-center justify-center`}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <span className="loader w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
      ) : (
        children
      )}
    </button>
  );
};

export default LoaderButton;

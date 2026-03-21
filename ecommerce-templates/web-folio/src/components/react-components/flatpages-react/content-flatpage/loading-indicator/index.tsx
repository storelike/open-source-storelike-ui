import React from 'react';

const LoadingIndicator: React.FC = () => (
  <div className="mt-4 p-5 w-full max-w-4xl flex justify-center items-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
  </div>
);

export default LoadingIndicator;

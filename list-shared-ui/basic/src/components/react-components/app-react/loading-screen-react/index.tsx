import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-black">
      <div className="animate-pulse">
        <h1 className="text-5xl font-bold text-white">Hello!</h1>
      </div>
      <div className="mt-4 flex items-center">
        <div className="w-8 h-8 border-4 border-t-4 border-t-transparent border-white rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
import React from 'react';
import LoadingIndicator from './loading-indicator';

interface LoadingWrapperProps {
  loading: boolean;
  children: React.ReactNode;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ loading, children }) => {
  return loading ? (
    <LoadingIndicator />
  ) : (
    <div className="mt-4  w-full md:p-5 ">
      {children}
    </div>
  );
};

export default LoadingWrapper;

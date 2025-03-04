import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  fullHeight?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'sky',
  text = 'Loading...',
  fullHeight = true
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4'
  };

  return (
    <div className={`flex justify-center items-center ${fullHeight ? 'min-h-[60vh]' : ''}`}>
      <div className="text-center">
        <div 
          className={`inline-block animate-spin rounded-full ${sizeClasses[size]} border-${color}-500 border-t-transparent`}
        ></div>
        {text && <p className="mt-2 text-gray-600">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
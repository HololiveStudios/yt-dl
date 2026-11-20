import React from 'react';

interface ProgressBarProps {
  progress: number;
  status: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, status, className = '' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'downloading': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
          {status}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {progress}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        ></div>
      </div>
    </div>
  );
};
import React from 'react';
import { Download } from 'lucide-react';

interface DownloadButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ onClick, disabled, loading }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg flex items-center gap-2 transition-colors duration-200 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        <Download className="w-5 h-5" />
      )}
      {loading ? 'Starting...' : 'Download'}
    </button>
  );
};
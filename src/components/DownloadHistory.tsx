import React from 'react';
import { Trash2, Download as DownloadIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { DownloadItem } from '../types';
import { ProgressBar } from './ProgressBar';

interface DownloadHistoryProps {
  downloads: DownloadItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const DownloadHistory: React.FC<DownloadHistoryProps> = ({ downloads, onRemove, onClear }) => {
  if (downloads.length === 0) {
    return (
      <div className="text-center py-12">
        <DownloadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No downloads yet</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'downloading':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600"></div>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Download History
        </h2>
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        {downloads.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start gap-4">
              <img
                src={item.thumbnail}
                alt="Thumbnail"
                className="w-24 h-18 object-cover rounded-lg flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{item.quality}</span>
                      <span>{item.format.toUpperCase()}</span>
                      {item.fileSize && <span>{item.fileSize}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <button
                      onClick={() => onRemove(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {item.status !== 'completed' && item.status !== 'error' && (
                  <ProgressBar
                    progress={item.progress}
                    status={item.status}
                    className="mb-3"
                  />
                )}

                {item.status === 'error' && item.error && (
                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{item.error}</p>
                  </div>
                )}

                {item.status === 'completed' && item.downloadUrl && (
                  <a
                    href={item.downloadUrl}
                    download
                    className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Download File
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
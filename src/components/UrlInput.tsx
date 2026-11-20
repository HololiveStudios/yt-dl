import React, { useState, useEffect } from 'react';
import { Link, AlertCircle, CheckCircle } from 'lucide-react';
import { VideoInfo } from '../types';

interface UrlInputProps {
  onValidUrl: (url: string, videoInfo: VideoInfo) => void;
  isValidating: boolean;
  validateUrl: (url: string) => Promise<VideoInfo | null>;
}

export const UrlInput: React.FC<UrlInputProps> = ({ onValidUrl, isValidating, validateUrl }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isAutoValidating, setIsAutoValidating] = useState(false);

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const handleAutoValidation = async (urlToValidate: string) => {
    if (!isValidYouTubeUrl(urlToValidate)) {
      setError('Please enter a valid YouTube URL');
      setVideoInfo(null);
      return;
    }

    setIsAutoValidating(true);
    setError('');
    setVideoInfo(null);

    try {
      const info = await validateUrl(urlToValidate);
      if (info) {
        setVideoInfo(info);
        onValidUrl(urlToValidate, info);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate URL');
    } finally {
      setIsAutoValidating(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (url.trim() && isValidYouTubeUrl(url.trim())) {
        handleAutoValidation(url.trim());
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [url]);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError('');
    setVideoInfo(null);

    if (!value.trim()) {
      return;
    }

    if (!isValidYouTubeUrl(value)) {
      setError('Please enter a valid YouTube URL');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (videoInfo) {
      return;
    }

    await handleAutoValidation(url.trim());
  };

  const currentlyValidating = isValidating || isAutoValidating;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Paste YouTube URL here..."
            className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors duration-200"
            disabled={currentlyValidating}
          />
          {currentlyValidating && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
          {videoInfo && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-500 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {currentlyValidating && (
          <div className="mt-3 flex items-center gap-2 text-blue-500 dark:text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm">Validating URL...</span>
          </div>
        )}

        {videoInfo && (
          <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <img 
                src={videoInfo.thumbnail} 
                alt="Video thumbnail"
                className="w-20 h-15 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Ready to download</span>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                  {videoInfo.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Duration: {videoInfo.duration}</span>
                  {videoInfo.fileSize !== 'Unknown' && <span>Size: ~{videoInfo.fileSize}</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
import React, { useState } from 'react';
import { Youtube } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { UrlInput } from './components/UrlInput';
import { QualitySelector } from './components/QualitySelector';
import { DownloadButton } from './components/DownloadButton';
import { DownloadHistory } from './components/DownloadHistory';
import { InstallPrompt } from './components/InstallPrompt';
import { useTheme } from './hooks/useTheme';
import { useDownloader } from './hooks/useDownloader';
import { VideoInfo } from './types';

function App() {
  const { theme } = useTheme();
  const { downloads, isValidating, validateUrl, startDownload, removeDownload, clearHistory } = useDownloader();
  
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentVideoInfo, setCurrentVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [selectedFormat, setSelectedFormat] = useState('mp4');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleValidUrl = (url: string, videoInfo: VideoInfo) => {
    setCurrentUrl(url);
    setCurrentVideoInfo(videoInfo);
  };

  const handleQualityChange = (quality: string, format: string) => {
    setSelectedQuality(quality);
    setSelectedFormat(format);
  };

  const handleDownload = async () => {
    if (!currentUrl || !currentVideoInfo) return;

    setIsDownloading(true);
    try {
      await startDownload(
        {
          url: currentUrl,
          quality: selectedQuality,
          format: selectedFormat,
        },
        currentVideoInfo
      );
      
      // Reset form
      setCurrentUrl('');
      setCurrentVideoInfo(null);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600 rounded-xl">
              <Youtube className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                YouTube Downloader
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Download videos and audio from YouTube
              </p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Download Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="space-y-6">
              <UrlInput
                onValidUrl={handleValidUrl}
                isValidating={isValidating}
                validateUrl={validateUrl}
              />
              
              {currentVideoInfo && (
                <div className="flex flex-col sm:flex-row gap-4 items-end justify-center">
                  <QualitySelector
                    value={selectedQuality}
                    onChange={handleQualityChange}
                  />
                  <DownloadButton
                    onClick={handleDownload}
                    disabled={!currentUrl || !currentVideoInfo}
                    loading={isDownloading}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Download History */}
          <DownloadHistory
            downloads={downloads}
            onRemove={removeDownload}
            onClear={clearHistory}
          />
        </div>
      </div>

      <InstallPrompt />
    </div>
  );
}

export default App;
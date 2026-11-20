import { useState, useCallback } from 'react';
import { DownloadItem, DownloadRequest, VideoInfo, ApiResponse } from '../types';

const API_BASE = 'http://10.0.0.146:3001/api';

export const useDownloader = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateUrl = useCallback(async (url: string): Promise<VideoInfo | null> => {
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      throw new Error('Please enter a valid YouTube URL');
    }

    setIsValidating(true);
    try {
      const response = await fetch(`${API_BASE}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const result: ApiResponse<VideoInfo> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to validate URL');
      }

      return result.data!;
    } catch (error) {
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const startDownload = useCallback(async (request: DownloadRequest, videoInfo: VideoInfo) => {
    const downloadId = Date.now().toString();
    
    const newDownload: DownloadItem = {
      id: downloadId,
      url: request.url,
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      quality: request.quality,
      format: request.format,
      status: 'pending',
      progress: 0,
      fileSize: videoInfo.fileSize,
      createdAt: new Date(),
    };

    setDownloads(prev => [newDownload, ...prev]);

    try {
      const response = await fetch(`${API_BASE}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, id: downloadId }),
      });

      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        setDownloads(prev => prev.map(d => 
          d.id === downloadId 
            ? { ...d, status: 'error', error: result.error }
            : d
        ));
        return;
      }

      // Start polling for progress
      pollProgress(downloadId);
    } catch (error) {
      setDownloads(prev => prev.map(d => 
        d.id === downloadId 
          ? { ...d, status: 'error', error: 'Failed to start download' }
          : d
      ));
    }
  }, []);

  const pollProgress = useCallback(async (downloadId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`${API_BASE}/status/${downloadId}`);
        const result: ApiResponse<{ status: string; progress: number; downloadUrl?: string }> = await response.json();
        
        if (result.success && result.data) {
          setDownloads(prev => prev.map(d => 
            d.id === downloadId 
              ? { 
                  ...d, 
                  status: result.data!.status as any,
                  progress: result.data!.progress,
                  downloadUrl: result.data!.downloadUrl 
                }
              : d
          ));

          if (result.data.status === 'downloading' && result.data.progress < 100) {
            setTimeout(poll, 1000);
          }
        }
      } catch (error) {
        console.error('Failed to poll progress:', error);
      }
    };

    poll();
  }, []);

  const removeDownload = useCallback((id: string) => {
    setDownloads(prev => prev.filter(d => d.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setDownloads([]);
  }, []);

  return {
    downloads,
    isValidating,
    validateUrl,
    startDownload,
    removeDownload,
    clearHistory,
  };
};
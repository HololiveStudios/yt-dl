export interface QualityOption {
  value: string;
  label: string;
  format: string;
}

export interface DownloadRequest {
  url: string;
  quality: string;
  format: string;
}

export interface DownloadItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  quality: string;
  format: string;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  progress: number;
  fileSize?: string;
  downloadUrl?: string;
  error?: string;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  fileSize: string;
}
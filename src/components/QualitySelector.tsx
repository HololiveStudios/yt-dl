import React from 'react';
import { QualityOption } from '../types';

interface QualitySelectorProps {
  value: string;
  onChange: (quality: string, format: string) => void;
  disabled?: boolean;
}

const qualityOptions: QualityOption[] = [
  { value: '2160p', label: '4K (2160p)', format: 'mp4' },
  { value: '1080p', label: 'Full HD (1080p)', format: 'mp4' },
  { value: '720p', label: 'HD (720p)', format: 'mp4' },
  { value: '480p', label: 'SD (480p)', format: 'mp4' },
  { value: 'mp3-320', label: 'Audio Only (MP3 320kbps)', format: 'mp3' },
  { value: 'mp3-128', label: 'Audio Only (MP3 128kbps)', format: 'mp3' },
];

export const QualitySelector: React.FC<QualitySelectorProps> = ({ value, onChange, disabled }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = qualityOptions.find(opt => opt.value === e.target.value);
    if (selectedOption) {
      onChange(selectedOption.value, selectedOption.format);
    }
  };

  return (
    <div className="w-full max-w-xs">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Quality
      </label>
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {qualityOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
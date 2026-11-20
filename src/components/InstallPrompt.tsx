import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
            Install App
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Install YouTube Downloader for quick access and offline use.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
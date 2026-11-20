const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());

app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

const downloadStatus = new Map();

const downloadsDir = path.join(__dirname, 'downloads');
fs.mkdir(downloadsDir, { recursive: true }).catch(console.error);

const checkYtDlp = () => {
  return new Promise((resolve, reject) => {
    const ytDlp = spawn('yt-dlp', ['--version'], { stdio: 'pipe' });
    
    ytDlp.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error('yt-dlp not found or not working'));
      }
    });

    ytDlp.on('error', (error) => {
      reject(new Error(`yt-dlp not found: ${error.message}`));
    });
  });
};

const runYtDlp = (url, options = []) => {
  return new Promise((resolve, reject) => {
    console.log(`Running: yt-dlp ${url} ${options.join(' ')}`);
    
const YT_DLP = '/usr/local/bin/yt-dlp';
const ytDlp = spawn(YT_DLP, [url, '--dump-json', '--no-download', '--legacy-server-connect', ...options]);

    let stdout = '';
    let stderr = '';

    ytDlp.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      console.log('stdout:', chunk);
    });

    ytDlp.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      console.log('stderr:', chunk);
    });

    ytDlp.on('error', (error) => {
      console.error('spawn error:', error);
      reject(new Error(`yt-dlp execution error: ${error.message}`));
    });

    ytDlp.on('close', (code) => {
      console.log(`yt-dlp closed with code: ${code}`);
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || `yt-dlp exited with code ${code}`));
      }
    });
  });
};

const getVideoInfo = async (url) => {
  let output = '';
  try {
    output = await runYtDlp(url, [
      '--dump-json',
      '--no-download',
      '--no-warnings',
      '--quiet',
      '--no-check-certificate'
    ]);

    if (!output || output.trim() === '') {
      throw new Error('No video information returned');
    }

    const lines = output.trim().split('\n');
    const jsonLine = lines.find(line => {
      try {
        JSON.parse(line);
        return true;
      } catch {
        return false;
      }
    });

    if (!jsonLine) {
      throw new Error('No valid JSON found in output');
    }

    const info = JSON.parse(jsonLine);
    
    return {
      title: info.title || 'Unknown Title',
      thumbnail: info.thumbnail || '',
      duration: formatDuration(info.duration || 0),
      fileSize: formatFileSize(info.filesize_approx || info.filesize || 0)
    };
  } catch (error) {
    console.error('getVideoInfo error:', error.message);
    console.error('Raw output:', output);
    throw new Error(`Failed to fetch video information: ${error.message}`);
  }
};

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

app.get('/api/health', async (req, res) => {
  try {
    await checkYtDlp();
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      ytdlp: 'available'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      ytdlp: 'not available',
      error: error.message
    });
  }
});

app.post('/api/validate', async (req, res) => {
  try {
    await checkYtDlp();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'yt-dlp is not installed or not working. Please install yt-dlp first.'
    });
  }

  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid YouTube URL'
      });
    }

    const videoInfo = await getVideoInfo(url);
    
    res.json({
      success: true,
      data: videoInfo
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate URL'
    });
  }
});

app.post('/api/download', async (req, res) => {
  try {
    await checkYtDlp();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'yt-dlp is not installed or not working. Please install yt-dlp first.'
    });
  }

  try {
    const { id, url, quality, format } = req.body;
    
    if (!url || !quality || !format) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    const downloadId = id || uuidv4();
    
    downloadStatus.set(downloadId, {
      status: 'pending',
      progress: 0,
      error: null,
      downloadUrl: null
    });

    processDownload(downloadId, url, quality, format);
    
    res.json({
      success: true,
      data: { downloadId }
    });
  } catch (error) {
    console.error('Download start error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start download'
    });
  }
});

app.get('/api/status/:id', (req, res) => {
  const { id } = req.params;
  const status = downloadStatus.get(id);
  
  if (!status) {
    return res.status(404).json({
      success: false,
      error: 'Download not found'
    });
  }
  
  res.json({
    success: true,
    data: status
  });
});

app.get('/api/history', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

const processDownload = async (downloadId, url, quality, format) => {
  try {
    downloadStatus.set(downloadId, {
      status: 'downloading',
      progress: 0,
      error: null,
      downloadUrl: null
    });

    const filename = `${downloadId}.%(ext)s`;
    const outputPath = path.join(downloadsDir, filename);
    
    const options = [
      '-o', outputPath,
      '--newline',
      '--no-check-certificate'
    ];

    if (format === 'mp3') {
      options.push('-x', '--audio-format', 'mp3');
      if (quality === 'mp3-320') {
        options.push('--audio-quality', '320K');
      } else if (quality === 'mp3-128') {
        options.push('--audio-quality', '128K');
      }
    } else {
      options.push('-f', `best[height<=${quality.replace('p', '')}]`);
    }

    const ytDlp = spawn('yt-dlp', [url, ...options], {
      stdio: 'pipe'
    });

    let progress = 0;

    ytDlp.stdout.on('data', (data) => {
      const output = data.toString();
      
      const progressMatch = output.match(/(\d+(?:\.\d+)?)%/);
      if (progressMatch) {
        progress = parseFloat(progressMatch[1]);
        downloadStatus.set(downloadId, {
          status: 'downloading',
          progress: Math.round(progress),
          error: null,
          downloadUrl: null
        });
      }
    });

    ytDlp.stderr.on('data', (data) => {
      console.error(`yt-dlp error: ${data}`);
    });

    ytDlp.on('error', (error) => {
      downloadStatus.set(downloadId, {
        status: 'error',
        progress: 0,
        error: `yt-dlp execution error: ${error.message}`,
        downloadUrl: null
      });
    });

    ytDlp.on('close', async (code) => {
      if (code === 0) {
        try {
          const files = await fs.readdir(downloadsDir);
          const downloadedFile = files.find(file => file.startsWith(downloadId));
          
          if (downloadedFile) {
            downloadStatus.set(downloadId, {
              status: 'completed',
              progress: 100,
              error: null,
              downloadUrl: `/downloads/${downloadedFile}`
            });
          } else {
            throw new Error('Downloaded file not found');
          }
        } catch (error) {
          downloadStatus.set(downloadId, {
            status: 'error',
            progress: 0,
            error: 'File not found after download',
            downloadUrl: null
          });
        }
      } else {
        downloadStatus.set(downloadId, {
          status: 'error',
          progress: 0,
          error: 'Download failed',
          downloadUrl: null
        });
      }
    });

  } catch (error) {
    console.error('Download processing error:', error);
    downloadStatus.set(downloadId, {
      status: 'error',
      progress: 0,
      error: error.message || 'Download failed',
      downloadUrl: null
    });
  }
};

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

checkYtDlp()
  .then(() => {
    console.log('yt-dlp is available');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error: yt-dlp is not available:', error.message);
    console.error('Please install yt-dlp first');
    process.exit(1);
  });
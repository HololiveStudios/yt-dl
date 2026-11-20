# YouTube Video Downloader Platform

A modern, full-stack web application for downloading YouTube videos and audio with support for multiple quality options, progressive web app features, and Docker containerization.

## Features

### Core Functionality
- **YouTube URL Validation**: Real-time URL validation with video preview
- **Multiple Quality Options**: 4K, Full HD, HD, SD, and audio-only formats
- **Real-time Progress**: Live download progress with queue management
- **Download History**: Complete history with thumbnails and status tracking
- **Error Handling**: User-friendly error messages and retry mechanisms

### Progressive Web App (PWA)
- **Offline Support**: Service worker for offline functionality
- **Installable**: Native app-like installation on devices
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Background Sync**: Failed downloads retry when connection restored

### Modern UI/UX
- **Dark/Light Theme**: Automatic theme detection with manual toggle
- **Glass Morphism**: Modern design with subtle transparency effects
- **Micro-interactions**: Smooth animations and hover states
- **Touch-friendly**: Optimized for mobile touch interactions

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Custom Hooks** for state management

### Backend
- **Node.js** with Express
- **yt-dlp** for video downloading
- **RESTful API** design
- **File serving** with progress tracking

### DevOps
- **Docker** containerization
- **Multi-stage builds** for optimization
- **Nginx** reverse proxy
- **Health checks** and monitoring

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd youtube-downloader
   ```

2. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001
   - Direct frontend: http://localhost:80

### Local Development

1. **Install frontend dependencies**
   ```bash
   npm install
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Install yt-dlp**
   ```bash
   pip install yt-dlp
   ```

4. **Start backend server**
   ```bash
   cd server
   npm run dev
   ```

5. **Start frontend development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### POST /api/validate
Validate YouTube URL and get video information.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Video Title",
    "thumbnail": "https://thumbnail-url.jpg",
    "duration": "3:45",
    "fileSize": "25.3 MB"
  }
}
```

### POST /api/download
Start a new download.

**Request:**
```json
{
  "id": "unique-download-id",
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "quality": "1080p",
  "format": "mp4"
}
```

### GET /api/status/:id
Get download progress and status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "downloading",
    "progress": 45,
    "downloadUrl": null
  }
}
```

### GET /api/history
Get download history (placeholder for future database integration).

## Quality Options

- **4K (2160p)**: Ultra HD MP4 format
- **Full HD (1080p)**: High definition MP4 format
- **HD (720p)**: Standard HD MP4 format
- **SD (480p)**: Standard definition MP4 format
- **Audio Only (MP3 320kbps)**: High quality audio
- **Audio Only (MP3 128kbps)**: Standard quality audio

## Docker Configuration

### Multi-stage Frontend Build
- **Build stage**: Compile React app with Vite
- **Production stage**: Serve with optimized Nginx

### Backend Container
- **Base**: Node.js 18 Alpine
- **Dependencies**: Python 3, yt-dlp, FFmpeg
- **Health checks**: Automatic container health monitoring
- **Volume mounts**: Persistent download storage

### Services Architecture
- **Frontend**: React app served by Nginx
- **Backend**: Node.js API server
- **Nginx**: Reverse proxy and static file serving
- **Volumes**: Shared download storage

## PWA Features

### Service Worker
- **Caching Strategy**: Cache-first for static assets
- **Background Sync**: Retry failed requests when online
- **Push Notifications**: Ready for future implementation

### Web App Manifest
- **Installation**: Add to home screen functionality
- **Theming**: Native theme color integration
- **Shortcuts**: Quick actions from app icon

### Install Prompt
- **Smart Detection**: Shows when installation criteria met
- **User Choice**: Respects user installation decisions
- **Cross-platform**: Works on desktop and mobile

## Development Scripts

```bash
# Frontend development
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run lint         # ESLint code checking
npm run preview      # Preview production build

# Backend development
cd server
npm run dev          # Start with nodemon
npm start            # Production start

# Docker commands
docker-compose up --build    # Build and run all services
docker-compose down         # Stop all services
docker-compose logs -f     # Follow logs
```

## Environment Configuration

### Development
Create `.env.local` for local overrides:
```env
VITE_API_URL=http://localhost:3001
```

### Production
Set environment variables in Docker Compose or deployment platform:
```env
NODE_ENV=production
PORT=3001
VITE_API_URL=https://your-api-domain.com
```

## Architecture Decisions

### State Management
- **Custom Hooks**: Lightweight alternative to Redux for this use case
- **Local State**: React useState for component-specific state
- **Context**: Theme management across components

### Styling Approach
- **Tailwind CSS**: Utility-first for rapid development
- **Custom Components**: Reusable UI components
- **Responsive Design**: Mobile-first approach

### Error Handling
- **Graceful Degradation**: App continues working with limited functionality
- **User Feedback**: Clear error messages and recovery suggestions
- **Retry Mechanisms**: Automatic retries for transient failures

## Security Considerations

- **Input Validation**: URL validation and sanitization
- **CORS Configuration**: Proper cross-origin resource sharing
- **Rate Limiting**: Prevent abuse (recommended for production)
- **File Serving**: Secure download URL generation
- **Headers**: Security headers via Helmet.js

## Performance Optimizations

### Frontend
- **Code Splitting**: Vendor and feature-based chunks
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Proper thumbnails and lazy loading
- **Caching**: Service worker caching strategies

### Backend
- **Streaming**: Large file download streaming
- **Compression**: Gzip compression for responses
- **Process Management**: Background download processing
- **Memory Management**: Cleanup of temporary files

## Deployment

### Docker Production
```bash
# Build optimized images
docker-compose -f docker-compose.prod.yml up --build

# Scale services
docker-compose up --scale backend=3
```

### Cloud Deployment
- **Container Orchestration**: Kubernetes manifests ready
- **Load Balancing**: Multiple backend instances
- **Persistent Storage**: Cloud storage for downloads
- **CDN Integration**: Static asset delivery

## Future Enhancements

### Planned Features
- **User Authentication**: Personal download history
- **Batch Downloads**: Multiple URLs at once
- **Playlist Support**: Full playlist downloading
- **Advanced Formats**: More video and audio options
- **Cloud Storage**: Direct upload to cloud services

### Technical Improvements
- **Database Integration**: PostgreSQL or MongoDB
- **Redis Caching**: Session and progress caching
- **WebSocket**: Real-time progress updates
- **Advanced Queuing**: Bull.js or similar queue system

## Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **yt-dlp**: Powerful YouTube downloading library
- **React Team**: Amazing frontend framework
- **Tailwind CSS**: Excellent utility-first CSS framework
- **Vite**: Lightning-fast build tool
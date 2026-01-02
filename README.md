# CourtVision

AI-powered basketball video analysis platform that uses computer vision and machine learning to provide automated shot tracking, player movement analysis, and AI-generated insights.

## Features

- **Video Upload & Management**: Simple drag-and-drop interface for uploading basketball game footage
- **Automated Computer Vision Analysis**:
  - Player detection and tracking using YOLOv8
  - Basketball detection and tracking
  - Shot detection and make/miss classification
  - Court zone detection
- **Visual Analysis Dashboard**:
  - Interactive shot chart showing shot locations
  - Zone-by-zone shooting percentage breakdown
  - Player movement heatmaps
  - Form analysis metrics
- **AI-Generated Insights**: Claude-powered natural language analysis with actionable recommendations

## Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- TailwindCSS for styling
- React Router for navigation
- React Dropzone for file uploads
- Recharts for data visualization

### Backend
- Python FastAPI
- OpenCV for video processing
- Ultralytics YOLOv8 for object detection
- Anthropic Claude API for AI insights

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- FFmpeg (for video processing)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run the server
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Project Structure

```
courtvision/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API calls
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx
│   └── package.json
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── models/       # Pydantic models
│   │   ├── services/     # Business logic
│   │   │   ├── detection.py
│   │   │   ├── analysis.py
│   │   │   └── insights.py
│   │   └── main.py
│   ├── data/             # Video storage
│   └── requirements.txt
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload video file |
| POST | `/api/process/{video_id}` | Start processing |
| GET | `/api/status/{job_id}` | Get processing status |
| GET | `/api/results/{video_id}` | Get analysis results |
| GET | `/api/export/{video_id}` | Export results (JSON/CSV) |
| GET | `/api/video/{video_id}/annotated` | Get annotated video |

## Usage

1. Open the application at http://localhost:3000
2. Click "Get Started" to navigate to the workspace
3. Drag and drop a basketball video (MP4, max 500MB)
4. Configure analysis settings if desired
5. Click "Start Analysis"
6. Wait for processing to complete
7. View results on the analysis dashboard

## Configuration Options

### Quick Settings
- **Analysis Type**: Full, Shots Only, Form Only, or Player Tracking
- **Court Detection**: Auto-detect, Manual marking, or Preset dimensions
- **Features**: Shot Chart, Make/Miss Rates, Form Analysis, Movement Patterns, Heatmaps

### Advanced Settings
- **Shot Detection Model**: YOLOv8, MediaPipe Pose, or Custom
- **Player Tracking**: Single Player, Multi-Player, or Team Analysis
- **Frame Processing**: Every Frame (Precise), Every 2 Frames (Balanced), Every 5 Frames (Fast)
- **Ball Tracking Confidence**: 50-95% threshold
- **Output Formats**: JSON, CSV, Annotated Video

## Built For

Alameda Hacks 2026 (January 1-11, 2026)

## License

MIT

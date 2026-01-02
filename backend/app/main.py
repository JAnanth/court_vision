import os
import uuid
import asyncio
from datetime import datetime
from typing import Dict
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
import aiofiles

from .models import (
    VideoUploadResponse,
    ProcessingRequest,
    ProcessingResponse,
    ProcessingStatus,
    ProcessingStep,
    AnalysisResults,
)
from .services.detection import DetectionService
from .services.analysis import AnalysisService
from .services.insights import InsightsService

app = FastAPI(
    title="CourtVision API",
    description="AI-powered basketball video analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data directories
DATA_DIR = Path(__file__).parent.parent / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
OUTPUTS_DIR = DATA_DIR / "outputs"

# Ensure directories exist
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

# In-memory storage for processing jobs (would use Redis in production)
processing_jobs: Dict[str, ProcessingStatus] = {}
analysis_results: Dict[str, AnalysisResults] = {}

# Services
detection_service = DetectionService()
analysis_service = AnalysisService()
insights_service = InsightsService()


@app.get("/")
async def root():
    return {"message": "CourtVision API", "status": "running"}


@app.post("/api/upload", response_model=VideoUploadResponse)
async def upload_video(file: UploadFile = File(...)):
    """Upload a video file for analysis"""

    # Validate file type
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")

    # Validate file size (500MB max)
    file_content = await file.read()
    if len(file_content) > 500 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 500MB")

    # Generate unique ID
    video_id = str(uuid.uuid4())[:8]

    # Create video directory
    video_dir = UPLOADS_DIR / video_id
    video_dir.mkdir(parents=True, exist_ok=True)

    # Save file
    file_path = video_dir / file.filename
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(file_content)

    return VideoUploadResponse(videoId=video_id, filename=file.filename)


@app.post("/api/process/{video_id}", response_model=ProcessingResponse)
async def start_processing(
    video_id: str,
    settings: ProcessingRequest,
    background_tasks: BackgroundTasks
):
    """Start processing a video"""

    # Check if video exists
    video_dir = UPLOADS_DIR / video_id
    if not video_dir.exists():
        raise HTTPException(status_code=404, detail="Video not found")

    # Find video file
    video_files = list(video_dir.glob("*.*"))
    if not video_files:
        raise HTTPException(status_code=404, detail="Video file not found")

    video_path = video_files[0]

    # Generate job ID
    job_id = str(uuid.uuid4())[:8]

    # Initialize job status
    processing_jobs[job_id] = ProcessingStatus(
        jobId=job_id,
        videoId=video_id,
        status="queued",
        progress=0,
        currentStep="Initializing",
        steps=[
            ProcessingStep(name="Video uploaded", status="complete"),
            ProcessingStep(name="Extracting frames", status="pending"),
            ProcessingStep(name="Detecting players & ball", status="pending"),
            ProcessingStep(name="Tracking movement", status="pending"),
            ProcessingStep(name="Analyzing shots", status="pending"),
            ProcessingStep(name="Generating insights", status="pending"),
        ],
        estimatedTimeRemaining=180,
    )

    # Start background processing
    background_tasks.add_task(
        process_video,
        job_id,
        video_id,
        str(video_path),
        settings.model_dump()
    )

    return ProcessingResponse(jobId=job_id)


async def process_video(job_id: str, video_id: str, video_path: str, settings: dict):
    """Background task to process video"""

    try:
        job = processing_jobs[job_id]
        job.status = "processing"

        # Step 1: Extract frames
        job.currentStep = "Extracting frames"
        job.steps[1].status = "active"
        job.progress = 10
        await asyncio.sleep(2)  # Simulate processing
        job.steps[1].status = "complete"

        # Step 2: Detection
        job.currentStep = "Detecting players & ball"
        job.steps[2].status = "active"
        job.progress = 25
        job.estimatedTimeRemaining = 150

        # Run detection
        detections = await detection_service.detect_objects(video_path, settings)
        job.steps[2].status = "complete"
        job.progress = 45

        # Step 3: Tracking
        job.currentStep = "Tracking movement"
        job.steps[3].status = "active"
        job.estimatedTimeRemaining = 100

        tracks = await detection_service.track_objects(detections)
        job.steps[3].status = "complete"
        job.progress = 60

        # Step 4: Shot analysis
        job.currentStep = "Analyzing shots"
        job.steps[4].status = "active"
        job.estimatedTimeRemaining = 60

        analysis = await analysis_service.analyze_shots(tracks, detections)
        job.steps[4].status = "complete"
        job.progress = 80

        # Step 5: Generate insights
        job.currentStep = "Generating insights"
        job.steps[5].status = "active"
        job.estimatedTimeRemaining = 30

        insights = await insights_service.generate_insights(analysis)
        job.steps[5].status = "complete"
        job.progress = 100

        # Store results
        video_name = Path(video_path).name
        analysis_results[video_id] = AnalysisResults(
            videoId=video_id,
            videoName=video_name,
            analyzedAt=datetime.now().isoformat(),
            statistics=analysis["statistics"],
            shots=analysis["shots"],
            zones=analysis["zones"],
            formMetrics=analysis["formMetrics"],
            insights=insights,
        )

        job.status = "completed"
        job.estimatedTimeRemaining = 0

    except Exception as e:
        processing_jobs[job_id].status = "failed"
        processing_jobs[job_id].error = str(e)
        raise


@app.get("/api/status/{job_id}", response_model=ProcessingStatus)
async def get_processing_status(job_id: str):
    """Get processing status for a job"""

    if job_id not in processing_jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    return processing_jobs[job_id]


@app.get("/api/results/{video_id}", response_model=AnalysisResults)
async def get_results(video_id: str):
    """Get analysis results for a video"""

    if video_id not in analysis_results:
        raise HTTPException(status_code=404, detail="Results not found")

    return analysis_results[video_id]


@app.get("/api/export/{video_id}")
async def export_results(video_id: str, format: str = "json"):
    """Export analysis results in various formats"""

    if video_id not in analysis_results:
        raise HTTPException(status_code=404, detail="Results not found")

    results = analysis_results[video_id]

    if format == "json":
        import json
        content = json.dumps(results.model_dump(), indent=2)
        return StreamingResponse(
            iter([content]),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=analysis-{video_id}.json"}
        )

    elif format == "csv":
        import csv
        import io

        output = io.StringIO()
        writer = csv.writer(output)

        # Write shots data
        writer.writerow(["Shot ID", "Frame", "X", "Y", "Outcome", "Zone", "Confidence", "Timestamp"])
        for shot in results.shots:
            writer.writerow([
                shot.id, shot.frame, shot.x, shot.y,
                shot.outcome, shot.zone, shot.confidence, shot.timestamp
            ])

        content = output.getvalue()
        return StreamingResponse(
            iter([content]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=analysis-{video_id}.csv"}
        )

    raise HTTPException(status_code=400, detail="Invalid format. Use 'json' or 'csv'")


@app.get("/api/video/{video_id}/annotated")
async def get_annotated_video(video_id: str):
    """Get annotated video with CV overlays"""

    annotated_path = OUTPUTS_DIR / video_id / "annotated.mp4"

    if not annotated_path.exists():
        # Return original video as fallback
        video_dir = UPLOADS_DIR / video_id
        video_files = list(video_dir.glob("*.*"))
        if video_files:
            return FileResponse(
                video_files[0],
                media_type="video/mp4",
                filename=f"annotated-{video_id}.mp4"
            )
        raise HTTPException(status_code=404, detail="Video not found")

    return FileResponse(
        annotated_path,
        media_type="video/mp4",
        filename=f"annotated-{video_id}.mp4"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

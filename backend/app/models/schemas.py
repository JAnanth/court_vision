from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime


class VideoUploadResponse(BaseModel):
    videoId: str
    filename: str


class AnalysisFeatures(BaseModel):
    shotChart: bool = True
    makeRate: bool = True
    formAnalysis: bool = True
    movement: bool = False
    heatmap: bool = False


class OutputFormats(BaseModel):
    json_format: bool = True
    csv_format: bool = True
    video_format: bool = False


class ProcessingRequest(BaseModel):
    analysisType: str = "full"
    courtDetection: str = "auto"
    features: AnalysisFeatures = AnalysisFeatures()
    shotDetectionModel: str = "yolov8"
    playerTracking: str = "single"
    calibrationSensitivity: int = 7
    frameProcessing: str = "balanced"
    ballTrackingConfidence: int = 75
    outputFormats: OutputFormats = OutputFormats()


class ProcessingResponse(BaseModel):
    jobId: str


class ProcessingStep(BaseModel):
    name: str
    status: Literal["pending", "active", "complete"]


class ProcessingStatus(BaseModel):
    jobId: str
    videoId: str
    status: Literal["queued", "processing", "completed", "failed"]
    progress: float
    currentStep: str
    steps: List[ProcessingStep]
    estimatedTimeRemaining: Optional[int] = None
    error: Optional[str] = None


class Shot(BaseModel):
    id: int
    frame: int
    x: float
    y: float
    outcome: Literal["make", "miss", "unknown"]
    zone: str
    confidence: float
    timestamp: float


class ZoneStats(BaseModel):
    name: str
    attempts: int
    makes: int
    percentage: float


class FormMetric(BaseModel):
    name: str
    score: str
    grade: Literal["high", "medium", "low"]
    description: str


class Insight(BaseModel):
    type: Literal["positive", "negative", "neutral"]
    icon: str
    title: str
    text: str


class Statistics(BaseModel):
    totalShots: int
    makes: int
    misses: int
    fieldGoalPercentage: float
    threePointPercentage: float
    hotZone: str
    avgReleaseTime: float


class AnalysisResults(BaseModel):
    videoId: str
    videoName: str
    analyzedAt: str
    statistics: Statistics
    shots: List[Shot]
    zones: List[ZoneStats]
    formMetrics: List[FormMetric]
    insights: List[Insight]
    annotatedVideoUrl: Optional[str] = None
    heatmapUrl: Optional[str] = None

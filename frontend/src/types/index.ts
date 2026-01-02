export interface VideoInfo {
  id: string;
  filename: string;
  size: number;
  duration?: number;
  uploadedAt: string;
}

export interface Shot {
  id: number;
  frame: number;
  x: number;
  y: number;
  outcome: 'make' | 'miss' | 'unknown';
  zone: string;
  confidence: number;
  timestamp: number;
}

export interface ZoneStats {
  name: string;
  attempts: number;
  makes: number;
  percentage: number;
}

export interface FormMetric {
  name: string;
  score: string;
  grade: 'high' | 'medium' | 'low';
  description: string;
}

export interface Insight {
  type: 'positive' | 'negative' | 'neutral';
  icon: string;
  title: string;
  text: string;
}

export interface AnalysisResults {
  videoId: string;
  videoName: string;
  analyzedAt: string;
  statistics: {
    totalShots: number;
    makes: number;
    misses: number;
    fieldGoalPercentage: number;
    threePointPercentage: number;
    hotZone: string;
    avgReleaseTime: number;
  };
  shots: Shot[];
  zones: ZoneStats[];
  formMetrics: FormMetric[];
  insights: Insight[];
  annotatedVideoUrl?: string;
  heatmapUrl?: string;
}

export interface ProcessingStatus {
  jobId: string;
  videoId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  steps: {
    name: string;
    status: 'pending' | 'active' | 'complete';
  }[];
  estimatedTimeRemaining?: number;
  error?: string;
}

export interface AnalysisSettings {
  analysisType: string;
  courtDetection: string;
  features: {
    shotChart: boolean;
    makeRate: boolean;
    formAnalysis: boolean;
    movement: boolean;
    heatmap: boolean;
  };
  shotDetectionModel: string;
  playerTracking: string;
  calibrationSensitivity: number;
  frameProcessing: string;
  ballTrackingConfidence: number;
  outputFormats: {
    json_format: boolean;
    csv_format: boolean;
    video_format: boolean;
  };
}

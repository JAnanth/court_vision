import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { AnalysisSettings } from '../types';

export default function WorkspacePage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<AnalysisSettings>({
    analysisType: 'full',
    courtDetection: 'auto',
    features: {
      shotChart: true,
      makeRate: true,
      formAnalysis: true,
      movement: false,
      heatmap: false,
    },
    shotDetectionModel: 'yolov8',
    playerTracking: 'single',
    calibrationSensitivity: 7,
    frameProcessing: 'balanced',
    ballTrackingConfidence: 75,
    outputFormats: {
      json_format: true,
      csv_format: true,
      video_format: false,
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    // Validate file
    if (!selectedFile.type.startsWith('video/')) {
      setError('Please upload a video file (MP4, MOV, AVI)');
      return;
    }

    if (selectedFile.size > 500 * 1024 * 1024) {
      setError('File size must be less than 500MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsUploading(true);

    try {
      const result = await api.uploadVideo(selectedFile, (progress) => {
        setUploadProgress(progress);
      });
      setVideoId(result.videoId);
    } catch (err) {
      setError('Failed to upload video. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleStartAnalysis = async () => {
    if (!videoId) return;

    setIsProcessing(true);
    try {
      const result = await api.startProcessing(videoId, settings);
      navigate(`/processing/${result.jobId}`);
    } catch (err) {
      setError('Failed to start analysis. Please try again.');
      console.error(err);
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-[1400px] mx-auto py-12 px-[5%]">
        <div className="mb-12">
          <h1 className="text-5xl font-black text-navy-dark mb-2 font-display uppercase tracking-tight">
            Upload & Analyze
          </h1>
          <p className="text-lg text-slate-500">
            Upload your basketball footage and customize your analysis pipeline
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Upload Section */}
          <div className="lg:col-span-2 bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-primary mb-6 font-display uppercase tracking-tight">
              Video Upload
            </h2>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-16 text-center transition-all cursor-pointer mb-6 ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : file
                  ? 'border-success bg-success/5'
                  : 'border-slate-300 bg-slate-50 hover:border-primary hover:bg-primary/5'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-5xl mb-4 text-primary">▲</div>
              <h3 className="text-xl font-bold text-navy-dark mb-2 font-display">
                {file ? file.name : 'Drop your video here'}
              </h3>
              <p className="text-slate-500 mb-6">
                {file ? formatFileSize(file.size) : 'or click to browse files'}
              </p>
              {!file && (
                <button className="bg-primary text-white px-6 py-3 rounded-md font-bold text-sm uppercase tracking-wider hover:bg-primary-dark transition-all">
                  Select Video File
                </button>
              )}
              {!file && (
                <p className="text-slate-400 text-sm mt-4">
                  Supported: MP4, MOV, AVI (Max 500MB)
                </p>
              )}
            </div>

            {isUploading && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {file && !isUploading && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="font-semibold text-primary mb-1">
                  ■ {file.name}
                </div>
                <div className="text-sm text-slate-500">
                  Size: {formatFileSize(file.size)}
                  {videoId && ' • Ready for analysis'}
                </div>
              </div>
            )}
          </div>

          {/* Quick Settings Panel */}
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm h-fit">
            <h2 className="text-xl font-bold text-primary mb-6 font-display uppercase tracking-tight">
              Quick Settings
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block font-semibold text-navy-dark text-sm mb-2">
                  Analysis Type
                </label>
                <select
                  value={settings.analysisType}
                  onChange={(e) => setSettings({ ...settings, analysisType: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="full">Full Analysis (Shots + Form + Movement)</option>
                  <option value="shots">Shot Analysis Only</option>
                  <option value="form">Form Analysis Only</option>
                  <option value="tracking">Player Tracking</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-navy-dark text-sm mb-2">
                  Court Detection
                </label>
                <select
                  value={settings.courtDetection}
                  onChange={(e) => setSettings({ ...settings, courtDetection: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="auto">Auto-detect court boundaries</option>
                  <option value="manual">Manual court marking</option>
                  <option value="preset">Use preset court dimensions</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-navy-dark text-sm mb-3">
                  Features to Extract
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'shotChart', label: 'Shot Chart' },
                    { key: 'makeRate', label: 'Make/Miss Rates' },
                    { key: 'formAnalysis', label: 'Shooting Form' },
                    { key: 'movement', label: 'Movement Patterns' },
                    { key: 'heatmap', label: 'Heat Maps' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.features[key as keyof typeof settings.features]}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            features: { ...settings.features, [key]: e.target.checked },
                          })
                        }
                        className="w-5 h-5 accent-primary"
                      />
                      <span className="text-slate-600">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartAnalysis}
                disabled={!videoId || isProcessing}
                className="w-full bg-primary text-white py-4 rounded-md font-bold uppercase tracking-wider hover:bg-primary-dark transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isProcessing ? 'Starting...' : 'Start Analysis'}
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-primary mb-2 font-display uppercase tracking-tight">
            Advanced Pipeline Configuration
          </h2>
          <p className="text-slate-500 mb-8">
            Fine-tune the computer vision models and analysis parameters
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h4 className="text-lg font-bold text-navy-dark mb-2 font-display">
                ▲ Shot Detection Model
              </h4>
              <p className="text-slate-500 text-sm mb-4">
                Choose the ML model for detecting shooting attempts
              </p>
              <select
                value={settings.shotDetectionModel}
                onChange={(e) => setSettings({ ...settings, shotDetectionModel: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="yolov8">YOLOv8 (Fast, Recommended)</option>
                <option value="mediapipe">MediaPipe Pose (Accurate)</option>
                <option value="custom">Custom Trained Model</option>
              </select>
              <span className="inline-block bg-primary/10 text-primary-dark px-3 py-1 rounded text-sm font-bold mt-3 uppercase tracking-wider border border-primary/20">
                Accuracy: 94%
              </span>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h4 className="text-lg font-bold text-navy-dark mb-2 font-display">
                ● Player Tracking
              </h4>
              <p className="text-slate-500 text-sm mb-4">
                Configure how players are detected and tracked
              </p>
              <select
                value={settings.playerTracking}
                onChange={(e) => setSettings({ ...settings, playerTracking: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="single">Single Player Focus</option>
                <option value="multi">Multi-Player Tracking</option>
                <option value="team">Team Analysis (5v5)</option>
              </select>
              <span className="inline-block bg-primary/10 text-primary-dark px-3 py-1 rounded text-sm font-bold mt-3 uppercase tracking-wider border border-primary/20">
                Real-time
              </span>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h4 className="text-lg font-bold text-navy-dark mb-2 font-display">
                ◆ Court Calibration
              </h4>
              <p className="text-slate-500 text-sm mb-4">
                Accuracy of court boundary detection
              </p>
              <input
                type="range"
                min="1"
                max="10"
                value={settings.calibrationSensitivity}
                onChange={(e) =>
                  setSettings({ ...settings, calibrationSensitivity: parseInt(e.target.value) })
                }
                className="w-full accent-primary"
              />
              <div className="text-center mt-2 font-semibold text-primary">
                Sensitivity: {settings.calibrationSensitivity}/10
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h4 className="text-lg font-bold text-navy-dark mb-2 font-display">
                ■ Frame Processing
              </h4>
              <p className="text-slate-500 text-sm mb-4">
                Balance between speed and accuracy
              </p>
              <select
                value={settings.frameProcessing}
                onChange={(e) => setSettings({ ...settings, frameProcessing: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="precise">Process Every Frame (Slow, Precise)</option>
                <option value="balanced">Every 2 Frames (Balanced)</option>
                <option value="fast">Every 5 Frames (Fast)</option>
              </select>
              <span className="inline-block bg-primary/10 text-primary-dark px-3 py-1 rounded text-sm font-bold mt-3 uppercase tracking-wider border border-primary/20">
                ~3 min processing
              </span>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h4 className="text-lg font-bold text-navy-dark mb-2 font-display">
                ◉ Ball Tracking Confidence
              </h4>
              <p className="text-slate-500 text-sm mb-4">
                Minimum confidence for ball detection
              </p>
              <input
                type="range"
                min="50"
                max="95"
                value={settings.ballTrackingConfidence}
                onChange={(e) =>
                  setSettings({ ...settings, ballTrackingConfidence: parseInt(e.target.value) })
                }
                className="w-full accent-primary"
              />
              <div className="text-center mt-2 font-semibold text-primary">
                Threshold: {settings.ballTrackingConfidence}%
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h4 className="text-lg font-bold text-navy-dark mb-2 font-display">
                ▶ Output Format
              </h4>
              <p className="text-slate-500 text-sm mb-4">
                Choose how to export analysis results
              </p>
              <div className="space-y-2 mt-4">
                {[
                  { key: 'json_format', label: 'JSON Data' },
                  { key: 'csv_format', label: 'CSV Export' },
                  { key: 'video_format', label: 'Annotated Video' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.outputFormats[key as keyof typeof settings.outputFormats]}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          outputFormats: { ...settings.outputFormats, [key]: e.target.checked },
                        })
                      }
                      className="w-5 h-5 accent-primary"
                    />
                    <span className="text-slate-600">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

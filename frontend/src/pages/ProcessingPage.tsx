import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { ProcessingStatus } from '../types';

export default function ProcessingPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const pollStatus = async () => {
      try {
        const result = await api.getProcessingStatus(jobId);
        setStatus(result);

        if (result.status === 'completed') {
          navigate(`/analysis/${result.videoId}`);
        } else if (result.status === 'failed') {
          setError(result.error || 'Processing failed. Please try again.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to get processing status.');
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [jobId, navigate]);

  const formatTime = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const defaultSteps = [
    { name: 'Video uploaded', status: 'complete' as const },
    { name: 'Extracting frames', status: 'complete' as const },
    { name: 'Detecting players & ball', status: 'active' as const },
    { name: 'Tracking movement', status: 'pending' as const },
    { name: 'Analyzing shots', status: 'pending' as const },
    { name: 'Generating insights', status: 'pending' as const },
  ];

  const steps = status?.steps || defaultSteps;
  const progress = status?.progress || 35;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-2xl mx-auto py-20 px-[5%]">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-navy-dark mb-4 font-display uppercase tracking-tight">
            Analyzing Your Video
          </h1>
          <p className="text-slate-500">
            Our AI is processing your footage. This typically takes 2-5 minutes.
          </p>
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8 text-center">
            <p className="font-medium">{error}</p>
            <button
              onClick={() => navigate('/workspace')}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-md font-bold text-sm hover:bg-red-700 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Processing Animation */}
            <div className="flex justify-center mb-12">
              <div className="relative w-48 h-48">
                {/* Orbiting rings */}
                <div className="absolute inset-4 border-2 border-slate-300 rounded-full animate-spin-slow border-t-primary" />
                <div
                  className="absolute inset-0 border-2 border-slate-200 rounded-full border-t-blue-500"
                  style={{ animation: 'spin 4s linear infinite' }}
                />
                {/* Basketball */}
                <div
                  className="absolute top-1/2 left-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/40"
                  style={{
                    animation: 'bounce 1.5s ease-in-out infinite',
                  }}
                />
              </div>
            </div>

            {/* Progress */}
            <div className="text-center mb-8">
              <div className="text-6xl font-black text-primary font-display mb-4">
                {progress}%
              </div>
              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-primary to-warning rounded-full relative transition-all duration-500"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
                </div>
              </div>
            </div>

            {/* Step List */}
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm mb-8">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-4 rounded-lg mb-2 transition-all ${
                    step.status === 'complete'
                      ? 'bg-success/10'
                      : step.status === 'active'
                      ? 'bg-primary/10'
                      : 'opacity-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold relative ${
                      step.status === 'complete'
                        ? 'bg-success'
                        : step.status === 'active'
                        ? 'bg-primary'
                        : 'bg-slate-300'
                    }`}
                  >
                    {step.status === 'complete' ? (
                      '✓'
                    ) : step.status === 'active' ? (
                      <>
                        <span>●</span>
                        <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping-slow" />
                      </>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`font-medium ${
                      step.status === 'pending' ? 'text-slate-400' : 'text-navy-dark'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Estimated Time */}
            <div className="text-center p-4 bg-slate-100 rounded-lg border border-slate-200">
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                Estimated Time Remaining
              </div>
              <div className="text-3xl font-bold text-primary font-display">
                {formatTime(status?.estimatedTimeRemaining || 180)}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-40px); }
        }
      `}</style>
    </div>
  );
}

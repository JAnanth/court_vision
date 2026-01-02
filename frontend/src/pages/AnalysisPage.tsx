import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ShotChart from '../components/ShotChart';
import { api } from '../services/api';
import { AnalysisResults, Shot, ZoneStats, FormMetric, Insight } from '../types';

// Mock data for demo
const mockShots: Shot[] = [
  { id: 1, frame: 100, x: 35, y: 25, outcome: 'make', zone: 'right-wing', confidence: 0.95, timestamp: 45 },
  { id: 2, frame: 200, x: 65, y: 30, outcome: 'make', zone: 'left-wing', confidence: 0.92, timestamp: 78 },
  { id: 3, frame: 300, x: 20, y: 45, outcome: 'make', zone: 'right-corner', confidence: 0.88, timestamp: 120 },
  { id: 4, frame: 400, x: 80, y: 45, outcome: 'make', zone: 'left-corner', confidence: 0.91, timestamp: 165 },
  { id: 5, frame: 500, x: 30, y: 60, outcome: 'make', zone: 'right-wing', confidence: 0.94, timestamp: 210 },
  { id: 6, frame: 600, x: 70, y: 60, outcome: 'make', zone: 'left-wing', confidence: 0.89, timestamp: 255 },
  { id: 7, frame: 700, x: 50, y: 70, outcome: 'make', zone: 'top-key', confidence: 0.96, timestamp: 300 },
  { id: 8, frame: 800, x: 50, y: 35, outcome: 'make', zone: 'paint', confidence: 0.97, timestamp: 345 },
  { id: 9, frame: 900, x: 40, y: 50, outcome: 'make', zone: 'mid-range', confidence: 0.93, timestamp: 390 },
  { id: 10, frame: 1000, x: 60, y: 50, outcome: 'make', zone: 'mid-range', confidence: 0.90, timestamp: 435 },
  { id: 11, frame: 1100, x: 75, y: 40, outcome: 'make', zone: 'left-wing', confidence: 0.87, timestamp: 480 },
  { id: 12, frame: 1200, x: 25, y: 55, outcome: 'make', zone: 'right-wing', confidence: 0.92, timestamp: 525 },
  { id: 13, frame: 1300, x: 45, y: 28, outcome: 'miss', zone: 'paint', confidence: 0.85, timestamp: 570 },
  { id: 14, frame: 1400, x: 55, y: 42, outcome: 'miss', zone: 'mid-range', confidence: 0.83, timestamp: 615 },
  { id: 15, frame: 1500, x: 50, y: 48, outcome: 'miss', zone: 'mid-range', confidence: 0.81, timestamp: 660 },
  { id: 16, frame: 1600, x: 45, y: 65, outcome: 'miss', zone: 'top-key', confidence: 0.79, timestamp: 705 },
  { id: 17, frame: 1700, x: 30, y: 38, outcome: 'miss', zone: 'right-wing', confidence: 0.84, timestamp: 750 },
  { id: 18, frame: 1800, x: 70, y: 52, outcome: 'miss', zone: 'left-wing', confidence: 0.82, timestamp: 795 },
  { id: 19, frame: 1900, x: 35, y: 75, outcome: 'miss', zone: 'right-corner', confidence: 0.77, timestamp: 840 },
  { id: 20, frame: 2000, x: 60, y: 33, outcome: 'miss', zone: 'paint', confidence: 0.80, timestamp: 885 },
];

const mockZones: ZoneStats[] = [
  { name: 'Right Wing', attempts: 11, makes: 8, percentage: 72.7 },
  { name: 'Top of Key', attempts: 9, makes: 6, percentage: 66.7 },
  { name: 'Left Wing', attempts: 11, makes: 6, percentage: 54.5 },
  { name: 'Paint', attempts: 8, makes: 4, percentage: 50.0 },
  { name: 'Corner 3', attempts: 8, makes: 3, percentage: 37.5 },
];

const mockFormMetrics: FormMetric[] = [
  { name: 'Elbow Alignment', score: 'A', grade: 'high', description: 'Excellent elbow positioning throughout shot motion. Maintained consistent 85-90° alignment on 89% of attempts.' },
  { name: 'Follow Through', score: 'A-', grade: 'high', description: 'Good extension and wrist snap. Slight improvement opportunity in holding follow-through position for 0.2s longer.' },
  { name: 'Shot Arc', score: 'B+', grade: 'medium', description: 'Average arc of 45° is optimal. Some variation on longer-range shots (38-42°) suggests leg drive inconsistency.' },
  { name: 'Balance', score: 'A', grade: 'high', description: 'Excellent base and weight distribution. Landing within 6 inches of takeoff spot on 92% of shots.' },
  { name: 'Release Point', score: 'B', grade: 'medium', description: 'Release height averaged 7.2ft. Consider raising release point by 2-3 inches for better defender clearance.' },
  { name: 'Jump Timing', score: 'C+', grade: 'low', description: 'Timing between catch and jump varies 0.3-0.8s. Work on rhythm drills to develop more consistent timing.' },
];

const mockInsights: Insight[] = [
  { type: 'positive', icon: '▲', title: 'Hot Streak Detected', text: 'You made 6 consecutive shots from the right wing between minutes 4-7. This zone shows consistent form and high confidence.' },
  { type: 'negative', icon: '▼', title: 'Corner 3 Struggles', text: 'Your corner 3-point percentage dropped 15% from last session. Consider practicing catch-and-shoot drills from this angle.' },
  { type: 'neutral', icon: '■', title: 'Volume Analysis', text: 'You attempted 47 total shots, up from 35 last session. Increased volume while maintaining 57% accuracy shows improved conditioning.' },
  { type: 'positive', icon: '●', title: 'Consistent Release', text: 'Your release time variance decreased by 0.11s. More consistent mechanics correlate with your improved shooting percentage.' },
];

export default function AnalysisPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [shotFilter, setShotFilter] = useState<'all' | 'makes' | 'misses'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (!videoId) return;

      try {
        const data = await api.getResults(videoId);
        setResults(data);
      } catch (err) {
        // Use mock data if API fails
        console.log('Using mock data for demo');
        setResults({
          videoId: videoId,
          videoName: 'practice_session_jan2.mp4',
          analyzedAt: new Date().toISOString(),
          statistics: {
            totalShots: 47,
            makes: 27,
            misses: 20,
            fieldGoalPercentage: 57.4,
            threePointPercentage: 41.7,
            hotZone: 'Right Wing',
            avgReleaseTime: 0.82,
          },
          shots: mockShots,
          zones: mockZones,
          formMetrics: mockFormMetrics,
          insights: mockInsights,
        });
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [videoId]);

  const handleExport = async () => {
    if (!videoId) return;
    try {
      const blob = await api.exportResults(videoId, 'json');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `courtvision-analysis-${videoId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      // Create mock export
      const data = JSON.stringify(results, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `courtvision-analysis-${videoId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-xl mx-auto py-20 px-[5%] text-center">
          <h1 className="text-3xl font-bold text-navy-dark mb-4">Analysis Not Found</h1>
          <p className="text-slate-500 mb-8">
            The analysis you're looking for doesn't exist or has expired.
          </p>
          <Link
            to="/workspace"
            className="bg-primary text-white px-6 py-3 rounded-md font-bold text-sm uppercase tracking-wider hover:bg-primary-dark transition-all inline-block"
          >
            Upload New Video
          </Link>
        </div>
      </div>
    );
  }

  const { statistics, shots, zones, formMetrics, insights } = results;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-[1600px] mx-auto py-8 px-[5%]">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-black text-navy-dark font-display uppercase tracking-tight">
              Analysis Results
            </h1>
            <p className="text-slate-500 mt-1">
              ■ {results.videoName} • Analyzed on {new Date(results.analyzedAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={handleExport}
            className="bg-primary text-white px-6 py-3 rounded-md font-bold text-sm uppercase tracking-wider hover:bg-primary-dark transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
          >
            Export Report
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Shots', value: statistics.totalShots, change: '+12 from last session' },
            { label: 'Field Goal %', value: `${statistics.fieldGoalPercentage}%`, change: '+8.2% improvement' },
            { label: '3-Point %', value: `${statistics.threePointPercentage}%`, change: '+5.1% improvement' },
            { label: 'Hot Zone', value: statistics.hotZone, change: '72.7% accuracy' },
            { label: 'Avg Release Time', value: `${statistics.avgReleaseTime}s`, change: '-0.04s slower', negative: true },
          ].map((stat, i) => (
            <div key={i} className="card-stagger bg-white p-6 rounded-lg border border-slate-200 border-l-4 border-l-primary shadow-sm">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                {stat.label}
              </div>
              <div className="text-3xl font-black text-navy-dark font-display tracking-tight">
                {stat.value}
              </div>
              <div className={`text-sm font-semibold mt-1 ${stat.negative ? 'text-error' : 'text-success'}`}>
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Shot Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary font-display uppercase tracking-tight">
                Shot Chart
              </h2>
              <div className="flex gap-2">
                {(['all', 'makes', 'misses'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setShotFilter(filter)}
                    className={`px-4 py-2 rounded text-sm font-semibold uppercase tracking-wide transition-all ${
                      shotFilter === filter
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {filter === 'all' ? 'All Shots' : filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-navy to-navy-dark rounded-lg p-8 flex items-center justify-center">
              <ShotChart shots={shots} filter={shotFilter} />
            </div>

            <div className="flex gap-8 justify-center mt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-success" />
                <span className="text-slate-500 font-semibold">Made Shot ({statistics.makes})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-error" />
                <span className="text-slate-500 font-semibold">Missed Shot ({statistics.misses})</span>
              </div>
            </div>
          </div>

          {/* Zone Analysis */}
          <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-primary mb-6 font-display uppercase tracking-tight">
              Zone Breakdown
            </h2>

            <div className="space-y-4">
              {zones.map((zone, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-navy-dark">{zone.name}</span>
                    <span className={`font-black text-lg font-display ${
                      zone.percentage >= 60 ? 'text-success' :
                      zone.percentage >= 45 ? 'text-warning' : 'text-error'
                    }`}>
                      {zone.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        zone.percentage >= 60 ? 'bg-gradient-to-r from-success to-emerald-400' :
                        zone.percentage >= 45 ? 'bg-gradient-to-r from-warning to-amber-400' :
                        'bg-gradient-to-r from-error to-red-400'
                      }`}
                      style={{ width: `${zone.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">
                    {zone.makes}/{zone.attempts} makes
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-primary mb-6 font-display uppercase tracking-tight">
            AI-Powered Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`p-6 rounded-lg border-l-4 ${
                  insight.type === 'positive'
                    ? 'bg-success/10 border-success'
                    : insight.type === 'negative'
                    ? 'bg-error/10 border-error'
                    : 'bg-warning/10 border-warning'
                }`}
              >
                <div className="text-xl mb-2">{insight.icon}</div>
                <h3 className="font-bold text-navy-dark mb-2 font-display">{insight.title}</h3>
                <p className="text-slate-600 leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form Analysis */}
        <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-primary mb-6 font-display uppercase tracking-tight">
            Form Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formMetrics.map((metric, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-navy-dark">{metric.name}</span>
                  <span className={`px-3 py-1 rounded text-sm font-black font-display ${
                    metric.grade === 'high' ? 'bg-success text-white' :
                    metric.grade === 'medium' ? 'bg-warning text-white' :
                    'bg-error text-white'
                  }`}>
                    {metric.score}
                  </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

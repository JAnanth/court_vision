import { useEffect, useRef } from 'react';
import { Shot } from '../types';

interface ShotChartProps {
  shots: Shot[];
  filter?: 'all' | 'makes' | 'misses';
  width?: number;
  height?: number;
}

export default function ShotChart({
  shots,
  filter = 'all',
  width = 600,
  height = 500
}: ShotChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const filteredShots = shots.filter(shot => {
    if (filter === 'all') return true;
    if (filter === 'makes') return shot.outcome === 'make';
    if (filter === 'misses') return shot.outcome === 'miss';
    return true;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, width, height);

    // Draw court lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;

    // Outer boundary
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Three-point line (arc)
    ctx.beginPath();
    ctx.arc(width / 2, 60, 200, 0, Math.PI);
    ctx.stroke();

    // Paint area
    const paintWidth = 160;
    const paintHeight = 190;
    ctx.strokeRect((width - paintWidth) / 2, 20, paintWidth, paintHeight);

    // Free throw circle
    ctx.beginPath();
    ctx.arc(width / 2, 20 + paintHeight, 60, 0, Math.PI);
    ctx.stroke();

    // Hoop
    ctx.beginPath();
    ctx.arc(width / 2, 45, 12, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff6b6b';
    ctx.fill();
    ctx.stroke();

    // Draw shots
    filteredShots.forEach(shot => {
      const x = (shot.x / 100) * (width - 40) + 20;
      const y = (shot.y / 100) * (height - 40) + 20;

      ctx.beginPath();
      ctx.arc(x, y, 9, 0, 2 * Math.PI);

      if (shot.outcome === 'make') {
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
      }
      ctx.shadowBlur = 15;
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 0;
      ctx.stroke();
    });
  }, [filteredShots, width, height, filter]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg"
    />
  );
}

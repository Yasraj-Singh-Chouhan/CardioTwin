import { useEffect, useRef } from 'react';

interface EcgOscilloscopeProps {
  heartRate?: number;
  isCrisis?: boolean;
  color?: string;
  height?: number;
  className?: string;
  showGrid?: boolean;
}

export function EcgOscilloscope({
  heartRate = 75,
  isCrisis = false,
  color,
  height = 96,
  className = '',
  showGrid = true,
}: EcgOscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 320);
    let h = (canvas.height = height);

    // Phosphor buffer history
    const wavePoints: number[] = new Array(width).fill(h / 2);
    let sweepX = 0;
    let t = 0;

    // Permanent authentic CCU Cath-Monitor Phosphor palette
    const strokeColor = color
      ? color
      : isCrisis
      ? '#ff334b' // High-alert CCU neon crimson
      : '#00f5d4'; // Standard clinical tonometry glowing neon cyan

    const render = () => {
      // Advance wave synthesis
      const beatPeriod = Math.max(40, Math.floor((60 / heartRate) * 120));
      const phase = t % beatPeriod;
      const normalizedPhase = phase / beatPeriod;

      let yVal = h / 2;

      // Realistic P-Q-R-S-T waveform calculation
      if (normalizedPhase > 0.15 && normalizedPhase < 0.25) {
        // P-wave (atrial depolarization)
        const pPhase = (normalizedPhase - 0.2) / 0.05;
        yVal -= Math.exp(-pPhase * pPhase * 4) * (h * 0.13);
      } else if (normalizedPhase >= 0.28 && normalizedPhase <= 0.3) {
        // Q-wave (small dip)
        yVal += h * 0.08;
      } else if (normalizedPhase > 0.3 && normalizedPhase < 0.34) {
        // R-wave (sharp systolic spike)
        const rPhase = (normalizedPhase - 0.32) / 0.02;
        yVal -= Math.exp(-rPhase * rPhase * 8) * (h * 0.42);
      } else if (normalizedPhase >= 0.34 && normalizedPhase <= 0.37) {
        // S-wave (deep dip)
        yVal += h * 0.16;
      } else if (normalizedPhase > 0.45 && normalizedPhase < 0.65) {
        // T-wave (ventricular repolarization)
        const tPhase = (normalizedPhase - 0.55) / 0.1;
        yVal -= Math.exp(-tPhase * tPhase * 3) * (h * 0.18);
      } else if (normalizedPhase > 0.7 && normalizedPhase < 0.85) {
        // Dicrotic notch reflection (tonometry wave)
        const dPhase = (normalizedPhase - 0.78) / 0.07;
        yVal -= Math.exp(-dPhase * dPhase * 4) * (h * 0.07);
      }

      // Add gentle baseline micro-jitter for organic realism
      yVal += (Math.random() - 0.5) * 1.5;

      wavePoints[sweepX] = yVal;

      // Permanent deep black CRT persistence trail
      ctx.fillStyle = 'rgba(6, 15, 20, 0.26)';
      ctx.fillRect(0, 0, width, h);

      // Draw faint tactical medical grid lines
      if (showGrid) {
        ctx.strokeStyle = 'rgba(0, 245, 212, 0.07)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < width; x += 24) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
        }
        for (let y = 0; y < h; y += 16) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      }

      // Erase gap right ahead of sweep bar
      const gapWidth = 14;
      for (let g = 0; g < gapWidth; g++) {
        const eraseIdx = (sweepX + g) % width;
        wavePoints[eraseIdx] = h / 2;
      }

      // Draw glowing ECG line
      ctx.shadowBlur = 10;
      ctx.shadowColor = strokeColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.2;
      ctx.lineJoin = 'round';
      ctx.beginPath();

      let started = false;
      for (let x = 0; x < width; x++) {
        const distToSweep = (sweepX - x + width) % width;
        if (distToSweep < gapWidth) continue;

        if (!started) {
          ctx.moveTo(x, wavePoints[x]);
          started = true;
        } else {
          ctx.lineTo(x, wavePoints[x]);
        }
      }
      ctx.stroke();

      // Draw sweeping scanner phosphor bar
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sweepX, 0, 2, h);

      // Sweep head dot
      ctx.beginPath();
      ctx.arc(sweepX, wavePoints[sweepX], 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Reset shadow blur
      ctx.shadowBlur = 0;

      sweepX = (sweepX + 2) % width;
      t++;
      animId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      h = canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [heartRate, isCrisis, color, height, showGrid]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-teal-500/25 bg-[#061014] shadow-md text-white ${className}`}
      style={{
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6), 0 4px 14px -3px rgba(0,0,0,0.25)',
      }}
    >
      <canvas ref={canvasRef} className="block w-full" style={{ height: `${height}px` }} />

      {/* Top Telemetry Overlay */}
      <div className="absolute top-2 left-3 flex items-center gap-2 pointer-events-none">
        <span
          className="w-2 h-2 rounded-full animate-ping"
          style={{ backgroundColor: isCrisis ? '#ff334b' : '#00f5d4' }}
        />
        <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-teal-300 drop-shadow-xs">
          LEAD II • CONTINUOUS TONOMETRY 100Hz
        </span>
      </div>

      <div className="absolute top-2 right-3 font-mono text-[11px] font-bold pointer-events-none text-white/95">
        <span className="text-teal-300">{heartRate}</span>{' '}
        <span className="text-xs text-teal-100/60 font-medium">BPM</span>
      </div>

      {/* Bottom Clinical Calipers Bar */}
      <div className="absolute bottom-1.5 left-3 right-3 flex items-center justify-between text-[9px] font-mono pointer-events-none border-t border-teal-500/15 pt-1 text-teal-300/80">
        <span>
          PR: <strong className="text-white font-semibold">158 ms</strong>
        </span>
        <span>
          QRS: <strong className="text-white font-semibold">86 ms</strong>
        </span>
        <span>
          QTc: <strong className="text-white font-semibold">414 ms</strong>
        </span>
        <span>
          Augmentation Index (AIx): <strong className="text-amber-300 font-semibold">32%</strong>
        </span>
        <span className="hidden sm:inline">
          Buckberg SEVR: <strong className="text-emerald-300 font-semibold">142%</strong>
        </span>
      </div>
    </div>
  );
}

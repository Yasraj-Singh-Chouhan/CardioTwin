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

    // Determine color
    const strokeColor = color
      ? color
      : isCrisis
      ? '#ff2a6d'
      : '#00f5d4'; // Glowing neon cyan / crimson

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
        yVal -= Math.exp(-pPhase * pPhase * 4) * (h * 0.12);
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

      // Clear with dark persistence trail
      ctx.fillStyle = 'rgba(7, 19, 23, 0.25)';
      ctx.fillRect(0, 0, width, h);

      // Draw faint tactical medical grid lines
      if (showGrid) {
        ctx.strokeStyle = 'rgba(0, 245, 212, 0.06)';
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
      const gapWidth = 12;
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
    <div className={`relative overflow-hidden rounded-2xl border border-[#00666f]/20 bg-[#071317] shadow-inner ${className}`}>
      <canvas ref={canvasRef} className="block w-full" style={{ height: `${height}px` }} />

      {/* Top Telemetry Overlay */}
      <div className="absolute top-2 left-3 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: isCrisis ? '#ff2a6d' : '#00f5d4' }} />
        <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-teal-400">
          LEAD II • CONTINUOUS TONOMETRY 100Hz
        </span>
      </div>

      <div className="absolute top-2 right-3 font-mono text-[11px] font-bold text-white/90 pointer-events-none">
        <span className="text-teal-400">{heartRate}</span> <span className="text-xs text-white/50">BPM</span>
      </div>

      {/* Bottom Clinical Calipers Bar */}
      <div className="absolute bottom-1.5 left-3 right-3 flex items-center justify-between text-[9px] font-mono text-teal-300/80 pointer-events-none border-t border-teal-500/10 pt-1">
        <span>PR: <strong className="text-white">158 ms</strong></span>
        <span>QRS: <strong className="text-white">86 ms</strong></span>
        <span>QTc: <strong className="text-white">414 ms</strong></span>
        <span>Augmentation Index (AIx): <strong className="text-amber-300">32%</strong></span>
        <span className="hidden sm:inline">Buckberg SEVR: <strong className="text-emerald-300">142%</strong></span>
      </div>
    </div>
  );
}

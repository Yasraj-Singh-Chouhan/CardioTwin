import { useEffect, useRef } from 'react';
import { Play, Pause, Heart, Gauge, FastForward } from 'lucide-react';
import type { PlaybackSpeed } from '../hooks/useReplay';
import { useAudioTelemetry } from '../hooks/useAudioTelemetry';

interface ReplayControlsBarProps {
  isPlaying: boolean;
  speed: PlaybackSpeed;
  isConnected: boolean;
  clockDisplay: string;
  onTogglePlay: () => void;
  onChangeSpeed: (speed: PlaybackSpeed) => void;
  liveSbp: number;
  liveDbp: number;
  liveHr: number;
}

const SPEEDS: PlaybackSpeed[] = ['1x', '5x', '10x', '20x', '60x'];

export function ReplayControlsBar({
  isPlaying,
  speed,
  isConnected,
  clockDisplay,
  onTogglePlay,
  onChangeSpeed,
  liveSbp,
  liveDbp,
  liveHr,
}: ReplayControlsBarProps) {
  const { triggerCardiacBeep, isMuted } = useAudioTelemetry();
  const prevSbpRef = useRef(liveSbp);

  // Trigger subtle audio telemetry chime on heart rate update if playing
  useEffect(() => {
    if (isPlaying && !isMuted) {
      triggerCardiacBeep(liveSbp, liveSbp >= 165 ? 85 : 35);
    }
    prevSbpRef.current = liveSbp;
  }, [liveSbp, isPlaying, isMuted, triggerCardiacBeep]);

  const isCriticalBP = liveSbp >= 165;
  const isElevatedBP = liveSbp >= 140;

  return (
    <div className="w-full px-4 py-2 rounded-xl flex flex-wrap items-center justify-between gap-3 glass-card border border-white/80 shadow-2xs">
      {/* Left: Play/Pause and Timeline clock */}
      <div className="flex items-center gap-3">
        <button
          onClick={onTogglePlay}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all shadow-xs active:scale-95 ${
            isPlaying
              ? 'bg-gradient-to-r from-teal-700 to-teal-800 text-white hover:brightness-110'
              : 'bg-white text-teal-800 hover:bg-teal-50 border border-slate-200'
          }`}
          type="button"
          title={isPlaying ? 'Pause in silico replay' : 'Resume in silico replay'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
              Replay Engine
            </span>
            <span className="flex items-center gap-1 text-[9.5px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 font-mono border border-emerald-200/60">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-600' : 'bg-teal-600 animate-ping'}`} />
              {isConnected ? 'TELEMETRY LIVE' : 'SYNTHETIC'}
            </span>
          </div>
          <span className="text-[13px] font-mono font-bold text-slate-900 leading-none mt-0.5">
            {clockDisplay}
          </span>
        </div>
      </div>

      {/* Center: Live streaming vitals tick with cardiac pulse */}
      <div className="flex items-center gap-4 bg-white/90 px-3.5 py-1 rounded-lg border border-slate-200/70 shadow-2xs">
        {/* Blood Pressure */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider leading-none">Aortic BP</span>
          <span
            className={`text-[15px] font-mono font-bold leading-tight mt-0.5 tabular-nums ${
              isCriticalBP ? 'text-red-700 animate-pulse' : isElevatedBP ? 'text-amber-800' : 'text-slate-900'
            }`}
          >
            {liveSbp}/{liveDbp} <span className="text-[9.5px] font-medium text-slate-500">mmHg</span>
          </span>
        </div>

        <div className="w-px h-6 bg-slate-200" />

        {/* Heart Rate */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1 leading-none">
            <Heart className="w-2.5 h-2.5 text-teal-700 fill-teal-700 animate-pulse" />
            Pulse
          </span>
          <span className="text-[15px] font-mono font-bold text-teal-800 leading-tight mt-0.5 tabular-nums">
            {liveHr} <span className="text-[9.5px] font-medium text-slate-500">bpm</span>
          </span>
        </div>

        <div className="w-px h-6 bg-slate-200" />

        {/* MAP */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1 leading-none">
            <Gauge className="w-2.5 h-2.5 text-slate-500" />
            Calc MAP
          </span>
          <span className="text-[15px] font-mono font-bold text-slate-900 leading-tight mt-0.5 tabular-nums">
            {Math.round(liveDbp + (liveSbp - liveDbp) / 3)} <span className="text-[9.5px] font-medium text-slate-500">mmHg</span>
          </span>
        </div>
      </div>

      {/* Right: Speed controls */}
      <div className="flex items-center gap-2">
        <span className="text-[10.5px] font-semibold text-slate-600 flex items-center gap-1">
          <FastForward className="w-3 h-3 text-slate-500" />
          Rate:
        </span>
        <div className="flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-2 py-0.5 rounded-md text-[10.5px] font-mono font-bold transition-all ${
                speed === s
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

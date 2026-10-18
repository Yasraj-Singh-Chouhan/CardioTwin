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
    <div className="w-full p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 glass-card border border-white/80">
      {/* Left: Play/Pause and Timeline clock */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onTogglePlay}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 ${
            isPlaying
              ? 'bg-gradient-to-r from-[#00666f] to-[#00818c] text-white hover:brightness-110'
              : 'bg-white text-[#00666f] hover:bg-[#e2f1ef] border border-gray-200'
          }`}
          type="button"
          title={isPlaying ? 'Pause in silico replay' : 'Resume in silico replay'}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00666f] flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#00666f] animate-pulse" />
              In Silico Replay Engine
            </span>
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#2FBF9B]/15 text-[#196C57] font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#196C57]' : 'bg-[#00666f] animate-ping'}`} />
              {isConnected ? 'TELEMETRY LIVE' : 'SYNTHETIC BUFFER'}
            </span>
          </div>
          <span className="text-[14px] font-mono font-bold text-[#111e1d] mt-0.5">
            {clockDisplay}
          </span>
        </div>
      </div>

      {/* Center: Live streaming vitals tick with cardiac pulse */}
      <div className="flex items-center gap-5 bg-white/85 px-5 py-2.5 rounded-xl border border-white/90 shadow-2xs">
        {/* Blood Pressure */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-[#445f73] uppercase font-bold tracking-wider">Aortic BP</span>
          <span
            className={`text-[17px] font-mono font-bold leading-tight ${
              isCriticalBP ? 'text-[#ba1a1a] animate-pulse' : isElevatedBP ? 'text-[#b25e00]' : 'text-[#111e1d]'
            }`}
          >
            {liveSbp}/{liveDbp} <span className="text-[10px] font-medium text-[#445f73]">mmHg</span>
          </span>
        </div>

        <div className="w-px h-8 bg-gray-200" />

        {/* Heart Rate */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-[#445f73] uppercase font-bold tracking-wider flex items-center gap-1">
            <Heart className="w-3 h-3 text-[#00666f] fill-[#00666f] animate-pulse" />
            Pulse
          </span>
          <span className="text-[17px] font-mono font-bold text-[#00666f] leading-tight">
            {liveHr} <span className="text-[10px] font-medium text-[#445f73]">bpm</span>
          </span>
        </div>

        <div className="w-px h-8 bg-gray-200" />

        {/* MAP */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-[#445f73] uppercase font-bold tracking-wider flex items-center gap-1">
            <Gauge className="w-3 h-3 text-[#445f73]" />
            Calc MAP
          </span>
          <span className="text-[17px] font-mono font-bold text-[#111e1d] leading-tight">
            {Math.round(liveDbp + (liveSbp - liveDbp) / 3)} <span className="text-[10px] font-medium text-[#445f73]">mmHg</span>
          </span>
        </div>
      </div>

      {/* Right: Speed controls */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-[#445f73] flex items-center gap-1">
          <FastForward className="w-3.5 h-3.5" />
          Compression:
        </span>
        <div className="flex items-center gap-1 bg-white/60 p-1 rounded-xl border border-white/80">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                speed === s
                  ? 'bg-[#00666f] text-white shadow-xs'
                  : 'text-[#445f73] hover:text-[#111e1d] hover:bg-white/80'
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

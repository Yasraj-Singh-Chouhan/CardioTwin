import { useState, useEffect, useRef, useCallback } from 'react';

export type PlaybackSpeed = '1x' | '5x' | '10x' | '20x' | '60x';

export interface TelemetryTick {
  timestamp: string;
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  hrv_rmssd: number;
  fused_risk_score: number;
  tdi_score: number;
  is_crisis: boolean;
  clock_display: string;
}

export interface UseReplayOptions {
  patientId: string;
  initialSpeed?: PlaybackSpeed;
  autoPlay?: boolean;
}

const SPEED_MULTIPLIERS: Record<PlaybackSpeed, number> = {
  '1x': 1,
  '5x': 5,
  '10x': 10,
  '20x': 20,
  '60x': 60,
};

export function useReplay({ patientId, initialSpeed = '10x', autoPlay = true }: UseReplayOptions) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState<PlaybackSpeed>(initialSpeed);
  const [isConnected, setIsConnected] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(252); // ~4.2h baseline

  // Live telemetry state for digital twin
  const [liveTelemetry, setLiveTelemetry] = useState<TelemetryTick>({
    timestamp: new Date().toISOString(),
    heart_rate: 78,
    systolic_bp: 154,
    diastolic_bp: 98,
    hrv_rmssd: 18,
    fused_risk_score: 84,
    tdi_score: 41,
    is_crisis: true,
    clock_display: 'T+04:12:00 (Past 24h)',
  });

  const wsRef = useRef<WebSocket | null>(null);

  // Attempt real WebSocket connection to /api/ws/patients/:id
  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = import.meta.env.VITE_WS_URL || `${window.location.hostname}:8000`;
    const wsUrl = `${wsProtocol}//${wsHost}/api/ws/patients/${patientId}`;

    let socket: WebSocket | null = null;
    let fallbackTimer: number | null = null;

    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        socket?.send(JSON.stringify({ action: isPlaying ? 'play' : 'pause', speed }));
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'telemetry_tick' || payload.systolic_bp) {
            const fusedRisk = payload.fused_risk_score ?? payload.current_risk_score ?? payload.risk_score;
            setLiveTelemetry(prev => ({
              ...prev,
              ...payload,
              fused_risk_score: fusedRisk !== undefined ? Number(fusedRisk) : prev.fused_risk_score,
            }));
          }
        } catch {
          // ignore non-json
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
      };

      socket.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

    return () => {
      if (socket) socket.close();
      if (fallbackTimer) clearInterval(fallbackTimer);
    };
  }, [patientId]);

  // High-fidelity fallback simulated playback loop if WS is offline or during replay mode
  useEffect(() => {
    if (!isPlaying) return;
    if (isConnected) return; // When real WebSocket is active, let real WS drive liveTelemetry!


    const intervalMs = Math.max(100, Math.round(1000 / SPEED_MULTIPLIERS[speed]));

    const timer = setInterval(() => {
      setElapsedMinutes(prev => {
        const next = (prev + 1) % 1440; // 24h rolling loop
        const hours = Math.floor(next / 60);
        const mins = next % 60;
        const clock = `T+${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00 (Past 24h)`;

        // Sinusoidal physiological circadian rhythm + drift
        const phase = (next / 1440) * Math.PI * 2;
        const hr = Math.round(68 + Math.sin(phase) * 12 + (next > 240 ? 4 : 0));
        const sbp = Math.round(148 + Math.sin(phase) * 18 + (next > 300 ? 16 : 0));
        const dbp = Math.round(90 + Math.sin(phase) * 10 + (next > 300 ? 8 : 0));
        const rmssd = Math.max(12, Math.round(28 - Math.sin(phase) * 8 - (next > 300 ? 6 : 0)));
        const risk = Math.min(96, Math.max(30, Math.round(60 + (sbp - 140) * 1.1)));
        const tdi = Math.min(80, Math.max(12, Math.round(20 + (sbp - 140) * 0.8)));

        setLiveTelemetry({
          timestamp: new Date().toISOString(),
          heart_rate: hr,
          systolic_bp: sbp,
          diastolic_bp: dbp,
          hrv_rmssd: rmssd,
          fused_risk_score: risk,
          tdi_score: tdi,
          is_crisis: sbp >= 180 || dbp >= 120,
          clock_display: clock,
        });

        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speed, isConnected]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => {
      const next = !prev;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: next ? 'play' : 'pause', speed }));
      }
      return next;
    });
  }, [speed]);

  const changeSpeed = useCallback((newSpeed: PlaybackSpeed) => {
    setSpeed(newSpeed);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'set_speed', speed: newSpeed }));
    }
  }, []);

  const seek = useCallback((minute: number) => {
    setElapsedMinutes(minute);
  }, []);

  return {
    isPlaying,
    speed,
    isConnected,
    liveTelemetry,
    elapsedMinutes,
    togglePlay,
    changeSpeed,
    seek,
  };
}

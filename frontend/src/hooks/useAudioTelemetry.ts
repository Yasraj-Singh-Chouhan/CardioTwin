import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudioTelemetry() {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem('cardiotwin-audio-muted');
    return saved === 'false' ? false : true; // Default muted so no autoplay block, but 1-click unmute
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem('cardiotwin-audio-muted', String(isMuted));
  }, [isMuted]);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (!next) {
        initAudio();
      }
      return next;
    });
  }, [initAudio]);

  const triggerCardiacBeep = useCallback((sbp = 120, riskScore = 30) => {
    if (isMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Frequency modulates with physiological crisis
      let freq = 540; // normal physiological pitch
      let duration = 0.08;

      if (sbp >= 160 || riskScore >= 75) {
        freq = 880; // Hypertensive crisis pitch (urgent)
        duration = 0.12;
      } else if (sbp >= 140 || riskScore >= 50) {
        freq = 680; // Pre-crisis pitch
        duration = 0.09;
      }

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.15, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // AudioContext could be pending or blocked
    }
  }, [isMuted, initAudio]);

  return {
    isMuted,
    toggleMute,
    triggerCardiacBeep,
  };
}

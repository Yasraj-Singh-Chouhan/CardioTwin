// Real-Time Cross-Tab Telemetry Broadcast Bus
const CHANNEL_NAME = 'cardiotwin_realtime_telemetry_bus';

const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel(CHANNEL_NAME)
  : null;

export type TelemetryActionType =
  | 'ALERT_ACKNOWLEDGED'
  | 'ALERT_ESCALATED'
  | 'ALERT_RESET'
  | 'TWIN_CALIBRATED'
  | 'VITALS_UPDATE';

export interface TelemetryBusEvent {
  type: TelemetryActionType;
  patientId: string;
  alertId?: string;
  protocol?: string;
  timestamp: string;
  operator?: string;
}

export function broadcastTelemetryAction(event: TelemetryBusEvent) {
  // 1. Post to BroadcastChannel (for modern cross-tab sync)
  if (channel) {
    try {
      channel.postMessage(event);
    } catch {
      // Ignore
    }
  }

  // 2. Storage event fallback (100% reliable across all browsers and windows)
  try {
    localStorage.setItem('cardiotwin_telemetry_event', JSON.stringify({ ...event, _rnd: Math.random() }));
  } catch {
    // Ignore
  }

  // 3. Local CustomEvent for the active tab itself
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cardiotwin_telemetry_sync', { detail: event }));
  }
}

export function subscribeTelemetrySync(callback: (event: TelemetryBusEvent) => void) {
  if (typeof window === 'undefined') return () => {};

  const handleBroadcast = (e: MessageEvent) => {
    if (e.data && e.data.type) {
      callback(e.data);
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'cardiotwin_telemetry_event' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        callback(parsed);
      } catch {
        // Ignore
      }
    }
  };

  const handleLocal = (e: Event) => {
    const custom = e as CustomEvent<TelemetryBusEvent>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  channel?.addEventListener('message', handleBroadcast);
  window.addEventListener('storage', handleStorage);
  window.addEventListener('cardiotwin_telemetry_sync', handleLocal);

  return () => {
    channel?.removeEventListener('message', handleBroadcast);
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('cardiotwin_telemetry_sync', handleLocal);
  };
}

interface GlassSkeletonProps {
  className?: string;
  lines?: number;
}

export function GlassSkeleton({ className = '', lines = 3 }: GlassSkeletonProps) {
  return (
    <div
      className={`rounded-[20px] p-6 animate-pulse ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px -4px rgba(11,42,60,0.05)',
      }}
    >
      <div className="h-6 bg-[#dcebe9] rounded-lg w-1/3 mb-4"></div>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-[#e2f1ef] rounded-md"
            style={{ width: `${85 - i * 15}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
}

interface GlassErrorProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function GlassError({ message = 'Unable to fetch real-time telemetry from digital twin stream.', onRetry, className = '' }: GlassErrorProps) {
  return (
    <div
      className={`rounded-[20px] p-6 flex flex-col items-center justify-center text-center ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.60)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px -4px rgba(186,26,26,0.08)',
        border: '1px solid rgba(186,26,26,0.2)',
      }}
    >
      <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#ba1a1a] flex items-center justify-center mb-3 shadow-sm">
        <span className="material-symbols-outlined text-[26px]">error</span>
      </div>
      <h3 className="text-[16px] font-bold text-[#111e1d] mb-1">Telemetry Disconnect</h3>
      <p className="text-[13px] text-[#445f73] max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#00666f] hover:bg-[#00818c] transition-all shadow-[0_4px_16px_rgba(14,154,167,0.30)] flex items-center gap-1.5"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Retry Telemetry Query
        </button>
      )}
    </div>
  );
}

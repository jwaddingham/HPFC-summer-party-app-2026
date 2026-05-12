export interface StatusPillProps {
  status: 'live' | 'complete' | 'final' | 'upcoming';
}

export function StatusPill({ status }: StatusPillProps) {
  const statusConfig = {
    live: {
      bg: 'bg-red-100 border-blood',
      text: 'text-blood',
      label: 'LIVE',
      pulse: 'animate-pulse'
    },
    final: {
      bg: 'bg-gold/20 border-gold',
      text: 'text-gold',
      label: 'FINAL',
      pulse: ''
    },
    complete: {
      bg: 'bg-gray-200 border-gray-400',
      text: 'text-gray-700',
      label: 'COMPLETE',
      pulse: ''
    },
    upcoming: {
      bg: 'bg-chalk border-ink',
      text: 'text-ink',
      label: 'UPCOMING',
      pulse: ''
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-1.5 border-2 px-2 py-1 font-bold text-xs uppercase tracking-widest ${config.bg} ${config.text}`}>
      {status === 'live' && <div className={`w-1.5 h-1.5 rounded-full ${config.text} bg-current ${config.pulse}`} />}
      {config.label}
    </div>
  );
}

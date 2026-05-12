import React from 'react';
type Status = 'live' | 'group' | 'semi' | 'final' | 'complete' | 'upcoming';
export function StatusPill({
  status,
  className = ''



}: {status: Status;className?: string;}) {
  const styles = {
    live: 'bg-blood text-white border-blood animate-pulse',
    group: 'bg-ink text-white border-ink',
    semi: 'bg-sky text-white border-sky',
    final: 'bg-gold text-ink border-gold',
    complete: 'bg-gray-200 text-gray-600 border-gray-300',
    upcoming: 'bg-chalk text-ink border-ink border-dashed'
  };
  const labels = {
    live: 'LIVE',
    group: 'GROUP STAGE',
    semi: 'SEMI-FINALS',
    final: 'FINAL',
    complete: 'COMPLETE',
    upcoming: 'UPCOMING'
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-bold font-sans tracking-wider uppercase border rounded-sm ${styles[status]} ${className}`}>
      
      {status === 'live' &&
      <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-ping" />
      }
      {labels[status]}
    </span>);

}
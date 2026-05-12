export function HPFCBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="currentColor">
      {/* Simplified HPFC badge - shield with star */}
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B11226" />
          <stop offset="100%" stopColor="#8B0A1F" />
        </linearGradient>
      </defs>
      {/* Shield background */}
      <path
        d="M 100 20 L 160 50 L 160 120 Q 100 170 100 170 Q 100 170 40 120 L 40 50 Z"
        fill="url(#shieldGrad)"
      />
      {/* Star */}
      <path
        d="M 100 70 L 110 95 L 135 95 L 115 110 L 125 135 L 100 120 L 75 135 L 85 110 L 65 95 L 90 95 Z"
        fill="white"
      />
    </svg>
  );
}

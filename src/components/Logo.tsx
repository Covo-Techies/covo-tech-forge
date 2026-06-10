interface LogoProps {
  showWordmark?: boolean;
  className?: string;
}

let gradientCounter = 0;

export default function Logo({ showWordmark = true, className = '' }: LogoProps) {
  const gradId = `covo-logo-grad-${++gradientCounter}`;
  const highlightId = `covo-logo-hl-${gradientCounter}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="COVO TECH"
        role="img"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#5B21B6" />
          </linearGradient>
          <linearGradient id={highlightId} x1="0" y1="0" x2="0" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx="10" fill={`url(#${gradId})`} />
        <rect width="36" height="36" rx="10" fill={`url(#${highlightId})`} />
        {/* Geometric C — open ring with squared terminals */}
        <path
          d="M26 11.5 H15.5 a5.5 5.5 0 0 0 -5.5 5.5 v2 a5.5 5.5 0 0 0 5.5 5.5 H26"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="square"
          fill="none"
        />
        {/* Lightning bolt accent inside the C opening */}
        <path
          d="M22 14.5 L19 18.5 H21 L19.5 22"
          stroke="#ffffff"
          strokeOpacity="0.65"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showWordmark && (
        <span
          className="text-[18px] leading-none whitespace-nowrap"
          style={{ fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.05em' }}
        >
          <span className="font-bold text-[#1a1a2e] dark:text-white">COVO</span>
          <span className="font-normal text-[#7C3AED] ml-1">TECH</span>
        </span>
      )}
    </div>
  );
}

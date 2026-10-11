// Hand-drawn style SVG decorations used across the landing page.

type DoodleProps = { className?: string };

export function Logo({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#F6B93B" />
      <path d="M8 31c5-6 10-6 16 0s11 6 16 0v6a16 16 0 0 1-32 0z" fill="#8DB596" />
      <circle cx="18" cy="20" r="2.4" fill="#2E2A3B" />
      <circle cx="30" cy="20" r="2.4" fill="#2E2A3B" />
      <path d="M18 26c3 3 9 3 12 0" stroke="#2E2A3B" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Scribble({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 300 24" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path
        d="M4 16c40-9 80-12 120-9s86 6 120 0 40-6 52-3M30 20c50-6 120-8 200-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Sparkle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 1c1 6 5 10 11 11-6 1-10 5-11 11-1-6-5-10-11-11 6-1 10-5 11-11z" fill="currentColor" />
    </svg>
  );
}

export function Squiggle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 20" className={className} aria-hidden="true">
      <path
        d="M2 10c10-12 20 12 30 0s20 12 30 0 20 12 30 0 16 8 26 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wave({ className, flip }: DoodleProps & { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className={`block w-full ${flip ? "rotate-180" : ""} ${className ?? ""}`}
      aria-hidden="true"
    >
      <path
        d="M0 40c120-30 240-30 360 0s240 30 360 0 240-30 360 0 240 30 360 0v40H0z"
        fill="currentColor"
      />
    </svg>
  );
}

export function HeroIllustration({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 480 440" className={className} role="img" aria-label="Sunny playground with a rainbow, a tree and building blocks">
      <defs>
        <clipPath id="kv-hero-blob">
          <path d="M246 18c86-6 176 40 206 122s4 186-62 238-170 64-250 30S12 300 18 214 76 88 132 52s66-30 114-34z" />
        </clipPath>
      </defs>
      {/* blob backdrop */}
      <path d="M246 18c86-6 176 40 206 122s4 186-62 238-170 64-250 30S12 300 18 214 76 88 132 52s66-30 114-34z" fill="#F7E9D7" />
      {/* sun */}
      <g>
        <circle cx="370" cy="100" r="38" fill="#F6B93B" />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={370 + Math.cos(a) * 50}
              y1={100 + Math.sin(a) * 50}
              x2={370 + Math.cos(a) * 64}
              y2={100 + Math.sin(a) * 64}
              stroke="#F6B93B"
              strokeWidth="6"
              strokeLinecap="round"
            />
          );
        })}
      </g>
      {/* rainbow */}
      <g fill="none" strokeLinecap="round" strokeWidth="16">
        <path d="M70 270a130 130 0 0 1 260 0" stroke="#E8704F" />
        <path d="M90 270a110 110 0 0 1 220 0" stroke="#F6B93B" />
        <path d="M110 270a90 90 0 0 1 180 0" stroke="#8DB596" />
        <path d="M130 270a70 70 0 0 1 140 0" stroke="#7EB6D9" />
      </g>
      {/* clouds */}
      <g fill="#fff">
        <path d="M56 266c-16 0-24-20-8-28 2-16 24-20 32-8 14-6 28 6 22 20 10 6 4 16-6 16z" />
        <path d="M296 266c-14 0-20-16-6-22 2-14 22-16 28-6 12-4 24 6 18 16 10 6 4 12-6 12z" />
        <path d="M150 90c-12 0-16-14-4-18 2-12 18-14 24-4 10-4 20 4 16 12 8 6 2 10-6 10z" />
      </g>
      {/* hills, clipped to the blob */}
      <g clipPath="url(#kv-hero-blob)">
        <path d="M0 340c60-40 140-56 220-50s170 30 260 70v80H0z" fill="#8DB596" />
        <path d="M0 390c80-40 220-50 320-30s130 30 160 40v40H0z" fill="#5E8F6B" opacity=".55" />
      </g>
      {/* tree */}
      <rect x="392" y="236" width="12" height="70" rx="5" fill="#8B5E3C" />
      <circle cx="398" cy="222" r="34" fill="#5E8F6B" />
      <circle cx="378" cy="240" r="20" fill="#8DB596" />
      <circle cx="420" cy="238" r="18" fill="#8DB596" />
      {/* blocks */}
      <g fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="34" textAnchor="middle">
        <rect x="150" y="306" width="52" height="52" rx="10" fill="#E8704F" transform="rotate(-6 176 332)" />
        <text x="176" y="345" fill="#fff" transform="rotate(-6 176 332)">K</text>
        <rect x="208" y="306" width="52" height="52" rx="10" fill="#7EB6D9" />
        <text x="234" y="344" fill="#fff">I</text>
        <rect x="266" y="306" width="52" height="52" rx="10" fill="#B9A7E0" transform="rotate(5 292 332)" />
        <text x="292" y="345" fill="#fff" transform="rotate(5 292 332)">D</text>
        <rect x="208" y="252" width="52" height="52" rx="10" fill="#F6B93B" transform="rotate(4 234 278)" />
        <text x="234" y="290" fill="#2E2A3B" transform="rotate(4 234 278)">S</text>
      </g>
      {/* kite */}
      <path d="M96 60l26 30-26 34-26-34z" fill="#B9A7E0" />
      <path d="M96 60v64M70 90h52" stroke="#fff" strokeWidth="3" />
      <path d="M96 124c-6 14 8 22 0 36s8 22 4 34" fill="none" stroke="#2E2A3B" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 7" />
      {/* stars */}
      <path d="M300 40c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z" fill="#E8704F" />
      <path d="M40 180c1 5 4 8 9 9-5 1-8 4-9 9-1-5-4-8-9-9 5-1 8-4 9-9z" fill="#7EB6D9" />
    </svg>
  );
}

export function ProgramIcon({ variant, className }: DoodleProps & { variant: "sage" | "sun" | "coral" }) {
  if (variant === "sage") {
    // sprout
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path d="M32 58V30" stroke="#5E8F6B" strokeWidth="4" strokeLinecap="round" />
        <path d="M32 34c-2-12-12-18-24-16 0 12 10 20 24 16z" fill="#8DB596" />
        <path d="M32 30c2-12 12-18 24-16 0 12-10 20-24 16z" fill="#5E8F6B" />
        <path d="M18 58h28" stroke="#8B5E3C" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }
  if (variant === "sun") {
    // ball
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <circle cx="32" cy="32" r="24" fill="#F6B93B" />
        <path d="M8 32h48M32 8c-10 10-10 38 0 48M32 8c10 10 10 38 0 48" stroke="#fff" strokeWidth="3.5" fill="none" />
      </svg>
    );
  }
  // pencil + paper
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="10" y="10" width="34" height="44" rx="6" fill="#fff" stroke="#E8704F" strokeWidth="3.5" />
      <path d="M18 22h18M18 30h18M18 38h10" stroke="#E8704F" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 50l14-28 6 3-14 28-7 3z" fill="#F6B93B" stroke="#2E2A3B" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

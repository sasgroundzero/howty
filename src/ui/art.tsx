/**
 * Original line drawings for "How it works". Same rules as the icons: 2px ink strokes, round joins,
 * warm neutral fills, and amber on exactly one thing per drawing (the thing the step is about).
 */
const INK = '#1c1917'
const frame = { viewBox: '0 0 200 120', fill: 'none', stroke: INK, strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round', 'aria-hidden': true } as const
const [WHITE, PALE, SHADE, AMBER] = ['#ffffff', '#f5f5f4', '#e7e5e4', '#f2b24a']

/** 1. Find your game: a game box under a magnifying glass. */
export function ArtFind({ className }: { className?: string }) {
  return (
    <svg {...frame} className={className}>
      <ellipse cx="96" cy="104" rx="66" ry="7" fill={SHADE} stroke="none" opacity="0.6" />
      {/* box: lid top, front and side */}
      <polygon points="34,56 96,40 158,56 96,72" fill={WHITE} />
      <polygon points="34,56 96,72 96,102 34,86" fill={PALE} />
      <polygon points="96,72 158,56 158,86 96,102" fill={SHADE} />
      {/* the name on the box, which is what you search for */}
      <polygon points="42,66 88,78 88,90 42,78" fill={AMBER} />
      <path d="M50 73l30 8" strokeWidth="2.5" />
      <path d="M34 62l62 16 62-16" opacity="0.35" />
      {/* magnifying glass */}
      <circle cx="138" cy="40" r="22" fill={WHITE} fillOpacity="0.92" />
      <path d="M126 36a13 13 0 0 1 12-9" opacity="0.4" />
      <path d="M154 56l18 18" strokeWidth="6" />
    </svg>
  )
}

/** 2. Follow each step: a board with pieces on it, and the next piece on its way down. */
export function ArtFollow({ className }: { className?: string }) {
  return (
    <svg {...frame} className={className}>
      <ellipse cx="100" cy="106" rx="72" ry="7" fill={SHADE} stroke="none" opacity="0.6" />
      {/* board */}
      <polygon points="24,74 100,52 176,74 100,96" fill={WHITE} />
      <path d="M24 74v7l76 22 76-22v-7" fill={PALE} />
      <path d="M100 96v7" />
      <path d="M62 63l76 22M138 63L62 85" opacity="0.2" />
      {/* a card and a pawn already placed */}
      <polygon points="52,72 72,66 84,70 64,76" fill={SHADE} />
      <path d="M150 78v-8a7 7 0 0 0-14 0v8" fill={PALE} />
      <circle cx="143" cy="60" r="6" fill={PALE} />
      <ellipse cx="143" cy="78" rx="9" ry="3.5" fill={PALE} />
      {/* the piece for this step, dropping onto its spot */}
      <ellipse cx="100" cy="74" rx="11" ry="4" strokeDasharray="3 4" />
      <path d="M100 44v18" strokeDasharray="2 5" />
      <polygon points="100,14 112,19 100,24 88,19" fill="#f8cf83" />
      <polygon points="88,19 100,24 100,38 88,33" fill={AMBER} />
      <polygon points="100,24 112,19 112,33 100,38" fill="#dc9a2e" />
    </svg>
  )
}

/** 3. Watch a first turn: a hand of cards, a rolled die, and a play button. */
export function ArtWatch({ className }: { className?: string }) {
  return (
    <svg {...frame} className={className}>
      <ellipse cx="100" cy="106" rx="70" ry="7" fill={SHADE} stroke="none" opacity="0.6" />
      {/* a fanned hand of three cards */}
      <rect x="34" y="50" width="34" height="48" rx="5" fill={SHADE} transform="rotate(-18 51 98)" />
      <rect x="48" y="46" width="34" height="48" rx="5" fill={PALE} transform="rotate(-4 65 94)" />
      <rect x="62" y="48" width="34" height="48" rx="5" fill={WHITE} transform="rotate(10 79 96)" />
      <path d="M74 62l8 1.5M73 70l14 2.5" opacity="0.35" transform="rotate(10 79 96)" />
      {/* the die, mid-tumble, and the path it took */}
      <path d="M104 44c14-12 30-10 40 4" strokeDasharray="2 6" />
      <g transform="rotate(14 152 78)">
        <rect x="134" y="60" width="36" height="36" rx="7" fill={WHITE} />
        <circle cx="144" cy="70" r="2.6" fill={INK} stroke="none" />
        <circle cx="152" cy="78" r="2.6" fill={INK} stroke="none" />
        <circle cx="160" cy="86" r="2.6" fill={INK} stroke="none" />
      </g>
      {/* play */}
      <circle cx="104" cy="28" r="15" fill={AMBER} />
      <path d="M100 21.5v13l10.5-6.5z" fill={WHITE} />
    </svg>
  )
}

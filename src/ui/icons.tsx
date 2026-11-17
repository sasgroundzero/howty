/** Small stroke icons, drawn inline so the app ships no icon font or image. */
const PATHS = {
  sound: 'M4 9v6h4l5 4V5L8 9H4z M16 9a4 4 0 0 1 0 6 M18.5 6.5a8 8 0 0 1 0 11',
  mute: 'M4 9v6h4l5 4V5L8 9H4z M17 9l5 6 M22 9l-5 6',
  speak: 'M4 5h16v11H10l-5 4v-4H4z M8 9h8 M8 12h5',
  mic: 'M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z M6 11a6 6 0 0 0 12 0 M12 17v4',
  target: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v4 M12 18v4 M2 12h4 M18 12h4',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  home: 'M4 11l8-7 8 7 M6 10v9h12v-9',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M20 20l-4-4',
  star: 'M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.8l1.1-6.1L3.2 9.4l6.1-.8z',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  back: 'M19 12H5 M11 6l-6 6 6 6',
  play: 'M7 4l13 8-13 8z',
  plus: 'M12 5v14 M5 12h14',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  pause: 'M8 5v14 M16 5v14',
  replay: 'M4 12a8 8 0 1 0 2.6-5.9 M4 4v4.5h4.5',
  list: 'M8 6h12 M8 12h12 M8 18h12 M4 6h.01 M4 12h.01 M4 18h.01',
  x: 'M6 6l12 12 M18 6L6 18',
} as const
export type IconName = keyof typeof PATHS

export function Icon({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {PATHS[name].split(' M').map((d, i) => (
        <path key={i} d={i ? `M${d}` : d} />
      ))}
    </svg>
  )
}

/** The Howty mark: a die face inside a rounded hex-ish tile. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="#1c1917" />
      <circle cx="11" cy="11" r="2.6" fill="#f59e0b" />
      <circle cx="21" cy="21" r="2.6" fill="#f59e0b" />
      <circle cx="21" cy="11" r="2.6" fill="#ffffff" />
      <circle cx="11" cy="21" r="2.6" fill="#ffffff" />
    </svg>
  )
}

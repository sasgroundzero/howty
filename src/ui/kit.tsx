/** The shared building blocks. Every screen is made from these so spacing, radius, borders and motion stay consistent. */
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from './icons'

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ')

const KIND = {
  primary: 'bg-ink text-paper hover:bg-stone-700',
  accent: 'bg-accent text-white hover:bg-amber-700',
  secondary: 'border border-line bg-white text-ink hover:border-ink',
  quiet: 'text-stone-600 hover:bg-ink/5 hover:text-ink',
}
/** Pill buttons. One `primary` (or `accent`) per screen; everything else is `secondary` or `quiet`. */
export function Button({ kind = 'secondary', size = 'md', icon, iconRight, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { kind?: keyof typeof KIND; size?: 'sm' | 'md' | 'lg'; icon?: IconName; iconRight?: IconName }) {
  return (
    <button
      {...rest}
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold transition duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40',
        size === 'lg' ? 'h-12 px-6 text-body' : size === 'sm' ? 'h-8 px-3 text-ui' : 'h-10 px-4 text-ui',
        KIND[kind],
        className,
      )}
    >
      {icon && <Icon name={icon} size={size === 'lg' ? 20 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'lg' ? 20 : 16} />}
    </button>
  )
}

/** A toggle or filter. Only things you can press look like this. */
export function Chip({ on, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { on?: boolean }) {
  return (
    <button {...rest} aria-pressed={on} className={cx('inline-flex h-8 items-center gap-1 rounded-full border px-3 text-ui font-medium transition duration-150 ease-out active:scale-[0.98]', on ? 'border-ink bg-ink text-paper' : 'border-line bg-white text-stone-700 hover:border-ink', className)}>
      {children}
    </button>
  )
}

/** A white card. Things nested inside it use the next radius down (rounded-xl, then rounded-lg). */
export const surface = 'rounded-2xl border border-line bg-white'
/** A floating panel over the 3D table. */
export const panel = 'rounded-2xl border border-line bg-paper/90 shadow-soft backdrop-blur-md'

export const Eyebrow = ({ children }: { children: ReactNode }) => <div className="text-meta font-semibold text-stone-500">{children}</div>
export const H2 = ({ children, className }: { children: ReactNode; className?: string }) => <h2 className={cx('font-display text-title font-bold text-ink', className)}>{children}</h2>
export const Note = ({ children }: { children: ReactNode }) => (
  <p role="status" className="rounded-xl border border-line bg-white px-4 py-3 text-ui text-stone-700">
    {children}
  </p>
)

/** A row of numbers. Shown only when the numbers are real (never a wall of zeros). */
export function Stats({ items }: { items: [string, string | number][] }) {
  return (
    <dl className={cx(surface, 'flex divide-x divide-line')}>
      {items.map(([k, v]) => (
        <div key={k} className="flex-1 px-4 py-3">
          <dd className="font-display text-title font-bold text-ink">{v}</dd>
          <dt className="text-meta text-stone-500">{k}</dt>
        </div>
      ))}
    </dl>
  )
}

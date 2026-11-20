/** @type {import('tailwindcss').Config} */
// The design tokens. DESIGN.md explains how they are meant to be used.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { display: ['Fraunces', 'Georgia', 'serif'], sans: ['"DM Sans"', 'system-ui', 'sans-serif'] },
      colors: {
        ink: '#1c1917', // text and primary buttons
        paper: '#ffffff', // page background: pure white
        mist: '#f5f5f4', // the quiet gray behind a 3D table panel
        line: 'rgba(28, 25, 23, 0.12)', // every border
        accent: '#b45309', // used sparingly: progress, focus, the first-turn button. White text on it is 5:1 (AA)
      },
      // Six sizes only. Hierarchy comes from weight and color before size.
      fontSize: {
        meta: ['12px', { lineHeight: '16px' }],
        ui: ['14px', { lineHeight: '20px' }],
        body: ['16px', { lineHeight: '24px' }],
        title: ['20px', { lineHeight: '24px', letterSpacing: '-0.01em' }],
        page: ['28px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
        hero: ['clamp(38px, 5.2vw, 56px)', { lineHeight: '1.04', letterSpacing: '-0.03em' }],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(28, 25, 23, 0.05), 0 8px 24px -10px rgba(28, 25, 23, 0.12)',
        lift: '0 2px 4px rgba(28, 25, 23, 0.05), 0 16px 40px -12px rgba(28, 25, 23, 0.18)',
      },
    },
  },
  plugins: [],
}

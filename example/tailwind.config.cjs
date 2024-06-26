
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    borderColor: theme => ({
      ...theme('colors'),
      DEFAULT: 'var(--color-border)',
    }),
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        paper: 'var(--color-paper)',
        text: 'var(--color-text)',
        "contrast-primary": 'var(--color-primary-contrast)',
      },
      cursor: {
        grab: 'grab',
        grabbing: 'grabbing',
        'n-resize': 'n-resize',
        'ew-resize': 'ew-resize',
        'col-resize': 'ew-resize',
        'all-scroll': 'all-scroll',
      },
      animation: {
        'fade-in': 'keyframes-fade-in 200ms',
        'fade-out': 'keyframes-fade-out 200ms',
      },
      keyframes: {
        "keyframes-fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 }
        },
        "keyframes-fade-out": {
          from: { opacity: 1 },
          to: { opacity: 0 }
        }
      }
    },
  },
}

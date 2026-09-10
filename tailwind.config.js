/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ftm: {
          page: 'var(--page-bg)',
          surface: 'var(--surface)',
          ink: 'var(--ink)',
          secondary: 'var(--ink-secondary)',
          muted: 'var(--ink-muted)',
          border: 'var(--border)',
          brand: 'var(--brand)',
          danger: 'var(--danger)',
          good: 'var(--status-good)',
          accentWash: 'var(--accent-wash)',
        }
      },
      fontFamily: {
        serif: ['"Iowan Old Style"', '"STIX Two Text"', '"Palatino Linotype"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', '"SF Mono"', '"Cascadia Mono"', '"Roboto Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'ftm': 'var(--shadow)',
      }
    },
  },
  plugins: [],
}

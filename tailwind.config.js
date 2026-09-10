/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#2a78d6',
          600: '#1d5eb8',
          700: '#17478e',
          900: '#0f2c59',
        },
        editorial: {
          bg: '#fbfbfa',
          surface: '#ffffff',
          darkBg: '#0f1115',
          darkSurface: '#161922',
          border: 'rgba(0,0,0,0.08)',
          darkBorder: 'rgba(255,255,255,0.08)',
          ink: '#111827',
          inkMuted: '#6b7280',
        }
      },
      fontFamily: {
        serif: ['"Iowan Old Style"', '"STIX Two Text"', 'Georgia', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}

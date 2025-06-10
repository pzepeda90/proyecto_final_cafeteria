/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
          light: '#DEB874',
          50: '#FDF8F3',
          100: '#F6ECD9',
          200: '#EED9B4',
          300: '#E6C68F',
          400: '#DEB36A',
          500: '#C8973F',
          600: '#A67B2D',
          700: '#8C5E1F',
          800: '#734111',
          900: '#5A2403'
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A'
        }
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '112': '28rem',
        '128': '32rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 
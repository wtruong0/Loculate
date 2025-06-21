/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/popup/index.html",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        loculate: {
          blue: '#2563eb',
        },
        dark: {
          bg: '#131313',
          card: '#0a0817',
          inputBorder: '#232323',
        },
        green: {
          light: '#bbf7d0',
          dark: '#166534',
          accent: '#0b3b1d',
          infoBg: '#107837',
        },
      },
      transitionDuration: {
        '200': '200ms',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        sparkle: {
          '0%': { 
            transform: 'scale(0) rotate(0deg)',
            opacity: '0'
          },
          '20%': { 
            transform: 'scale(0.8) rotate(72deg)',
            opacity: '0.8'
          },
          '50%': { 
            transform: 'scale(1) rotate(180deg)',
            opacity: '1'
          },
          '80%': { 
            transform: 'scale(0.8) rotate(288deg)',
            opacity: '0.8'
          },
          '100%': { 
            transform: 'scale(0) rotate(360deg)',
            opacity: '0'
          },
        },
        slideDown: {
          '0%': { 
            transform: 'translateY(-10px)',
            opacity: '0'
          },
          '100%': { 
            transform: 'translateY(0)',
            opacity: '1'
          },
        },
      },
      animation: {
        shake: 'shake 0.5s ease-in-out',
        sparkle: 'sparkle 0.8s ease-out',
        slideDown: 'slideDown 0.3s ease-out',
      },
    },
  },
  plugins: [],
} 
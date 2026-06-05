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
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#60A5FA',
        },
        success: {
          DEFAULT: '#10B981',
          dark: '#047857',
          light: '#34D399',
        },
        warning: {
          DEFAULT: '#F59E0B',
          dark: '#B45309',
          light: '#FBBF24',
        },
        danger: {
          DEFAULT: '#EF4444',
          dark: '#B91C1C',
          light: '#F87171',
        },
      }
    },
  },
  plugins: [],
}

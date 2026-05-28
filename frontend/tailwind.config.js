/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
        },
        card: {
          DEFAULT: 'rgba(30, 41, 59, 0.7)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        obsidian: {
          900: '#0b0f19',
          800: '#111827',
          700: '#1f2937',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glowing-theme': 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #0b0f19 100%)',
      },
      boxShadow: {
        'glass-glow': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'premium-ring': '0 0 15px rgba(99, 102, 241, 0.4)',
      },
      backdropFilter: {
        'glass': 'blur(12px)',
      }
    },
  },
  plugins: [],
}

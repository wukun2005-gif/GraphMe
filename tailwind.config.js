/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'space-dark': '#0a0a0f',
        'cyber-cyan': '#00f2ff',
        'amber-gold': '#ffb800',
        'emotion-happy': '#ffb800',
        'emotion-sad': '#4488ff',
        'emotion-curious': '#00f2ff',
        'emotion-angry': '#ff4444',
        'emotion-calm': '#88cc88',
        'emotion-proud': '#cc44ff',
      },
    },
  },
  plugins: [],
};
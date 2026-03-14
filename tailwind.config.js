/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#06131f',
        surface: '#0b2437',
        'surface-soft': '#123149',
        text: '#e8f1f8',
        'text-muted': '#9fb8cb',
        accent: '#00d3a7',
        alert: '#ff5f5f',
        warning: '#ff9d00',
        border: '#1f425c',
      },
    },
  },
  plugins: [],
};

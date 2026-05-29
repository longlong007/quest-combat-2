/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f5f0e8',
        sand: '#e8e0d0',
        moss: '#7a9e7e',
        dusk: '#c4a882',
        ink: '#3d3d3d',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,tsx,ts}',
    './components/**/*.{js,jsx,tsx,ts}',
    './context/**/*.{js,jsx,tsx,ts}',
    './data/**/*.{js,jsx,tsx,ts}',
  ],
  theme: {
    extend: {
      colors: {
        stone: {
          50: '#fafaf8',
          100: '#f5f5f0',
          200: '#e7e5e0',
          300: '#d9d5ce',
          400: '#a8a39a',
          500: '#78736a',
          600: '#5c5855',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
    },
  },
  plugins: [],
}

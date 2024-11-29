/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'], // Updated from 'purge' to 'content'
  darkMode: 'media', // Can be 'media' or 'class', or removed entirely if not using dark mode
  theme: {
    extend: {}, // Custom theme extensions go here
  },
  variants: {
    extend: {}, // Custom variants go here
  },
  plugins: [], // Add any Tailwind plugins if needed
};

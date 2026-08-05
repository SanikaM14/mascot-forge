/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E91E63',
        secondary: '#3b82f6',
        accent: '#FCE4EC',
        background: '#0B0E14',
        'background-darker': '#06080A',
        foreground: '#FFFFFF',
        'foreground-muted': '#94A3B8',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['Consolas', '"Courier New"', 'monospace'],
      },
      colors: {
        vsc: {
          bg: '#1e1e1e',
          sidebar: '#252526',
          activity: '#333333',
          border: '#3c3c3c',
          tabActive: '#1e1e1e',
          tabInactive: '#2d2d2d',
          hover: '#2a2d2e',
          text: '#cccccc',
          textMuted: '#969696',
          accent: '#007acc',
          input: '#3c3c3c'
        }
      }
    },
  },
  plugins: [],
}

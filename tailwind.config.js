/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#00FF66',
        'purple': '#9333EA',
        'dark-purple': '#6B21A8',
        'light-green': '#86EFAC',
        'dark-bg': '#121212',
        'text': '#E0E0E0',
      },
      fontFamily: {
        'heading': ['Orbitron', 'sans-serif'],
        'body': ['Exo 2', 'sans-serif'],
      },
      boxShadow: {
        'neon-green': '0 0 10px rgba(0, 255, 102, 0.7)',
        'neon-purple': '0 0 10px rgba(147, 51, 234, 0.7)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { 
            textShadow: '0 0 5px rgba(0, 255, 102, 0.3), 0 0 10px rgba(0, 255, 102, 0.2)' 
          },
          '100%': { 
            textShadow: '0 0 10px rgba(0, 255, 102, 0.5), 0 0 20px rgba(0, 255, 102, 0.3), 0 0 30px rgba(0, 255, 102, 0.2)' 
          },
        },
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to bottom, #121212, #1E1E1E)',
      },
    },
  },
  plugins: [],
}; 
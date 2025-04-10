module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        'primary': '#2563eb', // Adjusted to match original blue
        'secondary': '#10b981',
        'background': '#0f172a', // Darker background for cyberpunk feel
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
        'card-bg': '#1e293b',
        'card-hover': '#334155',
      },
      boxShadow: {
        'neon': '0 0 5px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

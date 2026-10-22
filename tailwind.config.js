/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'tiktok-pink': '#FE2C55',
        'tiktok-cyan': '#25F4EE',
        'tiktok-dark': '#121212',
        'tiktok-card': '#1F1F23',
        'tiktok-obsidian': '#010101',
        'tiktok-border': 'rgba(255, 255, 255, 0.1)',
        'risk-tier1': '#10B981',
        'risk-tier2': '#F59E0B',
        'risk-tier3': '#F97316',
        'risk-tier4': '#FE2C55',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        'tiktok-glitch': '-2px -2px 0px #25F4EE, 2px 2px 0px #FE2C55',
        'tiktok-glitch-sm': '-1px -1px 0px #25F4EE, 1px 1px 0px #FE2C55',
        'tiktok-glow-pink': '0 0 20px rgba(254, 44, 85, 0.35)',
        'tiktok-glow-cyan': '0 0 20px rgba(37, 244, 238, 0.35)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 2s infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-1.5px, 1.5px)' },
          '40%': { transform: 'translate(-1.5px, -1.5px)' },
          '60%': { transform: 'translate(1.5px, 1.5px)' },
          '80%': { transform: 'translate(1.5px, -1.5px)' },
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff1f5', 100: '#ffe4ec', 200: '#fecdd8', 300: '#fda4bb',
          400: '#fb6f93', 500: '#fe2c55', 600: '#e11d48', 700: '#be123c',
          800: '#9f1239', 900: '#881337',
        },
        accent: {
          50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
          400: '#25f4ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490',
          800: '#155e75', 900: '#164e63',
        },
        surface: { DEFAULT: '#0a0a0f', 50: '#16161f', 100: '#1c1c26', 200: '#26262f', 300: '#33333d' },
      },
      fontFamily: {
        sans: ['Tajawal', 'system-ui', 'sans-serif'],
        display: ['Cairo', 'system-ui', 'sans-serif'],
        arabic: ['Tajawal', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-pink': '0 0 24px -4px rgba(254,44,85,0.55)',
        'glow-cyan': '0 0 24px -4px rgba(37,244,238,0.45)',
        card: '0 10px 30px -12px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg,#fe2c55 0%,#ff7a59 100%)',
        'gradient-brand-cyan': 'linear-gradient(135deg,#fe2c55 0%,#25f4ee 100%)',
        'grid-dark': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 0 0 rgba(254,44,85,0.5)' }, '50%': { boxShadow: '0 0 28px 6px rgba(254,44,85,0.35)' } },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.5s ease-out both',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

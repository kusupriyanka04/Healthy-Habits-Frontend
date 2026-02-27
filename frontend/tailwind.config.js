/** @type {import(‘tailwindcss’).Config} */
export default {
darkMode: 'class',
content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
theme: {
extend: {
fontFamily: {
syne: ['Syne', 'sans-serif'],
manrope: ['Manrope', 'sans-serif'],
},
colors: {
brand: {
50:  '#f0fdf6',
100: '#dcfce9',
200: '#bbf7d4',
300: '#86efad',
400: '#4ade80',
500: '#22c55e',
600: '#16a34a',
700: '#15803d',
800: '#166534',
900: '#14532d',
950: '#052e16',
},
},
animation: {
'fade-in':   'fadeIn 0.35s ease both',
'slide-up':  'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
'slide-down':'slideDown 0.35s cubic-bezier(0.16,1,0.3,1) both',
'scale-in':  'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
'pulse-slow':'pulse 3s ease-in-out infinite',
},
keyframes: {
fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
slideUp:   { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
slideDown: { from: { opacity: 0, transform: 'translateY(-16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
scaleIn:   { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
},
boxShadow: {
'glow-green': '0 0 30px rgba(34, 197, 94, 0.15)',
'glow-sm':    '0 0 12px rgba(34, 197, 94, 0.10)',
},
},
},
plugins: [],
};
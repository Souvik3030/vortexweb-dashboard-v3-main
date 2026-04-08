/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        vortex: {
          50: '#f3f7ff',
          100: '#e6f0ff',
          200: '#bcd6ff',
          300: '#8dbbff',
          400: '#5ea1ff',
          500: '#2f88ff',
          600: '#2269d6',
          700: '#184fa9',
          800: '#10367b',
          900: '#0a234f',
          magenta: '#ff4ecb'
        }
      },
      fontFamily: {
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-lg': '0 8px 30px rgba(47,136,255,0.12), 0 0 30px rgba(0,246,255,0.06)'
      }
    }
  },
  plugins: []
};
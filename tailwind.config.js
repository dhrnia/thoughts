/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Newsreader"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        parchment: {
          50: '#FDFBF7',
          100: '#FAF7F0',
          150: '#F5F2EA',
          200: '#EFECE2',
          300: '#E4DFD3',
          400: '#CCC5B4',
          500: '#A9A08D',
        },
        pine: {
          800: '#233831',
          900: '#1A2B25',
          950: '#12201B',
        },
        zen: {
          cream: '#FAF8F5',
          card: '#FFFFFF',
          border: '#E8E4DA',
          textMuted: '#8C857B',
          textDark: '#2B2824',
          sand: '#ECE7DD',
        }
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
        'card': '0 2px 8px -2px rgba(0,0,0,0.04), 0 1px 4px -1px rgba(0,0,0,0.02)',
        'elevation': '0 10px 30px -5px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)',
      }
    },
  },
  plugins: [],
}

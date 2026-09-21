/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vocacao: {
          petroleo: '#002a3a',
          profundo: '#004a6d',
          turquesa: '#00e3e6',
          amarelo: '#edcd01',
          verde: '#00e04b',
          rosa: '#fd3168',
          laranja: '#e03f2a',
          bg: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

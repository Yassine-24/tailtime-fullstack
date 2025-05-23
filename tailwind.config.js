/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Urbanist', 'sans-serif'], // ⚡ Urbanist applied everywhere
      },
      keyframes: {
        'bounce-twice': {
          '0%, 100%': { transform: 'translateY(0)' },
          '25%': { transform: 'translateY(-15%)' },
          '50%': { transform: 'translateY(0)' },
          '75%': { transform: 'translateY(-10%)' },
        }
      },
      animation: {
        'bounce-twice': 'bounce-twice 0.6s ease'
      }
    }
  },
  plugins: [],
};


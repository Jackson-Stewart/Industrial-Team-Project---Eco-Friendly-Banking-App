/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["pages/*.html"],
  theme: {
    container: {
      center: true,
    },
    screens: {
      'sm': '640px',      
      'md': '768px',      
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1560px'
    },
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif']
      },
      colors: {
        'primary': '#00A4D3'
      }
    },
  },
  plugins: [],
}


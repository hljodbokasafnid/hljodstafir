const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xxs: "320px",
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      '2xl': "1536px",
      '3xl': "1920px",
      '4xl': "2560px",
    },
    extend: {
      spacing: {
        'half-screen': '50vh',
      },
      width: {
        'screen': '100vw',
      },
      minWidth: {
        'screen': '100vw',
      },
      colors: {
        'coffee': '#c0ffee',
        'pink': '#FFC0EE',
        'primary': '#103b70',
        'primary-hover': '#165097',
      },
      boxShadow: {
        'red': '0px 0px 0px 1px rgba(185, 28, 28,1)'
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
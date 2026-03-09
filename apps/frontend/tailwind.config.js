/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#621B7A',
          light: '#7a2294',
          dark: '#4e1561',
        },
        accent: {
          DEFAULT: '#9EE992',
          dark: '#7ed474',
        },
        brand: {
          text: '#1D1E18',
          bg: '#FFFFFF',
          subtle: '#F8F8F8',
        },
      },
      borderRadius: {
        btn: '5px',
      },
    },
  },
  plugins: [],
};

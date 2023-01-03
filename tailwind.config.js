/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'rubber-band': 'rubber-band 0.6s ease infinite',
      },
      keyframes: {
        'rubber-band': {
          '0%': {
            '-webkit-transform': 'scale(1.0)',
            '-ms-transform': 'scale(1.0)',
            transform: 'scale(1.0)',
          },
          '30%': {
            '-webkit-transform': 'scaleX(1.25) scaleY(0.75)',
            '-ms-transform': 'scaleX(1.25) scaleY(0.75)',
            transform: 'scaleX(1.25) scaleY(0.75)',
          },
          '40%': {
            '-webkit-transform': 'scaleX(0.75) scaleY(1.25)',
            '-ms-transform': 'scaleX(0.75) scaleY(1.25)',
            transform: 'scaleX(0.75) scaleY(1.25)',
          },
          '60%': {
            '-webkit-transform': 'scaleX(1.15) scaleY(0.85)',
            '-ms-transform': 'scaleX(1.15) scaleY(0.85)',
            transform: 'scaleX(1.15) scaleY(0.85)',
          },
          '100%': {
            '-webkit-transform': 'scale(1.0)',
            '-ms-transform': 'scale(1.0)',
            transform: 'scale(1.0)',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
  safelist: [
    'bottom-0', // used in Drawer.tsx
  ],
}

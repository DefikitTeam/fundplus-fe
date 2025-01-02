/* eslint-disable @typescript-eslint/no-require-imports */
// tailwind.config.cjs
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/views/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inria: ['Inria Sans', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      fontWeight: {
        'inter-light': 300,
        'inter-normal': 400,
        'inter-medium': 500,
        'inter-semibold': 600,
        'inter-bold': 700,
        'inter-extrabold': 800,
        'inter-black': 900,
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}


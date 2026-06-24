import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#005eb8',
          orange: '#e57200',
          white: '#ffffff',
          gray: '#f2f2f2',
          'blue-dark': '#004a93',
          'blue-light': '#1a6fc4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;

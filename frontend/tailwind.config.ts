// Configuración de Tailwind CSS — extiende colores con la paleta de marca de Home Pádel

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        lime: { DEFAULT: '#C8FF00', dark: '#a8d600' },
        brand: {
          dark: '#111111',
          darker: '#0a0a0a',
          gray: '#1c1c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

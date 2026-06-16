// Configuración de Tailwind CSS — extiende colores con la paleta de marca de Home Pádel

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        accent: '#D4FF00',
        lime:   { DEFAULT: '#D4FF00', dark: '#b8e000' },
        brand: {
          dark:   '#101010',
          darker: '#0A0A0A',
          base:   '#050505',
          surface:'#121212',
          gray:   '#1c1c1c',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

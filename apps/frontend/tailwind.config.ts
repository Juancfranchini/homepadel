// Configuración de Tailwind CSS — colores de la tienda por tema (oscuro / claro).
//
// Cada color apunta a una variable definida en src/app/globals.css, que cambia
// según data-theme en <html>. En los componentes se usa el nombre (bg-page,
// text-fg, border-line...), no el hex: así el mismo código sirve para los dos
// temas. Lo que no cambia entre temas (el lima #B7D31A de botones y bordes, el
// texto #050606 sobre lima) sigue escrito como hex.

import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const tema = (variable: string) => `rgb(var(--c-${variable}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        page: tema('page'),
        panel: tema('panel'),
        card: tema('card'),
        field: tema('field'),
        chip: tema('chip'),
        line: tema('line'),
        night: tema('night'),
        ocean: { DEFAULT: tema('ocean'), 2: tema('ocean-2') },
        olive: tema('olive'),
        fg: { DEFAULT: tema('fg'), soft: tema('fg-soft'), muted: tema('fg-muted') },
        'brand-fg': tema('brand-fg'),
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [
    // light:… aplica solo con el tema claro. Para los pocos colores que no tienen
    // nombre (se usan una o dos veces) y para los de estado (verde/rojo/ámbar).
    plugin(({ addVariant }) => {
      addVariant('light', '[data-theme="light"] &');
    }),
  ],
};

export default config;

import type { Metadata } from 'next';

/**
 * La página es un componente de navegador y no puede exportar metadatos, así
 * que el título y la descripción viven acá. Sin esto, esta ruta compartía el
 * título del sitio con todas las demás y Google las veía como duplicadas.
 */
export const metadata: Metadata = {
  title: 'Catálogo de pádel',
  description: 'Paletas, indumentaria, calzado y accesorios de pádel de las mejores marcas. Filtrá por marca, categoría y formato. Envíos a todo el país.',
  alternates: { canonical: '/catalogo' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

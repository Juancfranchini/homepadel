import type { Metadata } from 'next';

/**
 * La página es un componente de navegador y no puede exportar metadatos, así
 * que el título y la descripción viven acá. Sin esto, esta ruta compartía el
 * título del sitio con todas las demás y Google las veía como duplicadas.
 */
export const metadata: Metadata = {
  title: 'Cambios y devoluciones',
  description: 'Cómo cambiar o devolver un producto comprado en Home Pádel, y en qué plazos.',
  alternates: { canonical: '/politica-de-devolucion' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

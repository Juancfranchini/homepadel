import type { Metadata } from 'next';

/**
 * La página es un componente de navegador y no puede exportar metadatos, así
 * que el título y la descripción viven acá. Sin esto, esta ruta compartía el
 * título del sitio con todas las demás y Google las veía como duplicadas.
 */
export const metadata: Metadata = {
  title: 'Preguntas frecuentes',
  description: 'Dudas sobre envíos, pagos, cambios y devoluciones en Home Pádel. Si no encontrás lo que buscás, escribinos.',
  alternates: { canonical: '/faq' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

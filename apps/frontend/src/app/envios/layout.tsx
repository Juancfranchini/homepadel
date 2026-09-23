import type { Metadata } from 'next';

/**
 * La página es un componente de navegador y no puede exportar metadatos, así
 * que el título y la descripción viven acá. Sin esto, esta ruta compartía el
 * título del sitio con todas las demás y Google las veía como duplicadas.
 */
export const metadata: Metadata = {
  title: 'Envíos',
  description: 'Cómo y cuándo llega tu pedido. Envíos a todo el país, a domicilio o a sucursal.',
  alternates: { canonical: '/envios' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

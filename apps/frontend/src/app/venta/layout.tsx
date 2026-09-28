import type { Metadata } from 'next';

/**
 * Links de venta que arma el backoffice para un cliente puntual: son privados
 * y dejan de valer una vez convertidos en pedido. A diferencia de /checkout o
 * /cuenta, /venta no está bloqueada en robots.txt, así que este noindex es lo
 * único que evita que un link compartido termine indexado.
 */
export const metadata: Metadata = {
  title: 'Tu compra',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

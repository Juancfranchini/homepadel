import type { Metadata } from 'next';

/**
 * El carrito de cada visitante, guardado en su navegador.
 * No tiene sentido en un buscador: se marca noindex. robots.txt ya la bloquea
 * para el rastreo, pero eso no impide que Google indexe la URL si la encuentra
 * enlazada; el noindex cubre ese caso si algún día se levanta el bloqueo.
 */
export const metadata: Metadata = {
  title: 'Carrito',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

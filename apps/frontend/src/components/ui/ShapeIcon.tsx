interface Props {
  shape: string;
  size?: number;
  className?: string;
}

/**
 * Silueta de la pala según su formato.
 *
 * Antes se usaban tres íconos genéricos —un rombo, una gota y un círculo— que
 * a 13px se veían casi iguales y no decían nada del producto. Estos son la
 * forma real de la pala vista de frente, con su mango: se distinguen de un
 * vistazo y explican el formato sin necesidad de leerlo.
 */
const CABEZAS: Record<string, string> = {
  // Angular: el ancho máximo arriba, que es lo que da potencia.
  Diamante: 'M12 2 L19 9.5 L12 17 L5 9.5 Z',
  // Ovalada con la parte ancha alta y la base redondeada.
  Lagrima: 'M12 2 C16.4 2 19 5.8 19 9.6 C19 13.8 15.9 17 12 17 C8.1 17 5 13.8 5 9.6 C5 5.8 7.6 2 12 2 Z',
  // Redonda: el ancho máximo al medio, que es lo que da control.
  Redondo: 'M12 2 C15.9 2 19 5.4 19 9.5 C19 13.6 15.9 17 12 17 C8.1 17 5 13.6 5 9.5 C5 5.4 8.1 2 12 2 Z',
};

export default function ShapeIcon({ shape, size = 14, className }: Props) {
  const cabeza = CABEZAS[shape];
  if (!cabeza) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={cabeza} />
      {/* El mango es lo que hace que se lea como una pala y no como una figura. */}
      <path d="M12 17 L12 22" strokeLinecap="round" />
    </svg>
  );
}

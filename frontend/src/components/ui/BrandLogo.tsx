/**
 * BrandLogo — fuente única de verdad para la identidad visual de Home Pádel.
 *
 * El logo oficial está compuesto por:
 *   • Un chevron (tejado) en ángulo que simboliza el "home"
 *   • Una línea diagonal (mango de pala) que sube hacia la derecha
 *   • Una pelota de pádel (círculo con costuras) en el extremo del mango
 *   • El nombre "HOME PÁDEL" en tipografía negra debajo
 *
 * Variantes:
 *   dark  → para fondos oscuros (chevron blanco, pelota lima #D4FF00, texto blanco)
 *   light → para fondos claros (chevron azul, pelota verde oliva, texto azul)
 *
 * Tamaños:
 *   xs | sm | md | lg
 *
 * Props:
 *   showText   → muestra el nombre "HOME PÁDEL" debajo del isotipo (default: true)
 *   className  → clases adicionales para el wrapper
 */

interface BrandLogoProps {
  /** 'dark' para fondos oscuros, 'light' para fondos claros */
  variant?: 'dark' | 'light';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Mostrar el texto "HOME PÁDEL" debajo del ícono */
  showText?: boolean;
  className?: string;
}

// Mapa de tamaños: [icon width, icon height, text font-size, gap]
const SIZE_MAP: Record<string, [number, number, string, number]> = {
  xs: [22, 14,  '7px',  2],
  sm: [32, 20,  '9px',  3],
  md: [44, 27, '11px',  5],
  lg: [60, 37, '14px',  7],
};

export default function BrandLogo({
  variant = 'dark',
  size = 'md',
  showText = true,
  className = '',
}: BrandLogoProps) {
  const isDark = variant === 'dark';

  // Paleta de colores por variante
  const chevronColor = isDark ? '#FFFFFF'  : '#3E9FD4';
  const ballColor    = isDark ? '#D4FF00'  : '#8FBF2A';
  const seamColor    = isDark ? '#0A0A0A'  : '#FFFFFF';
  const textColor    = isDark ? '#FFFFFF'  : '#3E9FD4';

  const [iconW, iconH, textSize, gap] = SIZE_MAP[size] ?? SIZE_MAP.md;

  return (
    <div
      className={`flex flex-col items-center select-none ${className}`}
      style={{ gap }}
    >
      {/* ─── Isotipo (SVG inline) ──────────────────────────────────────── */}
      {/*
       * ViewBox: 0 0 92 58
       * El chevron (∧) va de (5,54) → peak(41,24) → (75,54)
       * El mango de pala va de (52,31) → (77,12)  [diag upper-right]
       * La pelota está en cx=83 cy=10 r=9
       */}
      <svg
        width={iconW}
        height={iconH}
        viewBox="0 0 92 58"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Chevron — tejado / home */}
        <path
          d="M5 54 L41 24 L75 54"
          stroke={chevronColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Mango de pala (racket handle) */}
        <line
          x1="52" y1="31"
          x2="77" y2="12"
          stroke={chevronColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Pelota de pádel */}
        <circle cx="83" cy="10" r="9" fill={ballColor} />

        {/* Costura izquierda de la pelota */}
        <path
          d="M75.5 7 Q80 10.5 75.5 14"
          stroke={seamColor}
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
        {/* Costura derecha de la pelota */}
        <path
          d="M90.5 7 Q86 10.5 90.5 14"
          stroke={seamColor}
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* ─── Nombre de marca ───────────────────────────────────────────── */}
      {showText && (
        <span
          className="font-black uppercase tracking-widest leading-none whitespace-nowrap"
          style={{ color: textColor, fontSize: textSize, letterSpacing: '0.2em' }}
        >
          HOME PÁDEL
        </span>
      )}
    </div>
  );
}

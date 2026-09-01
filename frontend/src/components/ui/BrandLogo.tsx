interface BrandLogoProps {
  /** URL de imagen personalizada (desde backoffice) */
  imageUrl?: string;
  /** 'dark' para fondos oscuros, 'light' para fondos claros */
  variant?: 'dark' | 'light';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Mostrar el texto "HOME PÁDEL */
  showText?: boolean;
  className?: string;
}

// Mapa de tamannos: [icon width, icon height, text font-size, gap]
const SIZE_MAP: Record<string, [number, number, string, number]> = {
  xs: [22, 14, '7px', 2],
  sm: [32, 20, '9px', 3],
  md: [64, 47, '12px', 6],
  lg: [84, 54, '16px', 8],
  xl: [120, 77, '18px', 10],
};

export default function BrandLogo({
  imageUrl,
  variant = 'dark',
  size = 'md',
  showText = true,
  className = '',
}: BrandLogoProps) {
  const isDark = variant === 'dark';

  // Paleta de colores por variante
  const chevronColor = isDark ? '#FFFFFF' : '#1699D3';
  const ballColor = isDark ? '#B7D31A' : '#B7D31A';
  const seamColor = isDark ? '#050606' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1699D3';

  const [iconW, iconH, textSize, gap] = SIZE_MAP[size] ?? SIZE_MAP.md;

  // Si hay una imagen personalizada del backoffice, mostrarla en vez del SVG
  if (imageUrl) {
    return (
      <div className={`flex flex-col items-center select-none ${className}`} style={{ gap }}>
        <img
          src={imageUrl}
          alt="Home Padel"
          className="object-cover"
          style={{ width: iconW, height: iconH }}
        />
        {showText && (
          <span
            className="font-black uppercase tracking-widest leading-none whitespace-nowrap"
            style={{ color: textColor, fontSize: textSize, letterSpacing: '0.2em' }}
          >
            HOME PADEL
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center select-none ${className}`}
      style={{ gap }}
    >
      {/* svg POR DEFAULT */}
      <svg
        width={iconW}
        height={iconH}
        viewBox="0 0 92 58"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >

        <path
          d="M5 54 L41 24 L75 54"
          stroke={chevronColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />


        <line
          x1="52" y1="31"
          x2="77" y2="12"
          stroke={chevronColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        <circle cx="83" cy="10" r="9" fill={ballColor} />

        <path
          d="M75.5 7 Q80 10.5 75.5 14"
          stroke={seamColor}
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />

        <path
          d="M90.5 7 Q86 10.5 90.5 14"
          stroke={seamColor}
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {showText && (
        <span
          className="font-black uppercase tracking-widest leading-none whitespace-nowrap"
          style={{ color: textColor, fontSize: textSize, letterSpacing: '0.2em' }}
        >
          HOME PADEL
        </span>
      )}
    </div>
  );
}
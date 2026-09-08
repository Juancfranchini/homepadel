import BrandLogoMark from './BrandLogoMark';

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
      <BrandLogoMark width={iconW} height={iconH} chevronColor={chevronColor} ballColor={ballColor} seamColor={seamColor} />

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
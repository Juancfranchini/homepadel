import Image from 'next/image';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  priority?: boolean;
}

// El logo (/public/home-padel-logo.png) ya trae el texto "HOME PÁDEL"
// dibujado adentro de la imagen — el ancho/alto de cada tamaño respeta su
// proporción real (1448x1086, 4:3) para que next/image no la deforme.
const SIZE_MAP: Record<string, [number, number]> = {
  xs: [43, 32],
  sm: [64, 48],
  md: [93, 70],
  lg: [120, 90],
  xl: [147, 110],
};

export default function BrandLogo({ size = 'md', className = '', priority = false }: BrandLogoProps) {
  const [width, height] = SIZE_MAP[size] ?? SIZE_MAP.md;

  return (
    <Image
      src="/home-padel-logo.png"
      alt="Home Pádel"
      width={width}
      height={height}
      priority={priority}
      className={`object-contain select-none ${className}`}
    />
  );
}

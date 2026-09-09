import Image from 'next/image';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  priority?: boolean;
}

// El logo (/public/home-padel-logo.png) ya trae el texto "HOME PÁDEL"
// dibujado adentro de la imagen — el ancho/alto de cada tamaño respeta su
// proporción real (1774x887) para que next/image no la deforme.
const SIZE_MAP: Record<string, [number, number]> = {
  xs: [64, 32],
  sm: [96, 48],
  md: [140, 70],
  lg: [180, 90],
  xl: [220, 110],
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

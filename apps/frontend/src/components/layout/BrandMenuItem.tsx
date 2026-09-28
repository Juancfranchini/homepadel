import Link from 'next/link';
import { logoMarcaUrl } from '@/lib/brandLogo';
import type { MarcaMenu } from '@/hooks/useMenuCategorias';

interface Props {
  marca: MarcaMenu;
  href: string;
  onNavigate?: () => void;
}

/** Marca con su logo, para el menú. Sin logo cargado se muestra solo el nombre: no se inventa un ícono. */
export default function BrandMenuItem({ marca, href, onNavigate }: Props) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group/marca flex items-center gap-3 rounded-lg border-b border-fg/[0.06] px-2 py-2.5 transition-colors hover:bg-fg/[0.05]"
    >
      {marca.logo && (
        <span className="flex h-7 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-black">
          <img src={logoMarcaUrl(marca.logo)} alt="" loading="lazy" className="max-h-6 max-w-11 object-contain" />
        </span>
      )}
      <span className="text-xs font-bold uppercase tracking-wide text-[#E8E8E3] light:text-[#2A2B27] transition-colors group-hover/marca:text-[#B7D31A]">
        {marca.name}
      </span>
    </Link>
  );
}

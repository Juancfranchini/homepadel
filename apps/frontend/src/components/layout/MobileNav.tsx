'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMenuNavegacion, accesosPorGenero } from '@/hooks/useMenuCategorias';
import MobileNavAccordion from './MobileNavAccordion';
import BrandMenuItem from './BrandMenuItem';
import { isNavActive } from './navState';

interface Props {
  links: { label: string; href: string }[];
  onNavigate: () => void;
}

const enlaceHoja = 'block rounded-md px-3 py-2.5 text-sm text-fg-soft transition-colors hover:bg-fg/[0.05] hover:text-brand-fg';
const enlaceRaiz = 'my-0.5 block rounded-lg px-3 py-3 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-fg/[0.06] hover:text-fg';

/**
 * Menú de navegación en móvil, al estilo Pádel CABA: cada categoría se
 * despliega en las marcas que tienen productos en ella, con su logo. Debajo,
 * los links informativos que en escritorio van en el pie.
 *
 * Si la API no responde, las categorías no aparecen y el menú sigue
 * funcionando con los links fijos.
 */
export default function MobileNav({ links, onNavigate }: Props) {
  const { categorias, marcas, generos } = useMenuNavegacion();
  const pathname = usePathname();

  const claseRaiz = (href: string) =>
    enlaceRaiz + (isNavActive(pathname, href) ? ' bg-[#B7D31A] text-[#050606]' : ' text-fg-soft');

  return (
    <nav className="max-h-[calc(100dvh-120px)] overflow-y-auto border-t border-[#303638] light:border-[#D2D2CA] bg-[#101416] light:bg-[#EFF2EC] shadow-2xl lg:hidden" aria-label="Navegación móvil">
      <div className="mx-auto flex max-w-7xl flex-col px-6 py-3">
        {categorias.map((categoria) => (
          <MobileNavAccordion key={categoria.id} label={categoria.name}>
            <Link href={'/catalogo?categoria=' + categoria.slug} className={enlaceHoja} onClick={onNavigate}>
              Ver todo en {categoria.name}
            </Link>
            {categoria.brands.map((marca) => (
              <BrandMenuItem
                key={marca.id}
                marca={marca}
                href={'/catalogo?categoria=' + categoria.slug + '&marca=' + marca.slug}
                onNavigate={onNavigate}
              />
            ))}
          </MobileNavAccordion>
        ))}

        {accesosPorGenero(generos).map((g) => (
          <Link key={g.href} href={g.href} className={enlaceRaiz + ' text-fg-soft'} onClick={onNavigate}>
            {g.label}
          </Link>
        ))}

        {marcas.length > 0 && (
          <MobileNavAccordion label="Marcas">
            <Link href="/catalogo" className={enlaceHoja} onClick={onNavigate}>
              Ver todo el catálogo
            </Link>
            {marcas.map((marca) => (
              <BrandMenuItem key={marca.id} marca={marca} href={'/catalogo?marca=' + marca.slug} onNavigate={onNavigate} />
            ))}
          </MobileNavAccordion>
        )}

        <Link href="/catalogo?oferta=true" className={enlaceRaiz + ' text-brand-fg'} onClick={onNavigate}>
          Ofertas
        </Link>

        <div className="my-2 h-px bg-[#303638] light:bg-[#DADAD2]" />

        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isNavActive(pathname, link.href) ? 'page' : undefined}
            className={claseRaiz(link.href)}
            onClick={onNavigate}
          >
            {link.label}
          </Link>
        ))}

        <Link
          href="/cuenta"
          aria-current={isNavActive(pathname, '/cuenta') ? 'page' : undefined}
          className={claseRaiz('/cuenta')}
          onClick={onNavigate}
        >
          Mi cuenta
        </Link>
      </div>
    </nav>
  );
}

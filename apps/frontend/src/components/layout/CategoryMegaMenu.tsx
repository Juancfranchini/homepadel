'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useMenuNavegacion, accesosPorGenero, MarcaMenu } from '@/hooks/useMenuCategorias';
import BrandMenuItem from './BrandMenuItem';

const enlace =
  'flex items-center gap-1 whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-fg-soft transition-colors hover:text-brand-fg';

interface Desplegable {
  titulo: string;
  href: string;
  marcas: MarcaMenu[];
  hrefMarca: (marca: MarcaMenu) => string;
  verTodo: string;
}

/**
 * Desplegable con marcas y sus logos. Se abre al pasar el mouse y también al
 * navegar con teclado (focus-within). Los de la mitad derecha de la barra se
 * abren hacia la izquierda, para que no se salgan de la pantalla.
 */
function MenuDesplegable({ item, alineaDerecha }: { item: Desplegable; alineaDerecha: boolean }) {
  return (
    <div className="group relative">
      <Link href={item.href} className={enlace + ' group-hover:text-brand-fg group-focus-within:text-brand-fg'}>
        {item.titulo}
        <ChevronDown size={12} className="transition-transform group-hover:rotate-180" />
      </Link>
      <div
        className={
          'invisible absolute top-full z-50 pt-1 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 ' +
          (alineaDerecha ? 'right-0' : 'left-0')
        }
      >
        <div className="w-[min(640px,90vw)] rounded-xl border border-[#B7D31A]/40 bg-[#111516] light:bg-[#EFF2EC] p-5 shadow-2xl shadow-black/60 light:shadow-black/15">
          <div className="grid grid-cols-3 gap-x-6">
            {item.marcas.map((marca) => (
              <BrandMenuItem key={marca.id} marca={marca} href={item.hrefMarca(marca)} />
            ))}
          </div>
          <Link href={item.href} className="mt-4 inline-block text-xs font-bold uppercase tracking-wide text-brand-fg hover:underline">
            {item.verTodo} →
          </Link>
        </div>
      </div>
    </div>
  );
}

type ItemBarra = { tipo: 'desplegable'; item: Desplegable } | { tipo: 'enlace'; label: string; href: string };

export default function CategoryMegaMenu() {
  const { categorias, marcas, generos } = useMenuNavegacion();
  if (categorias.length === 0 && marcas.length === 0) return null;

  const items: ItemBarra[] = [
    ...categorias.map((c): ItemBarra => ({
      tipo: 'desplegable',
      item: { titulo: c.name, href: '/catalogo?categoria=' + c.slug, marcas: c.brands, hrefMarca: (m) => '/catalogo?categoria=' + c.slug + '&marca=' + m.slug, verTodo: 'Ver todo en ' + c.name },
    })),
    ...accesosPorGenero(generos).map((g): ItemBarra => ({ tipo: 'enlace', ...g })),
    ...(marcas.length > 0
      ? [{ tipo: 'desplegable', item: { titulo: 'Marcas', href: '/catalogo', marcas, hrefMarca: (m: MarcaMenu) => '/catalogo?marca=' + m.slug, verTodo: 'Ver todo el catálogo' } } as ItemBarra]
      : []),
  ];

  return (
    <nav aria-label="Categorías" className="flex items-center justify-center">
      {items.map((it, i) =>
        it.tipo === 'desplegable' ? (
          <MenuDesplegable key={it.item.titulo} item={it.item} alineaDerecha={i > 0 && i >= items.length / 2} />
        ) : (
          <Link key={it.href} href={it.href} className={enlace}>{it.label}</Link>
        ),
      )}
      <Link href="/catalogo?oferta=true" className={enlace + ' text-brand-fg hover:text-[#CAE52E] light:hover:text-[#4B5A00]'}>
        Ofertas
      </Link>
    </nav>
  );
}

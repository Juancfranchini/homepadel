'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useMenuCategorias, CategoriaMenu } from '@/hooks/useMenuCategorias';
import BrandMenuItem from './BrandMenuItem';

const enlaceCategoria =
  'flex items-center gap-1 whitespace-nowrap px-3 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#C7C7C0] transition-colors hover:text-[#B7D31A] group-hover:text-[#B7D31A] group-focus-within:text-[#B7D31A]';

/**
 * Desplegable con las marcas de una categoría. Se abre al pasar el mouse y
 * también al navegar con teclado (focus-within). Las categorías de la mitad
 * derecha lo abren hacia la izquierda, para que no se salga de la pantalla.
 */
function CategoriaConMarcas({ categoria, alineaDerecha }: { categoria: CategoriaMenu; alineaDerecha: boolean }) {
  return (
    <div className="group relative">
      <Link href={'/catalogo?categoria=' + categoria.slug} className={enlaceCategoria}>
        {categoria.name}
        <ChevronDown size={12} className="transition-transform group-hover:rotate-180" />
      </Link>
      <div
        className={
          'invisible absolute top-full z-50 pt-1 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 ' +
          (alineaDerecha ? 'right-0' : 'left-0')
        }
      >
        <div className="w-[min(640px,90vw)] rounded-xl border border-[#B7D31A]/40 bg-[#111516] p-5 shadow-2xl shadow-black/60">
          <div className="grid grid-cols-3 gap-x-6">
            {categoria.brands.map((marca) => (
              <BrandMenuItem
                key={marca.id}
                marca={marca}
                href={'/catalogo?categoria=' + categoria.slug + '&marca=' + marca.slug}
              />
            ))}
          </div>
          <Link
            href={'/catalogo?categoria=' + categoria.slug}
            className="mt-4 inline-block text-xs font-bold uppercase tracking-wide text-[#B7D31A] hover:underline"
          >
            Ver todo en {categoria.name} →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CategoryMegaMenu() {
  const categorias = useMenuCategorias();
  if (categorias.length === 0) return null;

  return (
    <nav aria-label="Categorías" className="flex items-center justify-center">
      {categorias.map((categoria, i) => (
        <CategoriaConMarcas key={categoria.id} categoria={categoria} alineaDerecha={i > 0 && i >= categorias.length / 2} />
      ))}
      <Link
        href="/catalogo?oferta=true"
        className="whitespace-nowrap px-3 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#B7D31A] transition-colors hover:text-[#CAE52E]"
      >
        Ofertas
      </Link>
    </nav>
  );
}

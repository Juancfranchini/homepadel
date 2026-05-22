import Link from 'next/link';
import { Category } from '@/types';
import { getImageUrl } from '@/lib/utils';

// Fallback data si el backend no devuelve categorías
const FALLBACK_CATEGORIES: Array<Category & { gradient: string }> = [
  { id: '1', name: 'Paletas', slug: 'paletas', gradient: 'from-emerald-900 via-[#0d2b1a] to-[#111]' },
  { id: '2', name: 'Zapatillas', slug: 'zapatillas', gradient: 'from-blue-900 via-[#0d1b2b] to-[#111]' },
  { id: '3', name: 'Indumentaria', slug: 'indumentaria', gradient: 'from-purple-900 via-[#1b0d2b] to-[#111]' },
  { id: '4', name: 'Accesorios', slug: 'accesorios', gradient: 'from-orange-900 via-[#2b1a0d] to-[#111]' },
];

const GRADIENTS = [
  'from-emerald-900 via-[#0d2b1a] to-[#111]',
  'from-blue-900 via-[#0d1b2b] to-[#111]',
  'from-purple-900 via-[#1b0d2b] to-[#111]',
  'from-orange-900 via-[#2b1a0d] to-[#111]',
];

interface Props {
  categories?: Category[];
}

export default function CategoryCards({ categories }: Props) {
  const items =
    categories && categories.length > 0
      ? categories.slice(0, 4).map((cat, i) => ({ ...cat, gradient: GRADIENTS[i] || GRADIENTS[0] }))
      : FALLBACK_CATEGORIES;

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#111]">
          Categorías
        </h2>
        <Link
          href="/catalogo"
          className="text-sm font-bold text-[#111] hover:text-[#C8FF00] transition-colors flex items-center gap-1"
        >
          VER TODAS
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {items.map((cat) => {
          const imgUrl = cat.image ? getImageUrl(cat.image) : null;

          return (
            <Link
              key={cat.slug}
              href={`/catalogo?categoria=${cat.slug}`}
              className="group relative overflow-hidden rounded-xl aspect-[3/4] md:aspect-[4/5] flex flex-col items-end justify-end cursor-pointer"
            >
              {/* Fondo: imagen real o gradiente de fallback */}
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} transition-transform duration-500 group-hover:scale-105`}
                />
              )}

              {/* Overlay oscuro */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Texto */}
              <div className="relative z-10 w-full p-4">
                <p className="text-white font-black text-lg uppercase tracking-wide leading-none">
                  {cat.name.toUpperCase()}
                </p>
                <p className="text-gray-400 text-xs font-medium mt-1 group-hover:text-[#C8FF00] transition-colors duration-200 flex items-center gap-1">
                  VER PRODUCTOS
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </p>
              </div>

              {/* Borde inferior animado */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C8FF00] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

import Link from 'next/link';
import { Category } from '@/types';
import { getImageUrl } from '@/lib/utils';

interface Props {
  categories?: Category[];
  title?: string;
  description?: string;
}

export default function CategoryCards({ categories, title, description }: Props) {
  if (!categories || categories.length === 0) return null;

  const items = categories.slice(0, 5);

  return (
    <section className="section-gradient bg-[#202427] py-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-7">
          <h2 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-[#F7F6F7]">
            {title || 'CATEGORIAS'}
          </h2>
          <p className="text-[#C7C7C0] text-sm mt-1">
            {description || 'Encontra lo que necesitas para tu mejor version en la cancha.'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {items.map((cat) => {
            const imgUrl = cat.image ? getImageUrl(cat.image) : null;

            return (
              <Link
                key={cat.slug}
                href={'/catalogo?categoria=' + cat.slug}
                className="group relative overflow-hidden rounded-xl aspect-[3/4] flex flex-col items-end justify-end cursor-pointer"
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#0C0C0C] transition-transform duration-500 group-hover:scale-105" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="relative z-10 w-full p-3">
                  <p className="text-[#F7F6F7] font-semibold text-sm uppercase tracking-wide leading-none">
                    {cat.name.toUpperCase()}
                  </p>
                  <p className="text-[#C7C7C0] text-[10px] font-medium mt-1 group-hover:text-[#B7D31A] transition-colors duration-200 flex items-center gap-1 uppercase tracking-wider">
                    VER PRODUCTOS
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#B7D31A] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

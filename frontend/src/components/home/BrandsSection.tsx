import { Brand } from '@/types';
import { getImageUrl } from '@/lib/utils';

interface Props {
  brands?: Brand[];
}

const FALLBACK_BRAND_NAMES = ['Bullpadel', 'NOX', 'Adidas', 'Babolat', 'Wilson', 'Ulrich'];

export default function BrandsSection({ brands }: Props) {
  const hasBrands = brands && brands.length > 0;

  return (
    <section className="border-t border-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          {/* Etiqueta */}
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 whitespace-nowrap flex-none">
            Marcas Oficiales
          </p>

          {/* Logos */}
          <div className="flex items-center gap-8 md:gap-12 flex-wrap justify-center md:justify-start flex-1">
            {hasBrands
              ? brands!.map((brand) =>
                  brand.logo ? (
                    <img
                      key={brand.id}
                      src={getImageUrl(brand.logo)}
                      alt={brand.name}
                      className="h-7 md:h-8 w-auto object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-200"
                    />
                  ) : (
                    <span
                      key={brand.id}
                      className="text-gray-400 font-black text-sm uppercase tracking-wider hover:text-[#111] transition-colors cursor-default"
                    >
                      {brand.name}
                    </span>
                  )
                )
              : FALLBACK_BRAND_NAMES.map((name) => (
                  <span
                    key={name}
                    className="text-gray-400 font-black text-sm uppercase tracking-wider hover:text-[#111] transition-colors cursor-default"
                  >
                    {name}
                  </span>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}

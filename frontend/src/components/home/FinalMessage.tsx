import { FinalMessageData } from '@/types';
import Link from 'next/link';
import { ArrowRight , Package} from 'lucide-react';
import NewsletterForm from './NewsletterForm';

interface Props {
  data: FinalMessageData | null;
}

export default function FinalMessage({ data }: Props) {
  if (data && data.active === false) return null;

  const title = data?.title ?? 'LISTO PARA TU PROXIMO PARTIDO';
  const subtitle = data?.subtitle ?? 'Encontra todo lo que necesitas en un solo lugar. Las mejores marcas, los mejores precios.';
  const ctaText = data?.ctaText ?? 'VER CATALOGO';
  const ctaUrl = data?.ctaUrl ?? '/catalogo';

  return (
    <section className="section-gradient bg-[#050606] py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
          
          {/* Columna 1: FinalMessage */}
          <div className="bg-[#0C0C0C] border border-[#0D0F0F] rounded-2xl p-8 md:p-10 flex flex-col justify-between h-full">
            <div className="flex flex-col gap-5">
              {/* Nivel 1: Icono/Logo */}
              <div className="w-12 h-12 rounded-full bg-[#B7D31A]/10 border border-[#B7D31A]/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-[#B7D31A]" />
              </div>

              {/* Nivel 2: Titulo */}
              <h2 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-[#F7F6F7] leading-tight">
                {title}
              </h2>

              {/* Nivel 3: Texto descriptivo */}
              {subtitle && (
                <p className="text-[#C7C7C0] text-sm leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4 mt-6">
              {/* Nivel 4: Separador */}
              <div className="w-10 h-0.5 bg-[#B7D31A] rounded-full" />

              {/* Nivel 5: Boton */}
              <div className="flex flex-wrap items-center gap-3">
                {ctaText && ctaUrl && (
                  <Link href={ctaUrl} className="btn-primary-glow bg-[#B7D31A] text-[#050606] px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider inline-flex items-center gap-2 hover:bg-[#CAE52E] transition-colors">
                    {ctaText}
                    <ArrowRight size={14} />
                  </Link>
                )}
                {data?.ctaSecondaryText && data?.ctaSecondaryUrl && (
                  <Link href={data.ctaSecondaryUrl} className="bg-[#0A2D3D] text-[#F7F6F7] px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider inline-flex items-center gap-2 hover:bg-[#0D3D52] transition-colors">
                    {data.ctaSecondaryText}
                  </Link>
                )}
              </div>

              {/* Nivel 6: Texto small (para igualar altura) */}
              <p className="text-[#8A8A85] text-[10px]">
                Productos originales. Envios a todo el pais.
              </p>
            </div>
          </div>

          {/* Columna 2: Newsletter */}
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
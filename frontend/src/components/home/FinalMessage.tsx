import Link from 'next/link';
import { FinalMessageData } from '@/types';

interface Props {
  data?: FinalMessageData | null;
}

export default function FinalMessage({ data }: Props) {
  // No renderizar si está explícitamente inactivo
  if (data && data.active === false) return null;

  const title = data?.title ?? '¿Listo para jugar tu mejor partido?';
  const subtitle = data?.subtitle ?? 'Explorá todo nuestro catálogo y encontrá lo que necesitás.';
  const ctaText = data?.ctaText ?? 'Ver catálogo';
  const ctaUrl = data?.ctaUrl ?? '/catalogo';
  const ctaSecondaryText = data?.ctaSecondaryText;
  const ctaSecondaryUrl = data?.ctaSecondaryUrl;

  return (
    <section className="bg-[#C8FF00] py-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#111] leading-tight">
          {title}
        </h2>

        {subtitle && (
          <p className="text-[#333] text-base md:text-lg mt-4 font-medium">
            {subtitle}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            href={ctaUrl}
            className="inline-flex items-center gap-2 bg-[#111] text-white px-8 py-4 font-black text-sm uppercase tracking-wider rounded hover:bg-[#333] transition-colors"
          >
            {ctaText}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>

          {ctaSecondaryText && ctaSecondaryUrl && (
            <Link
              href={ctaSecondaryUrl}
              className="inline-flex items-center gap-2 bg-transparent border-2 border-[#111] text-[#111] px-8 py-4 font-black text-sm uppercase tracking-wider rounded hover:bg-[#111] hover:text-white transition-colors"
            >
              {ctaSecondaryText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

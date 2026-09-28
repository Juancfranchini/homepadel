import { FinalMessageData } from '@/types';
import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import NewsletterForm from './NewsletterForm';

interface Props {
  data: FinalMessageData | null;
}

export default function FinalMessage({ data }: Props) {
  if (data && data.active === false) return null;

  const title = data?.title ?? 'Un mensaje para vos';
  const text = data?.text ?? 'Encontra todo lo que necesitas en un solo lugar. Las mejores marcas, los mejores precios.';
  const buttonText = data?.buttonText ?? 'Ver catálogo';
  const buttonUrl = data?.buttonUrl ?? '/catalogo';
  const footerText = data?.footerText ?? 'Productos originales. Envíos a todo el pais.';

  return (
    <section className="section-gradient bg-page py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-12">
          <div className="bg-panel border border-line rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-10 flex flex-col justify-between h-full">
            <div className="flex flex-col gap-3 sm:gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#B7D31A]/10 border border-[#B7D31A]/20 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-brand-fg" />
                </div>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold uppercase tracking-tight text-fg leading-tight">{title}</h2>
              </div>
              {text && <p className="text-fg-soft text-xs sm:text-sm leading-relaxed">{text}</p>}
            </div>
            <div className="flex flex-col gap-3 sm:gap-4 mt-3 sm:mt-6">
              <div className="w-8 sm:w-10 h-0.5 bg-[#B7D31A] rounded-full" />
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
                {buttonText && buttonUrl && (
                  <Link href={buttonUrl} className="btn-primary-glow bg-[#B7D31A] text-[#050606] px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#CAE52E] transition-colors w-full sm:w-auto">
                    {buttonText}<ArrowRight size={14} />
                  </Link>
                )}
                {data?.secondaryButtonText && data?.secondaryButtonUrl && (
                  <Link href={data.secondaryButtonUrl} className="bg-ocean text-fg px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-ocean-2 transition-colors w-full sm:w-auto">
                    {data.secondaryButtonText}
                  </Link>
                )}
              </div>
              {footerText && <p className="text-fg-muted text-[10px]">{footerText}</p>}
            </div>
          </div>
          <NewsletterForm data={data} />
        </div>
      </div>
    </section>
  );
}

import { AboutSection as AboutData } from '@/types';
import { getImageUrl } from '@/lib/utils';
import { Heart, Users, Shield, Star, Award, Zap, CheckCircle, Truck } from 'lucide-react';
import { createElement } from 'react';

const ICON_MAP: Record<string, any> = { Heart, Users, Shield, Star, Award, Zap, CheckCircle, Truck };

interface Props {
  data: AboutData | null;
}

const FALLBACK: AboutData = {
  title: 'Somos Home Padel',
  description: 'En Home Padel vivimos este deporte con la misma pasion que vos. Ofrecemos las mejores marcas con atencion personalizada y envios a todo el pais.',
  image: undefined,
  benefits: [
    { icon: 'Truck', title: 'Envios a todo el pais', description: 'Llegamos a cada rincon de Argentina' },
    { icon: 'Shield', title: 'Productos originales', description: 'Garantia oficial de fabrica' },
    { icon: 'Users', title: 'Atencion personalizada', description: 'Te asesoramos segun tu nivel y estilo' },
  ],
};

export default function AboutSection({ data }: Props) {
  const d = data?.title ? data : FALLBACK;
  const bgImage = d.image ? getImageUrl(d.image!) : null;
  const benefits = d.benefits && d.benefits.length > 0 ? d.benefits : FALLBACK.benefits;
  const hasAnyDescription = benefits.some((b) => b.description && b.description.trim().length > 0);

  return (
    <section className="section-gradient relative bg-[#061E29] overflow-hidden py-16 md:py-20">
      {bgImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(' + bgImage + ')' }} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#061E29] via-[#061E29]/85 to-[#061E29]/40" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[#061E29]" />
      )}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-4">
            {d.title}
          </h2>
          <p className="text-[#C7C7C0] text-sm md:text-base leading-relaxed mb-8">{d.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {benefits.map((b, i) => {
              const IconComp = ICON_MAP[b.icon] || Truck;
              const hasDesc = b.description && b.description.trim().length > 0;
              return (
                <div key={i} className={'flex gap-3 ' + (hasDesc ? 'items-start' : 'items-center')}>
                  <div className={'rounded-lg bg-[#242A05] flex items-center justify-center flex-shrink-0 ' + (hasDesc ? 'w-12 h-12' : 'w-10 h-10')}>
                    {createElement(IconComp, { size: hasDesc ? 22 : 20, className: 'text-[#B7D31A]' })}
                  </div>
                  <div>
                    <span className="text-[#C7C7C0] text-sm font-medium block">{b.title}</span>
                    {hasDesc && <span className="text-[#8A8A85] text-xs mt-0.5 block">{b.description}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

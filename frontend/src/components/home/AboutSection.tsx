import { AboutSection as AboutData } from '@/types';
import { getImageUrl } from '@/lib/utils';
import { Truck, Shield, Users } from 'lucide-react';

interface Props {
  data: AboutData | null;
}

const FALLBACK: AboutData = {
  title: 'SOMOS HOME PADEL',
  description: 'En Home Padel somos apasionados por este deporte. Ofrecemos las mejores marcas con atencion personalizada y envios a todo el pais.',
  image: undefined,
};

const FEATURES = [
  { icon: <Truck size={20} />, text: 'Envios a todo el pais' },
  { icon: <Shield size={20} />, text: 'Productos originales' },
  { icon: <Users size={20} />, text: 'Atencion personalizada' },
];

export default function AboutSection({ data }: Props) {
  const d = data || FALLBACK;
  const bgImage = d.image ? getImageUrl(d.image) : null;

  return (
    <section className="section-gradient relative bg-[#061E29] overflow-hidden py-16 md:py-20">
      {/* Imagen de fondo full-width */}
      {bgImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(' + bgImage + ')' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#061E29] via-[#061E29]/85 to-[#061E29]/40" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[#061E29]" />
      )}

      {/* Contenido */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-4">
            SOMOS <span className="text-[#B7D31A]">HOME PADEL</span>
          </h2>
          <p className="text-[#C7C7C0] text-sm md:text-base leading-relaxed mb-8">
            {d.description}
          </p>

          {/* 3 columnas con iconos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#242A05] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#B7D31A]">{f.icon}</span>
                </div>
                <span className="text-[#C7C7C0] text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
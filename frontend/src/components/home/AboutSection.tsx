import { Heart, Users, Shield } from 'lucide-react';
import { AboutSection as AboutData } from '@/types';
import { getImageUrl } from '@/lib/utils';

const ICON_MAP: Record<string, React.ReactNode> = {
  Heart: <Heart size={20} strokeWidth={1.5} />,
  Users: <Users size={20} strokeWidth={1.5} />,
  Shield: <Shield size={20} strokeWidth={1.5} />,
};

const FALLBACK: AboutData = {
  title: 'Somos Home Pádel',
  description: 'Vivimos el pádel tanto como vos. Seleccionamos los mejores productos para que solo te enfoques en jugar tu mejor partido.',
  benefits: [
    { icon: 'Heart', title: 'Pasión por el pádel', description: 'Somos jugadores antes que vendedores' },
    { icon: 'Users', title: 'Atención personalizada', description: 'Te asesoramos según tu nivel y estilo' },
    { icon: 'Shield', title: 'Experiencia y confianza', description: 'Años en el mercado del pádel argentino' },
  ],
};

interface Props {
  data?: AboutData | null;
}

export default function AboutSection({ data }: Props) {
  const about = data ?? FALLBACK;
  const imageUrl = about.image ? getImageUrl(about.image) : null;

  return (
    <section className="bg-[#111] py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Texto */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1 h-7 bg-[#C8FF00] rounded-full" />
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                {about.title}
              </h2>
            </div>

            <p className="text-gray-400 text-base leading-relaxed mb-8">
              {about.description}
            </p>

            <div className="space-y-4">
              {about.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#C8FF00]/10 border border-[#C8FF00]/20 flex items-center justify-center text-[#C8FF00] flex-none">
                    {ICON_MAP[b.icon] ?? <Shield size={20} strokeWidth={1.5} />}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{b.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Imagen o placeholder */}
          <div className="flex items-center justify-center">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={about.title}
                className="rounded-2xl w-full max-w-md object-cover shadow-2xl"
              />
            ) : (
              <div className="w-full max-w-md aspect-square rounded-2xl bg-[#1a1a1a] border border-white/10 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                {/* Fondo decorativo */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#C8FF00]/5 to-transparent" />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-2xl bg-[#C8FF00]/10 border border-[#C8FF00]/20 flex items-center justify-center">
                    <span className="text-[#C8FF00] font-black text-2xl">HP</span>
                  </div>
                  <p className="text-gray-600 text-xs uppercase tracking-widest text-center max-w-[200px]">
                    Subí una imagen desde el backoffice
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

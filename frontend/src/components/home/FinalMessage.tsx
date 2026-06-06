import { FinalMessageData } from '@/types';

interface Props {
  data?: FinalMessageData | null;
}

// Ícono de pelota de pádel (SVG inline)
function PadelBallIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="text-[#C8FF00]"
    >
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M8 20 Q16 14 24 20 Q32 26 40 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M8 28 Q16 22 24 28 Q32 34 40 28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default function FinalMessage({ data }: Props) {
  // No renderizar si está explícitamente inactivo
  if (data && data.active === false) return null;

  const title = data?.title ?? 'UN MENSAJE PARA VOS';
  const subtitle =
    data?.subtitle ??
    'Gracias por elegir Home Pádel. Cada compra nos impulsa a seguir creciendo y acercarte lo mejor del pádel. Vamos por más, juntos.';

  return (
    <section className="bg-[#0a0a0a] border-t border-white/5 py-20">
      <div className="max-w-2xl mx-auto px-4 text-center flex flex-col items-center gap-6">
        {/* Ícono */}
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <PadelBallIcon />
        </div>

        {/* Eyebrow */}
        <p className="text-[#C8FF00] text-xs font-black uppercase tracking-[0.3em]">
          Home Pádel
        </p>

        {/* Título */}
        <h2 className="text-3xl md:text-4xl xl:text-5xl font-black uppercase tracking-tight text-white leading-tight">
          {title}
        </h2>

        {/* Separador */}
        <div className="w-12 h-0.5 bg-[#C8FF00]/40 rounded-full" />

        {/* Cuerpo */}
        {subtitle && (
          <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

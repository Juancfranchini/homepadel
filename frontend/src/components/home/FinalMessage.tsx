import { FinalMessageData } from '@/types';
import BrandLogo from '@/components/ui/BrandLogo';

interface Props {
  data?: FinalMessageData | null;
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
        {/* Logo oficial como identidad visual */}
        <BrandLogo variant="dark" size="md" showText={false} />

        {/* Título */}
        <h2 className="text-3xl md:text-4xl xl:text-5xl font-black uppercase tracking-tight text-white leading-tight">
          {title}
        </h2>

        {/* Separador */}
        <div className="w-12 h-0.5 bg-[#D4FF00]/40 rounded-full" />

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

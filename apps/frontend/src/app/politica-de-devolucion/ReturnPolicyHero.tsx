import { Package, RefreshCw } from 'lucide-react';

interface Props {
  hero: { chip: string; title: string; description: string };
}

export default function ReturnPolicyHero({ hero }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-[#B7D31A] text-xs font-semibold uppercase tracking-[0.2em] mb-3">{hero.chip}</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-[#F7F6F7] leading-tight mb-4">{hero.title}</h1>
          <p className="text-[#C7C7C0] text-base leading-relaxed max-w-md">{hero.description}</p>
        </div>
        <div className="flex justify-center lg:justify-end">
          <div className="w-full h-64 sm:h-72 md:w-80 md:h-80 bg-[#1A1F21] border border-[#0D0F0F] rounded-3xl flex items-center justify-center relative p-6 sm:p-8">
            <div className="relative">
              <div className="w-28 h-28 bg-[#0C0C0C] border-2 border-[#0D0F0F] rounded-2xl flex items-center justify-center">
                <Package size={48} className="text-[#8A8A85]" />
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-[#B7D31A] flex items-center justify-center">
                <RefreshCw size={20} className="text-[#050606]" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 bg-[#B7D31A]/10 border border-[#B7D31A]/20 rounded-xl px-4 py-2 text-center">
              <p className="text-[#B7D31A] font-semibold text-sm">30 DIAS</p>
              <p className="text-[#8A8A85] text-[10px]">Sin complicaciones</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

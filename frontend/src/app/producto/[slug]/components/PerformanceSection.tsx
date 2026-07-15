import { Target, Circle, Scale, Ruler, User, Zap } from 'lucide-react';
import { createElement } from 'react';

interface PerformanceStat { label: string; value: number; }
interface Spec { icon: string; title: string; value: string; }

interface Props {
  stats: PerformanceStat[];
  specs: Spec[];
}

const ICON_MAP: Record<string, any> = { Target, Circle, Scale, Ruler, User, Zap };

const DEFAULT_SPECS: Spec[] = [
  { icon: 'Target', title: 'Carbono', value: '18 K' },
  { icon: 'Circle', title: 'Forma', value: 'Redonda' },
  { icon: 'Scale', title: 'Balance', value: 'Medio' },
  { icon: 'Ruler', title: 'Peso', value: '360-375 gr' },
  { icon: 'User', title: 'Jugador', value: 'Avanzado' },
  { icon: 'Zap', title: 'Control', value: 'Superior' },
];

export default function PerformanceSection({ stats, specs }: Props) {
  const displaySpecs = specs && specs.length > 0 ? specs : DEFAULT_SPECS;
  const hasStats = stats && stats.length > 0;

  return (
    <section className="border-t border-[#0D0F0F] py-10 bg-[#242A05]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-6">RENDIMIENTO</h2>
        {hasStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#C7C7C0] w-28 flex-none">{s.label}</p>
                <div className="flex-1 h-1.5 bg-[#1A1F21] rounded-full overflow-hidden">
                  <div className="h-full bg-[#B7D31A] rounded-full transition-all duration-700" style={{ width: s.value + '%' }} />
                </div>
                <span className="text-[#B7D31A] font-semibold text-xs w-8 text-right">{s.value}%</span>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displaySpecs.map((s) => {
            const IconComp = ICON_MAP[s.icon] || Target;
            return (
              <div key={s.title} className="bg-[#1A1F21] border border-[#0D0F0F] rounded-2xl p-5 text-center flex flex-col items-center gap-2">
                <div className="text-[#B7D31A]">{createElement(IconComp, { size: 28 })}</div>
                <p className="text-[#F7F6F7] font-semibold text-sm">{s.title}</p>
                <p className="text-[#C7C7C0] text-xs leading-relaxed">{s.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

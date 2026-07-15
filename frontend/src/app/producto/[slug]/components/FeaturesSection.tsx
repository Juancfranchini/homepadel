import { createElement } from 'react';
import { Zap, Target, Shield, Gauge, TrendingUp, Star, Wind, Package, Thermometer, Footprints, Droplets, Maximize, Layers, Scissors } from 'lucide-react';

const ICON_MAP: Record<string, any> = { Zap, Target, Shield, Gauge, TrendingUp, Star, Wind, Package, Thermometer, Footprints, Droplets, Maximize, Layers, Scissors };

interface Feature { icon: string; title: string; subtitle: string; }
interface Props { features: Feature[]; }

export default function FeaturesSection({ features }: Props) {
  if (!features || features.length === 0) return null;
  return (
    <section className="py-8 border-t border-[#0D0F0F]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h3 className="text-lg font-semibold text-[#F7F6F7] mb-4">Caracteristicas</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const IconComp = ICON_MAP[f.icon] || Zap;
            return (
              <div key={i} className="bg-[#0C0C0C] rounded-xl border border-[#0D0F0F] p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#B7D31A]/10 flex items-center justify-center flex-shrink-0">
                  {createElement(IconComp, { size: 18, className: 'text-[#B7D31A]' })}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#F7F6F7]">{f.title}</p>
                  <p className="text-xs text-[#8A8A85]">{f.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

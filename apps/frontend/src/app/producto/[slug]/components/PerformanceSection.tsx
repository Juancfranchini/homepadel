'use client';

import { createElement, useEffect, useRef, useState } from 'react';
import { Crosshair, Gauge, Hand, Scale, Shield, Star, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { specIcon } from './specIcons';

interface PerformanceStat { label: string; value: number; }
interface Spec { icon: string; title: string; value: string; }

interface Props {
  stats: PerformanceStat[];
  specs: Spec[];
}

/** 0-100 en palabras: un 90 y un 65 se leían igual de "verdes" sin esta pista. */
function nivel(value: number): string {
  if (value >= 85) return 'Muy alto';
  if (value >= 70) return 'Alto';
  if (value >= 50) return 'Medio';
  if (value >= 30) return 'Bajo';
  return 'Muy bajo';
}

/** En cuántos bloques se parte cada barra. Diez hace que cada uno valga 10%. */
const SEGMENTOS = 10;

/**
 * Icono de cada característica, por nombre.
 *
 * Las barras las define la tienda con nombres fijos, así que se reconocen por
 * su texto. Una que no esté en la lista sencillamente va sin icono, no con uno
 * equivocado.
 */
const ICONO_POR_BARRA: Record<string, LucideIcon> = {
  control: Crosshair,
  potencia: Zap,
  'salida de bola': Gauge,
  manejabilidad: Hand,
  dureza: Shield,
  jugabilidad: Star,
  balance: Scale,
};

/**
 * Barra de una característica, partida en bloques.
 *
 * Una barra continua se lee como una mancha: un 90 y un 65 se ven casi igual.
 * En bloques se cuentan de un vistazo. Se llenan de a uno cuando la sección
 * entra en pantalla; antes la animación ocurría en el primer render, donde no
 * la veía nadie.
 */
function BarraRendimiento({ stat, visible }: { stat: PerformanceStat; visible: boolean }) {
  const valor = Math.max(0, Math.min(100, Number(stat.value) || 0));
  const llenos = Math.round((valor / 100) * SEGMENTOS);
  const Icono = ICONO_POR_BARRA[stat.label?.trim().toLowerCase()];

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2 gap-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#F7F6F7]">
          {Icono && <Icono size={13} className="flex-shrink-0 text-[#B7D31A]" />}
          {stat.label}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-wide text-[#8A8A85]">{nivel(valor)}</span>
          <span className="text-[#B7D31A] font-bold text-sm tabular-nums w-9 text-right">{valor}</span>
        </div>
      </div>

      <div className="flex gap-1">
        {Array.from({ length: SEGMENTOS }).map((_, i) => (
          <span
            key={i}
            className={
              'h-2.5 flex-1 rounded-[3px] transition-colors duration-300 ' +
              (visible && i < llenos ? 'bg-[#B7D31A]' : 'bg-[#0D0F0F]')
            }
            // Se encienden uno detrás de otro, como si se fueran cargando.
            style={{ transitionDelay: i * 45 + 'ms' }}
          />
        ))}
      </div>
    </div>
  );
}

export default function PerformanceSection({ stats, specs }: Props) {
  const displaySpecs = specs && specs.length > 0 ? specs : [];
  const hasStats = stats && stats.length > 0;

  const contenedor = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nodo = contenedor.current;
    if (!nodo) return;
    // Sin IntersectionObserver —o si algo falla— se muestran igual, completas.
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }

    const observador = new IntersectionObserver(
      ([entrada]) => { if (entrada.isIntersecting) { setVisible(true); observador.disconnect(); } },
      { threshold: 0.25 },
    );
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  if (!hasStats && displaySpecs.length === 0) return null;

  return (
    <section ref={contenedor} className="border-t border-[#0D0F0F] py-10 bg-[#242A05]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-6">RENDIMIENTO</h2>

        {hasStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5 mb-9">
            {stats.map((s) => <BarraRendimiento key={s.label} stat={s} visible={visible} />)}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displaySpecs.map((s) => (
            <div key={s.title} className="bg-[#1A1F21] border border-[#0D0F0F] rounded-2xl p-5 text-center flex flex-col items-center gap-2 transition-colors hover:border-[#B7D31A]/40">
              <div className="text-[#B7D31A]">{createElement(specIcon(s.icon), { size: 28 })}</div>
              <p className="text-[#F7F6F7] font-semibold text-sm">{s.title}</p>
              <p className="text-[#C7C7C0] text-xs leading-relaxed">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

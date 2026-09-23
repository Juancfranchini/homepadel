'use client';

import { createElement, useEffect, useRef, useState } from 'react';
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

/**
 * Barra de una característica.
 *
 * Crece desde cero cuando la sección entra en pantalla: antes se dibujaba ya
 * completa —la transición ocurría en el primer render, donde nadie la veía— y
 * eran cinco líneas finas casi iguales entre sí.
 */
function BarraRendimiento({ stat, visible }: { stat: PerformanceStat; visible: boolean }) {
  const valor = Math.max(0, Math.min(100, Number(stat.value) || 0));

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#F7F6F7]">{stat.label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-wide text-[#8A8A85]">{nivel(valor)}</span>
          <span className="text-[#B7D31A] font-bold text-sm tabular-nums w-9 text-right">{valor}</span>
        </div>
      </div>
      <div className="relative h-2.5 rounded-full bg-[#0D0F0F] overflow-hidden">
        {/* Marcas cada 25% para que la barra se lea como una escala y no como
            una mancha de color. */}
        <div className="absolute inset-0 flex justify-between px-[25%] pointer-events-none">
          <span className="w-px bg-white/10" />
          <span className="w-px bg-white/10" />
        </div>
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-[#7E9412] to-[#CAE52E] transition-[width] duration-1000 ease-out"
          style={{ width: (visible ? valor : 0) + '%' }}
        >
          <span className="absolute right-0 top-1/2 h-3.5 w-1 -translate-y-1/2 rounded-full bg-[#F7F6F7]" />
        </div>
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

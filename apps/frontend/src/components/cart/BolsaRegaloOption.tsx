'use client';

import Image from 'next/image';
import { Gift, Minus, Plus } from 'lucide-react';
import { bolsasEfectivas, useCartStore } from '@/store/cartStore';

/**
 * Ofrece la bolsa de regalo Home Pádel (sin cargo), una por producto como
 * máximo. `compacta` es la versión del resumen del checkout.
 */
export default function BolsaRegaloOption({ compacta = false }: { compacta?: boolean }) {
  const items = useCartStore((s) => s.items);
  const pedidas = useCartStore((s) => s.bolsasRegalo);
  const setBolsas = useCartStore((s) => s.setBolsasRegalo);
  const unidades = items.reduce((acc, i) => acc + i.quantity, 0);
  const bolsas = bolsasEfectivas(pedidas, items);
  if (unidades === 0) return null;

  return (
    <div className={`bg-card rounded-2xl border border-line flex items-center gap-4 ${compacta ? 'p-3 mb-4' : 'p-4'}`}>
      <div className={`relative flex-shrink-0 rounded-xl bg-[#ECEAE4] overflow-hidden ${compacta ? 'w-14 h-16' : 'w-24 h-28'}`}>
        <Image src="/images/bolsa-regalo.webp" alt="Bolsa de regalo Home Pádel" fill sizes="96px" className="object-contain p-1" />
      </div>
      <div className={`flex-1 min-w-0 ${compacta ? '' : 'sm:flex sm:items-center sm:justify-between sm:gap-4'}`}>
        <div className="min-w-0">
          <p className={`font-bold text-fg flex items-center gap-1.5 ${compacta ? 'text-sm' : ''}`}>
            <Gift size={compacta ? 14 : 16} className="text-brand-fg flex-shrink-0" /> ¿Es para regalo?
          </p>
          <p className="text-xs text-fg-muted mt-0.5">
            {bolsas > 0 ? `${bolsas === 1 ? 'Va 1 bolsa' : `Van ${bolsas} bolsas`} Home Pádel, sin cargo.` : 'Sumá la bolsa Home Pádel, sin cargo.'}
            {!compacta && ' Una por producto como máximo.'}
          </p>
        </div>
        <div className={`mt-2 ${compacta ? '' : 'sm:mt-0'} flex-shrink-0`}>
          {bolsas === 0 ? (
            <button type="button" onClick={() => setBolsas(1)}
              className="bg-[#B7D31A] text-[#050606] px-3 py-2 rounded-lg font-black text-xs uppercase tracking-wide hover:bg-[#c8e81f] transition-colors">
              Agregar
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 border border-line rounded-lg" aria-label="Cantidad de bolsas de regalo">
              <button type="button" onClick={() => setBolsas(bolsas - 1)} aria-label={bolsas === 1 ? 'Quitar bolsa de regalo' : 'Una bolsa menos'} className="p-2 text-fg-soft hover:text-fg"><Minus size={14} /></button>
              <span className="w-5 text-center text-sm font-bold text-fg">{bolsas}</span>
              <button type="button" onClick={() => setBolsas(bolsas + 1)} disabled={bolsas >= unidades} aria-label="Una bolsa más" className="p-2 text-fg-soft hover:text-fg disabled:opacity-30"><Plus size={14} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

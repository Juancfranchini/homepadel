'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Promotion } from '@/types';

interface Props {
  promotion?: Promotion | null;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function useCountdown(endDate: string): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return timeLeft;
}

function Countdown({ endDate }: { endDate: string }) {
  const { days, hours, minutes, seconds } = useCountdown(endDate);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-3">
      {[
        { v: pad(days), l: 'DÍAS' },
        { v: pad(hours), l: 'HS' },
        { v: pad(minutes), l: 'MIN' },
        { v: pad(seconds), l: 'SEG' },
      ].map(({ v, l }, i) => (
        <div key={l} className="flex items-center gap-3">
          {i > 0 && <span className="text-[#C8FF00] font-black text-xl">:</span>}
          <div className="text-center">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 min-w-[64px]">
              <span className="text-white font-black text-3xl tabular-nums">{v}</span>
            </div>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1.5">{l}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PromoDestacada({ promotion }: Props) {
  if (!promotion) return null;

  // No mostrar si ya expiró o si está inactiva
  if (!promotion.active || new Date(promotion.endDate) < new Date()) return null;

  return (
    <section className="bg-[#111] border-t border-b border-white/10 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Texto */}
          <div className="text-center md:text-left">
            <span className="text-[#C8FF00] text-xs font-black uppercase tracking-widest mb-2 block">
              OFERTA POR TIEMPO LIMITADO
            </span>
            <h2 className="text-white font-black text-3xl md:text-4xl uppercase leading-tight">
              {promotion.title}
            </h2>
            {promotion.description && (
              <p className="text-gray-400 text-sm mt-1">{promotion.description}</p>
            )}
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-500 text-xs uppercase tracking-widest">TERMINA EN:</p>
            <Countdown endDate={promotion.endDate} />
          </div>

          {/* CTA */}
          {promotion.ctaText && promotion.ctaUrl && (
            <Link
              href={promotion.ctaUrl}
              className="inline-flex items-center gap-2 bg-[#C8FF00] text-[#111] px-8 py-3.5 font-black text-sm uppercase tracking-wider rounded hover:bg-white transition-colors whitespace-nowrap"
            >
              {promotion.ctaText}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4"/>
              </svg>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

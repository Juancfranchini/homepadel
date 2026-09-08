'use client';

import Link from 'next/link';
import { MessageCircle, Mail, Clock, MapPin } from 'lucide-react';
import ContactForm from '@/components/contacto/ContactForm';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

function getFullUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('data:')) return path;
  if (path.startsWith('http')) return path;
  return API_BASE + path;
}

const ICON_MAP: Record<string, any> = { MessageCircle, Mail, Clock, MapPin };

interface Props {
  hero: { chip: string; title: string; description: string };
  heroImage: string;
  infoCards: any[];
}

export default function ContactoHero({ hero, heroImage, infoCards }: Props) {
  return (
    <section className="relative overflow-hidden bg-[#0C0C0C]">
      {heroImage && (
        <>
          <img src={getFullUrl(heroImage)} alt="" className="absolute right-0 top-0 h-full w-[55%] object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C0C0C] via-[#0C0C0C]/70 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0C0C0C]/60 via-transparent to-[#0C0C0C] pointer-events-none" />
        </>
      )}

      <div className="relative z-10 border-b border-[#0D0F0F]/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-[#8A8A85]">
          <Link href="/" className="hover:text-[#F7F6F7] transition-colors">Inicio</Link><span>/</span>
          <span className="text-[#F7F6F7]">Contacto</span>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-[#B7D31A] text-xs font-semibold uppercase tracking-[0.2em] mb-3">{hero.chip}</p>
            <h1 className="text-4xl md:text-5xl font-semibold text-[#F7F6F7] leading-tight mb-4">{hero.title}</h1>
            <p className="text-[#C7C7C0] text-base leading-relaxed mb-8">{hero.description}</p>
            <div className="space-y-5">
              {infoCards.map((item: any, i: number) => {
                const IconComp = ICON_MAP[item.icon] || MessageCircle;
                const iconColor = item.bgColor || (item.icon === 'MessageCircle' ? '#22c55e' : item.icon === 'Mail' ? '#B7D31A' : '#8A8A85');
                return item.href ? (
                  <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                    <div className="w-11 h-11 rounded-xl border flex items-center justify-center flex-none group-hover:scale-105 transition-transform" style={{ backgroundColor: iconColor + '20', borderColor: iconColor + '40' }}>
                      <IconComp size={20} style={{ color: iconColor }} />
                    </div>
                    <div><p className="text-[#F7F6F7] font-semibold text-sm">{item.title}</p><p className="text-[#C7C7C0] text-xs mt-0.5">{item.desc}</p><p className="font-semibold text-sm mt-0.5" style={{ color: iconColor }}>{item.detail}</p></div>
                  </a>
                ) : (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl border flex items-center justify-center flex-none" style={{ backgroundColor: iconColor + '20', borderColor: iconColor + '40' }}>
                      <IconComp size={20} style={{ color: iconColor }} />
                    </div>
                    <div><p className="text-[#F7F6F7] font-semibold text-sm">{item.title}</p><p className="text-[#C7C7C0] text-xs mt-0.5">{item.desc}</p><p className="text-[#C7C7C0] text-xs">{item.detail}</p></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-[#1A1F21] border border-[#0D0F0F] rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-semibold text-[#F7F6F7] mb-6">Envianos tu mensaje</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { MessageCircle, ArrowRight } from 'lucide-react';

interface Channel {
  id: string;
  title: string;
  description: string;
  logo: string;
  url: string;
  buttonText: string;
}

interface Props {
  channels: Channel[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

function getFullUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return API_BASE + path;
}

export default function ContactChannelsSection({ channels }: Props) {
  if (channels.length === 0) {
    return (
      <section className="relative bg-[#080D11]">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B7D31A]/25 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 text-center">
          <p className="text-[#8A8A85] text-sm">No hay canales disponibles.</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B7D31A]/25 to-transparent" />
      </section>
    );
  }

  return (
    <section className="relative bg-[#080D11]">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B7D31A]/25 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#B7D31A]/[0.03] to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <p className="text-[#B7D31A] text-xs font-semibold uppercase tracking-[0.2em] mb-3">CONTACTO DIRECTO</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#F7F6F7]">Elige tu canal de contacto</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {channels.map((channel) => (
            <div key={channel.id} className="bg-[#0C0C0C]/80 border border-[#B7D31A]/20 rounded-2xl p-6 flex flex-col items-center text-center gap-5 hover:border-[#B7D31A]/60 hover:bg-[#0F1417] hover:shadow-[0_0_20px_rgba(183,211,26,0.08)] transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-[#1A1F21] border border-[#0D0F0F] flex items-center justify-center overflow-hidden">
                {channel.logo ? (
                  <img src={getFullUrl(channel.logo)} alt={channel.title} className="w-full h-full object-cover" />
                ) : (
                  <MessageCircle size={32} className="text-[#B7D31A]" />
                )}
              </div>
              <h3 className="text-[#F7F6F7] font-semibold text-base">{channel.title}</h3>
              <p className="text-[#C7C7C0] text-sm leading-relaxed flex-1">{channel.description}</p>
              <a href={channel.url} target="_blank" rel="noopener noreferrer" className="mt-auto flex items-center gap-2 px-5 py-2.5 border border-[#B7D31A]/40 text-[#B7D31A] font-semibold text-sm rounded-xl hover:bg-[#B7D31A] hover:text-[#050606] transition-all group/btn">
                {channel.buttonText || 'Ir al canal'}
                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B7D31A]/25 to-transparent" />
    </section>
  );
}
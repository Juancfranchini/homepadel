'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ruler } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface SizeGuide {
  id: string;
  name: string;
  categoryId: string;
  content: string;
  productIds: string[];
  active: boolean;
  category?: { id: string; name: string };
}

function cleanContent(html: string): string {
  let cleaned = html
    .replace(/<pre><code>/g, '')
    .replace(/<\/code><\/pre>/g, '')
    .replace(/<pre>/g, '<div>')
    .replace(/<\/pre>/g, '</div>')
    .replace(/<code>/g, '<span>')
    .replace(/<\/code>/g, '</span>');
  
  const txt = document.createElement('textarea');
  txt.innerHTML = cleaned;
  let decoded = txt.value;
  if (decoded.includes('&')) {
    txt.innerHTML = decoded;
    decoded = txt.value;
  }
  return decoded;
}

export default function TallesPage() {
  const [guides, setGuides] = useState<SizeGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    fetch(API_URL + '/size-guides')
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setGuides(items);
        if (items.length > 0) setActiveTab(items[0].id);
      })
      .catch(() => setGuides([]))
      .finally(() => setLoading(false));
  }, []);

  const activeGuide = guides.find(g => g.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0C0C0C] to-[#050606] text-[#F7F6F7]">
      <div className="border-b border-[#0D0F0F]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-[#8A8A85]">
          <Link href="/" className="hover:text-[#F7F6F7] transition-colors">Inicio</Link><span>/</span>
          <span className="text-[#F7F6F7]">Guia de Talles</span>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-10">
          <p className="text-[#B7D31A] text-xs font-semibold uppercase tracking-[0.2em] mb-3">TALLES</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-[#F7F6F7] leading-tight mb-4">Guia de Talles</h1>
          <p className="text-[#C7C7C0] text-base leading-relaxed max-w-xl mx-auto">
            Encontra el talle perfecto para tus productos.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12"><p className="text-[#8A8A85] text-sm">Cargando...</p></div>
        ) : guides.length === 0 ? (
          <div className="text-center py-12">
            <Ruler size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-[#8A8A85] text-sm">No hay guias de talles disponibles.</p>
          </div>
        ) : (
          <>
            {guides.length > 1 && (
              <div className="flex flex-wrap gap-2 justify-center mb-10">
                {guides.map(guide => (
                  <button
                    key={guide.id}
                    onClick={() => setActiveTab(guide.id)}
                    className={'px-5 py-2 rounded-xl text-sm font-semibold transition-all ' + (activeTab === guide.id ? 'bg-[#B7D31A] text-[#050606]' : 'bg-[#0A0F12] border border-[#0D0F0F] text-[#C7C7C0] hover:border-[#B7D31A]/30')}
                  >
                    {guide.name}
                    {guide.category && <span className="text-xs opacity-70 ml-1">({guide.category.name})</span>}
                  </button>
                ))}
              </div>
            )}

            {activeGuide && (
              <div className="bg-[#0A0F12] border border-[#0D0F0F] rounded-2xl p-8 md:p-10">
                <h2 className="text-2xl font-semibold text-[#F7F6F7] mb-6">{activeGuide.name}</h2>
                <div
                  className="size-guide-content prose prose-invert max-w-none [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-[#1A1F21] [&_th]:bg-[#1A1F21] [&_th]:text-[#F7F6F7] [&_th]:font-semibold [&_th]:text-sm [&_th]:px-4 [&_th]:py-2 [&_td]:border [&_td]:border-[#1A1F21] [&_td]:text-[#C7C7C0] [&_td]:text-sm [&_td]:px-4 [&_td]:py-2 [&_img]:rounded-xl [&_h3]:text-[#F7F6F7] [&_h3]:font-semibold [&_h3]:text-lg [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:text-[#C7C7C0] [&_li]:text-sm [&_a]:text-[#B7D31A] [&_a]:underline [&_*]:max-w-full [&_*]:overflow-wrap-anywhere"
                  dangerouslySetInnerHTML={{ __html: cleanContent(activeGuide.content) }}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
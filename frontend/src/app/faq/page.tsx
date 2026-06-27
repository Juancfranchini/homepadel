'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Plus, X, MessageCircle } from 'lucide-react';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    fetch(apiUrl + '/faq')
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) ? data : data?.data || [];
        setFaqs(items);
      })
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  const grouped = faqs.reduce((acc: Record<string, FaqItem[]>, faq) => {
    const cat = faq.category || 'GENERAL';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isOpen = (id: string) => openItems[id] || false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0C0C0C] to-[#050606] text-[#F7F6F7]">
      <div className="border-b border-[#0D0F0F]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-[#8A8A85]">
          <Link href="/" className="hover:text-[#F7F6F7] transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-[#F7F6F7]">Preguntas Frecuentes</span>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16 text-center">
        <p className="text-[#B7D31A] text-xs font-semibold uppercase tracking-[0.2em] mb-3">SOPORTE</p>
        <h1 className="text-4xl md:text-5xl font-semibold text-[#F7F6F7] leading-tight mb-4">
          Preguntas Frecuentes
        </h1>
        <p className="text-[#C7C7C0] text-base leading-relaxed max-w-xl mx-auto">
          Encontra respuestas a las dudas mas comunes. Si no encontras lo que buscas, no dudes en contactarnos.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#8A8A85] text-sm">Cargando...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#8A8A85] text-sm">No hay preguntas disponibles.</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat} className="mb-12">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B7D31A] mb-5 flex items-center gap-2">
                <span className="w-4 h-px bg-[#B7D31A]" />
                {cat}
              </h2>
              <div className="space-y-3">
                {grouped[cat].map((item) => {
                  const open = isOpen(item.id);
                  return (
                    <div key={item.id} className="bg-[#0A2D3D] border border-[#0D0F0F] rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                      >
                        <span className="text-[#F7F6F7] font-semibold text-sm">{item.question}</span>
                        <div className={'flex-shrink-0 transition-transform duration-300 ' + (open ? 'rotate-180' : '')}>
                          {open ? (
                            <X size={18} className="text-[#B7D31A]" />
                          ) : (
                            <Plus size={18} className="text-[#B7D31A]" />
                          )}
                        </div>
                      </button>
                      <div className={'overflow-hidden transition-all duration-300 ' + (open ? 'max-h-96' : 'max-h-0')}>
                        <div className="px-6 pb-5">
                          <p className="text-[#C7C7C0] text-sm leading-relaxed">{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>

      <section className="border-t border-[#0D0F0F] py-12 bg-[#050606]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h3 className="text-[#F7F6F7] font-semibold text-xl mb-2">No encontraste lo que buscabas?</h3>
          <p className="text-[#C7C7C0] text-sm mb-6">Nuestro equipo esta disponible de Lunes a Viernes de 9 a 18 hs.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://wa.me/5491131813297"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-[#B7D31A] text-[#050606] font-semibold text-sm rounded-xl hover:bg-[#CAE52E] transition-colors"
            >
              <MessageCircle size={16} />
              Escribinos por WhatsApp
            </a>
            <Link
              href="/contacto"
              className="flex items-center gap-2 px-6 py-3 bg-[#0A2D3D] text-[#F7F6F7] font-semibold text-sm rounded-xl hover:bg-[#0D3D52] transition-colors"
            >
              Ir al formulario de contacto
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
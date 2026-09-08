'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import FaqAccordionList from './FaqAccordionList';
import FaqContactCta from './FaqContactCta';

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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-12 lg:py-16 text-center">
        <p className="text-[#B7D31A] text-xs font-semibold uppercase tracking-[0.2em] mb-3">SOPORTE</p>
        <h1 className="text-4xl md:text-5xl font-semibold text-[#F7F6F7] leading-tight mb-4">
          Preguntas Frecuentes
        </h1>
        <p className="text-[#C7C7C0] text-base leading-relaxed max-w-xl mx-auto">
          Encontra respuestas a las dudas más comunes. Si no encontras lo que buscas, no dudes en contactarnos.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-5 sm:pb-20">
        <FaqAccordionList loading={loading} categories={categories} grouped={grouped} isOpen={isOpen} onToggle={toggleItem} />
      </section>

      <FaqContactCta />
    </div>
  );
}

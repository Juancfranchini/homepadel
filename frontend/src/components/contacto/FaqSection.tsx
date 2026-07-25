'use client';

import { useState } from 'react';
import { MessageCircle, Plus, X } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface Props {
  faqs: FaqItem[];
}

export default function FaqSection({ faqs }: Props) {
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({});

  const toggleFaq = (id: string) => {
    setOpenFaqs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (faqs.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#F7F6F7]">Preguntas Frecuentes</h2>
        <p className="text-[#C7C7C0] text-sm">
          ¿No encontraste lo que buscabas?{' '}
          <a href="https://wa.me/5491131813297" target="_blank" rel="noopener noreferrer" className="text-[#B7D31A] font-semibold hover:underline inline-flex items-center gap-1">
            Escríbenos por WhatsApp <MessageCircle size={14} />
          </a>
        </p>
      </div>
      <div className="space-y-3">
        {faqs.map((faq) => {
          const open = openFaqs[faq.id] || false;
          return (
            <div key={faq.id} className="bg-[#0A2D3D] border border-[#0D0F0F] rounded-2xl overflow-hidden">
              <button onClick={() => toggleFaq(faq.id)} className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left">
                <span className="text-[#F7F6F7] font-semibold text-sm">{faq.question}</span>
                <div className={'flex-shrink-0 transition-transform duration-300 ' + (open ? 'rotate-180' : '')}>
                  {open ? <X size={18} className="text-[#B7D31A]" /> : <Plus size={18} className="text-[#B7D31A]" />}
                </div>
              </button>
              <div className={'overflow-hidden transition-all duration-300 ' + (open ? 'max-h-96' : 'max-h-0')}>
                <div className="px-6 pb-5"><p className="text-[#C7C7C0] text-sm leading-relaxed">{faq.answer}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
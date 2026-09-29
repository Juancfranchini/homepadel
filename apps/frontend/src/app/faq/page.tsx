'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import FaqAccordionList from './FaqAccordionList';
import FaqContactCta from './FaqContactCta';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

function applyPublicCheckoutPolicy(faq: FaqItem, conTransferencia: boolean): FaqItem {
  const question = faq.question.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (faq.category.toUpperCase() === 'ENVIOS' && question.includes('costo')) {
    return { ...faq, answer: 'Correo Argentino usa una tarifa plana visible en el carrito y puede ser gratis desde el monto configurado. En AMBA también está el Envío Flex en moto, con precio según tu partido o localidad. Andreani es gratis desde el mismo monto que Correo Argentino; por debajo, igual que OCA, el costo se coordina por WhatsApp.' };
  }
  if (faq.category.toUpperCase() !== 'PAGOS') return faq;
  if (question.includes('metodo') && question.includes('pago')) {
    const transferText = conTransferencia ? ' También podés pagar por transferencia bancaria: al confirmar el pedido te mostramos los datos de la cuenta.' : '';
    return { ...faq, answer: 'Trabajamos con Mercado Pago Checkout Pro. Dentro de Mercado Pago podés elegir tarjeta, saldo u otros medios disponibles.' + transferText };
  }
  if (question.includes('cuota')) {
    return { ...faq, answer: 'Las cuotas disponibles se muestran antes de comprar y se confirman al ingresar a Mercado Pago.' };
  }
  if (question.includes('seguro')) {
    return { ...faq, answer: 'Sí. El pago se completa dentro de Mercado Pago y Home Pádel no almacena datos de tarjetas.' };
  }
  return faq;
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { transferencia } = usePaymentMethods();

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

  const conTransferencia = transferencia.active === true;
  const grouped = faqs.map((faq) => applyPublicCheckoutPolicy(faq, conTransferencia)).reduce((acc: Record<string, FaqItem[]>, faq) => {
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
    <div className="min-h-screen bg-gradient-to-b from-panel to-page text-fg">
      <div className="border-b border-line">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-fg-muted">
          <Link href="/" className="hover:text-fg transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-fg">Preguntas Frecuentes</span>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-12 lg:py-16 text-center">
        <p className="text-brand-fg text-xs font-semibold uppercase tracking-[0.2em] mb-3">SOPORTE</p>
        <h1 className="text-4xl md:text-5xl font-semibold text-fg leading-tight mb-4">
          Preguntas Frecuentes
        </h1>
        <p className="text-fg-soft text-base leading-relaxed max-w-xl mx-auto">
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

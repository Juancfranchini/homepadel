'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus, X, MessageCircle } from 'lucide-react';

const FAQS = [
  {
    category: 'COMPRAS',
    items: [
      { q: 'Como realizo una compra?', a: 'Podes comprar directamente desde nuestra web: elegis el producto, lo agregas al carrito y completas el proceso de pago con los metodos disponibles.' },
      { q: 'Necesito crear una cuenta para comprar?', a: 'No es obligatorio, podes comprar como invitado. Sin embargo, registrarte te permite hacer seguimiento de tus pedidos y tener acceso a promociones exclusivas.' },
      { q: 'Como se que mi compra fue exitosa?', a: 'Una vez completado el pago, recibiras un email de confirmacion con el detalle de tu pedido y el numero de seguimiento.' },
    ],
  },
  {
    category: 'ENVIOS',
    items: [
      { q: 'A que zonas hacen envios?', a: 'Enviamos a todo el pais a traves de nuestros operadores logisticos. Para CABA y GBA ofrecemos envio express en 24/48 hs.' },
      { q: 'Cuanto tarda en llegar mi pedido?', a: 'CABA y GBA: 1 a 3 dias habiles. Interior del pais: 3 a 7 dias habiles segun la zona.' },
      { q: 'Los envios tienen costo?', a: 'El costo de envio varia segun la zona y el peso del pedido. Los pedidos superiores a .000 tienen envio gratis a CABA y GBA.' },
      { q: 'Puedo retirar mi pedido en el local?', a: 'Si, ofrecemos retiro en nuestro local sin costo adicional. Una vez listo, te avisamos por email o WhatsApp.' },
    ],
  },
  {
    category: 'PAGOS',
    items: [
      { q: 'Que medios de pago aceptan?', a: 'Aceptamos tarjetas de credito (Visa, Mastercard, American Express), tarjetas de debito, Mercado Pago y transferencia bancaria.' },
      { q: 'Puedo pagar en cuotas?', a: 'Si, ofrecemos hasta 6 cuotas sin interes con las principales tarjetas de credito.' },
      { q: 'Es seguro pagar en la web?', a: 'Si, todas las transacciones estan protegidas con certificado SSL y procesadas a traves de plataformas seguras certificadas.' },
    ],
  },
  {
    category: 'DEVOLUCIONES Y CAMBIOS',
    items: [
      { q: 'Puedo devolver un producto?', a: 'Si, tenes 30 dias desde la recepcion del producto para solicitar un cambio o devolucion, siempre que este sin uso y en su embalaje original.' },
      { q: 'Como solicito una devolucion?', a: 'Contactanos por WhatsApp o email con tu numero de pedido y el motivo de la devolucion. Nuestro equipo te guiara en el proceso.' },
      { q: 'Me devuelven el dinero?', a: 'Podes elegir entre cambio por otro producto del mismo valor o reintegro del dinero. El reintegro se procesa en 3 a 5 dias habiles.' },
    ],
  },
  {
    category: 'PRODUCTOS',
    items: [
      { q: 'Los productos tienen garantia?', a: 'Todos nuestros productos cuentan con garantia del fabricante. Las paletas tienen garantia de 3 a 12 meses segun la marca.' },
      { q: 'Como elijo el tamano correcto de paleta?', a: 'Contamos con una guia de talles detallada. En general, te recomendamos considerar tu nivel de juego y estilo (control vs. potencia).' },
      { q: 'Los precios son con IVA incluido?', a: 'Si, todos nuestros precios publicados incluyen IVA y demas impuestos correspondientes.' },
    ],
  },
];

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = categoryIndex + '-' + itemIndex;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isOpen = (categoryIndex: number, itemIndex: number) => {
    return openItems[categoryIndex + '-' + itemIndex] || false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0C0C0C] to-[#050606] text-[#F7F6F7]">

      {/* BREADCRUMB */}
      <div className="border-b border-[#0D0F0F]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-[#8A8A85]">
          <Link href="/" className="hover:text-[#F7F6F7] transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-[#F7F6F7]">Preguntas Frecuentes</span>
        </div>
      </div>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16 text-center">
        <p className="text-[#B7D31A] text-xs font-semibold uppercase tracking-[0.2em] mb-3">SOPORTE</p>
        <h1 className="text-4xl md:text-5xl font-semibold text-[#F7F6F7] leading-tight mb-4">
          Preguntas Frecuentes
        </h1>
        <p className="text-[#C7C7C0] text-base leading-relaxed max-w-xl mx-auto">
          Encontra respuestas a las dudas mas comunes. Si no encontras lo que buscas, no dudes en contactarnos.
        </p>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 pb-20">
        {FAQS.map((section, catIdx) => (
          <div key={catIdx} className="mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B7D31A] mb-5 flex items-center gap-2">
              <span className="w-4 h-px bg-[#B7D31A]" />
              {section.category}
            </h2>
            <div className="space-y-3">
              {section.items.map((item, itemIdx) => {
                const open = isOpen(catIdx, itemIdx);
                return (
                  <div key={itemIdx} className="bg-[#0A2D3D] border border-[#0D0F0F] rounded-2xl overflow-hidden">
                    <button
                      onClick={() => toggleItem(catIdx, itemIdx)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                    >
                      <span className="text-[#F7F6F7] font-semibold text-sm">{item.q}</span>
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
                        <p className="text-[#C7C7C0] text-sm leading-relaxed">{item.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
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
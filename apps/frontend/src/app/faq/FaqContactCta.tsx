import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { trackMetaEvent } from '@/lib/metaPixel';

export default function FaqContactCta() {
  return (
    <section className="border-t border-[#0D0F0F] py-5 sm:py-12 bg-[#050606]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h3 className="text-[#F7F6F7] font-semibold text-xl mb-2">No encontraste lo que buscabas?</h3>
        <p className="text-[#C7C7C0] text-sm mb-6">Nuestro equipo esta disponible de Lunes a Viernes de 9 a 18 hs.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://wa.me/5491131813297" onClick={() => trackMetaEvent("Contact", { content_type: "whatsapp" })}
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
  );
}

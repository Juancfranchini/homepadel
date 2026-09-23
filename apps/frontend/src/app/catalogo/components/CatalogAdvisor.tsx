'use client';

import { MessageCircle } from 'lucide-react';
import { useSiteSettings, buildWhatsappUrl } from '@/hooks/useSiteSettings';
import { trackMetaEvent } from '@/lib/metaPixel';

const MENSAJE =
  'Hola! Estoy mirando el catálogo y quiero ayuda para elegir una paleta.';

/**
 * Invitación a pedir asesoramiento, arriba del catálogo.
 *
 * Elegir una paleta es la decisión donde más gente abandona: las diferencias
 * entre modelos no se leen en una grilla. El bloque no se dibuja si no hay un
 * número de WhatsApp cargado en el backoffice, para no ofrecer un canal que
 * no existe.
 */
export default function CatalogAdvisor() {
  const settings = useSiteSettings();
  const url = buildWhatsappUrl(settings.whatsapp || settings.phone, MENSAJE);

  if (!url) return null;

  return (
    <div className="mb-5 rounded-2xl border border-[#B7D31A]/25 bg-gradient-to-r from-[#B7D31A]/[0.07] to-transparent px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm sm:text-base font-bold text-[#F7F6F7]">
            ¿No sabés qué paleta elegir?
          </p>
          <p className="text-xs sm:text-sm text-[#C7C7C0] max-w-xl">
            Te asesoramos según tu nivel, tu tipo de juego y tu presupuesto.
          </p>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackMetaEvent('Contact', { content_type: 'whatsapp_catalogo' })}
          className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-[#B7D31A] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-[#050606] transition-colors hover:bg-[#CAE52E]"
        >
          <MessageCircle size={15} />
          Hablar con un asesor
        </a>
      </div>
    </div>
  );
}

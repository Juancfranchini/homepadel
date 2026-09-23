'use client';

import { CalendarClock, MessageCircle, PackageCheck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useSiteSettings, buildWhatsappUrl } from '@/hooks/useSiteSettings';

interface Props {
  productName: string;
  estimatedDays?: number;
  depositAmount: number;
  remainingAmount: number;
  requiredDeposit: number;
}

/**
 * Plazo de entrega que se promete cuando el producto no tiene uno cargado.
 *
 * Es la política de la tienda, no un dato inventado: los encargos tardan entre
 * una y dos semanas. Si un producto puntual tiene su propio plazo cargado en el
 * backoffice, ese gana. Para cambiar el general, se cambia acá.
 */
const PLAZO_POR_DEFECTO = 'entre 7 y 14 días';

export default function MadeToOrderPricing({
  productName, estimatedDays, depositAmount, remainingAmount, requiredDeposit,
}: Props) {
  const { whatsapp } = useSiteSettings();
  const consulta = buildWhatsappUrl(
    whatsapp,
    `Hola! Encargué "${productName}". Quería consultar cuándo llega.`,
  );

  // `estimatedDays` puede venir en 0 desde el backoffice. Antes se escribía
  // `{estimatedDays && ...}`, que con 0 no oculta el bloque: imprime un "0"
  // suelto en la tarjeta.
  const plazo = estimatedDays && estimatedDays > 0 ? `en unos ${estimatedDays} días` : PLAZO_POR_DEFECTO;

  return (
    <div className="rounded-xl border border-[#B7D31A]/30 bg-[#B7D31A]/[0.07] p-4 space-y-3">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B7D31A]">
        <PackageCheck size={15} /> Se hace a pedido
      </p>

      <p className="flex items-start gap-2 text-sm text-[#C7C7C0]">
        <CalendarClock size={15} className="mt-0.5 flex-shrink-0 text-[#8A8A85]" />
        <span>
          No lo tenemos en stock: lo encargamos para vos y llega{' '}
          <span className="font-semibold text-[#F7F6F7]">{plazo}</span>.
        </span>
      </p>

      {depositAmount > 0 ? (
        <div className="rounded-lg bg-[#050606]/40 p-3 space-y-1">
          <p className="text-sm text-[#C7C7C0]">
            Reservás con el {requiredDeposit}%:{' '}
            <span className="font-bold text-[#F7F6F7]">{formatPrice(depositAmount)}</span>
          </p>
          <p className="text-sm text-[#C7C7C0]">
            El resto, al recibirlo:{' '}
            <span className="font-semibold text-[#F7F6F7]">{formatPrice(remainingAmount)}</span>
          </p>
        </div>
      ) : (
        <p className="text-sm text-[#C7C7C0]">Se abona el total por adelantado.</p>
      )}

      {/* El enlace solo aparece si hay número cargado: un botón que no lleva a
          ningún lado es peor que no ofrecerlo. */}
      {consulta && (
        <a
          href={consulta}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#B7D31A] transition-colors hover:text-[#CAE52E]"
        >
          <MessageCircle size={14} /> Consultá por WhatsApp cuándo llega
        </a>
      )}
    </div>
  );
}

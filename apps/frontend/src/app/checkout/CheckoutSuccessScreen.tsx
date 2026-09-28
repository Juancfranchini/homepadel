'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, CheckCircle, Copy, MessageCircle } from 'lucide-react';
import { buildWhatsappUrl } from '@/hooks/useSiteSettings';
import { formatPrice } from '@/lib/utils';
import { PedidoTransferencia } from './useCheckoutSubmit';

/**
 * Pedido tomado por transferencia: muestra cuánto y a dónde transferir, y un
 * botón para mandar el comprobante por WhatsApp con el número de pedido.
 *
 * Los datos de la cuenta llegan con la respuesta del pedido (no están en la
 * configuración pública). No promete un email: el envío de correos no está en
 * servicio.
 */
export default function CheckoutSuccessScreen({ orderNumber, pedido, whatsapp }: { orderNumber: string; pedido: PedidoTransferencia | null; whatsapp?: string }) {
  // Se llega desde el final del checkout: arriba para que se vea el pedido entero.
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const datos = pedido?.datos;
  const hayDatos = Boolean(datos && (datos.alias || datos.cbu));
  const comprobante = buildWhatsappUrl(
    whatsapp,
    `Hola, hice el pedido #${orderNumber}${pedido?.total ? ` por ${formatPrice(pedido.total)}` : ''} y te paso el comprobante de la transferencia.`,
  );

  return (
    <div className="min-h-screen bg-page flex items-center justify-center py-10">
      <div className="max-w-md w-full mx-4 bg-card rounded-2xl border border-[#B7D31A]/30 p-8 text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-green-500 light:text-green-700" />
        </div>
        <h1 className="text-2xl font-black text-fg mb-2">¡Pedido confirmado!</h1>
        <p className="text-fg-muted text-sm mb-1">Número de pedido</p>
        <p className="text-2xl font-black text-brand-fg bg-chip px-6 py-2 rounded-lg mb-5 inline-block">#{orderNumber}</p>

        {hayDatos && datos ? (
          <div className="text-left rounded-xl border border-chip bg-field p-4 mb-5">
            <p className="text-sm text-fg-soft mb-3">
              Transferí {pedido?.total ? <strong className="text-fg">{formatPrice(pedido.total)}</strong> : 'el total del pedido'} a esta cuenta y mandanos el comprobante:
            </p>
            <dl className="space-y-2 text-sm">
              {datos.alias && <DatoCopiable etiqueta="Alias" valor={datos.alias} />}
              {datos.cbu && <DatoCopiable etiqueta="CBU/CVU" valor={datos.cbu} />}
              {datos.titular && <div className="flex justify-between gap-3"><dt className="text-fg-muted">Titular</dt><dd className="text-fg font-semibold text-right">{datos.titular}</dd></div>}
              {datos.banco && <div className="flex justify-between gap-3"><dt className="text-fg-muted">Banco</dt><dd className="text-fg font-semibold text-right">{datos.banco}</dd></div>}
            </dl>
          </div>
        ) : (
          <p className="text-fg-muted text-sm mb-5">En minutos nos vamos a contactar para que termines tu compra. Guardá este número para identificar el pedido.</p>
        )}

        {comprobante && (
          <a href={comprobante} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#B7D31A] text-[#050606] py-3 rounded-xl font-black text-sm uppercase tracking-wide mb-3">
            <MessageCircle size={16} /> Enviar comprobante por WhatsApp
          </a>
        )}
        <Link href="/" className="block border border-line py-3 rounded-xl font-bold text-sm text-fg-soft hover:bg-panel transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function DatoCopiable({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // Sin permiso de portapapeles: el dato igual está a la vista para copiarlo a mano.
    }
  };
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-fg-muted">{etiqueta}</dt>
      <dd className="flex items-center gap-2 min-w-0">
        <span className="text-fg font-semibold font-mono break-all text-right">{valor}</span>
        <button type="button" onClick={copiar} aria-label={`Copiar ${etiqueta}`} className="p-1.5 rounded-md text-fg-muted hover:text-fg hover:bg-chip flex-shrink-0">
          {copiado ? <Check size={14} className="text-green-500 light:text-green-700" /> : <Copy size={14} />}
        </button>
      </dd>
    </div>
  );
}

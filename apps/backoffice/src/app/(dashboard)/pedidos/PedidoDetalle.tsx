'use client';

import { useEffect, useState } from 'react';
import { Gift, Mail, MessageCircle, Package } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatPrice } from '@/lib/utils';
import { OrderAftercare } from './OrderAftercare';
import { InsigniaEstado } from './PedidosLista';
import type { Pedido } from './tipos';
import {
  estadoDeEntrega, estadoDelPago, fechaCorta, formaDeEntrega, mailCliente, medioDePago, nombreCliente, unidades, whatsappDe,
} from './formato';

const ESTADOS = [
  { valor: 'PENDING', texto: 'Pendiente de pago' },
  { valor: 'PAID', texto: 'Pagado' },
  { valor: 'SHIPPED', texto: 'Enviado' },
  { valor: 'DELIVERED', texto: 'Entregado / retirado' },
];

const CANALES: Record<string, string> = {
  ONLINE: 'Tienda online', LOCAL: 'Local', WHATSAPP: 'WhatsApp', INSTAGRAM: 'Instagram', SOCIAL: 'Redes sociales', PHONE: 'Teléfono',
};

const TARJETA = 'rounded-xl border border-gray-200 bg-white';

function Fila({ etiqueta, valor, fuerte }: { etiqueta: string; valor: string; fuerte?: boolean }) {
  return (
    <div className={'flex justify-between gap-3 py-1 text-sm ' + (fuerte ? 'font-bold text-gray-900' : 'text-gray-600')}>
      <span>{etiqueta}</span><span className="whitespace-nowrap">{valor}</span>
    </div>
  );
}

function Productos({ pedido }: { pedido: Pedido }) {
  return (
    <section className={TARJETA}>
      <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">{unidades(pedido)} {unidades(pedido) === 1 ? 'unidad' : 'unidades'}</h3>
        <InsigniaEstado insignia={estadoDeEntrega(pedido)} />
      </header>
      {(pedido.bolsasRegalo ?? 0) > 0 && (
        <p className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
          <Gift size={16} /> Para regalo: incluir {pedido.bolsasRegalo === 1 ? '1 bolsa' : pedido.bolsasRegalo + ' bolsas'} Home Pádel
        </p>
      )}
      <ul className="divide-y divide-gray-100">
        {(pedido.items || []).map((item) => (
          <li key={item.id} className="flex items-center gap-3 px-4 py-3">
            {item.product.images?.[0]
              ? <img src={item.product.images[0]} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-gray-100 object-cover" />
              : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100"><Package className="h-5 w-5 text-gray-400" /></div>}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-blue-700">{item.product.name}</p>
              <p className="text-xs text-gray-500">
                {[item.variant?.size, item.variant?.color].filter(Boolean).join(' · ')}{item.variant?.size || item.variant?.color ? ' · ' : ''}SKU {item.product.sku}
              </p>
              <p className="text-xs text-gray-600">{item.quantity} × {formatPrice(item.price)}</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Pago({ pedido }: { pedido: Pedido }) {
  return (
    <section className={TARJETA + ' p-4'}>
      <header className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Pago</h3>
        <InsigniaEstado insignia={estadoDelPago(pedido)} />
      </header>
      <Fila etiqueta={'Subtotal (' + unidades(pedido) + ' unid.)'} valor={formatPrice(pedido.subtotal)} />
      <Fila etiqueta={'Envío (' + formaDeEntrega(pedido).texto + ')'} valor={pedido.shipping > 0 ? formatPrice(pedido.shipping) : 'Gratis'} />
      {pedido.discount > 0 && <Fila etiqueta={'Descuento' + (pedido.couponCode ? ' (cupón ' + pedido.couponCode + ')' : '')} valor={'−' + formatPrice(pedido.discount)} />}
      <div className="mt-1 border-t border-gray-100 pt-1"><Fila etiqueta="Total" valor={formatPrice(pedido.total)} fuerte /></div>
      <p className="mt-3 text-sm text-gray-700"><span className="font-medium">Medio:</span> {medioDePago(pedido)}</p>
      {pedido.paidAt && <p className="text-xs text-gray-500">Cobrado el {fechaCorta(pedido.paidAt)}</p>}
    </section>
  );
}

function CambiarEstado({ pedido, guardando, onGuardar }: {
  pedido: Pedido; guardando: boolean; onGuardar: (estado: string, seguimiento?: { numero: string; url: string }) => void;
}) {
  const [estado, setEstado] = useState(pedido.status);
  const [numero, setNumero] = useState(pedido.trackingNumber || '');
  const [url, setUrl] = useState(pedido.trackingUrl || '');
  useEffect(() => { setEstado(pedido.status); setNumero(pedido.trackingNumber || ''); setUrl(pedido.trackingUrl || ''); }, [pedido]);
  const cambio = estado !== pedido.status || (estado === 'SHIPPED' && (numero !== (pedido.trackingNumber || '') || url !== (pedido.trackingUrl || '')));
  const input = 'w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40';

  if (pedido.status === 'CANCELLED') return <p className="text-sm text-red-600">Pedido cancelado.</p>;
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-500" htmlFor="estado-pedido">Estado del pedido</label>
      <select id="estado-pedido" value={estado} disabled={guardando} onChange={(e) => setEstado(e.target.value)} className={input}>
        {ESTADOS.map((e) => <option key={e.valor} value={e.valor}>{e.texto}</option>)}
      </select>
      {estado === 'SHIPPED' && !formaDeEntrega(pedido).esRetiro && (
        <>
          <p className="text-xs text-gray-500">Al guardar, el cliente recibe un mail con el seguimiento.</p>
          <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Número de seguimiento (opcional)" className={input} maxLength={80} />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Link de seguimiento (opcional)" className={input} maxLength={300} />
        </>
      )}
      {estado === 'PAID' && pedido.status === 'PENDING' && (
        <p className="text-xs text-gray-500">Marcarlo pagado registra el cobro (si fue por transferencia), informa la venta a Meta y le avisa al cliente por mail.</p>
      )}
      <button type="button" disabled={!cambio || guardando} onClick={() => onGuardar(estado, estado === 'SHIPPED' ? { numero: numero.trim(), url: url.trim() } : undefined)}
        className="w-full rounded-lg bg-[#0f172a] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400">
        {guardando ? 'Guardando…' : 'Guardar'}
      </button>
    </div>
  );
}

function Entrega({ pedido, guardando, onGuardar }: Parameters<typeof CambiarEstado>[0]) {
  const forma = formaDeEntrega(pedido);
  return (
    <section className={TARJETA + ' space-y-3 p-4'}>
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{forma.esRetiro ? 'Retiro' : 'Envío'}</h3>
        <InsigniaEstado insignia={estadoDeEntrega(pedido)} />
      </header>
      <p className="text-sm text-gray-700"><span className="font-medium">{forma.texto}</span>{!forma.esRetiro && pedido.address ? ' — ' + pedido.address : ''}</p>
      {pedido.trackingNumber && (
        <p className="text-sm text-gray-700">
          Seguimiento: {pedido.trackingUrl ? <a href={pedido.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{pedido.trackingNumber}</a> : pedido.trackingNumber}
        </p>
      )}
      <CambiarEstado pedido={pedido} guardando={guardando} onGuardar={onGuardar} />
    </section>
  );
}

function Cliente({ pedido }: { pedido: Pedido }) {
  const mail = mailCliente(pedido);
  const whatsapp = whatsappDe(pedido.buyerPhone);
  return (
    <section className={TARJETA + ' space-y-2 p-4'}>
      <h3 className="text-sm font-semibold text-gray-900">Datos del cliente</h3>
      <p className="text-sm font-medium text-blue-700">{nombreCliente(pedido)}</p>
      {mail && <a href={'mailto:' + mail} className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-blue-600"><Mail className="h-4 w-4" />{mail}</a>}
      {pedido.buyerPhone && (
        whatsapp
          ? <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-green-600"><MessageCircle className="h-4 w-4" />{pedido.buyerPhone}</a>
          : <p className="text-sm text-gray-700">{pedido.buyerPhone}</p>
      )}
    </section>
  );
}

function Venta({ pedido }: { pedido: Pedido }) {
  return (
    <section className={TARJETA + ' space-y-1 p-4 text-sm text-gray-700'}>
      <h3 className="mb-1 text-sm font-semibold text-gray-900">Venta</h3>
      <p>{fechaCorta(pedido.createdAt)} · {CANALES[pedido.channel || 'ONLINE'] || pedido.channel}</p>
      {(pedido.branch?.name || pedido.seller?.name) && <p>{[pedido.branch?.name, pedido.seller?.name].filter(Boolean).join(' · ')}</p>}
      {pedido.isTest && <p className="text-xs font-semibold text-amber-700">Compra de prueba: no suma en estadísticas ni va a Meta.</p>}
    </section>
  );
}

export function PedidoDetalle({ pedido, guardando, onGuardarEstado, onCambio, onCerrar }: {
  pedido: Pedido | null; guardando: boolean; onGuardarEstado: (estado: string, seguimiento?: { numero: string; url: string }) => void;
  onCambio: () => void; onCerrar: () => void;
}) {
  if (!pedido) return null;
  return (
    <Modal isOpen onClose={onCerrar} title={'Venta #' + pedido.number} size="xl">
      <div className="grid gap-4 bg-gray-50 p-4 sm:p-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <Productos pedido={pedido} />
          <Pago pedido={pedido} />
        </div>
        <div className="space-y-4">
          <Cliente pedido={pedido} />
          <Entrega pedido={pedido} guardando={guardando} onGuardar={onGuardarEstado} />
          <Venta pedido={pedido} />
        </div>
        <div className="lg:col-span-2"><OrderAftercare order={pedido} onChanged={onCambio} /></div>
      </div>
    </Modal>
  );
}

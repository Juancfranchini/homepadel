'use client';

import { useState } from 'react';
import { ChevronDown, Gift, MoreVertical } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Pedido } from './tipos';
import { AplicarEstado, EstadoRapido } from './EstadoRapido';
import {
  estadoDeEntrega, estadoDelPago, fechaCorta, formaDeEntrega, Insignia, mailCliente, medioDePago, nombreCliente, unidades,
} from './formato';

export function InsigniaEstado({ insignia }: { insignia: Insignia }) {
  return <span className={'inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ' + insignia.color}>{insignia.texto}</span>;
}

function Marcas({ pedido }: { pedido: Pedido }) {
  return (
    <>
      {pedido.isTest && (
        <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700" title="Compra de prueba: no suma en las estadísticas ni se informa a Meta">Prueba</span>
      )}
      {(pedido.bolsasRegalo ?? 0) > 0 && <Gift size={14} className="ml-1.5 inline text-amber-600" aria-label={'Para regalo: ' + pedido.bolsasRegalo + ' bolsa(s)'} />}
    </>
  );
}

/** "3 unid." que se despliega con el detalle, sin abrir el pedido. */
function Productos({ pedido }: { pedido: Pedido }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div>
      <button type="button" onClick={(e) => { e.stopPropagation(); setAbierto(!abierto); }} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
        {unidades(pedido)} unid. <ChevronDown className={'h-3.5 w-3.5 transition-transform ' + (abierto ? 'rotate-180' : '')} />
      </button>
      {abierto && (
        <ul className="mt-1 space-y-0.5 text-xs text-gray-600">
          {(pedido.items || []).map((i) => (
            <li key={i.id}>{i.quantity}× {i.product.name}{i.variant?.size ? ' · ' + i.variant.size : ''}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Pago({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-1">
      <InsigniaEstado insignia={estadoDelPago(pedido)} />
      <p className="text-xs text-gray-600">{medioDePago(pedido)}</p>
    </div>
  );
}

function Entrega({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-1">
      <InsigniaEstado insignia={estadoDeEntrega(pedido)} />
      <p className="text-xs text-gray-600">{formaDeEntrega(pedido).texto}</p>
      {pedido.status === 'SHIPPED' && pedido.trackingNumber && <p className="text-[11px] text-gray-500">Seguimiento: {pedido.trackingNumber}</p>}
    </div>
  );
}

interface Acciones {
  onAbrir: (p: Pedido) => void;
  onAplicar: AplicarEstado;
  ocupadoId: string | null;
}

const TH = 'px-3 py-3 text-left text-xs font-semibold text-gray-500';

export function PedidosTabla({ pedidos, onAbrir, onAplicar, ocupadoId }: { pedidos: Pedido[] } & Acciones) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50">
            <tr>
              <th className={TH}>Venta</th><th className={TH}>Fecha</th><th className={TH}>Cliente</th><th className={TH}>Total</th>
              <th className={TH}>Productos</th><th className={TH}>Pago</th><th className={TH}>Envío</th><th className={TH}>Cambiar estado</th><th className={TH}><span className="sr-only">Abrir</span></th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id} onClick={() => onAbrir(p)} className="cursor-pointer border-t border-gray-100 align-top transition-colors hover:bg-gray-50">
                <td className="px-3 py-3 text-sm font-semibold text-blue-600">#{p.number}<Marcas pedido={p} /></td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-700">{fechaCorta(p.createdAt)}</td>
                <td className="px-3 py-3">
                  <p className="text-sm font-medium text-gray-900">{nombreCliente(p)}</p>
                  <p className="text-xs text-gray-400">{mailCliente(p)}</p>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm font-semibold text-gray-900">{formatPrice(p.total)}</td>
                <td className="px-3 py-3"><Productos pedido={p} /></td>
                <td className="px-3 py-3"><Pago pedido={p} /></td>
                <td className="px-3 py-3"><Entrega pedido={p} /></td>
                <td className="px-3 py-3"><EstadoRapido pedido={p} ocupado={ocupadoId === p.id} onAplicar={onAplicar} /></td>
                <td className="px-3 py-3 text-right">
                  <button type="button" onClick={(e) => { e.stopPropagation(); onAbrir(p); }} className="rounded-full border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-100" title="Ver el pedido">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PedidosTarjetas({ pedidos, onAbrir, onAplicar, ocupadoId }: { pedidos: Pedido[] } & Acciones) {
  return (
    <div className="space-y-3 md:hidden">
      {pedidos.map((p) => (
        <div key={p.id} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          <button type="button" onClick={() => onAbrir(p)} className="flex w-full items-start justify-between gap-2 text-left">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-blue-600">#{p.number}<Marcas pedido={p} /></p>
              <p className="mt-0.5 truncate text-sm font-medium text-gray-900">{nombreCliente(p)}</p>
              <p className="text-xs text-gray-400">{fechaCorta(p.createdAt)} · {unidades(p)} unid.</p>
            </div>
            <p className="shrink-0 text-sm font-bold text-gray-900">{formatPrice(p.total)}</p>
          </button>
          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
            <Pago pedido={p} />
            <Entrega pedido={p} />
          </div>
          <div className="border-t border-gray-100 pt-3">
            <EstadoRapido pedido={p} ocupado={ocupadoId === p.id} onAplicar={onAplicar} />
          </div>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { Pedido } from './tipos';
import { formaDeEntrega } from './formato';

export interface Seguimiento {
  numero: string;
  url: string;
}

/** Devuelve true si el servidor aceptó el cambio. */
export type AplicarEstado = (pedido: Pedido, estado: string, seguimiento?: Seguimiento) => Promise<boolean>;

const CAMPO = 'w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40';

/**
 * Estados a los que se puede pasar desde la lista. Una vez cobrado no se
 * vuelve a "esperando el pago": el cobro ya quedó registrado y el aviso al
 * cliente ya salió. Quien retira en el local no tiene "enviado".
 */
function opcionesPara(pedido: Pedido): { valor: string; texto: string }[] {
  const retiro = formaDeEntrega(pedido).esRetiro;
  const cobradas = [
    { valor: 'PAID', texto: 'Pagado' },
    ...(retiro ? [] : [{ valor: 'SHIPPED', texto: 'Enviado' }]),
    { valor: 'DELIVERED', texto: retiro ? 'Retirado' : 'Entregado' },
  ];
  return pedido.status === 'PENDING' ? [{ valor: 'PENDING', texto: 'Esperando el pago' }, ...cobradas] : cobradas;
}

/** Lo que va a pasar al confirmar, en palabras: la tienda tiene que saber que se avisa al cliente. */
function queVaAPasar(pedido: Pedido, estado: string): string {
  const sinCobrar = pedido.status === 'PENDING';
  if (estado === 'PAID') {
    return sinCobrar ? 'Se confirma el pago: queda registrado el cobro y se le avisa al cliente por mail que lo recibimos.' : 'Vuelve a "Pagado". No se le manda ningún mail.';
  }
  if (estado === 'SHIPPED') {
    return (sinCobrar ? 'Se marca como pagado y enviado (queda registrado el cobro). ' : '') +
      'Se le avisa al cliente por mail que su pedido va en camino, con el seguimiento si lo cargás.';
  }
  return sinCobrar ? 'Se marca como pagado y entregado: queda registrado el cobro y se le avisa al cliente por mail.' : 'Se marca como entregado.';
}

const TITULOS: Record<string, string> = { PAID: 'Marcar como pagado', SHIPPED: 'Marcar como enviado', DELIVERED: 'Marcar como entregado', PENDING: 'Esperando el pago' };

interface Props {
  pedido: Pedido;
  ocupado: boolean;
  onAplicar: AplicarEstado;
}

/**
 * Cambio de estado y de seguimiento directo desde la lista, sin abrir el
 * pedido. Lo que avisa al cliente (pagado, enviado) pide confirmar y deja
 * cargar el seguimiento; el resto se aplica al instante.
 */
export function EstadoRapido({ pedido, ocupado, onAplicar }: Props) {
  const [destino, setDestino] = useState<string | null>(null);
  const [numero, setNumero] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  if (pedido.status === 'CANCELLED') return null;
  const retiro = formaDeEntrega(pedido).esRetiro;
  const pideSeguimiento = destino === 'SHIPPED' && !retiro;

  const abrir = (estado: string) => {
    setNumero(pedido.trackingNumber || '');
    setUrl(pedido.trackingUrl || '');
    setError('');
    setDestino(estado);
  };

  const elegir = (estado: string) => {
    if (estado === pedido.status) return;
    // Directo solo lo que no manda ningún mail ni mueve plata.
    if (estado === 'DELIVERED' && pedido.status !== 'PENDING') void onAplicar(pedido, estado);
    else abrir(estado);
  };

  const confirmar = async () => {
    if (!destino) return;
    if (url.trim() && !/^https?:\/\//i.test(url.trim())) {
      setError('El link tiene que empezar con http:// o https://');
      return;
    }
    const aceptado = await onAplicar(pedido, destino, pideSeguimiento ? { numero: numero.trim(), url: url.trim() } : undefined);
    if (aceptado) setDestino(null);
  };

  return (
    <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
      <select
        aria-label={'Cambiar el estado del pedido ' + pedido.number}
        value={pedido.status}
        disabled={ocupado}
        onChange={(e) => elegir(e.target.value)}
        className="w-full min-w-[140px] max-w-[170px] rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 disabled:opacity-50"
      >
        {opcionesPara(pedido).map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
      </select>
      {pedido.status === 'SHIPPED' && !retiro && (
        <button type="button" disabled={ocupado} onClick={() => abrir('SHIPPED')} className="block text-[11px] font-medium text-blue-600 hover:underline disabled:opacity-50">
          {pedido.trackingNumber ? 'Editar seguimiento' : 'Cargar seguimiento'}
        </button>
      )}

      {destino && (
        <Modal isOpen onClose={() => setDestino(null)} title={(TITULOS[destino] || 'Cambiar estado') + ' · #' + pedido.number} size="sm">
          <div className="space-y-3 p-4 sm:p-6">
            <p className="text-sm text-gray-700">{queVaAPasar(pedido, destino)}</p>
            {pideSeguimiento && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500" htmlFor={'seg-num-' + pedido.id}>Número de seguimiento (opcional)</label>
                <input id={'seg-num-' + pedido.id} value={numero} onChange={(e) => setNumero(e.target.value)} maxLength={80} className={CAMPO} placeholder="Ej: 1234567890" />
                <label className="block text-xs font-medium text-gray-500" htmlFor={'seg-url-' + pedido.id}>Link de seguimiento (opcional)</label>
                <input id={'seg-url-' + pedido.id} value={url} onChange={(e) => setUrl(e.target.value)} maxLength={300} className={CAMPO} placeholder="https://..." />
                <p className="text-[11px] text-gray-400">Le llega al cliente en el mail. Si todavía no lo tenés, confirmá igual: podés cargarlo después y se le vuelve a avisar.</p>
              </div>
            )}
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
              <button type="button" onClick={() => setDestino(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button type="button" disabled={ocupado} onClick={confirmar} className="rounded-lg bg-[#C8FF00] px-4 py-2 text-sm font-semibold text-[#0f172a] hover:bg-[#b8ef00] disabled:opacity-50">
                {ocupado ? 'Guardando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

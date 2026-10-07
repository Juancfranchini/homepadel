'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useToast } from '@/components/ui/Toast';
import type { Etapa, Pedido } from './tipos';
import { coincideBusqueda, etapaDe, ETAPAS } from './formato';
import { PedidosTabla, PedidosTarjetas } from './PedidosLista';
import { PedidoDetalle } from './PedidoDetalle';
import type { AplicarEstado } from './EstadoRapido';

/** El servidor explica por qué rechazó el cambio (link inválido, estado inexistente...): se le muestra a la tienda. */
function motivoDelError(err: unknown): string {
  const detalle = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  if (Array.isArray(detalle)) return detalle.join('. ');
  return typeof detalle === 'string' ? detalle : 'No se pudo actualizar el pedido';
}

/**
 * Pedidos, ordenados como en Tiendanube: qué hay que hacer con cada uno
 * (cobrar, enviar, entregar), cómo pagó y cómo se entrega, a simple vista.
 * Las etiquetas salen de formato.ts; la lista y el detalle viven aparte.
 */
function useEtapas(pedidos: Pedido[]) {
  return useMemo(() => {
    const cuentas: Record<Etapa, number> = { todos: pedidos.length, cobrar: 0, enviar: 0, retirar: 0, enviados: 0, entregados: 0, cancelados: 0 };
    for (const p of pedidos) cuentas[etapaDe(p)] += 1;
    return cuentas;
  }, [pedidos]);
}

function Filtros({ cuentas, etapa, onEtapa, busqueda, onBusqueda }: {
  cuentas: Record<Etapa, number>; etapa: Etapa; onEtapa: (e: Etapa) => void; busqueda: string; onBusqueda: (t: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
      <label className="relative block lg:w-72">
        <span className="sr-only">Buscar pedidos</span>
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={busqueda} onChange={(e) => onBusqueda(e.target.value)} placeholder="Buscar por número, cliente, mail o teléfono"
          className="w-full rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40" />
      </label>
      <div className="flex flex-wrap gap-1.5">
        {ETAPAS.map((e) => {
          const activa = etapa === e.valor;
          return (
            <button key={e.valor} type="button" onClick={() => onEtapa(e.valor)}
              className={'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ' + (activa ? 'border-[#0f172a] bg-[#0f172a] text-white' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50')}>
              {e.texto}
              <span className={'rounded-full px-1.5 text-[10px] font-bold ' + (activa ? 'bg-[#C8FF00] text-[#0f172a]' : 'bg-gray-100 text-gray-500')}>{cuentas[e.valor]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Paginas({ total, actual, onPagina }: { total: number; actual: number; onPagina: (n: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button key={i} type="button" onClick={() => onPagina(i + 1)}
          className={'h-8 w-8 rounded-lg text-sm font-medium ' + (i + 1 === actual ? 'bg-[#C8FF00] text-[#0f172a]' : 'text-gray-500 hover:bg-gray-100')}>{i + 1}</button>
      ))}
    </div>
  );
}

export default function PedidosPage() {
  const { toast } = useToast();
  const esCelular = useIsMobile();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [etapa, setEtapa] = useState<Etapa>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [abiertoId, setAbiertoId] = useState<string | null>(null);
  const [ocupadoId, setOcupadoId] = useState<string | null>(null);
  const porPagina = esCelular ? 10 : 20;

  const cargar = useCallback(async () => {
    try {
      const res = await api.get('/orders');
      const data = res.data?.value || res.data?.data || res.data;
      setPedidos(Array.isArray(data) ? data : []);
    } catch {
      toast('No se pudieron cargar los pedidos', 'error');
    } finally {
      setCargando(false);
    }
  }, [toast]);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { setPagina(1); }, [etapa, busqueda, esCelular]);

  const cuentas = useEtapas(pedidos);
  const filtrados = pedidos.filter((p) => (etapa === 'todos' || etapaDe(p) === etapa) && coincideBusqueda(p, busqueda));
  const totalPaginas = Math.ceil(filtrados.length / porPagina);
  const visibles = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);
  const abierto = pedidos.find((p) => p.id === abiertoId) ?? null;

  /** Un solo camino para la lista y el detalle. Devuelve si el servidor aceptó el cambio. */
  const aplicarEstado: AplicarEstado = async (pedido, estado, seguimiento) => {
    setOcupadoId(pedido.id);
    try {
      await api.patch('/orders/' + pedido.id + '/status', {
        status: estado,
        ...(seguimiento?.numero ? { trackingNumber: seguimiento.numero } : {}),
        ...(seguimiento?.url ? { trackingUrl: seguimiento.url } : {}),
      });
      toast('Pedido ' + pedido.number + ' actualizado', 'success');
      // Se recarga entero: marcar pagado también registra el cobro y cambia el estado del pago.
      await cargar();
      return true;
    } catch (err) {
      toast(motivoDelError(err), 'error');
      return false;
    } finally {
      setOcupadoId(null);
    }
  };

  if (cargando) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="mt-0.5 text-sm text-gray-500">{cuentas.cobrar} por cobrar · {cuentas.enviar} por enviar · {cuentas.retirar} por retirar</p>
      </div>

      <Filtros cuentas={cuentas} etapa={etapa} onEtapa={setEtapa} busqueda={busqueda} onBusqueda={setBusqueda} />

      {visibles.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-20 text-center"><p className="text-sm text-gray-400">No hay pedidos con estos filtros</p></div>
      ) : (
        <>
          <PedidosTabla pedidos={visibles} onAbrir={(p) => setAbiertoId(p.id)} onAplicar={aplicarEstado} ocupadoId={ocupadoId} />
          <PedidosTarjetas pedidos={visibles} onAbrir={(p) => setAbiertoId(p.id)} onAplicar={aplicarEstado} ocupadoId={ocupadoId} />
        </>
      )}

      <Paginas total={totalPaginas} actual={pagina} onPagina={setPagina} />

      <PedidoDetalle pedido={abierto} guardando={ocupadoId === abierto?.id} onGuardarEstado={(estado, seguimiento) => abierto && aplicarEstado(abierto, estado, seguimiento)} onCambio={cargar} onCerrar={() => setAbiertoId(null)} />
    </div>
  );
}

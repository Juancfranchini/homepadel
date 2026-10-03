export interface Stats {
  pendientes: number;
  recuperados: number;
  montoPendiente: number;
  dias: number;
  /** Del embudo de Marketing: todos los inicios de checkout, con o sin contacto. */
  iniciosCheckout?: number;
  montoIniciado?: number;
  compras?: number;
}

const pesos = (n: number) => '$ ' + Math.round(n).toLocaleString('es-AR');

function Tarjeta({ valor, etiqueta, detalle }: { valor: string; etiqueta: string; detalle?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
      <p className="text-2xl font-bold text-gray-900">{valor}</p>
      <p className="text-xs text-gray-500 mt-0.5">{etiqueta}</p>
      {detalle && <p className="text-[11px] text-gray-400 mt-1">{detalle}</p>}
    </div>
  );
}

/**
 * El embudo completo de los últimos días: cuántos empezaron a comprar (con o
 * sin dejar sus datos), cuántos dejaron contacto para recuperarlos y cuántos
 * compraron. Antes solo se veían los que dejaron su mail, y parecía que se
 * perdía mucho menos de lo que se pierde.
 */
export default function AbandonedCartStats({ stats }: { stats: Stats }) {
  const conContacto = stats.pendientes + stats.recuperados;
  const inicios = stats.iniciosCheckout;
  // Aproximado: el inicio se cuenta por carrito y visita, el contacto por mail.
  const anonimos = inicios != null ? Math.max(0, inicios - conContacto) : null;

  return (
    <div className="space-y-3">
      {inicios != null && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Tarjeta valor={String(inicios)} etiqueta={`Empezaron a comprar (${stats.dias} días)`} detalle={pesos(stats.montoIniciado ?? 0) + ' en carritos'} />
          <Tarjeta valor={String(conContacto)} etiqueta="Dejaron su contacto" detalle="Se pueden recuperar" />
          <Tarjeta valor={String(anonimos)} etiqueta="Sin dejar contacto (aprox.)" detalle="Anónimos: se recuperan con anuncios" />
          <Tarjeta valor={String(stats.compras ?? 0)} etiqueta="Compraron" />
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Tarjeta valor={String(stats.pendientes)} etiqueta={`Con contacto, sin comprar (${stats.dias} días)`} />
        <Tarjeta valor={pesos(stats.montoPendiente)} etiqueta="Valor de lo abandonado con contacto" />
        <Tarjeta valor={String(stats.recuperados)} etiqueta="Terminaron comprando" />
      </div>
    </div>
  );
}

export interface Stats {
  pendientes: number;
  recuperados: number;
  montoPendiente: number;
  dias: number;
}

function Tarjeta({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
      <p className="text-2xl font-bold text-gray-900">{valor}</p>
      <p className="text-xs text-gray-500 mt-0.5">{etiqueta}</p>
    </div>
  );
}

/** Los tres números que dicen si vale la pena seguir contactando gente. */
export default function AbandonedCartStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <Tarjeta valor={String(stats.pendientes)} etiqueta={`Sin comprar (últimos ${stats.dias} días)`} />
      <Tarjeta
        valor={'$ ' + Math.round(stats.montoPendiente).toLocaleString('es-AR')}
        etiqueta="Valor de lo abandonado"
      />
      <Tarjeta valor={String(stats.recuperados)} etiqueta="Terminaron comprando" />
    </div>
  );
}

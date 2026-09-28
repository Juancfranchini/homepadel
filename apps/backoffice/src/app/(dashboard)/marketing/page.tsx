'use client';

import { Eye, MousePointerClick, ShoppingCart, CreditCard, CheckCircle2, Info } from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useMarketingStats, MarketingStats, ProductoRanking } from './useMarketingStats';
import DailyCharts from './DailyCharts';

const PASOS = [
  { key: 'PageView' as const, label: 'Vistas de página', icon: Eye },
  { key: 'ViewContent' as const, label: 'Vistas de producto', icon: MousePointerClick },
  { key: 'AddToCart' as const, label: 'Agregados al carrito', icon: ShoppingCart },
  { key: 'InitiateCheckout' as const, label: 'Inicios de checkout', icon: CreditCard },
  { key: 'Purchase' as const, label: 'Compras', icon: CheckCircle2 },
];

const RANGOS = [7, 30, 90];

export default function MarketingPage() {
  const { stats, loading, days, setDays } = useMarketingStats();

  return (
    <div className="space-y-6">
      <Header days={days} onDaysChange={setDays} />
      {!stats ? (
        <PageLoader />
      ) : (
        // Al cambiar de rango se queda lo anterior, atenuado, hasta que llega lo nuevo: sin parpadeo.
        <div className={'space-y-6 transition-opacity ' + (loading ? 'opacity-50' : '')} aria-busy={loading}>
          <Contenido stats={stats} days={days} />
        </div>
      )}
    </div>
  );
}

function Header({ days, onDaysChange }: { days: number; onDaysChange: (d: number) => void }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-lime-600">Trazabilidad real</p>
        <h1 className="text-2xl font-black text-gray-900">Marketing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Lo que la gente hace en el sitio, medido acá mismo — no hace falta entrar a Meta para verlo.
        </p>
      </div>
      <div className="flex gap-2">
        {RANGOS.map((r) => (
          <button
            key={r}
            onClick={() => onDaysChange(r)}
            className={
              'rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ' +
              (days === r ? 'border-lime-500 bg-lime-50 text-lime-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50')
            }
          >
            {r} días
          </button>
        ))}
      </div>
    </header>
  );
}

const ZONA_ARGENTINA = 'America/Argentina/Buenos_Aires';

/** YYYY-MM-DD en hora argentina, el mismo formato que las fechas del gráfico. */
const diaArgentino = (fecha: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_ARGENTINA }).format(fecha);

/** Hora HH:MM en Argentina; null si fue a primera hora (el día cuenta como completo). */
function horaDeInicio(fecha: Date): string | null {
  const hora = new Intl.DateTimeFormat('es-AR', { timeZone: ZONA_ARGENTINA, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(fecha);
  return hora === '00:00' ? null : hora;
}

function Contenido({ stats, days }: { stats: MarketingStats; days: number }) {
  const desde = stats.registrandoDesde ? new Date(stats.registrandoDesde) : null;
  // Los días anteriores al primer evento no son "cero visitas": no se medía.
  // Dibujarlos en cero hace creer que hubo días muertos.
  const dias = desde ? stats.daily.filter((dia) => dia.date >= diaArgentino(desde)) : stats.daily;
  const horaInicio = desde ? horaDeInicio(desde) : null;
  const parciales = {
    hoy: diaArgentino(new Date()),
    inicio: desde && horaInicio ? { fecha: diaArgentino(desde), hora: horaInicio } : null,
  };

  return (
    <>
      {desde && <AvisoDatosDesde desde={desde} />}
      <FunnelCards funnel={stats.funnel} />
      <ConversionBar conversion={stats.conversion} />
      <DailyCharts rows={dias} parciales={parciales} diasPedidos={days} />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ProductRanking title="Productos más vistos" rows={stats.topViewed} />
        <ProductRanking title="Productos más agregados al carrito" rows={stats.topAddedToCart} />
      </div>
    </>
  );
}

function AvisoDatosDesde({ desde }: { desde: Date }) {
  const cuando = desde.toLocaleString('es-AR', {
    timeZone: ZONA_ARGENTINA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <div className="flex gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
      <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky-600" />
      <p>
        <strong>Datos desde el {cuando} hs.</strong> Ahí empezó este seguimiento: antes no hay registros, no es que
        no hubo visitas. Para comparar con Meta, mirá en el Administrador de eventos el mismo período, a partir de
        esa fecha. Lo que se hace con una cuenta de prueba o en modo prueba no se cuenta.
      </p>
    </div>
  );
}

function FunnelCards({ funnel }: { funnel: MarketingStats['funnel'] }) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
      {PASOS.map(({ key, label, icon: Icon }) => (
        <div key={key} className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <Icon className="h-5 w-5 text-lime-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">{funnel[key].toLocaleString('es-AR')}</p>
        </div>
      ))}
    </div>
  );
}

function ConversionBar({ conversion }: { conversion: MarketingStats['conversion'] }) {
  const pasos = [
    { label: 'Ve un producto de los que vieron la página', value: conversion.viewContentDePageView },
    { label: 'Lo agrega al carrito de los que lo vieron', value: conversion.addToCartDeViewContent },
    { label: 'Empieza el checkout de los que agregaron', value: conversion.checkoutDeAddToCart },
    { label: 'Compra de los que empezaron el checkout', value: conversion.compraDeCheckout },
  ];
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 font-bold text-gray-900">Conversión entre pasos</h2>
      <div className="space-y-3">
        {pasos.map((paso) => (
          <div key={paso.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-gray-600">{paso.label}</span>
              <strong className="text-gray-900">{paso.value}%</strong>
            </div>
            <div className="h-2 rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-lime-500" style={{ width: Math.min(paso.value, 100) + '%' }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-gray-400">
        De cada 100 personas que entran al sitio, {conversion.compraDePageView} terminan comprando.
      </p>
    </section>
  );
}

function ProductRanking({ title, rows }: { title: string; rows: ProductoRanking[] }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="mb-3 font-bold text-gray-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400">Todavía no hay datos suficientes en este rango.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={row.productId} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span>
                <b className="mr-2 text-lime-600">#{index + 1}</b>
                {row.productName}
              </span>
              <span className="font-semibold text-gray-700">{row.count}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

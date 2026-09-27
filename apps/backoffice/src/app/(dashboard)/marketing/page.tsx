'use client';

import { Eye, MousePointerClick, ShoppingCart, CreditCard, CheckCircle2 } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useMarketingStats, MarketingStats, ProductoRanking } from './useMarketingStats';

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
      {loading || !stats ? <PageLoader /> : <Contenido stats={stats} />}
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

function Contenido({ stats }: { stats: MarketingStats }) {
  return (
    <>
      <FunnelCards funnel={stats.funnel} />
      <ConversionBar conversion={stats.conversion} />
      <DailyChart rows={stats.daily} />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ProductRanking title="Productos más vistos" rows={stats.topViewed} />
        <ProductRanking title="Productos más agregados al carrito" rows={stats.topAddedToCart} />
      </div>
    </>
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

function DailyChart({ rows }: { rows: MarketingStats['daily'] }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 font-bold text-gray-900">Evolución diaria</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pageView" name="Vistas de página" stroke="#94a3b8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="viewContent" name="Vistas de producto" stroke="#38bdf8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="addToCart" name="Al carrito" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="initiateCheckout" name="Checkout" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="purchase" name="Compras" stroke="#84cc16" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
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

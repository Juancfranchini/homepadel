'use client';

import { useCallback, useEffect, useState } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BarChart3, Download, ReceiptText, ShoppingBag, TrendingUp, Wallet } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { PosBranch } from '../punto-de-venta/types';

const filterSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  channel: z.string(),
  branchId: z.string(),
  sellerId: z.string(),
  paymentMethod: z.string(),
});
type Filters = z.infer<typeof filterSchema>;
interface Stats {
  criteria: { sales: string; income: string };
  totals: {
    grossSales: number;
    refunds: number;
    netSales: number;
    income: number;
    operations: number;
    units: number;
    averageTicket: number;
  };
  byChannel: { channel: string; gross: number; refunds: number; net: number; operations: number }[];
  byPaymentMethod: { method: string; amount: number }[];
  daily: { date: string; sales: number; operations: number }[];
  topProducts: { productId: string; name: string; units: number; revenue: number }[];
}

const CHANNELS: Record<string, string> = {
  ONLINE: 'Tienda online',
  LOCAL: 'Local',
  WHATSAPP: 'WhatsApp',
  INSTAGRAM: 'Instagram',
  SOCIAL: 'Otras redes',
  PHONE: 'Teléfono',
};
const METHODS: Record<string, string> = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  CARD: 'Tarjeta',
  DIGITAL_WALLET: 'Billetera',
  EXTERNAL_TERMINAL: 'Terminal',
  MERCADOPAGO: 'Mercado Pago',
};

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function useSalesStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [branches, setBranches] = useState<PosBranch[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; role: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const form = useForm<Filters>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      from: isoDate(new Date(Date.now() - 29 * 86400000)),
      to: isoDate(new Date()),
      channel: '',
      branchId: '',
      sellerId: '',
      paymentMethod: '',
    },
  });

  const load = useCallback(async (filters: Filters) => {
    setLoading(true);
    try {
      const response = await api.get('/pos/stats', {
        params: Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
      });
      setStats(response.data);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    Promise.all([api.get('/pos/config'), api.get('/pos/sellers')]).then(
      ([branchResponse, userResponse]) => {
        setBranches(branchResponse.data);
        setUsers(userResponse.data);
      },
    );
    load(form.getValues());
  }, [form, load]);

  const exportCsv = () => {
    if (!stats) return;
    const rows = [
      ['Canal', 'Ventas brutas', 'Devoluciones', 'Ventas netas', 'Operaciones'],
      ...stats.byChannel.map((row) => [
        CHANNELS[row.channel] || row.channel,
        row.gross,
        row.refunds,
        row.net,
        row.operations,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = `ventas-${form.getValues('from')}-${form.getValues('to')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  return { stats, branches, users, loading, form, load, exportCsv };
}

export default function SalesStatsPage() {
  const state = useSalesStats();
  return (
    <div className="space-y-6">
      <StatsHeader canExport={!!state.stats} onExport={state.exportCsv} />
      <FiltersForm
        form={state.form}
        branches={state.branches}
        users={state.users}
        loading={state.loading}
        onSubmit={state.load}
      />
      {state.stats && <StatsResults stats={state.stats} />}
    </div>
  );
}

function StatsHeader({ canExport, onExport }: { canExport: boolean; onExport: () => void }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-lime-600">
          Negocio completo
        </p>
        <h1 className="text-2xl font-black text-gray-900">Estadísticas de ventas</h1>
        <p className="mt-1 text-sm text-gray-500">Online, local y redes bajo el mismo criterio.</p>
      </div>
      <button
        onClick={onExport}
        disabled={!canExport}
        className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold disabled:opacity-40"
      >
        <Download className="h-4 w-4" /> Exportar CSV
      </button>
    </header>
  );
}

function StatsResults({ stats }: { stats: Stats }) {
  return (
    <>
      <Kpis stats={stats} />
      <SalesChart rows={stats.daily} />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChannelTable rows={stats.byChannel} />
        <TopProducts rows={stats.topProducts} />
      </div>
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <p>
          <strong>Ventas:</strong> {stats.criteria.sales}
        </p>
        <p className="mt-1">
          <strong>Ingresos:</strong> {stats.criteria.income}
        </p>
      </div>
    </>
  );
}

function SalesChart({ rows }: { rows: Stats['daily'] }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 font-bold">
        <BarChart3 className="h-5 w-5 text-lime-600" /> Evolución por fecha de venta
      </h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value) => formatPrice(Number(value))} />
            <Line type="monotone" dataKey="sales" stroke="#84cc16" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function FiltersForm({
  form,
  branches,
  users,
  loading,
  onSubmit,
}: {
  form: UseFormReturn<Filters>;
  branches: PosBranch[];
  users: { id: string; name: string; role: string }[];
  loading: boolean;
  onSubmit: (data: Filters) => Promise<void>;
}) {
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid grid-cols-2 gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-6"
    >
      <DateField form={form} field="from" label="Desde" />
      <DateField form={form} field="to" label="Hasta" />
      <SelectField
        form={form}
        field="channel"
        label="Canal"
        empty="Todos"
        options={Object.entries(CHANNELS)}
      />
      <SelectField
        form={form}
        field="branchId"
        label="Sucursal"
        empty="Todas"
        options={branches.map((branch) => [branch.id, branch.name])}
      />
      <SelectField
        form={form}
        field="sellerId"
        label="Vendedor"
        empty="Todos"
        options={users.map((user) => [user.id, user.name])}
      />
      <div>
        <SelectField
          form={form}
          field="paymentMethod"
          label="Medio"
          empty="Todos"
          options={Object.entries(METHODS)}
        />
        <button
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-[#0f172a] py-2 text-xs font-bold text-white"
        >
          {loading ? 'Cargando…' : 'Aplicar'}
        </button>
      </div>
    </form>
  );
}

function DateField({
  form,
  field,
  label,
}: {
  form: UseFormReturn<Filters>;
  field: 'from' | 'to';
  label: string;
}) {
  return (
    <label className="text-xs font-medium text-gray-600">
      {label}
      <input
        {...form.register(field)}
        type="date"
        className="mt-1 w-full rounded-lg border px-2 py-2 text-sm"
      />
    </label>
  );
}

function SelectField({
  form,
  field,
  label,
  empty,
  options,
}: {
  form: UseFormReturn<Filters>;
  field: keyof Filters;
  label: string;
  empty: string;
  options: string[][];
}) {
  return (
    <label className="text-xs font-medium text-gray-600">
      {label}
      <select {...form.register(field)} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm">
        <option value="">{empty}</option>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

function Kpis({ stats }: { stats: Stats }) {
  const cards = [
    { label: 'Ventas netas', value: formatPrice(stats.totals.netSales), icon: TrendingUp },
    { label: 'Ingresos cobrados', value: formatPrice(stats.totals.income), icon: Wallet },
    { label: 'Operaciones', value: String(stats.totals.operations), icon: ShoppingBag },
    { label: 'Ticket promedio', value: formatPrice(stats.totals.averageTicket), icon: ReceiptText },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <Icon className="h-5 w-5 text-lime-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">{value}</p>
        </div>
      ))}
    </div>
  );
}

function ChannelTable({ rows }: { rows: Stats['byChannel'] }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="mb-3 font-bold">Desglose por canal</h2>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.channel}
            className="grid grid-cols-[1fr_auto_auto] gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm"
          >
            <span>{CHANNELS[row.channel] || row.channel}</span>
            <span>{row.operations} ops.</span>
            <strong>{formatPrice(row.net)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function TopProducts({ rows }: { rows: Stats['topProducts'] }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="mb-3 font-bold">Productos más vendidos</h2>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div
            key={row.productId}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
          >
            <span>
              <b className="mr-2 text-lime-600">#{index + 1}</b>
              {row.name}
            </span>
            <span>
              {row.units} u. · <strong>{formatPrice(row.revenue)}</strong>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

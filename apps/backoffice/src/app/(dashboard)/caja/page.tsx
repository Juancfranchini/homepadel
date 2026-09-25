'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowDownCircle, ArrowUpCircle, LockKeyhole, WalletCards } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { PosBranch } from '../punto-de-venta/types';

const openSchema = z.object({
  registerId: z.string().min(1),
  openingAmount: z.coerce.number().min(0),
  notes: z.string().max(500).optional(),
});
const movementSchema = z.object({
  type: z.enum(['INCOME', 'WITHDRAWAL']),
  amount: z.coerce.number().positive(),
  note: z.string().min(2).max(500),
});
const closeSchema = z.object({
  cash: z.coerce.number().min(0),
  transfer: z.coerce.number().min(0),
  card: z.coerce.number().min(0),
  wallet: z.coerce.number().min(0),
  terminal: z.coerce.number().min(0),
  notes: z.string().max(500).optional(),
});
type OpenData = z.infer<typeof openSchema>;
type MovementData = z.infer<typeof movementSchema>;
type CloseData = z.infer<typeof closeSchema>;

interface Session {
  id: string;
  openingAmount: number;
  openedAt: string;
  register: { name: string; branch: { name: string } };
  movements: { id: string; type: string; amount: number; note?: string; createdAt: string }[];
}
interface Summary {
  expected: Record<string, number>;
  sales: number;
}
interface History {
  id: string;
  openedAt: string;
  closedAt: string;
  expectedTotals: Record<string, number>;
  countedTotals: Record<string, number>;
  differences: Record<string, number>;
  register: { name: string; branch: { name: string } };
  openedBy: { name: string };
  closedBy?: { name: string };
}

function useCashForms() {
  const openForm = useForm<OpenData>({
    resolver: zodResolver(openSchema),
    defaultValues: { registerId: '', openingAmount: 0, notes: '' },
  });
  const movementForm = useForm<MovementData>({
    resolver: zodResolver(movementSchema),
    defaultValues: { type: 'INCOME', amount: 0, note: '' },
  });
  const closeForm = useForm<CloseData>({
    resolver: zodResolver(closeSchema),
    defaultValues: { cash: 0, transfer: 0, card: 0, wallet: 0, terminal: 0, notes: '' },
  });
  return { openForm, movementForm, closeForm };
}

export default function CashPage() {
  const [branches, setBranches] = useState<PosBranch[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [message, setMessage] = useState('');
  const { openForm, movementForm, closeForm } = useCashForms();

  const load = useCallback(async () => {
    const [configResponse, currentResponse, historyResponse] = await Promise.all([
      api.get('/pos/config'),
      api.get('/cash/sessions/current'),
      api.get('/cash/sessions/history'),
    ]);
    setBranches(configResponse.data);
    setSession(currentResponse.data || null);
    setHistory(historyResponse.data);
    if (currentResponse.data) {
      const summaryResponse = await api.get(`/cash/sessions/${currentResponse.data.id}/summary`);
      setSummary(summaryResponse.data);
    } else setSummary(null);
  }, []);
  useEffect(() => {
    load().catch(() => setMessage('No se pudo cargar la caja'));
  }, [load]);
  useEffect(() => {
    const first = branches.flatMap((branch) => branch.registers)[0];
    if (first && !openForm.getValues('registerId')) openForm.setValue('registerId', first.id);
  }, [branches, openForm]);

  const open = async (data: OpenData) => {
    await api.post('/cash/sessions', data);
    openForm.reset();
    setMessage('Caja abierta');
    await load();
  };
  const movement = async (data: MovementData) => {
    if (!session) return;
    await api.post('/cash/movements', { ...data, cashSessionId: session.id });
    movementForm.reset({ type: 'INCOME', amount: 0, note: '' });
    setMessage('Movimiento registrado');
    await load();
  };
  const close = async (data: CloseData) => {
    if (!session) return;
    await api.post(`/cash/sessions/${session.id}/close`, {
      countedTotals: {
        CASH: data.cash,
        TRANSFER: data.transfer,
        CARD: data.card,
        DIGITAL_WALLET: data.wallet,
        EXTERNAL_TERMINAL: data.terminal,
      },
      notes: data.notes,
    });
    closeForm.reset();
    setMessage('Caja cerrada');
    await load();
  };

  return (
    <div className="space-y-6">
      <CashHeader />
      {message && (
        <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</div>
      )}
      {session ? (
        <OpenSession
          session={session}
          summary={summary}
          movementForm={movementForm}
          closeForm={closeForm}
          onMovement={movement}
          onClose={close}
        />
      ) : (
        <OpenCash branches={branches} form={openForm} onSubmit={open} />
      )}
      <CashHistory history={history} />
    </div>
  );
}

function CashHeader() {
  return (
    <header>
      <p className="text-xs font-bold uppercase tracking-widest text-lime-600">Punto de Venta</p>
      <h1 className="text-2xl font-black text-gray-900">Caja y conciliación</h1>
      <p className="mt-1 text-sm text-gray-500">
        El efectivo físico se separa de transferencias, tarjetas y cobros online.
      </p>
    </header>
  );
}

function OpenCash({
  branches,
  form,
  onSubmit,
}: {
  branches: PosBranch[];
  form: ReturnType<typeof useForm<OpenData>>;
  onSubmit: (data: OpenData) => Promise<void>;
}) {
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-xl space-y-4 rounded-2xl border border-gray-200 bg-white p-6"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-lime-100 p-3">
          <WalletCards className="h-6 w-6 text-lime-700" />
        </div>
        <div>
          <h2 className="font-bold">Abrir caja</h2>
          <p className="text-sm text-gray-500">Indicá el fondo físico inicial.</p>
        </div>
      </div>
      <label className="block text-sm font-medium">
        Caja
        <select
          {...form.register('registerId')}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5"
        >
          {branches.flatMap((branch) =>
            branch.registers.map((register) => (
              <option key={register.id} value={register.id}>
                {branch.name} · {register.name}
              </option>
            )),
          )}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Fondo inicial
        <input
          {...form.register('openingAmount')}
          type="number"
          min="0"
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium">
        Notas
        <input
          {...form.register('notes')}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5"
        />
      </label>
      <button className="w-full rounded-xl bg-[#C8FF00] px-4 py-3 font-black text-[#0f172a]">
        Abrir caja
      </button>
    </form>
  );
}

function OpenSession({
  session,
  summary,
  movementForm,
  closeForm,
  onMovement,
  onClose,
}: {
  session: Session;
  summary: Summary | null;
  movementForm: ReturnType<typeof useForm<MovementData>>;
  closeForm: ReturnType<typeof useForm<CloseData>>;
  onMovement: (data: MovementData) => Promise<void>;
  onClose: (data: CloseData) => Promise<void>;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
        <div>
          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
            ABIERTA
          </span>
          <h2 className="mt-2 text-lg font-bold">
            {session.register.branch.name} · {session.register.name}
          </h2>
          <p className="text-sm text-gray-500">
            Desde {formatDate(session.openedAt)} · Fondo {formatPrice(session.openingAmount)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(summary?.expected || {}).map(([method, amount]) => (
            <div key={method} className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Esperado · {method}</p>
              <p className="font-bold">{formatPrice(amount)}</p>
            </div>
          ))}
        </div>
        <form onSubmit={movementForm.handleSubmit(onMovement)} className="space-y-2 border-t pt-4">
          <p className="text-sm font-bold">Ingreso o retiro</p>
          <div className="grid grid-cols-2 gap-2">
            <select {...movementForm.register('type')} className="rounded-lg border px-3 py-2">
              <option value="INCOME">Ingreso</option>
              <option value="WITHDRAWAL">Retiro</option>
            </select>
            <input
              {...movementForm.register('amount')}
              type="number"
              min="0"
              placeholder="Importe"
              className="rounded-lg border px-3 py-2"
            />
          </div>
          <input
            {...movementForm.register('note')}
            placeholder="Motivo"
            className="w-full rounded-lg border px-3 py-2"
          />
          <button className="flex items-center gap-2 rounded-lg bg-[#0f172a] px-3 py-2 text-sm font-semibold text-white">
            {movementForm.watch('type') === 'INCOME' ? (
              <ArrowUpCircle className="h-4 w-4" />
            ) : (
              <ArrowDownCircle className="h-4 w-4" />
            )}{' '}
            Registrar
          </button>
        </form>
      </section>
      <CloseCash form={closeForm} expected={summary?.expected || {}} onSubmit={onClose} />
    </div>
  );
}

function CloseCash({
  form,
  expected,
  onSubmit,
}: {
  form: ReturnType<typeof useForm<CloseData>>;
  expected: Record<string, number>;
  onSubmit: (data: CloseData) => Promise<void>;
}) {
  const fields: [keyof CloseData, string][] = [
    ['cash', 'Efectivo contado'],
    ['transfer', 'Transferencias'],
    ['card', 'Tarjetas'],
    ['wallet', 'Billeteras'],
    ['terminal', 'Terminal externa'],
  ];
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6"
    >
      <div className="flex items-center gap-2">
        <LockKeyhole className="h-5 w-5 text-gray-500" />
        <h2 className="font-bold">Cerrar y conciliar</h2>
      </div>
      <p className="text-sm text-gray-500">
        Ingresá lo efectivamente contado o conciliado por medio.
      </p>
      {fields.map(([field, label]) => (
        <label key={field} className="flex items-center justify-between gap-3 text-sm">
          <span>{label}</span>
          <input
            {...form.register(field)}
            type="number"
            min="0"
            step="0.01"
            className="w-40 rounded-lg border px-3 py-2 text-right"
          />
        </label>
      ))}
      <label className="block text-sm">
        Notas
        <textarea {...form.register('notes')} className="mt-1 w-full rounded-lg border px-3 py-2" />
      </label>
      <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
        Esperado total:{' '}
        {formatPrice(Object.values(expected).reduce((sum, value) => sum + value, 0))}
      </p>
      <button className="w-full rounded-xl bg-red-600 px-4 py-3 font-bold text-white">
        Cerrar caja
      </button>
    </form>
  );
}

function CashHistory({ history }: { history: History[] }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 font-bold">Historial de cierres</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-gray-400">
              <th className="py-2">Caja</th>
              <th>Responsables</th>
              <th>Cierre</th>
              <th className="text-right">Efectivo esperado</th>
              <th className="text-right">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="py-3 font-medium">
                  {item.register.branch.name} · {item.register.name}
                </td>
                <td>
                  {item.openedBy.name} / {item.closedBy?.name || '-'}
                </td>
                <td>{item.closedAt ? formatDate(item.closedAt) : '-'}</td>
                <td className="text-right">{formatPrice(item.expectedTotals?.CASH || 0)}</td>
                <td
                  className={`text-right font-bold ${(item.differences?.CASH || 0) === 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatPrice(item.differences?.CASH || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { PosBranch } from '../punto-de-venta/types';

interface BranchData {
  name: string;
  code: string;
  address: string;
}
interface RegisterData {
  branchId: string;
  name: string;
  code: string;
}

export default function PosSettingsPage() {
  const [branches, setBranches] = useState<PosBranch[]>([]);
  const [message, setMessage] = useState('');
  const load = useCallback(async () => {
    const response = await api.get('/pos/settings/config');
    setBranches(response.data);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const saved = async (message: string) => {
    setMessage(message);
    await load();
  };
  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-lime-600">Punto de Venta</p>
        <h1 className="text-2xl font-black">Sucursales y cajas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configuración operativa para atribuir ventas y cierres.
        </p>
      </header>
      {message && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>
      )}
      <div className="grid gap-5 xl:grid-cols-2">
        <BranchForm onSaved={saved} />
        <RegisterForm branches={branches} onSaved={saved} />
      </div>
      <BranchList branches={branches} />
    </div>
  );
}

function BranchForm({ onSaved }: { onSaved: (message: string) => Promise<void> }) {
  const form = useForm<BranchData>({ defaultValues: { name: '', code: '', address: '' } });
  const submit = async (data: BranchData) => {
    await api.post('/pos/config/branches', data);
    form.reset();
    await onSaved('Sucursal creada');
  };
  return (
    <form
      onSubmit={form.handleSubmit(submit)}
      className="space-y-3 rounded-2xl border bg-white p-5"
    >
      <h2 className="font-bold">Nueva sucursal</h2>
      <input
        {...form.register('name', { required: true })}
        placeholder="Nombre"
        className="w-full rounded-lg border px-3 py-2"
      />
      <input
        {...form.register('code', { required: true })}
        placeholder="Código"
        className="w-full rounded-lg border px-3 py-2"
      />
      <input
        {...form.register('address')}
        placeholder="Dirección"
        className="w-full rounded-lg border px-3 py-2"
      />
      <button className="rounded-lg bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white">
        Crear sucursal
      </button>
    </form>
  );
}

function RegisterForm({
  branches,
  onSaved,
}: {
  branches: PosBranch[];
  onSaved: (message: string) => Promise<void>;
}) {
  const form = useForm<RegisterData>({ defaultValues: { branchId: '', name: '', code: '' } });
  const submit = async (data: RegisterData) => {
    await api.post('/pos/config/registers', data);
    form.reset();
    await onSaved('Caja creada');
  };
  return (
    <form
      onSubmit={form.handleSubmit(submit)}
      className="space-y-3 rounded-2xl border bg-white p-5"
    >
      <h2 className="font-bold">Nueva caja</h2>
      <select
        {...form.register('branchId', { required: true })}
        className="w-full rounded-lg border px-3 py-2"
      >
        <option value="">Elegí sucursal</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>
      <input
        {...form.register('name', { required: true })}
        placeholder="Nombre"
        className="w-full rounded-lg border px-3 py-2"
      />
      <input
        {...form.register('code', { required: true })}
        placeholder="Código"
        className="w-full rounded-lg border px-3 py-2"
      />
      <button className="rounded-lg bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white">
        Crear caja
      </button>
    </form>
  );
}

function BranchList({ branches }: { branches: PosBranch[] }) {
  return (
    <section className="rounded-2xl border bg-white p-5">
      <h2 className="mb-3 font-bold">Configuración activa</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {branches.map((branch) => (
          <div key={branch.id} className="rounded-xl bg-gray-50 p-3">
            <p className="font-semibold">{branch.name}</p>
            <p className="text-xs text-gray-500">
              {branch.registers.map((register) => register.name).join(' · ') || 'Sin cajas'}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

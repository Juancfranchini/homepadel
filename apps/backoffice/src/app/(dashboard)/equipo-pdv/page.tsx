'use client';

import { useCallback, useEffect, useState } from 'react';
import { Save, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';

interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  permissions: string[];
}

const PERMISSIONS = [
  ['pos.sell', 'Vender y registrar cobros'],
  ['pos.discount', 'Aplicar descuentos'],
  ['pos.create_product', 'Crear productos'],
  ['pos.returns', 'Cambios, devoluciones y cancelaciones'],
  ['pos.cash', 'Operar y cerrar caja'],
  ['pos.stats', 'Ver estadísticas'],
  ['pos.settings', 'Cambiar configuración del PDV'],
] as const;

export default function PosTeamPage() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const response = await api.get('/users');
    setUsers(response.data.filter((user: TeamUser) => user.role !== 'ADMIN'));
    setLoading(false);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  if (loading) return <PageLoader />;
  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-lime-600">Seguridad</p>
        <h1 className="text-2xl font-black text-gray-900">Equipo del Punto de Venta</h1>
        <p className="mt-1 text-sm text-gray-500">
          Promové una cuenta existente a personal y asignale sólo las funciones necesarias.
        </p>
      </header>
      <div className="grid gap-4 xl:grid-cols-2">
        {users.map((user) => (
          <TeamUserCard key={user.id} user={user} onSaved={load} />
        ))}
      </div>
    </div>
  );
}

function TeamUserCard({ user, onSaved }: { user: TeamUser; onSaved: () => Promise<void> }) {
  const [role, setRole] = useState<'CUSTOMER' | 'STAFF'>(
    user.role === 'STAFF' ? 'STAFF' : 'CUSTOMER',
  );
  const [permissions, setPermissions] = useState(user.permissions);
  const [saved, setSaved] = useState(false);
  const toggle = (permission: string) => {
    setPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
  };
  const save = async () => {
    await api.patch(`/users/${user.id}/access`, {
      role,
      permissions: role === 'STAFF' ? permissions : [],
    });
    setSaved(true);
    await onSaved();
  };
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <ShieldCheck className="h-5 w-5 text-lime-600" />
      </div>
      <label className="mt-4 block text-sm font-medium">
        Rol
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as 'CUSTOMER' | 'STAFF')}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        >
          <option value="CUSTOMER">Cliente</option>
          <option value="STAFF">Personal</option>
        </select>
      </label>
      <div className={`mt-4 grid gap-2 sm:grid-cols-2 ${role !== 'STAFF' ? 'opacity-40' : ''}`}>
        {PERMISSIONS.map(([value, label]) => (
          <label key={value} className="flex items-start gap-2 rounded-lg bg-gray-50 p-2 text-xs">
            <input
              type="checkbox"
              checked={permissions.includes(value)}
              disabled={role !== 'STAFF'}
              onChange={() => toggle(value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
      <button
        onClick={save}
        className="mt-4 flex items-center gap-2 rounded-lg bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white"
      >
        <Save className="h-4 w-4" /> {saved ? 'Guardado' : 'Guardar acceso'}
      </button>
    </section>
  );
}

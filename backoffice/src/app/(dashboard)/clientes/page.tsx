'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Mail, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  _count?: { orders: number };
}

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      const data = res.data?.value || res.data?.data || res.data;
      setCustomers(Array.isArray(data) ? data.filter((c: Customer) => c.role !== 'ADMIN') : []);
    } catch { setCustomers([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-500 text-sm mt-0.5">{customers.length} clientes registrados</p>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <p className="text-gray-400 text-sm">No hay clientes registrados</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Telefono</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedidos</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Registro</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0f172a] flex items-center justify-center">
                        <User className="w-4 h-4 text-[#C8FF00]" />
                      </div>
                      <p className="text-gray-900 font-medium text-sm">{c.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Mail className="w-3.5 h-3.5" />{c.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500">{c.phone || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-semibold text-gray-900">{c._count?.orders || 0}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(c.createdAt).toLocaleDateString('es-AR')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

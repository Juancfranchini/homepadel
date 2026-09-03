'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Mail, Calendar, Search } from 'lucide-react';
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
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const pageSize = isMobile ? 3 : 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      const data = res.data?.value || res.data?.data || res.data;
      setCustomers(Array.isArray(data) ? data.filter((c: Customer) => c.role !== 'ADMIN') : []);
    } catch { setCustomers([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => { setCurrentPage(1); }, [isMobile]);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center justify-between lg:justify-start gap-3 lg:shrink-0">
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 text-sm">{filtered.length} registros</p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-1 lg:max-w-2xl lg:justify-end">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, email o telefono..."
                className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
              />
            </div>
          </div>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <p className="text-gray-400 text-sm">No se encontraron clientes</p>
        </div>
      ) : (
        <>
          {/* Tabla desktop/tablet */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Telefono</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedidos</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#0f172a] flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-[#C8FF00]" />
                          </div>
                          <p className="text-gray-900 font-medium text-sm whitespace-nowrap">{c.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{c.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{c.phone || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-gray-900">{c._count?.orders || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                          <Calendar className="w-3 h-3 shrink-0" />
                          {new Date(c.createdAt).toLocaleDateString('es-AR')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards mobile */}
          <div className="md:hidden space-y-3">
            {paginated.map((c) => (
              <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#0f172a] flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-[#C8FF00]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        {c.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 whitespace-nowrap shrink-0">{c._count?.orders || 0} pedidos</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500 truncate">{c.phone || 'Sin telefono'}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(c.createdAt).toLocaleDateString('es-AR')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Paginacion */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={'w-8 h-8 rounded-lg text-sm font-medium ' + (i + 1 === currentPage ? 'bg-[#C8FF00] text-[#0f172a]' : 'text-gray-500 hover:bg-gray-50')}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

interface Subscriber {
  id: string;
  email: string;
  active: boolean;
  createdAt: string;
}

export default function NewsletterPage() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const pageSize = isMobile ? 3 : 10;
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/newsletter/subscribers');
      setSubscribers(Array.isArray(res.data) ? res.data : []);
    } catch { setSubscribers([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => { setCurrentPage(1); }, [isMobile]);

  const handleUnsubscribe = async (email: string) => {
    try {
      await api.post('/newsletter/unsubscribe', { email });
      toast('Email desuscripto', 'success');
      load();
    } catch { toast('Error', 'error'); }
  };

  const totalPages = Math.ceil(subscribers.length / pageSize);
  const paginated = subscribers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
        <p className="text-gray-500 text-sm mt-0.5">{subscribers.length} suscriptores</p>
      </div>

      {subscribers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <Mail className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No hay suscriptores todavia</p>
        </div>
      ) : (
        <>
          {/* Tabla desktop */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
            </tr></thead>
            <tbody>
              {paginated.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{s.email}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={'text-xs font-medium px-2 py-1 rounded-full ' + (s.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                      {s.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">{new Date(s.createdAt).toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3 text-center">
                    {s.active && (
                      <button onClick={() => handleUnsubscribe(s.email)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors" title="Desuscribir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Cards mobile */}
          <div className="md:hidden space-y-3">
            {paginated.map((s) => (
              <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900 truncate">{s.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={'text-xs font-medium px-2 py-1 rounded-full ' + (s.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                    {s.active ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleDateString('es-AR')}</span>
                </div>
                {s.active && (
                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <button onClick={() => handleUnsubscribe(s.email)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors" title="Desuscribir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={'w-8 h-8 rounded-lg text-sm font-medium ' + (i + 1 === currentPage ? 'bg-[#C8FF00] text-[#0f172a]' : 'text-gray-500 hover:bg-gray-50')}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}


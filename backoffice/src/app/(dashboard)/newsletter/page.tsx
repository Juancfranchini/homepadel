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
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/newsletter/subscribers');
      setSubscribers(Array.isArray(res.data) ? res.data : []);
    } catch { setSubscribers([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUnsubscribe = async (email: string) => {
    try {
      await api.post('/newsletter/unsubscribe', { email });
      toast('Email desuscripto', 'success');
      load();
    } catch { toast('Error', 'error'); }
  };

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
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
            </tr></thead>
            <tbody>
              {subscribers.map((s) => (
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
      )}
    </div>
  );
}

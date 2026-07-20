'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Trash2, Star, User } from 'lucide-react';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/Modal';

interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  active: boolean;
  verified: boolean;
  createdAt: string;
}

export default function ReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews/admin/all');
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch { setReviews([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (r: Review) => {
    try { await api.patch('/reviews/' + r.id + '/approve'); toast('Resena aprobada', 'success'); load(); }
    catch { toast('Error', 'error'); }
  };

  const reject = async (r: Review) => {
    try { await api.delete('/reviews/' + r.id); toast('Resena eliminada', 'success'); load(); }
    catch { toast('Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/reviews/' + deleteTarget.id); toast('Eliminada', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error', 'error'); } finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resenas de productos</h1>
        <p className="text-gray-500 text-sm mt-0.5">{reviews.length} resenas</p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <p className="text-gray-400 text-sm">No hay resenas para moderar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className={'bg-white rounded-xl border p-5 ' + (r.active ? 'border-gray-200' : 'border-amber-200 bg-amber-50/30')}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">{r.name}</span>
                      {!r.active && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Pendiente</span>
                      )}
                      {r.active && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Aprobada</span>
                      )}
                    </div>
                    <div className="flex gap-0.5 mb-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={'w-3.5 h-3.5 ' + (s <= r.rating ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-gray-200')} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{r.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString('es-AR')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {!r.active && (
                    <button onClick={() => approve(r)} className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Aprobar">
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={() => r.active ? setDeleteTarget(r) : reject(r)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title={r.active ? 'Eliminar' : 'Rechazar'}>
                    {r.active ? <Trash2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Eliminar resena" description={'Eliminar la resena de ' + (deleteTarget?.name || '') + '?'} isLoading={deleting} />
    </div>
  );
}

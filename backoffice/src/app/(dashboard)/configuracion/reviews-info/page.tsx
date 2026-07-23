'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

const schema = z.object({
  title: z.string().min(2, 'El titulo es requerido'),
  content: z.string().min(10, 'El contenido es requerido'),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

export default function ReviewsInfoPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-sections/reviews_info');
      const data = res.data?.data ?? res.data ?? {};
      reset({ title: data.title || 'Como se calculan las opiniones?', content: data.content || '' });
    } catch { reset({ title: 'Como se calculan las opiniones?', content: '' }); } finally { setLoading(false); }
  }, [reset]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await api.put('/site-sections/reviews_info', { data, active: true });
      toast('Informacion guardada', 'success');
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3">
        <Link href="/configuracion" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-[#C8FF00]" />Info Reviews</h1>
          <p className="text-gray-500 text-sm mt-0.5">Texto del modal "Como se calculan las opiniones"</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Pregunta</label><input {...register('title')} className={inputClass} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Respuesta</label><textarea {...register('content')} rows={5} className={inputClass} /></div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 transition-colors"><Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}</button>
        </div>
      </form>
    </div>
  );
}

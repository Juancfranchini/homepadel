'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, FileCheck } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import RichTextEditor from '@/components/ui/RichTextEditor';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-xs font-medium text-gray-400 uppercase tracking-wider';

export default function TerminosPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    resolver: zodResolver(z.object({
      title: z.string().min(1, 'El titulo es requerido'),
      content: z.string().optional().default(''),
    })),
    defaultValues: { title: 'Terminos y Condiciones', content: '' },
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-sections/terminos');
      const data = res.data?.data ?? res.data ?? {};
      reset({ title: data.title || 'Terminos y Condiciones', content: data.content || '' });
    } catch {} finally { setLoading(false); }
  }, [reset]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await api.put('/site-sections/terminos', { data, active: true });
      toast('Terminos y Condiciones guardados', 'success');
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/configuracion" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileCheck className="w-5 h-5 text-[#C8FF00]" />Terminos y Condiciones</h1>
          <p className="text-gray-500 text-sm mt-0.5">Configura la página /terminos</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className={labelClass}>Titulo de la página</label>
          <input {...register('title')} className={inputClass} placeholder="Terminos y Condiciones" />
        </div>
        <div>
          <label className={labelClass}>Contenido</label>
          <RichTextEditor
            content={watch('content') || ''}
            onChange={(html) => setValue('content', html, { shouldDirty: true })}
          />
        </div>
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
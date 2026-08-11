'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, Truck, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import RichTextEditor from '@/components/ui/RichTextEditor';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-xs font-medium text-gray-400 uppercase tracking-wider';

export default function EnviosPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, control, watch, setValue } = useForm<any>({
    resolver: zodResolver(z.object({
      title: z.string().min(1, 'El titulo es requerido'),
      sections: z.array(z.object({
        title: z.string().optional().default(''),
        content: z.string().optional().default(''),
      })).min(1, 'Al menos una seccion es requerida'),
    })),
    defaultValues: {
      title: 'Envios',
      sections: [{ title: 'Tiempos y costos', content: '' }],
    },
  });

  const { fields, append, remove, swap } = useFieldArray({ control, name: 'sections' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-sections/envios');
      const data = res.data?.data ?? res.data ?? {};
      reset({
        title: data.title || 'Envios',
        sections: data.sections?.length > 0 ? data.sections : [{ title: 'Tiempos y costos', content: data.content || '' }],
      });
    } catch {} finally { setLoading(false); }
  }, [reset]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await api.put('/site-sections/envios', { data, active: true });
      toast('Envios guardados', 'success');
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  const moveUp = (index: number) => { if (index > 0) swap(index, index - 1); };
  const moveDown = (index: number) => { if (index < fields.length - 1) swap(index, index + 1); };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/configuracion" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Truck className="w-5 h-5 text-[#C8FF00]" />Envios</h1>
            <p className="text-gray-500 text-sm mt-0.5">{fields.length} secciones configuradas</p>
          </div>
        </div>
        <button type="button" onClick={() => append({ title: 'Nueva seccion', content: '' })} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors">
          <Plus className="w-4 h-4" />Agregar Seccion
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className={labelClass}>Titulo principal de la pagina</label>
            <input {...register('title')} className={inputClass} placeholder="Envios" />
          </div>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3 flex-1">
                <GripVertical size={16} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase">Seccion {index + 1}</span>
                <input
                  {...register('sections.' + index + '.title')}
                  placeholder="Titulo de la seccion"
                  className="px-2 py-1 border border-gray-200 rounded text-sm text-gray-900 focus:outline-none focus:border-[#C8FF00] flex-1 max-w-xs"
                />
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveUp(index)} disabled={index === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronUp size={16} /></button>
                <button type="button" onClick={() => moveDown(index)} disabled={index === fields.length - 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronDown size={16} /></button>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(index)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 ml-2"><Trash2 size={16} /></button>
                )}
              </div>
            </div>
            <div className="p-4">
              <RichTextEditor
                content={watch('sections.' + index + '.content') || ''}
                onChange={(html) => setValue('sections.' + index + '.content', html, { shouldDirty: true })}
              />
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
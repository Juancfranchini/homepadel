'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Plus, Trash2, Info, ArrowLeft, Heart, Users, Shield, Star, Award, Zap, CheckCircle, Truck } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import ImageUpload from '@/components/ui/ImageUpload';
import { createElement } from 'react';

const ICON_OPTIONS = [
  { value: 'Heart', label: 'Corazon', icon: Heart },
  { value: 'Users', label: 'Usuarios', icon: Users },
  { value: 'Shield', label: 'Escudo', icon: Shield },
  { value: 'Star', label: 'Estrella', icon: Star },
  { value: 'Award', label: 'Premio', icon: Award },
  { value: 'Zap', label: 'Rayo', icon: Zap },
  { value: 'CheckCircle', label: 'Check', icon: CheckCircle },
  { value: 'Truck', label: 'Camion', icon: Truck },
];

const benefitSchema = z.object({
  icon: z.string().min(1),
  title: z.string().min(1, 'Requerido'),
  description: z.string().optional().or(z.literal('')),
});

const schema = z.object({
  title: z.string().min(2, 'El titulo es requerido'),
  description: z.string().min(10, 'La descripcion es requerida'),
  image: z.string().optional().or(z.literal('')),
  benefits: z.array(benefitSchema).min(1, 'Agrega al menos un item'),
  active: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-xs font-medium text-gray-400 uppercase tracking-wider';

export default function AboutConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: 'Somos Home Padel',
      description: 'En Home Padel vivimos este deporte con la misma pasion que vos.',
      benefits: [
        { icon: 'Truck', title: 'Envios a todo el pais', description: 'Llegamos a cada rincon de Argentina' },
        { icon: 'Shield', title: 'Productos originales', description: 'Garantia oficial de fabrica' },
        { icon: 'Users', title: 'Atencion personalizada', description: 'Te asesoramos segun tu nivel y estilo' },
      ],
      active: true,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'benefits' });
  const imageValue = watch('image') || '';
  const benefitsWatch = watch('benefits');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-sections/about');
      const data = res.data?.data ?? res.data;
      if (data && typeof data === 'object') {
        reset({
          title: data.title ?? 'Somos Home Padel',
          description: data.description ?? '',
          image: data.image ?? '',
          benefits: data.benefits?.length > 0 ? data.benefits : [
            { icon: 'Truck', title: 'Envios a todo el pais', description: 'Llegamos a cada rincon de Argentina' },
            { icon: 'Shield', title: 'Productos originales', description: 'Garantia oficial de fabrica' },
            { icon: 'Users', title: 'Atencion personalizada', description: 'Te asesoramos segun tu nivel y estilo' },
          ],
          active: data.active !== false,
        });
      }
    } catch {} finally { setLoading(false); }
  }, [reset]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await api.put('/site-sections/about', { data, active: data.active });
      toast('Seccion guardada', 'success');
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3">
        <Link href="/configuracion" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Info className="w-5 h-5 text-[#C8FF00]" />Sobre Nosotros</h1>
          <p className="text-gray-500 text-sm mt-0.5">Seccion del inicio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div className="flex gap-6">
            <ImageUpload value={imageValue} onChange={(url) => setValue('image', url, { shouldDirty: true })} placeholder="URL de imagen" width={200} height={160} />
            <div className="flex-1 space-y-4">
              <div>
                <label className={labelClass + ' mb-1'}>Titulo *</label>
                <input {...register('title')} className={inputClass + ' mt-1'} placeholder="Somos Home Padel" />
                {errors.title && <p className="text-xs text-red-600 mt-0.5">{errors.title.message}</p>}
              </div>
              <div>
                <label className={labelClass + ' mb-1'}>Descripcion *</label>
                <textarea {...register('description')} rows={3} className={inputClass + ' mt-1'} />
                {errors.description && <p className="text-xs text-red-600 mt-0.5">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Beneficios ({fields.length})</h3>
              <button type="button" onClick={() => append({ icon: 'Star', title: '', description: '' })}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00] transition-colors">
                <Plus className="w-3.5 h-3.5" />Agregar
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((field, i) => {
                const currentIcon = benefitsWatch?.[i]?.icon || 'Star';
                const iconObj = ICON_OPTIONS.find((o) => o.value === currentIcon);
                const IconPreview = iconObj?.icon || Star;
                return (
                  <div key={field.id} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Icono</label>
                      <div className="relative">
                        <select {...register(('benefits.' + i + '.icon') as any)} className={inputClass + ' text-xs pl-8'}>
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#C8FF00] pointer-events-none">
                          {createElement(IconPreview, { size: 14 })}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Titulo *</label>
                      <input {...register(('benefits.' + i + '.title') as any)} className={inputClass} placeholder="Ej: Envios a todo el pais" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Descripcion (opcional)</label>
                      <input {...register(('benefits.' + i + '.description') as any)} className={inputClass} placeholder="Ej: Llegamos a cada rincon" />
                    </div>
                    <button type="button" onClick={() => remove(i)} className="p-2 mt-5 text-red-400 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="aboutActive" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
            <label htmlFor="aboutActive" className="text-sm text-gray-700 font-medium">Seccion activa</label>
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

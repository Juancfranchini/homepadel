'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, Shield, Plus, Trash2, Truck, RefreshCw, Check, MessageCircle, Star, Zap, Heart, Lock, Headphones, Gift, Award, Clock, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { createElement } from 'react';

const ICON_OPTIONS = [
  { value: 'Truck', label: 'Envio', icon: Truck },
  { value: 'RefreshCw', label: 'Cambios', icon: RefreshCw },
  { value: 'Shield', label: 'Garantia', icon: Shield },
  { value: 'Check', label: 'Seguridad', icon: Check },
  { value: 'MessageCircle', label: 'WhatsApp', icon: MessageCircle },
  { value: 'Star', label: 'Calidad', icon: Star },
  { value: 'Zap', label: 'Rapidez', icon: Zap },
  { value: 'Heart', label: 'Confianza', icon: Heart },
  { value: 'Lock', label: 'Proteccion', icon: Lock },
  { value: 'Headphones', label: 'Soporte', icon: Headphones },
  { value: 'Gift', label: 'Regalo', icon: Gift },
  { value: 'Award', label: 'Premio', icon: Award },
  { value: 'Clock', label: 'Horario', icon: Clock },
  { value: 'ThumbsUp', label: 'Garantia', icon: ThumbsUp },
];

const ICON_MAP: Record<string, any> = {};
ICON_OPTIONS.forEach((o) => { ICON_MAP[o.value] = o.icon; });

const itemSchema = z.object({
  icon: z.string().min(1),
  title: z.string().min(1, 'Requerido'),
  subtitle: z.string().optional().or(z.literal('')),
});

const schema = z.object({
  items: z.array(itemSchema).min(1, 'Agrega al menos un item'),
  active: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

export default function ConfianzaProductosPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      items: [
        { icon: 'Truck', title: 'ENVIOS A TODO EL PAIS', subtitle: 'Recibi tu pedido en cualquier punto del pais' },
        { icon: 'RefreshCw', title: '30 DIAS PARA CAMBIOS', subtitle: 'Si no estas conforme, podes cambiar tu producto' },
        { icon: 'Shield', title: 'GARANTIA OFICIAL', subtitle: 'Todos nuestros productos cuentan con garantia oficial' },
        { icon: 'Check', title: 'PAGOS 100% SEGUROS', subtitle: 'Protegemos tus datos con el mas alto nivel de seguridad' },
        { icon: 'MessageCircle', title: 'ATENCION PERSONALIZADA', subtitle: 'Te asesoramos por WhatsApp en todo momento' },
      ],
      active: true,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const itemsWatch = watch('items');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-sections/trust_bottom');
      const data = res.data?.data ?? res.data;
      if (data?.items && data.items.length > 0) {
        reset({ items: data.items, active: data.active !== false });
      }
    } catch {} finally { setLoading(false); }
  }, [reset]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await api.put('/site-sections/trust_bottom', { data, active: data.active });
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#C8FF00]" />Confianza Productos
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Barra de confianza en la pagina de producto</p>
        </div>
      </div>

      <div className="bg-[#050606] rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#C8FF00] mb-2">Vista previa</p>
        <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-[#B7D31A]/20">
          {itemsWatch?.map((item, i) => {
            const IconComp = ICON_MAP[item.icon] || Shield;
            return (
              <div key={i} className="flex items-center gap-3 px-3 py-2 first:pl-0 last:pr-0">
                <span className="text-[#B7D31A] flex-shrink-0">{createElement(IconComp, { size: 20 })}</span>
                <div>
                  <p className="text-[#F7F6F7] font-semibold text-[9px] uppercase tracking-wide leading-snug">{item.title || 'Titulo'}</p>
                  <p className="text-[#C7C7C0] text-[8px] leading-snug mt-0.5">{item.subtitle || 'Subtitulo'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-semibold text-gray-800">Items ({fields.length})</h2>
            <button type="button" onClick={() => append({ icon: 'Shield', title: '', subtitle: '' })}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00] transition-colors">
              <Plus className="w-3.5 h-3.5" />Agregar
            </button>
          </div>
          <div className="space-y-3">
            {fields.map((field, i) => {
              const currentIcon = itemsWatch?.[i]?.icon || 'Shield';
              const IconComp = ICON_MAP[currentIcon] || Shield;
              return (
                <div key={field.id} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                  <div className="w-32">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Icono</label>
                    <div className="relative">
                      <select {...register(('items.' + i + '.icon') as any)} className={inputClass + ' text-xs pl-8'}>
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#C8FF00] pointer-events-none">
                        {createElement(IconComp, { size: 14 })}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Titulo *</label>
                    <input {...register(('items.' + i + '.title') as any)} className={inputClass} placeholder="ENVIOS A TODO EL PAIS" />
                    {errors.items?.[i]?.title && <p className="text-xs text-red-600 mt-0.5">{errors.items[i]?.title?.message}</p>}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Subtitulo</label>
                    <input {...register(('items.' + i + '.subtitle') as any)} className={inputClass} placeholder="Recibi tu pedido en..." />
                  </div>
                  <button type="button" onClick={() => remove(i)} className="p-2 mt-5 text-red-400 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="ctActive" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
            <label htmlFor="ctActive" className="text-sm text-gray-700 font-medium">Seccion activa</label>
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

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Upload, Link, Image } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const schema = z.object({
  logoHeader: z.string().optional().or(z.literal('')),
  logoFooter: z.string().optional().or(z.literal('')),
  isotipo: z.string().optional().or(z.literal('')),
  logoMobile: z.string().optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

export default function BrandingPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const logoHeader = watch('logoHeader');
  const logoFooter = watch('logoFooter');
  const isotipo = watch('isotipo');
  const logoMobile = watch('logoMobile');

  useEffect(() => {
    api.get('/site-sections/branding')
      .then(res => {
        const data = res.data?.data || res.data || {};
        reset({
          logoHeader: data.logoHeader || '',
          logoFooter: data.logoFooter || '',
          isotipo: data.isotipo || '',
          logoMobile: data.logoMobile || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await api.put('/site-sections/branding', { data });
      toast('Configuracion guardada', 'success');
    } catch {
      toast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Identidad de Marca</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gestiona los logos de la tienda</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-2"><Image className="w-4 h-4 text-[#C8FF00]" />Logo Header (Principal)</span>
            </label>
            <input {...register('logoHeader')} className={inputClass} placeholder="https://... o deja vacio para usar el logo por defecto" />
            {logoHeader && (
              <div className="mt-3 p-4 bg-gray-900 rounded-lg inline-block">
                <img src={logoHeader} alt="Logo Header" className="h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">Se muestra en el header y footer. Recomendado: PNG con fondo transparente, 200x60px.</p>
          </div>

          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-2"><Image className="w-4 h-4 text-[#C8FF00]" />Logo Footer</span>
            </label>
            <input {...register('logoFooter')} className={inputClass} placeholder="https://... (opcional, si es diferente al header)" />
            {logoFooter && (
              <div className="mt-3 p-4 bg-gray-900 rounded-lg inline-block">
                <img src={logoFooter} alt="Logo Footer" className="h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-2"><Image className="w-4 h-4 text-[#C8FF00]" />Isotipo (solo icono)</span>
            </label>
            <input {...register('isotipo')} className={inputClass} placeholder="https://... (opcional)" />
            {isotipo && (
              <div className="mt-3 p-4 bg-gray-900 rounded-lg inline-block">
                <img src={isotipo} alt="Isotipo" className="h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">Version sin texto. Se usa en FinalMessage, AboutSection y favicon.</p>
          </div>

          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-2"><Image className="w-4 h-4 text-[#C8FF00]" />Logo Mobile</span>
            </label>
            <input {...register('logoMobile')} className={inputClass} placeholder="https://... (opcional, version reducida para moviles)" />
            {logoMobile && (
              <div className="mt-3 p-4 bg-gray-900 rounded-lg inline-block">
                <img src={logoMobile} alt="Logo Mobile" className="h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
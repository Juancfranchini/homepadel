'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, Megaphone, Mail } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

const schema = z.object({
  // CTA (columna izquierda)
  title: z.string().min(2, 'El titulo es requerido'),
  text: z.string().optional().or(z.literal('')),
  buttonText: z.string().min(2, 'El texto del boton es requerido'),
  buttonUrl: z.string().min(1, 'La URL es requerida'),
  footerText: z.string().optional().or(z.literal('')),
  secondaryButtonText: z.string().optional().or(z.literal('')),
  secondaryButtonUrl: z.string().optional().or(z.literal('')),
  // Newsletter (columna derecha)
  newsletterTitle: z.string().min(2, 'El titulo es requerido'),
  newsletterText: z.string().optional().or(z.literal('')),
  newsletterPlaceholder: z.string().optional().or(z.literal('')),
  newsletterButtonText: z.string().optional().or(z.literal('')),
  newsletterFooterText: z.string().optional().or(z.literal('')),
  active: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

export default function CtaNewsletterConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: 'Un mensaje para vos',
      text: 'Encontra todo lo que necesitas en un solo lugar. Las mejores marcas, los mejores precios.',
      buttonText: 'Ver catalogo',
      buttonUrl: '/catalogo',
      footerText: 'Productos originales. Envios a todo el pais.',
      secondaryButtonText: '',
      secondaryButtonUrl: '',
      newsletterTitle: 'Enterate de las novedades',
      newsletterText: 'Ofertas exclusivas, nuevos productos y contenido relevante sobre padel.',
      newsletterPlaceholder: 'Tu email',
      newsletterButtonText: 'Suscribirme',
      newsletterFooterText: 'Sin spam. Solo contenido relevante sobre padel.',
      active: true,
    },
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-sections/final_message');
      const data = res.data?.data ?? res.data;
      if (data && typeof data === 'object') {
        reset({
          title: data.title ?? 'Un mensaje para vos',
          text: data.text ?? '',
          buttonText: data.buttonText ?? 'Ver catalogo',
          buttonUrl: data.buttonUrl ?? '/catalogo',
          footerText: data.footerText ?? 'Productos originales. Envios a todo el pais.',
          secondaryButtonText: data.secondaryButtonText ?? '',
          secondaryButtonUrl: data.secondaryButtonUrl ?? '',
          newsletterTitle: data.newsletterTitle ?? 'Enterate de las novedades',
          newsletterText: data.newsletterText ?? 'Ofertas exclusivas, nuevos productos y contenido relevante sobre padel.',
          newsletterPlaceholder: data.newsletterPlaceholder ?? 'Tu email',
          newsletterButtonText: data.newsletterButtonText ?? 'Suscribirme',
          newsletterFooterText: data.newsletterFooterText ?? 'Sin spam. Solo contenido relevante sobre padel.',
          active: data.active !== false,
        });
      }
    } catch {} finally { setLoading(false); }
  }, [reset]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await api.put('/site-sections/final_message', { data, active: data.active });
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
            <Megaphone className="w-5 h-5 text-[#C8FF00]" />CTA & Newsletter
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Seccion final del inicio con CTA y formulario de newsletter</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna CTA */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Megaphone size={16} className="text-[#C8FF00]" />Columna CTA
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
              <input {...register('title')} className={inputClass} placeholder="Un mensaje para vos" />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto descriptivo</label>
              <textarea {...register('text')} rows={2} className={inputClass} placeholder="Encontra todo lo que necesitas..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto del boton *</label>
              <input {...register('buttonText')} className={inputClass} placeholder="Ver catalogo" />
              {errors.buttonText && <p className="text-xs text-red-600 mt-1">{errors.buttonText.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL del boton *</label>
              <input {...register('buttonUrl')} className={inputClass} placeholder="/catalogo" />
              {errors.buttonUrl && <p className="text-xs text-red-600 mt-1">{errors.buttonUrl.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto pequeno debajo del boton</label>
              <input {...register('footerText')} className={inputClass} placeholder="Productos originales. Envios a todo el pais." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Boton secundario (texto)</label>
                <input {...register('secondaryButtonText')} className={inputClass} placeholder="Opcional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Boton secundario (URL)</label>
                <input {...register('secondaryButtonUrl')} className={inputClass} placeholder="Opcional" />
              </div>
            </div>
          </div>

          {/* Columna Newsletter */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Mail size={16} className="text-[#C8FF00]" />Columna Newsletter
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
              <input {...register('newsletterTitle')} className={inputClass} placeholder="Enterate de las novedades" />
              {errors.newsletterTitle && <p className="text-xs text-red-600 mt-1">{errors.newsletterTitle.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto descriptivo</label>
              <textarea {...register('newsletterText')} rows={2} className={inputClass} placeholder="Ofertas exclusivas..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder del input</label>
              <input {...register('newsletterPlaceholder')} className={inputClass} placeholder="Tu email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto del boton</label>
              <input {...register('newsletterButtonText')} className={inputClass} placeholder="Suscribirme" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto pequeno debajo</label>
              <input {...register('newsletterFooterText')} className={inputClass} placeholder="Sin spam. Solo contenido relevante." />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="fmActive" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
            <label htmlFor="fmActive" className="text-sm text-gray-700 font-medium">Seccion activa</label>
          </div>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

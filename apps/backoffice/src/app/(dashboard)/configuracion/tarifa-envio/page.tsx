'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, Banknote } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-xs font-medium text-gray-400 uppercase tracking-wider';

const schema = z.object({
  flatRate: z.coerce.number().min(0, 'Tiene que ser 0 o más'),
  freeShippingThreshold: z.coerce.number().min(0, 'Tiene que ser 0 o más'),
});
type FormData = z.infer<typeof schema>;

export default function TarifaEnvioPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { flatRate: 4500, freeShippingThreshold: 100000 },
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-sections/shipping_rates');
      const data = res.data?.data ?? res.data ?? {};
      reset({
        flatRate: data.flatRate ?? 4500,
        freeShippingThreshold: data.freeShippingThreshold ?? 100000,
      });
    } catch {
      toast('No se pudo cargar la tarifa de envío', 'error');
    } finally {
      setLoading(false);
    }
  }, [reset, toast]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await api.put('/site-sections/shipping_rates', { data, active: true });
      toast('Tarifa de envío guardada', 'success');
    } catch {
      toast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/configuracion" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Banknote className="w-5 h-5 text-[#C8FF00]" />Tarifa de envío</h1>
          <p className="text-gray-500 text-sm mt-0.5">Lo que se muestra en el carrito y lo que realmente se cobra: es el mismo número, calculado acá.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 max-w-lg">
          <div>
            <label className={labelClass}>Costo de envío ($)</label>
            <input type="number" step="1" min="0" {...register('flatRate')} className={inputClass} placeholder="4500" />
            {errors.flatRate && <p className="text-red-500 text-xs mt-1">{errors.flatRate.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Envío gratis a partir de ($)</label>
            <input type="number" step="1" min="0" {...register('freeShippingThreshold')} className={inputClass} placeholder="100000" />
            {errors.freeShippingThreshold && <p className="text-red-500 text-xs mt-1">{errors.freeShippingThreshold.message}</p>}
            <p className="text-gray-400 text-xs mt-1">Un pedido con subtotal igual o mayor a este monto no paga envío.</p>
          </div>
        </div>

        <div className="flex justify-end max-w-lg">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

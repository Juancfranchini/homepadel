'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import TramosFields from './TramosFields';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-xs font-medium text-gray-400 uppercase tracking-wider';

const schema = z.object({
  activo: z.boolean(),
  cuotasBase: z.coerce.number().int('Tiene que ser un número entero').min(1, 'Mínimo 1').max(24, 'Máximo 24'),
  tramos: z.array(z.object({
    desde: z.coerce.number().min(0, 'Tiene que ser 0 o más'),
    cuotas: z.coerce.number().int('Tiene que ser un número entero').min(1, 'Mínimo 1').max(24, 'Máximo 24'),
  })),
});
export type CuotasForm = z.infer<typeof schema>;
type FormData = CuotasForm;

// La propuesta del negocio: se precarga, pero no rige hasta activarla y guardar.
const POR_DEFECTO: FormData = { activo: false, cuotasBase: 1, tramos: [{ desde: 300000, cuotas: 9 }, { desde: 400000, cuotas: 12 }] };

/**
 * Cuotas sin interés con Mercado Pago según el monto de la compra. El
 * servidor le pone el tope a cada pago y la tienda muestra lo mismo en la
 * ficha, el carrito y el checkout (ver apps/backend/src/payments/cuotas.ts).
 */
export default function CuotasPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: POR_DEFECTO });
  const { fields, append, remove } = useFieldArray({ control, name: 'tramos' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-sections/cuotas');
      const data = res.data?.data ?? res.data ?? {};
      reset({
        activo: data.activo === true,
        cuotasBase: data.cuotasBase ?? POR_DEFECTO.cuotasBase,
        tramos: Array.isArray(data.tramos) ? data.tramos : POR_DEFECTO.tramos,
      });
    } catch {
      toast('No se pudieron cargar las cuotas', 'error');
    } finally {
      setLoading(false);
    }
  }, [reset, toast]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const tramos = [...data.tramos].sort((a, b) => a.desde - b.desde);
      await api.put('/site-sections/cuotas', { data: { ...data, tramos }, active: true });
      toast('Cuotas guardadas', 'success');
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#C8FF00]" />Cuotas sin interés</h1>
          <p className="text-gray-500 text-sm mt-0.5">Hasta cuántas cuotas ofrece Mercado Pago según el monto de los productos (después de descuentos, sin envío). La tienda muestra lo mismo en la ficha, el carrito y el checkout.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <input type="checkbox" {...register('activo')} className="h-4 w-4 accent-[#C8FF00]" />
            Usar cuotas por monto
          </label>
          <p className="text-gray-400 text-xs -mt-2">Apagado, cada producto muestra sus cuotas y Mercado Pago ofrece las que tenga activas la cuenta.</p>

          <TramosFields register={register} errors={errors} fields={fields} append={append} remove={remove} />

          <div>
            <label className={labelClass}>Cuotas por debajo del primer tramo</label>
            <input type="number" step="1" min="1" max="24" {...register('cuotasBase')} className={inputClass} />
            {errors.cuotasBase && <p className="text-red-500 text-xs mt-1">{errors.cuotasBase.message}</p>}
            <p className="text-gray-400 text-xs mt-1">1 = pago en una sola cuota (Mercado Pago no ofrece cuotas, ni con interés).</p>
          </div>

          {watch('activo') && (
            <p className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
              Que estas cuotas sean <strong>sin interés</strong> depende de tu cuenta de Mercado Pago: ahí tienen que estar activos esos planes (por ejemplo 9 y 12 cuotas sin interés). Este tope solo limita cuántas se ofrecen.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DireccionGuardada, DireccionInput } from '@/lib/api';
import { PROVINCIAS } from '@/lib/provincias';

const inputClass = 'w-full bg-field border border-chip rounded-lg px-4 py-2.5 text-sm text-fg placeholder-fg-muted focus:outline-none focus:border-[#B7D31A]/60 transition-colors';
const labelClass = 'block text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1';
const MensajeError = ({ mensaje }: { mensaje?: string }) => (mensaje ? <p className="text-red-500 light:text-red-600 text-xs mt-1">{mensaje}</p> : null);

// Mismas reglas que valida el backend (DireccionDto).
const schema = z.object({
  label: z.string().trim().max(40, 'Hasta 40 caracteres').optional(),
  street: z.string().trim().min(5, 'Escribí calle y número').max(200),
  city: z.string().trim().min(2, 'Escribí la ciudad o localidad').max(100),
  province: z.string().min(2, 'Elegí la provincia'),
  postalCode: z.string().trim().regex(/^[A-Za-z0-9]{4,8}$/, 'Código postal inválido'),
  phone: z.string().trim().regex(/^[0-9+\s()-]{8,40}$/, 'Teléfono inválido').or(z.literal('')).optional(),
});
type Datos = z.infer<typeof schema>;

interface Props {
  inicial?: DireccionGuardada;
  guardando: boolean;
  onGuardar: (datos: DireccionInput) => void;
  onCancelar: () => void;
}

export default function DireccionForm({ inicial, guardando, onGuardar, onCancelar }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<Datos>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: inicial?.label ?? '', street: inicial?.street ?? '', city: inicial?.city ?? '',
      province: inicial?.province ?? '', postalCode: inicial?.postalCode ?? '', phone: inicial?.phone ?? '',
    },
  });

  const enviar = (d: Datos) => onGuardar({ ...d, label: d.label || undefined, phone: d.phone || undefined });

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="rounded-xl border border-[#B7D31A]/30 bg-field/40 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label htmlFor="dir-label" className={labelClass}>Nombre (opcional)</label>
        <input id="dir-label" {...register('label')} placeholder="Casa, Trabajo…" className={inputClass} />
        <MensajeError mensaje={errors.label?.message} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="dir-street" className={labelClass}>Calle y número *</label>
        <input id="dir-street" {...register('street')} autoComplete="street-address" className={inputClass} />
        <MensajeError mensaje={errors.street?.message} />
      </div>
      <div>
        <label htmlFor="dir-city" className={labelClass}>Ciudad o localidad *</label>
        <input id="dir-city" {...register('city')} autoComplete="address-level2" className={inputClass} />
        <MensajeError mensaje={errors.city?.message} />
      </div>
      <div>
        <label htmlFor="dir-postal" className={labelClass}>Código postal *</label>
        <input id="dir-postal" {...register('postalCode')} inputMode="numeric" autoComplete="postal-code" className={inputClass} />
        <MensajeError mensaje={errors.postalCode?.message} />
      </div>
      <div>
        <label htmlFor="dir-province" className={labelClass}>Provincia *</label>
        <select id="dir-province" {...register('province')} className={inputClass}>
          <option value="">Elegí la provincia</option>
          {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <MensajeError mensaje={errors.province?.message} />
      </div>
      <div>
        <label htmlFor="dir-phone" className={labelClass}>Teléfono (opcional)</label>
        <input id="dir-phone" {...register('phone')} type="tel" autoComplete="tel" className={inputClass} />
        <MensajeError mensaje={errors.phone?.message} />
      </div>
      <div className="sm:col-span-2 flex justify-end gap-2">
        <button type="button" onClick={onCancelar} className="px-4 py-2 rounded-lg border border-chip text-sm text-fg-soft hover:text-fg">Cancelar</button>
        <button type="submit" disabled={guardando} className="px-4 py-2 rounded-lg bg-[#B7D31A] text-[#050606] text-sm font-bold disabled:opacity-60">{guardando ? 'Guardando…' : 'Guardar dirección'}</button>
      </div>
    </form>
  );
}

import ImageUpload from '@/components/ui/ImageUpload';
import Toggle from '../../testimonios/components/Toggle';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1';

export default function HeroSection({ register, watch, setValue }: { register: any; watch: any; setValue: any }) {
  const active = watch('heroActive');
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">Hero Principal</h3>
        <div className="flex items-center gap-2">
          <Toggle checked={active} onChange={() => setValue('heroActive', !active, { shouldDirty: true })} />
          <span className="text-xs text-gray-500">{active ? 'Activo' : 'Inactivo'}</span>
        </div>
      </div>
      {active ? (
        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="lg:w-1/3 space-y-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Imagen de Fondo del Hero</h4>
              <ImageUpload value={watch('heroImage') || ''} onChange={(url: string) => setValue('heroImage', url, { shouldDirty: true })} placeholder="URL o subir imagen de fondo" width={300} height={150} />
            </div>
            <div className="hidden lg:block w-px bg-gray-200 self-stretch" />
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>Chip</label><input {...register('chip')} className={inputClass} /></div>
                <div><label className={labelClass}>Titulo</label><input {...register('title')} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>Descripcion</label><textarea {...register('description')} rows={4} className={inputClass} /></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-6"><p className="text-sm text-gray-400 italic">Seccion desactivada. Activala para editar su contenido.</p></div>
      )}
    </div>
  );
}

import Toggle from '../../testimonios/components/Toggle';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1';

export default function NewsletterSection({ register, active, onToggle }: { register: any; active: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">Seccion Newsletter</h3>
        <div className="flex items-center gap-2">
          <Toggle checked={active} onChange={onToggle} />
          <span className="text-xs text-gray-500">{active ? 'Activo' : 'Inactivo'}</span>
        </div>
      </div>
      {active ? (
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelClass}>Titulo</label><input {...register('newsletterTitle')} className={inputClass} /></div>
          <div><label className={labelClass}>Descripcion</label><input {...register('newsletterText')} className={inputClass} /></div>
        </div>
      ) : (
        <div className="p-4 sm:p-6"><p className="text-sm text-gray-400 italic">Seccion desactivada. Activala para editar su contenido.</p></div>
      )}
    </div>
  );
}

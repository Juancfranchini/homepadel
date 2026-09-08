import Toggle from '../../testimonios/components/Toggle';

export default function SimpleToggleSection({ title, description, active, onToggle }: {
  title: string; description: string; active: boolean; onToggle: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-4 sm:p-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Toggle checked={active} onChange={onToggle} />
          <span className="text-xs text-gray-500">{active ? 'Activo' : 'Inactivo'}</span>
        </div>
      </div>
    </div>
  );
}

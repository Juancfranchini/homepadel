import { Youtube, BarChart3, ListChecks, ArrowLeftRight, GitCompare, Save } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import VideoTab from './VideoTab';
import RendimientoTab from './RendimientoTab';
import HighlightsTab from './HighlightsTab';
import RelacionadosTab from './RelacionadosTab';
import ComparaTab from './ComparaTab';
import { Product, TabKey } from '../useProductosContenido';

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'video', label: 'Video', icon: Youtube },
  { key: 'rendimiento', label: 'Rendimiento', icon: BarChart3 },
  { key: 'highlights', label: 'Highlights', icon: ListChecks },
  { key: 'relacionados', label: 'Relacionados', icon: ArrowLeftRight },
  { key: 'compara', label: 'Compara', icon: GitCompare },
];

export default function ContentEditorModal({ isOpen, selected, products, activeTab, onTabChange, form, saving, onClose, onSubmit }: {
  isOpen: boolean; selected: Product | null; products: Product[]; activeTab: TabKey; onTabChange: (t: TabKey) => void;
  form: any; saving: boolean; onClose: () => void; onSubmit: (e?: React.BaseSyntheticEvent) => void;
}) {
  if (!isOpen || !selected) return null;
  const { register, control, setValue, watch } = form;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={'Contenido: ' + selected.name} size="xl">
      <div className="space-y-4">
        <div className="flex gap-1 overflow-x-auto border-b border-gray-100 pb-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} type="button" onClick={() => onTabChange(tab.key)}
                className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ' + (activeTab === tab.key ? 'bg-[#C8FF00]/10 border border-[#C8FF00]/30 text-[#C8FF00]' : 'text-gray-600 hover:bg-gray-50')}>
                <Icon size={14} />{tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {activeTab === 'video' && <VideoTab register={register} control={control} showVideo={watch('showVideo')} onToggleShowVideo={() => setValue('showVideo', !watch('showVideo'), { shouldDirty: true })} />}
          {activeTab === 'rendimiento' && <RendimientoTab register={register} control={control} watch={watch} showPerformance={watch('showPerformance')} onToggleShowPerformance={() => setValue('showPerformance', !watch('showPerformance'), { shouldDirty: true })} />}
          {activeTab === 'highlights' && <HighlightsTab register={register} control={control} showHighlights={watch('showHighlights')} onToggleShowHighlights={() => setValue('showHighlights', !watch('showHighlights'), { shouldDirty: true })} />}
          {activeTab === 'relacionados' && <RelacionadosTab products={products} selectedId={selected.id} register={register} setValue={setValue} control={control} showRelated={watch('showRelated')} onToggleShowRelated={() => setValue('showRelated', !watch('showRelated'), { shouldDirty: true })} />}
          {activeTab === 'compara' && (
            <ComparaTab
              value={watch('compareData') || { fields: [], products: [] }}
              onChange={(data) => setValue('compareData', data, { shouldDirty: true })}
              showCompare={watch('showCompare')}
              onToggleShowCompare={() => setValue('showCompare', !watch('showCompare'), { shouldDirty: true })}
            />
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50 flex items-center gap-2"><Save size={14} />{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

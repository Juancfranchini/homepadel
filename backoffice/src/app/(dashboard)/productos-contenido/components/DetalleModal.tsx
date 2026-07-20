import { Modal } from '@/components/ui/Modal';

interface Product {
  id: string; name: string; videoUrl?: string;
  highlightsTitle?: string; highlightsDescription?: string;
  highlights?: string[];
  performanceStats?: { label: string; value: number }[];
  specs?: { icon: string; title: string; value: string }[];
  relatedVideos?: { title: string; url: string }[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: Product | null;
}

export default function DetalleModal({ isOpen, onClose, item }: Props) {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={'Detalle: ' + item.name} size="lg">
      <div className="space-y-4 text-sm">
        <div><p className="text-xs text-gray-400">Video Principal</p><p className="text-gray-900">{item.videoUrl || '-'}</p></div>
        <div><p className="text-xs text-gray-400">Videos Relacionados ({(item.relatedVideos || []).length})</p>{(item.relatedVideos || []).map((v, i) => <p key={i} className="text-gray-600"> {v.title}</p>)}</div>
        <div><p className="text-xs text-gray-400">Titulo Highlights</p><p className="text-gray-900">{item.highlightsTitle || '-'}</p></div>
        <div><p className="text-xs text-gray-400">Descripcion Highlights</p><p className="text-gray-900">{item.highlightsDescription || '-'}</p></div>
        <div><p className="text-xs text-gray-400">Rendimiento</p>{(item.performanceStats || []).map((s, i) => <div key={i} className="flex gap-2 items-center"><span className="w-24">{s.label}</span><div className="flex-1 bg-gray-200 rounded-full h-3"><div className="bg-[#C8FF00] h-3 rounded-full" style={{width: s.value + '%'}} /></div><span className="text-xs">{s.value}%</span></div>)}</div>
        <div><p className="text-xs text-gray-400">Especificaciones</p>{(item.specs || []).map((s, i) => <p key={i} className="text-gray-600"> {s.title}: {s.value}</p>)}</div>
        <div><p className="text-xs text-gray-400">Highlights</p>{(item.highlights || []).map((h, i) => <p key={i} className="text-gray-600"> {h}</p>)}</div>
      </div>
    </Modal>
  );
}

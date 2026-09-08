import { Video } from 'lucide-react';
import { SectionCard, Label } from './shared';

export default function VideoSection({ register, watch }: { register: any; watch: any }) {
  return (
    <SectionCard icon={<Video className="w-4 h-4" />} title="Video del producto">
      <div>
        <Label>URL de YouTube o Vimeo</Label>
        <input {...register('videoUrl')} className="input-field" placeholder="https://youtube.com/watch?v=..." />
        <p className="text-xs text-gray-400 mt-1">Si tiene video se muestra en el detalle del producto. Dejar vacío para ocultar.</p>
      </div>
      {watch('videoUrl') && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 flex items-center gap-2">
          <Video className="w-4 h-4 text-gray-400" />
          Video configurado: {watch('videoUrl')}
        </div>
      )}
    </SectionCard>
  );
}

import { Modal } from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import Toggle from '../../testimonios/components/Toggle';
import { Banner } from '../useBanners';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider';

export default function BannerFormModal({ isOpen, editItem, isMobile, imageDesktop, imageMobile, isActive, register, errors, setValue, saving, onClose, onSubmit }: {
  isOpen: boolean; editItem: Banner | null; isMobile: boolean; imageDesktop: string; imageMobile: string; isActive: boolean;
  register: any; errors: any; setValue: any; saving: boolean; onClose: () => void; onSubmit: (e?: React.BaseSyntheticEvent) => void;
}) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editItem ? 'Editar banner' : 'Nuevo banner'} size="xl">
      <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-4 md:gap-0">
        <div className="md:flex-shrink-0 flex flex-col gap-4 md:pr-4" style={{ width: isMobile ? '100%' : 200 }}>
          <div>
            <p className={labelClass + ' mb-2'}>Desktop</p>
            <ImageUpload value={imageDesktop} onChange={(url) => setValue('image', url, { shouldDirty: true })} placeholder="URL desktop" width={isMobile ? 140 : 200} height={100} suggestion="Medida recomendada: 1200x400px (ratio 3:1). Peso maximo: 300KB" />
          </div>
          <div>
            <p className={labelClass + ' mb-2'}>Mobile</p>
            <ImageUpload value={imageMobile} onChange={(url) => setValue('imageMobile', url, { shouldDirty: true })} placeholder="URL mobile" width={isMobile ? 140 : 200} height={100} suggestion="Medida recomendada: 768x500px. Peso maximo: 200KB" />
          </div>
        </div>

        <div className="hidden md:block mx-6 w-px bg-gray-200 self-stretch my-2" />

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
          <div>
            <label className={labelClass}>Titulo *</label>
            <input {...register('title')} className={inputClass + ' mt-1'} placeholder="Ej: Promo de verano" />
            {errors.title && <p className="text-xs text-red-600 mt-0.5">{errors.title.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Subtitulo</label>
            <input {...register('subtitle')} className={inputClass + ' mt-1'} placeholder="Ej: Zapatillas premium" />
          </div>
          <div>
            <label className={labelClass}>Texto del boton</label>
            <input {...register('ctaText')} className={inputClass + ' mt-1'} placeholder="VER OFERTA" />
          </div>
          <div>
            <label className={labelClass}>Orden</label>
            <input type="number" min={0} {...register('order')} className={inputClass + ' mt-1'} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Link de destino</label>
            <input {...register('link')} className={inputClass + ' mt-1'} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <div className="flex items-center gap-2 mt-1">
              <Toggle checked={isActive} onChange={() => setValue('isActive', !isActive, { shouldDirty: true })} />
              <span className={'text-xs font-medium ' + (isActive ? 'text-green-600' : 'text-gray-400')}>{isActive ? 'Activo' : 'Inactivo'}</span>
            </div>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">{saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

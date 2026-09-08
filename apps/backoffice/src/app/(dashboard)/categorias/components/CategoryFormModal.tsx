import { Upload, ImageIcon } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { getImageUrl } from '@/components/ui/ImageUpload';
import Toggle from '../../testimonios/components/Toggle';
import { Category } from '../useCategorias';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider';

export default function CategoryFormModal({ isOpen, editItem, imageUrl, isActive, uploading, register, errors, setValue, saving, onClose, onUpload, onSubmit }: {
  isOpen: boolean; editItem: Category | null; imageUrl?: string; isActive: boolean; uploading: boolean;
  register: any; errors: any; setValue: any; saving: boolean; onClose: () => void; onUpload: () => void; onSubmit: (e?: React.BaseSyntheticEvent) => void;
}) {
  if (!isOpen) return null;
  const previewUrl = getImageUrl(imageUrl);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editItem ? 'Editar categoria' : 'Nueva categoria'} size="xl">
      <form onSubmit={onSubmit} className="flex flex-col h-full">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
          <div className="w-full md:w-[200px] flex-shrink-0 flex flex-col gap-3">
            <div className="w-full h-[180px] md:h-[200px] rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-300" />
              )}
            </div>
            <div className="flex gap-2 w-full">
              <input
                {...register('image')}
                className="flex-1 min-w-0 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
                placeholder="URL de imagen"
              />
              <button type="button" onClick={onUpload} disabled={uploading}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50 shrink-0">
                <Upload className="w-3 h-3" />{uploading ? '...' : 'Subir'}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 leading-tight mt-1">Medida recomendada: 400x400px (cuadrada). Fondo transparente o blanco. Peso maximo: 300KB</p>
          </div>

          <div className="hidden md:block w-px bg-gray-200 self-stretch" />

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
            <div>
              <label className={labelClass}>Nombre *</label>
              <input {...register('name')} className={inputClass + ' mt-1'} placeholder="Ej: Palas" />
              {errors.name && <p className="text-xs text-red-600 mt-0.5">{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Orden</label>
              <input type="number" min={0} {...register('order')} className={inputClass + ' mt-1'} />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <div className="flex items-center gap-2 mt-1">
                <Toggle checked={isActive} onChange={() => setValue('isActive', !isActive, { shouldDirty: true })} />
                <span className={'text-xs font-medium ' + (isActive ? 'text-green-600' : 'text-gray-400')}>{isActive ? 'Activo' : 'Inactivo'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
            {saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

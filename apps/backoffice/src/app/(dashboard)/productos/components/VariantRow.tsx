import { Plus, Trash2, Upload } from 'lucide-react';
import { VariantData } from './VariantEditor';
import { VariantSizeColor, VariantDimensions, VariantWeight, VariantStockSku } from './VariantRowFields';
import VariantImagesList from './VariantImagesList';

interface Props {
  v: VariantData;
  index: number;
  inputClass: string;
  hasSize: boolean;
  hasColor: boolean;
  hasDimensions: boolean;
  hasWeight: boolean;
  uploadingIndex: number | null;
  onUpdate: (index: number, field: keyof VariantData, value: any) => void;
  onRemove: (index: number) => void;
  onAddImage: (index: number) => void;
  onRemoveImage: (variantIndex: number, imageIndex: number) => void;
  onUpdateImage: (variantIndex: number, imageIndex: number, value: string) => void;
  onUpload: (variantIndex: number, field: 'imageUrl' | 'images', imageIndex?: number) => void;
}

export default function VariantRow({ v, index, inputClass, hasSize, hasColor, hasDimensions, hasWeight, uploadingIndex, onUpdate, onRemove, onAddImage, onRemoveImage, onUpdateImage, onUpload }: Props) {
  const update = (field: keyof VariantData, value: any) => onUpdate(index, field, value);

  return (
    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
      <div className="flex items-center justify-end gap-2 mb-2">
        {(v.images || []).length < 5 && (
          <button type="button" onClick={() => onAddImage(index)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 transition-colors" title="Agregar imagen secundaria">
            <Plus className="w-3 h-3" />IMG
          </button>
        )}
        <button type="button" onClick={() => onRemove(index)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-red-500 hover:bg-red-50 transition-colors" title="Eliminar variante">
          <Trash2 className="w-3.5 h-3.5" />DEL
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-1/4 flex-shrink-0 flex flex-col justify-end">
          <label className="text-[10px] text-gray-400 uppercase">Imagen principal</label>
          <div className="w-full h-36 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            {v.imageUrl ? <img src={v.imageUrl} alt="Imagen variante" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-300">Sin imagen</span>}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1.5">
          <VariantSizeColor v={v} inputClass={inputClass} hasSize={hasSize} hasColor={hasColor} onUpdate={update} />
          {hasDimensions && <VariantDimensions v={v} inputClass={inputClass} onUpdate={update} />}
          {hasWeight && <VariantWeight v={v} inputClass={inputClass} onUpdate={update} />}
          <VariantStockSku v={v} inputClass={inputClass} onUpdate={update} />

          <div className="flex gap-1.5">
            <input type="text" value={v.imageUrl || ''} onChange={(e) => update('imageUrl', e.target.value)} className={inputClass + ' flex-1 min-w-0'} placeholder="URL imagen principal" />
            <button type="button" onClick={() => onUpload(index, 'imageUrl')} disabled={uploadingIndex === index}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              {uploadingIndex === index ? '...' : <><Upload className="w-3 h-3" />SUBIR</>}
            </button>
          </div>
        </div>
      </div>

      <VariantImagesList
        images={v.images || []}
        inputClass={inputClass}
        uploading={uploadingIndex === index}
        onUpdate={(imgIdx, value) => onUpdateImage(index, imgIdx, value)}
        onUpload={(imgIdx) => onUpload(index, 'images', imgIdx)}
        onRemove={(imgIdx) => onRemoveImage(index, imgIdx)}
      />
    </div>
  );
}

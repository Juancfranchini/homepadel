'use client';

import { Plus, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';

export interface VariantData {
  sku: string;
  size: string;
  color?: string;
  imageUrl?: string;
  images?: string[];
  stock: number;
}

interface Props {
  variants: VariantData[];
  onChange: (variants: VariantData[]) => void;
  inputClass: string;
}

export default function VariantEditor({ variants, onChange, inputClass }: Props) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const addVariant = () => {
    onChange([...variants, { sku: '', size: '', color: '', imageUrl: '', images: [], stock: 0 }]);
  };

  const updateVariant = (index: number, field: keyof VariantData, value: any) => {
    const newVariants = [...variants];
    (newVariants[index] as any)[field] = value;
    onChange(newVariants);
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const addImage = (index: number) => {
    const newVariants = [...variants];
    newVariants[index].images = [...(newVariants[index].images || []), ''];
    onChange(newVariants);
  };

  const removeImage = (variantIndex: number, imageIndex: number) => {
    const newVariants = [...variants];
    newVariants[variantIndex].images = (newVariants[variantIndex].images || []).filter((_, i) => i !== imageIndex);
    onChange(newVariants);
  };

  const updateImage = (variantIndex: number, imageIndex: number, value: string) => {
    const newVariants = [...variants];
    const imgs = [...(newVariants[variantIndex].images || [])];
    imgs[imageIndex] = value;
    newVariants[variantIndex].images = imgs;
    onChange(newVariants);
  };

  const handleUpload = async (variantIndex: number, field: 'imageUrl' | 'images', imageIndex?: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploadingIndex(variantIndex);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/uploads/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const url = res.data?.url || res.data?.imageUrl || '';
        if (field === 'imageUrl') {
          updateVariant(variantIndex, 'imageUrl', url);
        } else if (imageIndex !== undefined) {
          updateImage(variantIndex, imageIndex, url);
        }
      } catch {
        alert('Error al subir la imagen');
      } finally {
        setUploadingIndex(null);
      }
    };
    input.click();
  };

  return (
    <div className="sm:col-span-2 border-t border-gray-100 pt-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Variantes (talles/colores)</label>
        <button
          type="button"
          onClick={addVariant}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#C8FF00] text-[#0f172a] hover:bg-[#b8ef00] transition-colors"
        >
          <Plus className="w-3 h-3" />Agregar variante
        </button>
      </div>

      {variants.length === 0 ? (
        <p className="text-xs text-gray-400">Sin variantes. Agrega talles o colores si este producto los necesita.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {variants.map((v, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
              <div className="flex items-center justify-end gap-2 mb-2">
                {(v.images || []).length < 5 && (
                  <button
                    type="button"
                    onClick={() => addImage(i)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 transition-colors"
                    title="Agregar imagen secundaria"
                  >
                    <Plus className="w-3 h-3" />IMG
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-red-500 hover:bg-red-50 transition-colors"
                  title="Eliminar variante"
                >
                  <Trash2 className="w-3.5 h-3.5" />DEL
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-1/4 flex-shrink-0 flex flex-col justify-end">
                  <label className="text-[10px] text-gray-400 uppercase">Imagen principal</label>
                  <div className="w-full h-36 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {v.imageUrl ? (
                      <img src={v.imageUrl} alt="Imagen variante" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-300">Sin imagen</span>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="flex flex-col justify-end">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-gray-400 uppercase">Talle *</label>
                        {!v.size && <span className="text-[10px] text-red-500">Requerido</span>}
                      </div>
                      <input
                        type="text"
                        value={v.size}
                        onChange={(e) => updateVariant(i, 'size', e.target.value)}
                        className={inputClass + ' !py-1.5'}
                        placeholder="S, M, L, XL"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <label className="text-[10px] text-gray-400 uppercase">Color</label>
                      <input
                        type="text"
                        value={v.color || ''}
                        onChange={(e) => updateVariant(i, 'color', e.target.value)}
                        className={inputClass + ' !py-1.5'}
                        placeholder="Negro, Blanco"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="flex flex-col justify-end">
                      <label className="text-[10px] text-gray-400 uppercase">Stock</label>
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => updateVariant(i, 'stock', Number(e.target.value))}
                        className={inputClass + ' !py-1.5'}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-gray-400 uppercase">SKU *</label>
                        {!v.sku && <span className="text-[10px] text-red-500">Requerido</span>}
                      </div>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                        className={inputClass + ' !py-1.5'}
                        placeholder="SKU-001"
                      />
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={v.imageUrl || ''}
                      onChange={(e) => updateVariant(i, 'imageUrl', e.target.value)}
                      className={inputClass + ' flex-1 min-w-0'}
                      placeholder="URL imagen principal"
                    />
                    <button 
                      type="button" 
                      onClick={() => handleUpload(i, 'imageUrl')} 
                      disabled={uploadingIndex === i}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {uploadingIndex === i ? '...' : <><Upload className="w-3 h-3" />SUBIR</>}
                    </button>
                  </div>
                </div>
              </div>

              {(v.images || []).length > 0 && (
                <div className="flex flex-col gap-1.5 mt-3">
                  {(v.images || []).map((img: string, imgIdx: number) => (
                    <div key={imgIdx} className="flex items-center gap-1.5 w-full">
                      <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {img ? (
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[8px] text-gray-300">IMG</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => updateImage(i, imgIdx, e.target.value)}
                        className={inputClass + ' flex-1 min-w-0'}
                        placeholder={'Imagen secundaria ' + (imgIdx + 1)}
                      />
                      <button
                        type="button"
                        onClick={() => handleUpload(i, 'images', imgIdx)}
                        disabled={uploadingIndex === i}
                        className="flex items-center gap-1 px-1.5 py-1 rounded-lg text-[10px] font-medium border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
                      >
                        {uploadingIndex === i ? '...' : <Upload className="w-3 h-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(i, imgIdx)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

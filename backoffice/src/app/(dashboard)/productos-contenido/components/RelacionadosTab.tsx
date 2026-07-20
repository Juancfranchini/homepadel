import { UseFormRegister, UseFormSetValue, useWatch } from 'react-hook-form';
import { ImageIcon } from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  return API_BASE + (path.startsWith('/') ? '' : '/') + path;
}

interface Product {
  id: string; name: string; images: string[];
}

interface Props {
  products: Product[];
  selectedId: string;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  control: any;
}

export default function RelacionadosTab({ products, selectedId, setValue, control }: Props) {
  const relatedIds: string[] = useWatch({ control, name: 'relatedProductIds' }) || [];

  const toggleProduct = (id: string) => {
    const current = relatedIds || [];
    if (current.includes(id)) {
      setValue('relatedProductIds', current.filter((x) => x !== id), { shouldDirty: true });
    } else {
      setValue('relatedProductIds', [...current, id], { shouldDirty: true });
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">Selecciona productos para mostrar como relacionados al final de la pagina.</p>
      <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
        {products.filter((p) => p.id !== selectedId).map((p) => {
          const isChecked = relatedIds.includes(p.id);
          const imgSrc = getImageUrl(p.images?.[0]);
          return (
            <label key={p.id} className={'flex items-center gap-3 p-2 rounded-lg border cursor-pointer text-sm transition-all ' + (isChecked ? 'border-[#C8FF00] bg-[#C8FF00]/5' : 'border-gray-200 hover:bg-gray-50')}>
              <input type="checkbox" checked={isChecked} onChange={() => toggleProduct(p.id)} className="sr-only" />
              {imgSrc ? <img src={imgSrc} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" /> 
                : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"><ImageIcon className="w-4 h-4 text-gray-400" /></div>}
              <span className="truncate">{p.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

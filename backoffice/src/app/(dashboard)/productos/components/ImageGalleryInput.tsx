'use client';

import { Upload } from 'lucide-react';
import api from '@/lib/api';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  return API_BASE + (path.startsWith('/') ? '' : '/') + path;
}

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageGalleryInput({ images, onChange }: Props) {
  const slots = Array.from({ length: 5 }, (_, i) => images[i] || '');

  const handleUpload = async (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/uploads/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const url = res.data?.url || '';
        const newImages = [...slots];
        newImages[index] = url;
        onChange(newImages.filter(Boolean));
      } catch {}
    };
    input.click();
  };

  return (
    <div className="space-y-1.5 mt-2">
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Imagenes adicionales (hasta 5)</p>
      {slots.map((url, i) => {
        const preview = getImageUrl(url);
        return (
          <div key={i} className="flex gap-1.5 items-center">
            <div className="w-6 h-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {preview ? (
                <img src={preview} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <span className="text-[8px] text-gray-300">{i + 1}</span>
              )}
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => { const newImages = [...slots]; newImages[i] = e.target.value; onChange(newImages.filter(Boolean)); }}
              placeholder={'URL ' + (i + 1)}
              className="w-[122px] px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
            />
            <button
              type="button"
              onClick={() => handleUpload(i)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50"
            >
              <Upload className="w-3 h-3" />Subir
            </button>
          </div>
        );
      })}
    </div>
  );
}

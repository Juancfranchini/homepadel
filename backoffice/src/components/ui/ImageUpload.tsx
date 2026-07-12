'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, ImageIcon, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

export function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  return API_BASE + (path.startsWith('/') ? '' : '/') + path;
}

interface Props {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  width?: number;
  height?: number;
}

export default function ImageUpload({ value, onChange, placeholder = 'URL de imagen', width = 200, height = 200 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const previewUrl = getImageUrl(value);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.url || res.data?.imageUrl || '';
      onChange(url);
    } catch {
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadFile(file);
    }
  }, [uploadFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="flex-shrink-0 flex flex-col gap-3" style={{ width }}>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={'relative rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-all ' +
          (dragOver
            ? 'border-[#C8FF00] bg-[#C8FF00]/10'
            : previewUrl
              ? 'border-gray-200 bg-gray-100'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100')}
        style={{ width, height }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#C8FF00]" />
            <span className="text-xs">Subiendo...</span>
          </div>
        ) : previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain p-2"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-3 h-3" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <ImageIcon className="w-10 h-10" />
            <span className="text-xs text-center px-2">Arrastra una imagen<br />o haz clic aqui</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          <Upload className="w-3 h-3" />{uploading ? '...' : 'Subir'}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

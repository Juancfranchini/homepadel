'use client';

import { useRef, useState } from 'react';
import { Store, Image, MapPin, Check, Upload } from 'lucide-react';
import api from '@/lib/api';

const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00] text-gray-900';

const LOGO_MAP = [
  { key: 'logoUrl', label: 'Logo del sitio (Header)', desc: 'Se muestra arriba a la izquierda en todas las páginas', position: 'Header - Escritorio y tablet', size: 'Recomendado: 200x60px' },
  { key: 'logoFooter', label: 'Logo del pie de página (Footer)', desc: 'Se muestra abajo en todas las páginas', position: 'Footer - Parte inferior del sitio', size: 'Recomendado: 160x50px' },
  { key: 'logoMobile', label: 'Logo para celulares', desc: 'Versión reducida para pantallas chicas', position: 'Header - Pantallas menores a 768px', size: 'Recomendado: 120x40px' },
  { key: 'isotipo', label: 'Icono de pestaña (Favicon)', desc: 'Se muestra en la pestaña del navegador', position: 'Pestaña del navegador y marcadores', size: 'Recomendado: 32x32px o 64x64px' },
  { key: 'logoLogin', label: 'Logo del formulario (Login)', desc: 'Se muestra en el formulario de login y registro', position: 'Formulario - Login/Registro', size: 'Recomendado: 200x60px' },
];

const API_BASE = 'http://localhost:4000';

function getFullUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return API_BASE + path;
}

interface GeneralTabProps {
  generalForm: any;
  onSave: (data: any) => void;
  saving: boolean;
}

export default function GeneralTab({ generalForm, onSave, saving }: GeneralTabProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadedKeys, setUploadedKeys] = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState('');

  const handleUpload = async (key: string) => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(key);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.url || res.data?.imageUrl || '';
      generalForm.setValue(key as any, url, { shouldDirty: true });
      setUploadedKeys(prev => ({ ...prev, [key]: true }));
    } catch {
      console.error('Error al subir imagen');
    } finally {
      setUploading(null);
      setUploadTarget('');
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const triggerUpload = (key: string) => {
    setUploadTarget(key);
    fileRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2"><Store className="w-4 h-4 text-gray-500" />Información de la tienda</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de la tienda *</label>
            <input {...generalForm.register('storeName')} className={inputClass} />
            {generalForm.formState.errors.storeName && <p className="text-xs text-red-600 mt-1">{generalForm.formState.errors.storeName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email de contacto *</label>
            <input type="email" {...generalForm.register('contactEmail')} className={inputClass} />
            {generalForm.formState.errors.contactEmail && <p className="text-xs text-red-600 mt-1">{generalForm.formState.errors.contactEmail.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
            <input {...generalForm.register('phone')} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp</label>
            <input {...generalForm.register('whatsapp')} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirección</label>
            <input {...generalForm.register('address')} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2"><Image className="w-4 h-4 text-gray-500" />Identidad de Marca</h2>
        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={() => { if (uploadTarget) handleUpload(uploadTarget); }} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {LOGO_MAP.map((logo) => {
            const value = generalForm.watch(logo.key as any) as string;
            const isUploading = uploading === logo.key;
            const isUploaded = uploadedKeys[logo.key];
            const fullUrl = getFullUrl(value);
            return (
              <div key={logo.key} className="border border-gray-100 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{logo.label}</label>
                <div className="flex gap-2">
                  <input {...generalForm.register(logo.key as any)} className={inputClass} placeholder="https://... (URL externa)" />
                  <button
                    type="button"
                    onClick={() => triggerUpload(logo.key)}
                    disabled={isUploading}
                    className={'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ' +
                      (isUploaded
                        ? 'bg-[#C8FF00] text-[#0f172a] hover:bg-[#b8ef00] border border-[#C8FF00]'
                        : 'border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50')
                    }
                  >
                    {isUploading ? '...' : isUploaded ? <><Check className="w-4 h-4" />Subido</> : <><Upload className="w-4 h-4" />Subir</>}
                  </button>
                </div>
                <div className="flex items-start justify-between mt-2">
                  <div>
                    <p className="text-xs text-gray-400">{logo.desc}</p>
                    <p className="text-xs text-[#C8FF00] flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{logo.position}</p>
                    <p className="text-xs text-gray-400 mt-1">{logo.size}</p>
                  </div>
                  {fullUrl && (
                    <div className="p-2 bg-gray-900 rounded-lg flex-shrink-0">
                      <img src={fullUrl} alt={logo.label} className="h-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={generalForm.handleSubmit(onSave)} disabled={!generalForm.formState.isDirty || saving}
          className={'flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all ' + (generalForm.formState.isDirty ? 'bg-[#C8FF00] text-[#0f172a] hover:bg-[#b8ef00]' : 'bg-gray-200 text-gray-400 cursor-not-allowed')}>
          <Store className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}
'use client';

import { Save, ArrowLeft, ExternalLink, Plus, Trash2, CheckCircle, XCircle, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useInstagramConfig } from './useInstagramConfig';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

function GeneralDataSection({ register }: { register: any }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">Datos generales</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Título *</label><input {...register('title')} className={inputClass} placeholder="No te pierdas ninguna publicacion" /></div>
        <div><label className={labelClass}>Usuario *</label><input {...register('username')} className={inputClass} placeholder="@home.padel" /></div>
        <div><label className={labelClass}>Texto del botón *</label><input {...register('buttonText')} className={inputClass} placeholder="Seguinos en Instagram" /></div>
        <div><label className={labelClass}>URL del perfil *</label><input {...register('buttonUrl')} className={inputClass} placeholder="https://instagram.com/home.padel" /></div>
      </div>
    </div>
  );
}

function MetaApiSection({ register, testing, testResult, onTest }: { register: any; testing: boolean; testResult: boolean | null; onTest: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
        <h2 className="text-sm font-semibold text-gray-800">Conexion API de Meta</h2>
        <button type="button" onClick={onTest} disabled={testing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50 self-start sm:self-auto">
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : testResult === true ? <CheckCircle className="w-4 h-4 text-green-500" /> : testResult === false ? <XCircle className="w-4 h-4 text-red-500" /> : null}
          {testing ? 'Probando...' : 'Probar conexion'}
        </button>
      </div>
      <p className="text-xs text-gray-400">Necesitas crear una App en Meta for Developers y activar oEmbed Read. Si la API no funciona, las imagenes subidas manualmente se usaran en el frontend.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Meta App ID</label><input {...register('appId')} className={inputClass} placeholder="123456789" /></div>
        <div><label className={labelClass}>Meta App Secret</label><input {...register('appSecret')} type="password" className={inputClass} placeholder="abc123..." /></div>
      </div>
      {testResult === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
          La API de Meta no esta funcionando. Las miniaturas subidas manualmente se usaran en el frontend. Si no hay miniatura, se mostrara un card degradado.
        </div>
      )}
    </div>
  );
}

function PostUrlRow({ index, register, total, uploadingIndex, onUploadClick, onRemove }: {
  index: number; register: any; total: number; uploadingIndex: number | null; onUploadClick: () => void; onRemove: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-start">
      <div className="flex-1 space-y-2">
        <input {...register(('manualUrls.' + index + '.url') as any)} className={inputClass} placeholder={'Post #' + (index + 1) + ' - https://www.instagram.com/p/...'} />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onUploadClick} disabled={uploadingIndex !== null}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap">
          <Upload className="w-3 h-3" />{uploadingIndex === index ? 'Subiendo...' : 'Subir imagen'}
        </button>
        {total > 1 && (
          <button type="button" onClick={onRemove} className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function PostUrlsSection({ register, fields, uploadingIndex, fileRef, onAppend, onUploadClick, onRemove, onFileChange }: {
  register: any; fields: { id: string }[]; uploadingIndex: number | null; fileRef: React.RefObject<HTMLInputElement | null>;
  onAppend: () => void; onUploadClick: (i: number) => void; onRemove: (i: number) => void; onFileChange: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
        <h2 className="text-sm font-semibold text-gray-800">URLs de posts ({fields.length})</h2>
        <button type="button" onClick={onAppend}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#C8FF00] text-[#0f172a] hover:bg-[#b8ef00] transition-colors self-start sm:self-auto">
          <Plus className="w-3 h-3" />Agregar
        </button>
      </div>
      <p className="text-xs text-gray-400">Pega las URLs de Instagram. Si la API no funciona, subi una imagen miniatura para que se muestre en el frontend. Sin imagen, se mostrara un card degradado.</p>
      <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={onFileChange} />
      <div className="space-y-3">
        {fields.map((field, index) => (
          <PostUrlRow key={field.id} index={index} register={register} total={fields.length} uploadingIndex={uploadingIndex}
            onUploadClick={() => onUploadClick(index)} onRemove={() => onRemove(index)} />
        ))}
      </div>
    </div>
  );
}

export default function InstagramConfigPage() {
  const {
    form, loading, saving, testing, testResult, uploadingIndex, setUploadingIndex, fileRef,
    fields, append, remove, handleUploadThumbnail, onSubmit, handleTestConnection,
  } = useInstagramConfig();
  const { register, handleSubmit, watch } = form;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/configuracion" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Instagram</h1>
            <p className="text-gray-500 text-sm mt-0.5">Configuración de la sección Instagram del inicio</p>
          </div>
        </div>
      </div>

      <div className="bg-[#0f172a] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[#C8FF00] text-xs font-bold uppercase tracking-widest mb-1">Vista previa</p>
          <p className="text-white font-black text-lg">{watch('title') || 'No te pierdas ninguna publicacion'}</p>
        </div>
        <a href={watch('buttonUrl')} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#C8FF00] text-[#0f172a] px-4 py-2 rounded-full font-bold text-sm self-start sm:self-auto">
          {watch('username') || '@home.padel'}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <GeneralDataSection register={register} />
        <MetaApiSection register={register} testing={testing} testResult={testResult} onTest={handleTestConnection} />

        <PostUrlsSection
          register={register}
          fields={fields}
          uploadingIndex={uploadingIndex}
          fileRef={fileRef}
          onAppend={() => append({ url: '', thumbnail: '' })}
          onUploadClick={(i) => { setUploadingIndex(i); fileRef.current?.click(); }}
          onRemove={(i) => remove(i)}
          onFileChange={() => { if (uploadingIndex !== null) handleUploadThumbnail(uploadingIndex); }}
        />

        <div className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="igActive" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
            <label htmlFor="igActive" className="text-sm text-gray-700 font-medium">Sección activa (visible en el inicio)</label>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
              <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

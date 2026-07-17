'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Store, Shield, Bell, Save, Eye, EyeOff, Upload, Image, MapPin, Check } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const generalSchema = z.object({
  storeName: z.string().min(2, 'El nombre de la tienda es requerido'),
  logoUrl: z.string().optional().or(z.literal('')),
  logoFooter: z.string().optional().or(z.literal('')),
  isotipo: z.string().optional().or(z.literal('')),
  logoMobile: z.string().optional().or(z.literal('')),
  contactEmail: z.string().email('Email invalido'),
  phone: z.string().optional(),
  address: z.string().optional(),
  whatsapp: z.string().optional(),
});
type GeneralForm = z.infer<typeof generalSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Las contraseÃ±as no coinciden', path: ['confirmPassword'] });
type PasswordForm = z.infer<typeof passwordSchema>;

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00] text-gray-900";

type Tab = 'general' | 'seguridad' | 'notificaciones';
const TABS = [
  { id: 'general' as Tab, label: 'General', icon: Store },
  { id: 'seguridad' as Tab, label: 'Seguridad', icon: Shield },
  { id: 'notificaciones' as Tab, label: 'Notificaciones', icon: Bell },
];

const LOGO_MAP = [
  { key: 'logoUrl', label: 'Logo del sitio (Header)', desc: 'Se muestra arriba a la izquierda en todas las paginas', position: 'Header - Escritorio y tablet' },
  { key: 'logoFooter', label: 'Logo del pie de pagina (Footer)', desc: 'Se muestra abajo en todas las paginas', position: 'Footer - Parte inferior del sitio' },
  { key: 'logoMobile', label: 'Logo para celulares', desc: 'Version reducida para pantallas chicas', position: 'Header - Pantallas menores a 768px' },
  { key: 'isotipo', label: 'Icono de pestaÃ±a (Favicon)', desc: 'Se muestra en la pestaÃ±a del navegador', position: 'PestaÃ±a del navegador y marcadores' },
];

const API_BASE = 'http://localhost:4000';

function getFullUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return API_BASE + path;
}

export default function ConfiguracionPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadedKeys, setUploadedKeys] = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState('');

  const [notifs, setNotifs] = useState({
    newOrder: true, lowStock: true, newCustomer: false,
    dailyReport: true, weeklyReport: false, promotionExpiry: true,
  });

  const generalForm = useForm<GeneralForm>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      storeName: 'Home Padel', contactEmail: 'hola@homepadel.com',
      phone: '', address: '', whatsapp: '',
    },
  });

  useEffect(() => {
    Promise.all([
      api.get('/site-sections/settings'),
      api.get('/site-sections/branding'),
    ]).then(([settingsRes, brandingRes]) => {
      const s = settingsRes.data?.data || settingsRes.data || {};
      const b = brandingRes.data?.data || brandingRes.data || {};
      generalForm.reset({
        storeName: s.storeName || 'Home Padel',
        contactEmail: s.contactEmail || 'hola@homepadel.com',
        phone: s.phone || '',
        address: s.address || '',
        whatsapp: s.whatsapp || '',
        logoUrl: b.logoHeader || '',
        logoFooter: b.logoFooter || '',
        isotipo: b.isotipo || '',
        logoMobile: b.logoMobile || '',
      });
    }).catch(() => {});
  }, []);

  const { isDirty } = generalForm.formState;

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
      toast('Error al subir la imagen', 'error');
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

  const onSave = async (data: GeneralForm) => {
    setSaving(true);
    try {
      await Promise.all([
        api.put('/site-sections/settings', { data: { storeName: data.storeName, contactEmail: data.contactEmail, phone: data.phone, address: data.address, whatsapp: data.whatsapp } }),
        api.put('/site-sections/branding', { data: { logoHeader: data.logoUrl, logoFooter: data.logoFooter, isotipo: data.isotipo, logoMobile: data.logoMobile } }),
      ]);
      toast('Configuracion guardada', 'success');
      generalForm.reset(data);
      setUploadedKeys({});
    } catch {
      toast('Error al guardar', 'error');
    } finally { setSaving(false); }
  };

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });
  const onChangePassword = async (data: PasswordForm) => {
    setSavingPassword(true);
    try {
      await api.post('/auth/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast('ContraseÃ±a actualizada', 'success');
      passwordForm.reset();
    } catch { toast('Error', 'error'); } finally { setSavingPassword(false); }
  };

  const onSaveNotifs = async () => {
    try { await api.put('/settings/notifications', notifs); toast('Notificaciones guardadas', 'success'); }
    catch { toast('Error', 'error'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuracion</h1>
        <p className="text-gray-500 text-sm mt-0.5">Administra las preferencias del BackOffice</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-1 flex gap-1 shadow-sm w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ' + (activeTab === tab.id ? 'bg-[#0f172a] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100')}>
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2"><Store className="w-4 h-4 text-gray-500" />Informacion de la tienda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Nombre de la tienda *" error={generalForm.formState.errors.storeName?.message}>
                <input {...generalForm.register('storeName')} className={inputClass} />
              </FormField>
              <FormField label="Email de contacto *" error={generalForm.formState.errors.contactEmail?.message}>
                <input type="email" {...generalForm.register('contactEmail')} className={inputClass} />
              </FormField>
              <FormField label="Telefono">
                <input {...generalForm.register('phone')} className={inputClass} />
              </FormField>
              <FormField label="WhatsApp">
                <input {...generalForm.register('whatsapp')} className={inputClass} />
              </FormField>
              <FormField label="Direccion">
                <input {...generalForm.register('address')} className={inputClass} />
              </FormField>
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
                    <FormField label={logo.label}>
                      <div className="flex gap-2">
                        <input {...generalForm.register(logo.key as any)} className={inputClass} placeholder="https://... (URL externa)" />
                        <button
                          type="button"
                          onClick={() => triggerUpload(logo.key)}
                          disabled={isUploading}
                          className={'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ' +
                            (isUploaded
                              ? 'bg-[#C8FF00] text-[#0f172a] border border-[#C8FF00]'
                              : 'border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50')
                          }
                        >
                          {isUploading ? '...' : isUploaded ? <><Check className="w-4 h-4" />Subido</> : <><Upload className="w-4 h-4" />Subir</>}
                        </button>
                      </div>
                    </FormField>
                    <div className="flex items-start justify-between mt-2">
                      <div>
                        <p className="text-xs text-gray-400">{logo.desc}</p>
                        <p className="text-xs text-[#C8FF00] flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{logo.position}</p>
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
            <button onClick={generalForm.handleSubmit(onSave)} disabled={!isDirty || saving}
              className={'flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all ' + (isDirty ? 'bg-[#C8FF00] text-[#0f172a] hover:bg-[#b8ef00]' : 'bg-gray-200 text-gray-400 cursor-not-allowed')}>
              <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'seguridad' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-md">
          <h2 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2"><Shield className="w-4 h-4 text-gray-500" />Cambiar contraseÃ±a</h2>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <FormField label="ContraseÃ±a actual *" error={passwordForm.formState.errors.currentPassword?.message}>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} {...passwordForm.register('currentPassword')} className={inputClass + ' pr-10'} />
                <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>
            <FormField label="Nueva contraseÃ±a *" error={passwordForm.formState.errors.newPassword?.message}>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} {...passwordForm.register('newPassword')} className={inputClass + ' pr-10'} placeholder="Minimo 8 caracteres" />
                <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>
            <FormField label="Confirmar contraseÃ±a *" error={passwordForm.formState.errors.confirmPassword?.message}>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} {...passwordForm.register('confirmPassword')} className={inputClass + ' pr-10'} />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>
            <button type="submit" disabled={savingPassword} className="flex items-center gap-2 px-5 py-2.5 bg-[#0f172a] text-white rounded-lg font-semibold text-sm hover:bg-[#1e293b] disabled:opacity-50">
              <Shield className="w-4 h-4" />{savingPassword ? 'Actualizando...' : 'Cambiar contraseÃ±a'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'notificaciones' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2"><Bell className="w-4 h-4 text-gray-500" />Preferencias de notificaciones</h2>
          <div className="space-y-2">
            {[
              { key: 'newOrder' as const, label: 'Nuevo pedido recibido', desc: 'Email cuando llegue un pedido nuevo' },
              { key: 'lowStock' as const, label: 'Stock bajo', desc: 'Alerta cuando stock sea menor a 5 unidades' },
              { key: 'newCustomer' as const, label: 'Nuevo cliente', desc: 'Notificacion cuando un usuario se registre' },
              { key: 'dailyReport' as const, label: 'Reporte diario', desc: 'Resumen de ventas cada maÃ±ana' },
              { key: 'weeklyReport' as const, label: 'Reporte semanal', desc: 'Informe completo todos los lunes' },
              { key: 'promotionExpiry' as const, label: 'Vencimiento de promociones', desc: 'Aviso 24hs antes de que venza' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-start justify-between p-4 rounded-lg hover:bg-gray-50 cursor-pointer gap-4">
                <div><p className="text-sm font-medium text-gray-900">{label}</p><p className="text-xs text-gray-400 mt-0.5">{desc}</p></div>
                <div className="relative shrink-0 mt-0.5">
                  <input type="checkbox" checked={notifs[key]} onChange={(e) => setNotifs((prev) => ({ ...prev, [key]: e.target.checked }))} className="sr-only" />
                  <div onClick={() => setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))} className={'w-11 h-6 rounded-full cursor-pointer transition-colors ' + (notifs[key] ? 'bg-[#C8FF00]' : 'bg-gray-200')}>
                    <div className={'w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-transform ' + (notifs[key] ? 'translate-x-6' : 'translate-x-1')} />
                  </div>
                </div>
              </label>
            ))}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button onClick={onSaveNotifs} className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00]"><Save className="w-4 h-4" />Guardar preferencias</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
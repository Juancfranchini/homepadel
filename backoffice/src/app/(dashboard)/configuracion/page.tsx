// Settings (Configuración) page for the Home Pádel BackOffice.
// Three tabs:
//   - General: store name, logo URL, contact email, phone
//   - Seguridad: change password form
//   - Notificaciones: toggle email/push notification preferences
// Saves to API: PUT /api/settings (General), POST /api/auth/change-password (Security)

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Store, Shield, Bell, Save, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

// ─── Schemas ─────────────────────────────────────────────────────────────────
const generalSchema = z.object({
  storeName: z.string().min(2, 'El nombre de la tienda es requerido'),
  logoUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  contactEmail: z.string().email('Email inválido'),
  phone: z.string().optional(),
  address: z.string().optional(),
  whatsapp: z.string().optional(),
});
type GeneralForm = z.infer<typeof generalSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'La contraseña actual es requerida'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});
type PasswordForm = z.infer<typeof passwordSchema>;

// ─── Sub-components ──────────────────────────────────────────────────────────
function FormField({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00] text-gray-900";

// ─── Tabs ────────────────────────────────────────────────────────────────────
type Tab = 'general' | 'seguridad' | 'notificaciones';
const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'seguridad', label: 'Seguridad', icon: Shield },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
];

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ConfiguracionPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Notification toggles state
  const [notifs, setNotifs] = useState({
    newOrder: true,
    lowStock: true,
    newCustomer: false,
    dailyReport: true,
    weeklyReport: false,
    promotionExpiry: true,
  });

  // ── General form ────────────────────────────────────────────────────────────
  const generalForm = useForm<GeneralForm>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      storeName: 'Home Pádel',
      contactEmail: 'hola@homepadel.com',
      phone: '+54 11 1234-5678',
      address: 'Buenos Aires, Argentina',
      whatsapp: '+54 9 11 1234-5678',
    },
  });

  const onSaveGeneral = async (data: GeneralForm) => {
    setSavingGeneral(true);
    try {
      await api.put('/settings', data);
      toast('Configuración guardada', 'success');
    } catch {
      toast('Error al guardar la configuración', 'error');
    } finally {
      setSavingGeneral(false);
    }
  };

  // ── Password form ───────────────────────────────────────────────────────────
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onChangePassword = async (data: PasswordForm) => {
    setSavingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast('Contraseña actualizada correctamente', 'success');
      passwordForm.reset();
    } catch {
      toast('Error al cambiar la contraseña. Verificá la contraseña actual.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Notification save ───────────────────────────────────────────────────────
  const onSaveNotifs = async () => {
    try {
      await api.put('/settings/notifications', notifs);
      toast('Preferencias de notificaciones guardadas', 'success');
    } catch {
      toast('Error al guardar las notificaciones', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 text-sm mt-0.5">Administrá las preferencias del BackOffice</p>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 flex gap-1 shadow-sm w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0f172a] text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab: General ──────────────────────────────────────────────────── */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Store className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-800">Información de la tienda</h2>
          </div>
          <form onSubmit={generalForm.handleSubmit(onSaveGeneral)} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Nombre de la tienda *" error={generalForm.formState.errors.storeName?.message}>
                <input {...generalForm.register('storeName')} className={inputClass} />
              </FormField>
              <FormField label="URL del logo" error={generalForm.formState.errors.logoUrl?.message}>
                <input {...generalForm.register('logoUrl')} className={inputClass} placeholder="https://..." />
              </FormField>
              <FormField label="Email de contacto *" error={generalForm.formState.errors.contactEmail?.message}>
                <input type="email" {...generalForm.register('contactEmail')} className={inputClass} />
              </FormField>
              <FormField label="Teléfono">
                <input {...generalForm.register('phone')} className={inputClass} placeholder="+54 11..." />
              </FormField>
              <FormField label="WhatsApp">
                <input {...generalForm.register('whatsapp')} className={inputClass} placeholder="+54 9 11..." />
              </FormField>
              <FormField label="Dirección">
                <input {...generalForm.register('address')} className={inputClass} placeholder="Buenos Aires..." />
              </FormField>
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="submit"
                disabled={savingGeneral}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingGeneral ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tab: Seguridad ────────────────────────────────────────────────── */}
      {activeTab === 'seguridad' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-800">Cambiar contraseña</h2>
          </div>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="p-6 space-y-4 max-w-sm">
            {/* Current password */}
            <FormField label="Contraseña actual *" error={passwordForm.formState.errors.currentPassword?.message}>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  {...passwordForm.register('currentPassword')}
                  className={`${inputClass} pr-10`}
                />
                <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            {/* New password */}
            <FormField label="Nueva contraseña *" error={passwordForm.formState.errors.newPassword?.message}>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  {...passwordForm.register('newPassword')}
                  className={`${inputClass} pr-10`}
                  placeholder="Mínimo 8 caracteres"
                />
                <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            {/* Confirm password */}
            <FormField label="Confirmar nueva contraseña *" error={passwordForm.formState.errors.confirmPassword?.message}>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  {...passwordForm.register('confirmPassword')}
                  className={`${inputClass} pr-10`}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            {/* Password strength hints */}
            <ul className="text-xs text-gray-400 space-y-0.5 pl-4 list-disc">
              <li>Al menos 8 caracteres</li>
              <li>Combiná letras, números y símbolos</li>
              <li>No uses información personal</li>
            </ul>

            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0f172a] text-white rounded-lg font-semibold text-sm hover:bg-[#1e293b] disabled:opacity-50 mt-2"
            >
              <Shield className="w-4 h-4" />
              {savingPassword ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
          </form>
        </div>
      )}

      {/* ── Tab: Notificaciones ──────────────────────────────────────────── */}
      {activeTab === 'notificaciones' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-800">Preferencias de notificaciones</h2>
          </div>
          <div className="p-6 space-y-2">
            {[
              { key: 'newOrder' as const, label: 'Nuevo pedido recibido', desc: 'Recibí un email cuando llegue un pedido nuevo' },
              { key: 'lowStock' as const, label: 'Stock bajo', desc: 'Alerta cuando el stock de un producto sea menor a 5 unidades' },
              { key: 'newCustomer' as const, label: 'Nuevo cliente registrado', desc: 'Notificación cuando un nuevo usuario cree su cuenta' },
              { key: 'dailyReport' as const, label: 'Reporte diario', desc: 'Resumen de ventas del día anterior cada mañana' },
              { key: 'weeklyReport' as const, label: 'Reporte semanal', desc: 'Informe completo de la semana todos los lunes' },
              { key: 'promotionExpiry' as const, label: 'Vencimiento de promociones', desc: 'Aviso 24hs antes de que venza una promoción activa' },
            ].map(({ key, label, desc }) => (
              <label
                key={key}
                className="flex items-start justify-between p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors gap-4"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <div className="relative shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={notifs[key]}
                    onChange={(e) => setNotifs((prev) => ({ ...prev, [key]: e.target.checked }))}
                    className="sr-only"
                  />
                  <div
                    onClick={() => setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))}
                    className={`w-11 h-6 rounded-full cursor-pointer transition-colors ${notifs[key] ? 'bg-[#C8FF00]' : 'bg-gray-200'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${notifs[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </div>
              </label>
            ))}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={onSaveNotifs}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00]"
              >
                <Save className="w-4 h-4" />
                Guardar preferencias
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

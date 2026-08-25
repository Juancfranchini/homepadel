'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Save, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';

const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00] text-gray-900';

const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] });

type PasswordForm = z.infer<typeof passwordSchema>;

interface SeguridadTabProps {
  toast: (msg: string, type: 'success' | 'error') => void;
}

export default function SeguridadTab({ toast }: SeguridadTabProps) {
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onChangePassword = async (data: PasswordForm) => {
    setSavingPassword(true);
    try {
      await api.post('/auth/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast('Contraseña actualizada', 'success');
      passwordForm.reset();
    } catch { toast('Error', 'error'); } finally { setSavingPassword(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
        <Shield className="w-4 h-4 text-gray-500" />
        Cambiar contraseña
      </h2>
      <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña actual *</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              {...passwordForm.register('currentPassword')}
              className={inputClass + ' pr-10'}
            />
            <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva contraseña *</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              {...passwordForm.register('newPassword')}
              className={inputClass + ' pr-10'}
              placeholder="Minimo 8 caracteres"
            />
            <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña *</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              {...passwordForm.register('confirmPassword')}
              className={inputClass + ' pr-10'}
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 transition-colors"
          >
            <Shield className="w-4 h-4" />
            {savingPassword ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </div>
      </form>
    </div>
  );
}
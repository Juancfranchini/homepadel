'use client';

import { useState } from 'react';
import { Mail, Save, Send } from 'lucide-react';

const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00] text-gray-900';

interface EmailsTabProps {
  emailConfig: { resendApiKey: string; fromEmail: string; adminEmail: string };
  setEmailConfig: (fn: (prev: any) => any) => void;
  onSave: () => void;
  onTest: (email: string) => void;
  saving: boolean;
  testing: boolean;
}

export default function EmailsTab({ emailConfig, setEmailConfig, onSave, onTest, saving, testing }: EmailsTabProps) {
  const [testEmail, setTestEmail] = useState('');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500" />Configuración de Resend</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">API Key de Resend</label>
          <input type="password" value={emailConfig.resendApiKey} onChange={(e) => setEmailConfig(prev => ({ ...prev, resendApiKey: e.target.value }))} className={inputClass} placeholder="re_..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email remitente (From)</label>
          <input value={emailConfig.fromEmail} onChange={(e) => setEmailConfig(prev => ({ ...prev, fromEmail: e.target.value }))} className={inputClass} placeholder="Home Padel <noreply@homepadel.com.ar>" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email del admin (recibe notificaciones)</label>
          <input value={emailConfig.adminEmail} onChange={(e) => setEmailConfig(prev => ({ ...prev, adminEmail: e.target.value }))} className={inputClass} placeholder="contactohomepadel@gmail.com" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Enviar email de prueba</label>
          <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} className={inputClass} placeholder="tu@email.com" />
        </div>
        <div className="flex items-end">
          <button onClick={() => onTest(testEmail)} disabled={testing || !testEmail} className="flex items-center gap-2 px-4 py-2.5 bg-[#0f172a] text-white hover:bg-[#1e293b] rounded-lg font-semibold text-sm hover:bg-[#1e293b] disabled:opacity-50 whitespace-nowrap shrink-0">
            <Send className="w-4 h-4" />{testing ? 'Enviando...' : 'Probar'}
          </button>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] hover:bg-[#b8ef00] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 whitespace-nowrap shrink-0">
          <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>
    </div>
  );
}
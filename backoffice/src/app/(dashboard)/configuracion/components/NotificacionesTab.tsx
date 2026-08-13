'use client';

import { Bell, Save } from 'lucide-react';

interface NotificacionesTabProps {
  notifs: { newOrder: boolean; shippedOrder: boolean; contactForm: boolean };
  setNotifs: (fn: (prev: any) => any) => void;
  onSave: () => void;
}

const NOTIFICATIONS = [
  { key: 'newOrder' as const, label: 'Nuevo pedido recibido', desc: 'Email al cliente cuando se crea un pedido' },
  { key: 'shippedOrder' as const, label: 'Pedido despachado', desc: 'Email al cliente con el numero de tracking' },
  { key: 'contactForm' as const, label: 'Formulario de contacto', desc: 'Email al admin cuando llega un mensaje' },
];

export default function NotificacionesTab({ notifs, setNotifs, onSave }: NotificacionesTabProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2"><Bell className="w-4 h-4 text-gray-500" />Preferencias de notificaciones</h2>
      <div className="space-y-2">
        {NOTIFICATIONS.map(({ key, label, desc }) => (
          <label key={key} className="flex items-start justify-between p-4 rounded-lg hover:bg-gray-50 cursor-pointer gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <div className="relative shrink-0 mt-0.5">
              <input type="checkbox" checked={notifs[key]} onChange={(e) => setNotifs((prev) => ({ ...prev, [key]: e.target.checked }))} className="sr-only" />
              <div onClick={() => setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))} className={'w-11 h-6 rounded-full cursor-pointer transition-colors ' + (notifs[key] ? 'bg-[#C8FF00]' : 'bg-gray-200')}>
                <div className={'w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-transform ' + (notifs[key] ? 'translate-x-6' : 'translate-x-1')} />
              </div>
            </div>
          </label>
        ))}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button onClick={onSave} className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] hover:bg-[#b8ef00] rounded-lg font-semibold text-sm hover:bg-[#b8ef00]">
            <Save className="w-4 h-4" />Guardar preferencias
          </button>
        </div>
      </div>
    </div>
  );
}
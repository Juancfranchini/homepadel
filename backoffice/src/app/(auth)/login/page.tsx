// Login page for the Home Pádel BackOffice.
// Centered card on a dark gradient background.
// Uses react-hook-form + Zod for validation.
// On successful login: stores the JWT in localStorage AND as a cookie (for middleware),
// then redirects to the dashboard (/). On error: shows the API error message.

'use client';

import { useRouter } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';

// Login desactivado temporalmente — acceso directo al dashboard sin credenciales
export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 bg-[#C8FF00]" />
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0f172a] mb-4">
              <span className="text-[#C8FF00] font-black text-xl">HP</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">HOME PÁDEL</h1>
            <p className="text-gray-400 text-sm mt-1 mb-8 font-medium uppercase tracking-widest">BackOffice</p>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 rounded-lg bg-[#C8FF00] text-[#0f172a] font-bold text-sm hover:bg-[#b8ef00] transition-colors flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Entrar al panel
            </button>
          </div>
        </div>
        <p className="text-center text-slate-500 text-xs mt-6">
          © {new Date().getFullYear()} Home Pádel — Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}

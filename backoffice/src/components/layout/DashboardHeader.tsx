// Top header bar for the dashboard layout.
// Shows the current page breadcrumb on the left and admin avatar + logout on the right.
// Logout clears 'bo_token' from localStorage and the cookie, then redirects to /login.

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Bell } from 'lucide-react';

const PAGE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/productos': 'Productos',
  '/categorias': 'Categorías',
  '/marcas': 'Marcas',
  '/pedidos': 'Pedidos',
  '/clientes': 'Clientes',
  '/promociones': 'Promociones',
  '/banners': 'Banners',
  '/cupones': 'Cupones',
  '/gastos': 'Gastos',
  '/configuracion': 'Configuración',
};

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const pageLabel = PAGE_LABELS[pathname] ?? 'BackOffice';

  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem('bo_token');
    // Clear the cookie used by middleware
    document.cookie = 'bo_token=; Max-Age=0; path=/';
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-sm">Home Pádel</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 text-sm font-semibold">{pageLabel}</span>
      </div>

      {/* Right: Notifications + User info + Logout */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:bg-gray-100 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C8FF00]" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Admin avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center">
            <span className="text-[#C8FF00] text-xs font-bold">AD</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-none">Admin</p>
            <p className="text-xs text-slate-400 mt-0.5">Administrador</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors text-sm"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}

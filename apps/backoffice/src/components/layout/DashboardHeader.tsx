'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Bell, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const PAGE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/productos': 'Productos',
  '/categorias': 'Categorias',
  '/marcas': 'Marcas',
  '/pedidos': 'Pedidos',
  '/clientes': 'Clientes',
  '/promociones': 'Promociones',
  '/banners': 'Banners',
  '/cupones': 'Cupones',
  '/gastos': 'Gastos',
  '/configuracion': 'Configuracion',
  '/reviews': 'Reviews',
  '/productos-contenido': 'Contenido Productos',
  '/testimonios': 'Testimonios',
  '/faq': 'FAQ',
  '/hero': 'Hero Slider',
  '/beneficios': 'Beneficios',
};

interface DashboardHeaderProps {
  onMenuClick: () => void;
  onCollapseToggle: () => void;
  collapsed: boolean;
}

export function DashboardHeader({ onMenuClick, onCollapseToggle, collapsed }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const pageLabel = PAGE_LABELS[pathname] ?? 'BackOffice';

  const handleLogout = () => {
    localStorage.removeItem('bo_token');
    document.cookie = 'bo_token=; Max-Age=0; path=/';
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-gray-100 hover:text-slate-700 transition-colors"
          title="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onCollapseToggle}
          className="hidden lg:flex p-2 rounded-lg text-slate-500 hover:bg-gray-100 hover:text-slate-700 transition-colors"
          title={collapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        <span className="text-slate-400 text-sm hidden sm:inline">Home Padel</span>
        <span className="text-slate-300 hidden sm:inline">/</span>
        <span className="text-slate-800 text-sm font-semibold">{pageLabel}</span>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button className="relative p-2 rounded-lg text-slate-400 hover:bg-gray-100 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C8FF00]" />
        </button>

        <div className="w-px h-6 bg-gray-200 hidden md:block" />

        <div className="flex items-center gap-2 md:gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center shrink-0">
            <span className="text-[#C8FF00] text-xs font-bold">AD</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-800 leading-none">Admin</p>
            <p className="text-xs text-slate-400 mt-0.5">Administrador</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors text-sm"
          title="Cerrar sesion"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}

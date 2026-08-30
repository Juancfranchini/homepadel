'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
  HelpCircle,
  LayoutDashboard,
  Package,
  Tags,
  Award,
  ShoppingBag,
  Users,
  Percent,
  Image,
  Tag,
  Receipt,
  Settings,
  PlaySquare,
  Sparkles,
  Shield,
  MessageSquare,
  Info,
  Instagram,
  Megaphone,
  Star,
  FileEdit,
  FileText,
  RefreshCw,
  CreditCard,
  Ruler,
  Truck,
  UserCheck,
  FileCheck,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Ecommerce',
    items: [
      { label: 'Productos', href: '/productos', icon: Package },
      { label: 'Contenido Productos', href: '/productos-contenido', icon: FileEdit },
      { label: 'Categorias', href: '/categorias', icon: Tags },
      { label: 'Marcas', href: '/marcas', icon: Award },
      { label: 'Pedidos', href: '/pedidos', icon: ShoppingBag },
      { label: 'Reviews', href: '/reviews', icon: Star },
      { label: 'Clientes', href: '/clientes', icon: Users },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { label: 'Promociones', href: '/promociones', icon: Percent },
      { label: 'Cupones', href: '/cupones', icon: Tag },
    ],
  },
  {
    title: 'Landing Page',
    items: [
      { label: 'Hero Slider', href: '/hero', icon: PlaySquare },
      { label: 'Beneficios', href: '/beneficios', icon: Sparkles },
      { label: 'Banners', href: '/banners', icon: Image },
      { label: 'Sobre Nosotros', href: '/configuracion/about', icon: Info },
      { label: 'Testimonios', href: '/testimonios', icon: MessageSquare },
      { label: 'FAQ', href: '/faq', icon: HelpCircle },
      { label: 'Instagram', href: '/configuracion/instagram', icon: Instagram },
      { label: 'CTA & Newsletter', href: '/configuracion/mensaje-final', icon: Megaphone },
      { label: 'Confianza Productos', href: '/configuracion/confianza-productos', icon: Shield },
      { label: 'Medios de Pago', href: '/configuracion/medios-pago', icon: CreditCard },
      { label: 'Politica de Devolucion', href: '/configuracion/paginas', icon: RefreshCw },
      { label: 'Guia de Talles', href: '/configuracion/talles', icon: Ruler },
      { label: 'Envios', href: '/configuracion/envios', icon: Truck },
      { label: 'Politica de Privacidad', href: '/configuracion/privacidad', icon: UserCheck },
      { label: 'Terminos y Condiciones', href: '/configuracion/terminos', icon: FileCheck },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Gastos', href: '/gastos', icon: Receipt },
      { label: 'Configuracion', href: '/configuracion', icon: Settings },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/productos') return pathname === '/productos';
    if (href === '/configuracion') return pathname === '/configuracion';
    return pathname.startsWith(href);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onMobileClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        ref={sidebarRef}
        className={
          'fixed lg:sticky top-0 left-0 z-50 h-screen bg-[#0f172a] flex flex-col shrink-0 transition-all duration-300 ' +
          'w-64 ' +
          (collapsed ? 'lg:!w-16' : 'lg:w-64') +
          ' ' +
          (mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
        }
      >
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-white font-bold text-lg tracking-wide whitespace-nowrap">HOME PADEL</span>
            <span className="w-2 h-2 rounded-full bg-[#C8FF00] shrink-0" />
          </div>
          <button
            onClick={onMobileClose}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className={'px-6 pt-2 text-slate-400 text-xs shrink-0 ' + (collapsed ? 'lg:hidden' : '')}>
          Panel de Administracion
        </p>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.title && (
                <>
                  <p className={'px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 whitespace-nowrap ' + (collapsed ? 'lg:hidden' : '')}>
                    {group.title}
                  </p>
                  {collapsed && (
                    <div className="px-3 mb-1 border-b border-white/10 hidden lg:block" />
                  )}
                </>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ' +
                          (active ? 'bg-[#1e293b] text-white border-l-2 border-[#C8FF00] pl-[10px]' : 'text-slate-400 hover:bg-[#1e293b] hover:text-white border-l-2 border-transparent pl-[10px]') +
                          (collapsed ? 'lg:justify-center lg:px-2' : '')
                        }
                      >
                        <Icon className={'w-4 h-4 shrink-0 ' + (active ? 'text-[#C8FF00]' : 'text-slate-500')} />
                        <span className={'whitespace-nowrap ' + (collapsed ? 'lg:hidden' : '')}>
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-white/10 shrink-0">
          <p className={'text-slate-600 text-xs ' + (collapsed ? 'lg:hidden' : '')}>BackOffice v1.2.0</p>
        </div>
      </aside>
    </>
  );
}

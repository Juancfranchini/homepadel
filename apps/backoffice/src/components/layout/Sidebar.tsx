'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { GRUPOS_MENU, rutaActiva } from './navegacion';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const CLAVE_PLEGADOS = 'bo_menu_plegados';

/**
 * Grupos plegados por quien usa el panel, recordados en este navegador. El
 * grupo de la pantalla abierta se muestra siempre, aunque se haya plegado.
 */
function useGruposPlegados() {
  const [plegados, setPlegados] = useState<string[]>([]);
  useEffect(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE_PLEGADOS) || '[]');
      if (Array.isArray(guardado)) setPlegados(guardado.filter((g) => typeof g === 'string'));
    } catch {
      // Sin almacenamiento: todo desplegado.
    }
  }, []);
  const alternar = (titulo: string) => setPlegados((actuales) => {
    const nuevos = actuales.includes(titulo) ? actuales.filter((t) => t !== titulo) : [...actuales, titulo];
    try { localStorage.setItem(CLAVE_PLEGADOS, JSON.stringify(nuevos)); } catch { /* sin almacenamiento */ }
    return nuevos;
  });
  return { plegados, alternar };
}

function SidebarNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  const { plegados, alternar } = useGruposPlegados();
  return (
    <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-3">
      {GRUPOS_MENU.map((group, gi) => {
        const tieneActiva = group.items.some((item) => rutaActiva(pathname, item.href));
        // Con la barra angosta (solo íconos) no hay títulos: se ve todo.
        const abierto = collapsed || !group.title || tieneActiva || !plegados.includes(group.title);
        return (
        <div key={gi}>
          {group.title && (
            <>
              <button
                type="button"
                onClick={() => alternar(group.title as string)}
                aria-expanded={abierto}
                className={'flex w-full items-center justify-between px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 whitespace-nowrap ' + (collapsed ? 'lg:hidden' : '')}
              >
                {group.title}
                <ChevronDown className={'h-3 w-3 transition-transform ' + (abierto ? '' : '-rotate-90')} />
              </button>
              {collapsed && <div className="px-3 mb-1 border-b border-white/10 hidden lg:block" />}
            </>
          )}
          {abierto && (
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = rutaActiva(pathname, item.href);
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
                    <span className={'whitespace-nowrap ' + (collapsed ? 'lg:hidden' : '')}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          )}
        </div>
        );
      })}
    </nav>
  );
}

export function Sidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

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
            <NextImage src="/home-padel-logo.png" alt="Home Pádel" width={93} height={70} priority className="object-contain h-8 w-auto" />
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

        <SidebarNav pathname={pathname} collapsed={collapsed} />

        <div className="px-6 py-4 border-t border-white/10 shrink-0">
          <p className={'text-slate-600 text-xs ' + (collapsed ? 'lg:hidden' : '')}>BackOffice v1.2.0</p>
        </div>
      </aside>
    </>
  );
}

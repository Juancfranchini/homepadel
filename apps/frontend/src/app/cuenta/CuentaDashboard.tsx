'use client';

import { useState } from 'react';
import { Package, LogOut, Heart, MapPin, FileText, MessageSquare } from 'lucide-react';
import { Order, User } from '@/types';
import MisResenasTab from '@/components/account/MisResenasTab';
import CuentaOrdersTab from './CuentaOrdersTab';
import { CuentaDatosTab } from './CuentaStaticTabs';
import CuentaFavoritosTab from './CuentaFavoritosTab';
import CuentaDireccionesTab from './CuentaDireccionesTab';

type TabKey = 'pedidos' | 'resenas' | 'favoritos' | 'datos' | 'direcciones';

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'pedidos', label: 'Mis pedidos', icon: Package },
  { key: 'resenas', label: 'Mis resenas', icon: MessageSquare },
  { key: 'favoritos', label: 'Favoritos', icon: Heart },
  { key: 'datos', label: 'Mis datos', icon: FileText },
  { key: 'direcciones', label: 'Direcciones', icon: MapPin },
];

interface Props {
  user: User;
  orders: Order[];
  loadingOrders: boolean;
  onLogout: () => void;
}

export default function CuentaDashboard({ user, orders, loadingOrders, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('pedidos');

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-card rounded-2xl border border-[#B7D31A]/20 p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#B7D31A] rounded-full flex items-center justify-center text-[#050606] font-black text-xl">{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <p className="text-xs text-fg-muted font-medium uppercase tracking-wide">Bienvenido</p>
              <h1 className="text-xl font-black text-fg">{user.name}</h1>
              <p className="text-sm text-fg-muted">{user.email}</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-sm text-fg-muted hover:text-red-500 light:hover:text-red-600 transition-colors border border-chip px-4 py-2 rounded-lg hover:border-red-500/30">
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={'rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all ' +
                  (isActive ? 'bg-[#B7D31A]/10 border border-[#B7D31A]/40 shadow-[0_0_12px_rgba(183,211,26,0.08)]' : 'bg-card border border-[#B7D31A]/20 hover:border-[#B7D31A]/40')}>
                <Icon size={22} className={isActive ? 'text-brand-fg' : 'text-fg-muted'} />
                <span className={'text-xs font-semibold ' + (isActive ? 'text-brand-fg' : 'text-fg-soft')}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-card rounded-2xl border border-[#B7D31A]/20 p-6 min-h-[300px]">
          {activeTab === 'pedidos' && <CuentaOrdersTab orders={orders} loading={loadingOrders} />}
          {activeTab === 'resenas' && <MisResenasTab />}
          {activeTab === 'favoritos' && <CuentaFavoritosTab />}
          {activeTab === 'datos' && <CuentaDatosTab user={user} />}
          {activeTab === 'direcciones' && <CuentaDireccionesTab />}
        </div>
      </div>
    </div>
  );
}

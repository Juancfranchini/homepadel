import { Store, Shield, Bell, Mail, Target, LayoutDashboard, Cloud } from 'lucide-react';
import { Tab } from '../useConfiguracionPage';

export const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'home_sections', label: 'Secciones Home', icon: LayoutDashboard },
  { id: 'meta_pixel', label: 'Meta Pixel', icon: Target },
  { id: 'seguridad', label: 'Seguridad', icon: Shield },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { id: 'emails', label: 'Emails', icon: Mail },
  { id: 'cloudinary', label: 'Cloudinary', icon: Cloud },
];

export default function ConfiguracionTabsBar({ activeTab, onChange }: { activeTab: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="w-full bg-gray-50 rounded-xl p-1.5 border border-gray-200">
      <div className="flex items-center gap-1 overflow-x-auto lg:overflow-visible lg:justify-between">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={'flex-shrink-0 lg:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ' +
                (isActive ? 'bg-[#0f172a] text-white shadow-sm' : 'text-gray-500 hover:bg-white hover:text-gray-700')}
            >
              <Icon className={'w-4 h-4 shrink-0 ' + (isActive ? 'text-[#C8FF00]' : 'text-gray-400')} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

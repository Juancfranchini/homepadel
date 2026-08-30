'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { ToastProvider } from '@/components/ui/Toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="flex flex-col flex-1 min-w-0">
          <DashboardHeader
            onMenuClick={() => setMobileOpen(true)}
            onCollapseToggle={() => setCollapsed(!collapsed)}
            collapsed={collapsed}
          />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}

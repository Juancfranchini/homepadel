// Dashboard group layout — wraps all authenticated admin pages.
// Renders: fixed sidebar on the left | vertical stack of (header + page content) on the right.
// Also provides the ToastProvider so all pages can show notifications.

import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { ToastProvider } from '@/components/ui/Toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-gray-50">
        {/* Fixed sidebar */}
        <Sidebar />

        {/* Main column: header + scrollable content */}
        <div className="flex flex-col flex-1 min-w-0">
          <DashboardHeader />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}

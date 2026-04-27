'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { useAppStore } from '@/stores/app.store';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar />
      <main
        className={cn(
          'transition-all duration-300 pt-14 pb-20 md:pb-6',
          sidebarCollapsed ? 'md:ml-15' : 'md:ml-65',
        )}
      >
        <div className="p-4 md:p-6 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

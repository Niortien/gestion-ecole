'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';
import { AuthGuard } from '@/providers/auth-guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
        {/* Sidebar */}
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar />
          <main
            id="main-content"
            className="flex-1 overflow-y-auto p-4 md:p-6"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

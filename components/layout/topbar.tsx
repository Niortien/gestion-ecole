'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { IconBell, IconLogout, IconUser } from '@tabler/icons-react';
import { useAuthStore } from '@/stores/auth.store';
import { messageApi } from '@/lib/api/messagerie';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function TopBar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const { data: unread = [] } = useQuery({
    queryKey: ['messagerie', 'non-lus'],
    queryFn: messageApi.nonLus,
    refetchInterval: 60_000,
  });

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const roleLabel: Record<string, string> = {
    ADMIN: 'Administrateur',
    DIRECTEUR: 'Directeur',
    MAITRE: 'Maître',
    PARENT: 'Parent',
    COMPTABLE: 'Comptable',
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0">
      <div />

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`${unread.length} message(s) non lu(s)`}
            onClick={() => router.push('/dashboard/messagerie')}
          >
            <IconBell size={18} />
          </Button>
          {unread.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-[hsl(var(--destructive))] text-white text-[10px] font-bold pointer-events-none">
              {unread.length > 9 ? '9+' : unread.length}
            </span>
          )}
        </div>

        {/* User info */}
        <div className="flex items-center gap-2 pl-2 border-l border-[hsl(var(--border))]">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]">
            <IconUser size={16} aria-hidden="true" />
          </div>
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {user?.role ? roleLabel[user.role] ?? user.role : ''}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Se déconnecter"
            onClick={handleLogout}
            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
          >
            <IconLogout size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
}

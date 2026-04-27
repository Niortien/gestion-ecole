'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  MessageSquare,
  CreditCard,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/lib/types';

const MOBILE_NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: [] },
  { label: 'Élèves', href: '/eleves', icon: Users, roles: [UserRole.ADMIN, UserRole.DIRECTEUR, UserRole.MAITRE] },
  { label: 'Présences', href: '/presences', icon: CalendarCheck, roles: [UserRole.ADMIN, UserRole.DIRECTEUR, UserRole.MAITRE] },
  { label: 'Paiements', href: '/paiements', icon: CreditCard, roles: [UserRole.ADMIN, UserRole.DIRECTEUR, UserRole.COMPTABLE] },
  { label: 'Messages', href: '/messagerie', icon: MessageSquare, roles: [] },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const role = user?.role as UserRole | undefined;

  const items = MOBILE_NAV_ITEMS.filter(
    (item) => !item.roles.length || !role || item.roles.includes(role),
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background px-2 md:hidden">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors text-xs',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

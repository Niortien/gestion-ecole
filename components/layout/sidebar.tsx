'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconLayoutDashboard,
  IconUsers,
  IconSchool,
  IconChalkboard,
  IconNotebook,
  IconClipboardList,
  IconFileText,
  IconCalendar,
  IconBook,
  IconCoin,
  IconReceipt,
  IconWallet,
  IconMail,
  IconSettings,
  IconChevronLeft,
  IconMenu2,
} from '@tabler/icons-react';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/lib/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: UserRole[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Tableau de bord', href: '/dashboard', icon: <IconLayoutDashboard size={18} /> },
    ],
  },
  {
    title: 'Académique',
    items: [
      { label: 'Élèves', href: '/eleves', icon: <IconUsers size={18} /> },
      { label: 'Classes', href: '/classes', icon: <IconChalkboard size={18} /> },
      { label: 'Maîtres', href: '/maitres', icon: <IconSchool size={18} />, roles: [UserRole.ADMIN, UserRole.DIRECTEUR] },
      { label: 'Parents', href: '/parents', icon: <IconUsers size={18} />, roles: [UserRole.ADMIN, UserRole.DIRECTEUR] },
      { label: 'Notes', href: '/notes', icon: <IconNotebook size={18} /> },
      { label: 'Bulletins', href: '/bulletins', icon: <IconFileText size={18} /> },
      { label: 'Présences', href: '/presences', icon: <IconClipboardList size={18} /> },
      { label: 'Examens', href: '/examens', icon: <IconCalendar size={18} /> },
      { label: 'Devoirs', href: '/devoirs', icon: <IconBook size={18} /> },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Frais de scolarité', href: '/frais-scolarite', icon: <IconCoin size={18} />, roles: [UserRole.ADMIN, UserRole.DIRECTEUR, UserRole.COMPTABLE] },
      { label: 'Paiements', href: '/paiements', icon: <IconReceipt size={18} />, roles: [UserRole.ADMIN, UserRole.DIRECTEUR, UserRole.COMPTABLE] },
      { label: 'Dépenses', href: '/depenses', icon: <IconWallet size={18} />, roles: [UserRole.ADMIN, UserRole.DIRECTEUR, UserRole.COMPTABLE] },
      { label: 'Caisse', href: '/caisse', icon: <IconWallet size={18} />, roles: [UserRole.ADMIN, UserRole.DIRECTEUR, UserRole.COMPTABLE] },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Messagerie', href: '/messagerie', icon: <IconMail size={18} /> },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { label: 'Paramètres', href: '/parametres', icon: <IconSettings size={18} />, roles: [UserRole.ADMIN, UserRole.DIRECTEUR] },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role as UserRole | undefined;

  const isAllowed = (item: NavItem) => {
    if (!item.roles) return true;
    if (!userRole) return false;
    return item.roles.includes(userRole);
  };

  return (
    <aside
      className={[
        'flex flex-col h-full transition-[width] duration-300 ease-in-out overflow-hidden',
        'bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-text))]',
        collapsed ? 'w-[60px]' : 'w-64',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-3 border-b border-white/10 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(var(--primary))] shrink-0">
              <IconSchool size={16} className="text-white" />
            </div>
            <span className="font-semibold text-sm truncate text-white">École Primaire</span>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(var(--primary))] mx-auto">
            <IconSchool size={16} className="text-white" />
          </div>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Développer le menu' : 'Réduire le menu'}
          className={[
            'shrink-0 flex items-center justify-center w-7 h-7 rounded-md',
            'hover:bg-white/10 transition-colors text-white/70 hover:text-white',
            collapsed ? 'mx-auto' : '',
          ].join(' ')}
        >
          {collapsed ? <IconMenu2 size={16} /> : <IconChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4" aria-label="Navigation principale">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(isAllowed);
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.title}>
              {!collapsed && (
                <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  {group.title}
                </p>
              )}
              <ul className="space-y-0.5" role="list">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        title={collapsed ? item.label : undefined}
                        className={[
                          'flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-[hsl(var(--primary))] text-white'
                            : 'text-white/70 hover:bg-white/10 hover:text-white',
                          collapsed ? 'justify-center' : '',
                        ].join(' ')}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

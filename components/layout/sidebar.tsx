'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarRange,
  School,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  FileCheck,
  CalendarCheck,
  Star,
  FileText,
  Banknote,
  CreditCard,
  ArrowDownCircle,
  Vault,
  MessageSquare,
  ShieldCheck,
  HeartHandshake,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/auth.store';
import { useAppStore } from '@/stores/app.store';
import { useUnreadCount } from '@/features/messagerie';
import { UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: React.ReactNode;
  roles?: UserRole[];
}

interface NavSection {
  title: string;
  roles?: UserRole[];
  items: NavItem[];
}

function UnreadBadge() {
  const { data: count } = useUnreadCount();
  if (!count) return null;
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Établissement',
    items: [
      { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Années scolaires', href: '/annee-scolaire', icon: CalendarRange },
      { label: 'Classes', href: '/classes', icon: School },
    ],
  },
  {
    title: 'Pédagogie',
    roles: [UserRole.ADMIN, UserRole.DIRECTEUR, UserRole.MAITRE],
    items: [
      { label: 'Élèves', href: '/eleves', icon: Users },
      { label: 'Enseignants', href: '/maitres', icon: GraduationCap },
      { label: 'Matières', href: '/matieres', icon: BookOpen },
      { label: 'Devoirs', href: '/devoirs', icon: ClipboardList },
      { label: 'Examens', href: '/examens', icon: FileCheck },
    ],
  },
  {
    title: 'Suivi',
    roles: [UserRole.ADMIN, UserRole.DIRECTEUR, UserRole.MAITRE, UserRole.PARENT],
    items: [
      { label: 'Présences', href: '/presences', icon: CalendarCheck },
      { label: 'Notes', href: '/notes', icon: Star },
      { label: 'Bulletins', href: '/bulletins', icon: FileText },
    ],
  },
  {
    title: 'Finances',
    roles: [UserRole.ADMIN, UserRole.DIRECTEUR, UserRole.COMPTABLE],
    items: [
      { label: 'Frais de scolarité', href: '/frais-scolarite', icon: Banknote },
      { label: 'Paiements', href: '/paiements', icon: CreditCard },
      { label: 'Dépenses', href: '/depenses', icon: ArrowDownCircle },
      { label: 'Caisse', href: '/caisse', icon: Vault },
    ],
  },
  {
    title: 'Communication',
    items: [
      {
        label: 'Messagerie',
        href: '/messagerie',
        icon: MessageSquare,
        badge: <UnreadBadge />,
      },
      { label: 'Notifications', href: '/notifications', icon: Bell },
    ],
  },
  {
    title: 'Administration',
    roles: [UserRole.ADMIN],
    items: [
      { label: 'Utilisateurs', href: '/utilisateurs', icon: ShieldCheck },
      { label: 'Parents', href: '/parents', icon: HeartHandshake },
      { label: 'Rapports', href: '/rapports', icon: BarChart3 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  const role = user?.role as UserRole | undefined;

  const visibleSections = NAV_SECTIONS.filter(
    (section) => !section.roles || !role || section.roles.includes(role),
  );

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300',
        sidebarCollapsed ? 'w-15' : 'w-65',
      )}
      style={{ background: 'hsl(var(--sidebar-bg))' }}
    >
      {/* Logo */}
      <div className={cn(
        'flex h-16 items-center border-b border-white/8 px-3',
        sidebarCollapsed ? 'justify-center' : 'justify-between gap-2',
      )}>
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white font-black text-sm shadow-lg shadow-indigo-500/30">
              EP
            </div>
            <div className="min-w-0">
              <span className="block font-bold text-white text-sm leading-none">EcolePro</span>
              <span className="block text-[10px] text-white/40 leading-none mt-0.5 truncate">Gestion scolaire</span>
            </div>
          </Link>
        )}
        {sidebarCollapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white font-black text-sm shadow-lg shadow-indigo-500/30">
            EP
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            'h-7 w-7 shrink-0 rounded-lg text-white/40 hover:bg-white/8 hover:text-white/80',
            sidebarCollapsed && 'absolute -right-3 top-14 h-6 w-6 rounded-full border border-white/10 bg-[hsl(var(--sidebar-bg))] shadow-md',
          )}
        >
          {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-3">
        <nav className="px-2 space-y-0.5">
          {visibleSections.map((section) => (
            <div key={section.title} className="mb-3">
              {!sidebarCollapsed && (
                <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-white/25 select-none">
                  {section.title}
                </p>
              )}
              {sidebarCollapsed && <div className="my-2 border-t border-white/8" />}
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const NavLink = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-white/12 text-white shadow-sm'
                        : 'text-white/55 hover:bg-white/6 hover:text-white/85',
                      sidebarCollapsed && 'justify-center px-2',
                    )}
                  >
                    {isActive && !sidebarCollapsed && (
                      <span className="absolute left-2 h-4 w-0.5 rounded-full bg-primary" />
                    )}
                    <item.icon className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive ? 'text-primary' : 'text-white/40 group-hover:text-white/65',
                    )} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge}
                      </>
                    )}
                  </Link>
                );

                if (sidebarCollapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger render={NavLink} />
                      <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
                    </Tooltip>
                  );
                }

                return <div key={item.href} className="relative">{NavLink}</div>;
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-white/8 p-3">
        <div className={cn('flex items-center gap-2.5', sidebarCollapsed && 'flex-col gap-2')}>
          <Avatar className="h-8 w-8 shrink-0 ring-2 ring-white/10">
            <AvatarFallback className="bg-linear-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white/80">{user?.email}</p>
              <span className="mt-0.5 inline-flex items-center rounded-md border border-white/15 px-1.5 py-0 text-[10px] font-medium text-white/45">
                {role}
              </span>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger render={
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-7 w-7 shrink-0 rounded-lg text-white/40 hover:bg-rose-500/15 hover:text-rose-400"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            } />
            <TooltipContent side={sidebarCollapsed ? 'right' : 'top'} className="text-xs">Déconnexion</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}

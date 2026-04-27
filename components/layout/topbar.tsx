'use client';

import { Sun, Moon, Bell, Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BreadcrumbNav } from './BreadcrumbNav';
import { AnneeScolaireSelector } from './AnneeScolaireSelector';
import { useAppStore } from '@/stores/app.store';
import { useUnreadCount } from '@/features/messagerie';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const { sidebarCollapsed, hasUnsavedChanges } = useAppStore();
  const { data: unreadCount } = useUnreadCount();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-40 flex h-14 items-center gap-3 border-b border-border/60 bg-background/90 backdrop-blur-md px-5 transition-all duration-300',
        sidebarCollapsed ? 'left-15' : 'left-65',
      )}
    >
      {/* Breadcrumb */}
      <div className="flex-1 min-w-0">
        <BreadcrumbNav />
      </div>

      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && (
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Non enregistré
        </div>
      )}

      {/* Search hint */}
      <Button
        variant="outline"
        size="sm"
        className="hidden lg:flex items-center gap-2 text-muted-foreground text-xs h-8 rounded-lg border-border/70 bg-muted/40 hover:bg-muted/70 w-44 justify-start"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1">Rechercher...</span>
        <kbd className="rounded-md border border-border/70 bg-background px-1.5 font-mono text-[10px] leading-4">⌘K</kbd>
      </Button>

      {/* Année scolaire */}
      <AnneeScolaireSelector />

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Changer le thème</span>
      </Button>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              {unreadCount != null && unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-72 rounded-xl p-1">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b mb-1">Notifications</div>
          <DropdownMenuItem className="text-muted-foreground text-xs justify-center py-6 rounded-lg">
            Aucune nouvelle notification
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

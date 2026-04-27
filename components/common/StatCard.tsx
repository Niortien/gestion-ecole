import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; label: string };
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet';
  isLoading?: boolean;
  className?: string;
}

const COLOR_MAP = {
  indigo: {
    icon: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
    accent: 'from-indigo-500/5',
    dot: 'bg-indigo-500',
  },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    accent: 'from-emerald-500/5',
    dot: 'bg-emerald-500',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    accent: 'from-amber-500/5',
    dot: 'bg-amber-500',
  },
  rose: {
    icon: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
    accent: 'from-rose-500/5',
    dot: 'bg-rose-500',
  },
  violet: {
    icon: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400',
    accent: 'from-violet-500/5',
    dot: 'bg-violet-500',
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'indigo',
  isLoading,
  className,
}: StatCardProps) {
  const colors = COLOR_MAP[color];

  if (isLoading) {
    return (
      <Card className={cn('rounded-xl border-0 shadow-sm', className)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2.5 flex-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-11 w-11 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'relative overflow-hidden rounded-xl border border-border/60 shadow-sm transition-shadow hover:shadow-md',
      className,
    )}>
      {/* Subtle gradient overlay */}
      <div className={cn('absolute inset-0 bg-linear-to-br to-transparent pointer-events-none', colors.accent)} />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold font-mono tracking-tight text-foreground tabular-nums">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                trend.value >= 0
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
              )}>
                {trend.value >= 0
                  ? <TrendingUp className="h-3 w-3" />
                  : <TrendingDown className="h-3 w-3" />}
                {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
              </div>
            )}
          </div>
          <div className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl shadow-sm',
            colors.icon,
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {/* Bottom accent bar */}
        <div className={cn('absolute bottom-0 left-0 h-0.5 w-12 rounded-r-full', colors.dot)} />
      </CardContent>
    </Card>
  );
}

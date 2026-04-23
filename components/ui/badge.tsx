import * as React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
  secondary: 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]',
  destructive: 'bg-[hsl(var(--destructive))]/15 text-[hsl(var(--destructive))]',
  outline: 'border border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
};

function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    />
  );
}

export { Badge };

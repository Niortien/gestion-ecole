'use client';

import * as React from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (open) {
      document.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function DialogContent({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'w-full max-h-[90vh] overflow-y-auto rounded-xl border border-[hsl(var(--border))]',
        'bg-[hsl(var(--card))] p-6 shadow-xl',
        'max-w-lg mx-4',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

function DialogHeader({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={['flex flex-col space-y-1.5 mb-4', className].join(' ')} {...props} />;
}

function DialogTitle({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={['text-lg font-semibold leading-none tracking-tight', className].join(' ')} {...props} />;
}

function DialogDescription({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={['text-sm text-[hsl(var(--muted-foreground))]', className].join(' ')} {...props} />
  );
}

function DialogFooter({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6', className].join(' ')} {...props} />
  );
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };

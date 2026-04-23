import * as React from 'react';

function Skeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['animate-pulse rounded-md bg-[hsl(var(--muted))]', className].join(' ')}
      {...props}
    />
  );
}

export { Skeleton };

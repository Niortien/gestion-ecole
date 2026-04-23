import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={[
        'flex h-9 w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-3 py-1',
        'text-sm shadow-sm transition-colors',
        'placeholder:text-[hsl(var(--muted-foreground))]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      ].join(' ')}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };

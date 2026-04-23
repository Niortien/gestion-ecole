import * as React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, placeholder, ...props }, ref) => (
    <select
      ref={ref}
      className={[
        'flex h-9 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-1',
        'text-sm shadow-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      ].join(' ')}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

export { Select };

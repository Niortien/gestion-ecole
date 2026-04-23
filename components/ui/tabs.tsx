import * as React from 'react';

interface TabsContextValue {
  value: string;
  onChange: (v: string) => void;
}

const TabsContext = React.createContext<TabsContextValue>({ value: '', onChange: () => {} });

function Tabs({
  value,
  onValueChange,
  children,
  className = '',
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsContext.Provider value={{ value, onChange: onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'inline-flex h-9 items-center justify-center rounded-lg bg-[hsl(var(--muted))] p-1',
        'text-[hsl(var(--muted-foreground))]',
        className,
      ].join(' ')}
      role="tablist"
      {...props}
    />
  );
}

function TabsTrigger({
  value,
  className = '',
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const ctx = React.useContext(TabsContext);
  const isActive = ctx.value === value;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx.onChange(value)}
      className={[
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium',
        'ring-offset-[hsl(var(--background))] transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow'
          : 'hover:bg-[hsl(var(--background))]/50',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({
  value,
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const ctx = React.useContext(TabsContext);
  if (ctx.value !== value) return null;
  return (
    <div
      role="tabpanel"
      className={['mt-4 ring-offset-[hsl(var(--background))] focus-visible:outline-none focus-visible:ring-2', className].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

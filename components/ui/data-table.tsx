'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import {
  IconChevronUp,
  IconChevronDown,
  IconChevronsLeft,
  IconChevronsRight,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
} from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  globalFilter?: boolean;
}

export function DataTable<TData>({
  data,
  columns,
  isLoading,
  searchPlaceholder = 'Rechercher…',
  globalFilter = true,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: globalFilterValue },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilterValue,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  return (
    <div className="space-y-3">
      {/* Search */}
      {globalFilter && (
        <div className="relative max-w-xs">
          <IconSearch
            size={15}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
            aria-hidden="true"
          />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilterValue}
            onChange={(e) => setGlobalFilterValue(e.target.value)}
            className="pl-8 h-8 text-sm"
            aria-label={searchPlaceholder}
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-[hsl(var(--border))] overflow-x-auto">
        <table className="w-full text-sm" role="grid">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] whitespace-nowrap"
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className={[
                          'inline-flex items-center gap-1',
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none hover:text-[hsl(var(--foreground))]'
                            : '',
                        ].join(' ')}
                        aria-label={
                          header.column.getCanSort()
                            ? `Trier par ${header.column.id}`
                            : undefined
                        }
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <IconChevronUp size={12} />}
                        {header.column.getIsSorted() === 'desc' && <IconChevronDown size={12} />}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[hsl(var(--border))]">
                  {columns.map((_, j) => (
                    <td key={j} className="px-3 py-2.5">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-10 text-center text-[hsl(var(--muted-foreground))] text-sm"
                >
                  Aucune donnée disponible
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2 text-sm text-[hsl(var(--muted-foreground))]">
        <span>
          {table.getFilteredRowModel().rows.length} résultat(s) ·{' '}
          Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Première page"
            className="h-7 w-7"
          >
            <IconChevronsLeft size={14} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Page précédente"
            className="h-7 w-7"
          >
            <IconChevronLeft size={14} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Page suivante"
            className="h-7 w-7"
          >
            <IconChevronRight size={14} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Dernière page"
            className="h-7 w-7"
          >
            <IconChevronsRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

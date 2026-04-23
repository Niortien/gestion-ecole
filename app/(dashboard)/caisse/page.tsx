'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { IconLock } from '@tabler/icons-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { caisseApi } from '@/lib/api/caisse';
import type { Caisse } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function CaissePage() {
  const qc = useQueryClient();
  const [cloturDate, setCloturDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [clotureOpen, setClotureOpen] = useState(false);

  const { data: solde, isLoading: loadingSolde } = useQuery({ queryKey: ['caisse', 'solde'], queryFn: caisseApi.solde });
  const { data: operations = [], isLoading: loadingOps } = useQuery({ queryKey: ['caisse', 'list'], queryFn: () => caisseApi.list({}) });

  const cloturerMutation = useMutation({
    mutationFn: (date: string) => caisseApi.cloturer(date),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['caisse'] }); setClotureOpen(false); },
  });

  const fmtAmount = (v: number) => new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(v);
  const fmtDate = (v: unknown) => { try { return format(new Date(v as string), 'dd/MM/yyyy', { locale: fr }); } catch { return '—'; } };

  const columns: ColumnDef<Caisse, unknown>[] = [
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => fmtDate(getValue()), enableSorting: true },
    { accessorKey: 'soldeOuverture', header: 'Solde ouverture', cell: ({ getValue }) => fmtAmount(getValue() as number) },
    { accessorKey: 'totalEntrees', header: 'Entrées', cell: ({ getValue }) => <span className="font-medium text-green-600">{fmtAmount(getValue() as number)}</span> },
    { accessorKey: 'totalSorties', header: 'Sorties', cell: ({ getValue }) => <span className="font-medium text-red-600">{fmtAmount(getValue() as number)}</span> },
    { accessorKey: 'soldeFermeture', header: 'Solde fermeture', cell: ({ getValue }) => <span className="font-semibold">{fmtAmount(getValue() as number)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Caisse" description="Suivi des entrées et sorties de caisse" action={
        <div className="flex items-center gap-2">
          <div>
            <Label htmlFor="cloturDate" className="sr-only">Date de clôture</Label>
            <Input id="cloturDate" type="date" value={cloturDate} onChange={(e) => setCloturDate(e.target.value)} className="h-9 text-sm" />
          </div>
          <Button variant="outline" size="sm" onClick={() => setClotureOpen(true)}>
            <IconLock size={16} />Clôturer la journée
          </Button>
        </div>
      } />

      {/* Solde card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:col-span-1">
          <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide font-medium">Solde actuel</p>
          {loadingSolde ? <Skeleton className="h-8 w-32 mt-1" /> : (
            <p className={`text-2xl font-bold mt-1 ${(solde?.solde ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {fmtAmount(solde?.solde ?? 0)}
            </p>
          )}
        </div>
        {solde && (
          <>
            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
              <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide font-medium">Total entrées</p>
              <p className="text-xl font-bold mt-1 text-green-600">{fmtAmount(solde.totalEntrees ?? 0)}</p>
            </div>
            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
              <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide font-medium">Total sorties</p>
              <p className="text-xl font-bold mt-1 text-red-600">{fmtAmount(solde.totalSorties ?? 0)}</p>
            </div>
          </>
        )}
      </div>

      <DataTable data={operations} columns={columns} isLoading={loadingOps} searchPlaceholder="Rechercher une opération…" />

      <ConfirmDialog
        open={clotureOpen}
        onOpenChange={setClotureOpen}
        title="Clôturer la journée ?"
        description={`Toutes les opérations du ${format(new Date(cloturDate), 'dd MMMM yyyy', { locale: fr })} seront clôturées.`}
        onConfirm={() => cloturerMutation.mutate(cloturDate)}
        loading={cloturerMutation.isPending}
        confirmLabel="Clôturer"
        variant="destructive"
      />
    </div>
  );
}

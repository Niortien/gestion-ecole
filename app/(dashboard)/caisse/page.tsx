'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { StatCard } from '@/components/common/StatCard';
import { useCaisse, useSoldeCaisse } from '@/features/caisse';
import type { Caisse } from '@/lib/types';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function CaissePage() {
  const { data: lignes, isLoading } = useCaisse();
  const { data: solde } = useSoldeCaisse();

  const columns: ColumnDef<Caisse>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return val ? format(new Date(val), 'dd MMM yyyy', { locale: fr }) : '—';
      },
    },
    {
      accessorKey: 'entrees',
      header: 'Entrées (FCFA)',
      cell: ({ getValue }) => (
        <span className="font-mono text-emerald-600">{((getValue() as number | undefined) ?? 0).toLocaleString('fr-FR')}</span>
      ),
    },
    {
      accessorKey: 'sorties',
      header: 'Sorties (FCFA)',
      cell: ({ getValue }) => (
        <span className="font-mono text-rose-500">{((getValue() as number | undefined) ?? 0).toLocaleString('fr-FR')}</span>
      ),
    },
    {
      accessorKey: 'solde',
      header: 'Solde (FCFA)',
      cell: ({ getValue }) => (
        <span className="font-mono font-semibold">{((getValue() as number | undefined) ?? 0).toLocaleString('fr-FR')}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Caisse"
        description="Tableau de bord financier de la caisse"
        icon={Wallet}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Solde actuel" value={`${(solde?.solde ?? 0).toLocaleString('fr-FR')} FCFA`} icon={DollarSign} color="indigo" />
        <StatCard title="Total entrées" value={`${(solde?.totalEntrees ?? 0).toLocaleString('fr-FR')} FCFA`} icon={TrendingUp} color="emerald" />
        <StatCard title="Total sorties" value={`${(solde?.totalSorties ?? 0).toLocaleString('fr-FR')} FCFA`} icon={TrendingDown} color="rose" />
      </div>

      <DataTable columns={columns} data={lignes ?? []} isLoading={isLoading} searchPlaceholder="Filtrer..." />
    </div>
  );
}

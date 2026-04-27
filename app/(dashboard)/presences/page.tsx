'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { CalendarCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { usePresencesByClasse } from '@/features/presences';
import type { Presence } from '@/lib/types';
import { StatutPresence } from '@/lib/types';
import { cn } from '@/lib/utils';

const STATUT_COLORS: Record<StatutPresence, string> = {
  [StatutPresence.PRESENT]: 'bg-emerald-100 text-emerald-700',
  [StatutPresence.ABSENT]: 'bg-rose-100 text-rose-700',
  [StatutPresence.RETARD]: 'bg-amber-100 text-amber-700',
  [StatutPresence.EXCUSE]: 'bg-blue-100 text-blue-700',
};

export default function PresencesPage() {
  const { data: presences, isLoading } = usePresencesByClasse(0);

  const columns: ColumnDef<Presence>[] = [
    {
      id: 'eleve',
      header: 'Élève',
      cell: ({ row }) => {
        const e = row.original.eleve;
        return e ? `${e.prenom} ${e.nom}` : '—';
      },
    },
    {
      id: 'classe',
      header: 'Classe',
      cell: ({ row }) => row.original.classe?.libelle ?? row.original.classe?.nom ?? '—',
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return val ? format(new Date(val), 'dd MMM yyyy', { locale: fr }) : '—';
      },
    },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: ({ getValue }) => {
        const val = getValue() as StatutPresence;
        return (
          <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', STATUT_COLORS[val])}>
            {val}
          </span>
        );
      },
    },
    {
      accessorKey: 'motif',
      header: 'Motif',
      cell: ({ getValue }) => (getValue() as string | undefined) ?? '—',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Présences"
        description="Suivi des présences des élèves"
        icon={CalendarCheck}
      />
      <DataTable columns={columns} data={presences ?? []} isLoading={isLoading} searchPlaceholder="Rechercher..." />
    </div>
  );
}

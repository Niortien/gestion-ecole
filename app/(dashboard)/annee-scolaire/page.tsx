'use client';

import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { useAnneesScolaires, useActivateAnneeScolaire } from '@/features/annees-scolaires';
import type { AnneeScolaire } from '@/lib/types';

export default function AnneeScolairePage() {
  const { data: annees, isLoading } = useAnneesScolaires();
  const activate = useActivateAnneeScolaire();

  const columns: ColumnDef<AnneeScolaire>[] = [
    { accessorKey: 'libelle', header: 'Libellé', cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
    {
      accessorKey: 'dateDebut',
      header: 'Début',
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return val ? format(new Date(val), 'dd MMM yyyy', { locale: fr }) : '—';
      },
    },
    {
      accessorKey: 'dateFin',
      header: 'Fin',
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return val ? format(new Date(val), 'dd MMM yyyy', { locale: fr }) : '—';
      },
    },
    {
      accessorKey: 'estActive',
      header: 'Statut',
      cell: ({ getValue }) => (
        <Badge variant={(getValue() as boolean) ? 'default' : 'secondary'} className="text-xs">
          {(getValue() as boolean) ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        !row.original.estActive ? (
          <Button
            variant="outline" size="sm" className="h-7 text-xs"
            onClick={() => activate.mutate(row.original.id)}
            disabled={activate.isPending}
          >
            Activer
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Années scolaires"
        description="Gestion des années scolaires"
        icon={Calendar}
        actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Nouvelle année</Button>}
      />
      <DataTable columns={columns} data={annees ?? []} isLoading={isLoading} searchPlaceholder="Rechercher..." />
    </div>
  );
}

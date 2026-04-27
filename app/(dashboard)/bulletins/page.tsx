'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { useBulletinsByClasse } from '@/features/bulletins';
import type { Bulletin } from '@/lib/types';

export default function BulletinsPage() {
  const { data: bulletins, isLoading } = useBulletinsByClasse(0);

  const columns: ColumnDef<Bulletin>[] = [
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
    { accessorKey: 'periode', header: 'Période' },
    {
      accessorKey: 'moyenne',
      header: 'Moyenne',
      cell: ({ getValue }) => {
        const val = getValue() as number | undefined;
        return val != null ? <span className="font-mono font-semibold">{val.toFixed(2)}/20</span> : '—';
      },
    },
    {
      accessorKey: 'rang',
      header: 'Rang',
      cell: ({ getValue }) => {
        const val = getValue() as number | undefined;
        return val != null ? <span className="font-mono">{val}e</span> : '—';
      },
    },
    {
      accessorKey: 'publie',
      header: 'Publié',
      cell: ({ getValue }) => (
        <Badge variant={(getValue() as boolean) ? 'default' : 'secondary'} className="text-xs">
          {(getValue() as boolean) ? 'Publié' : 'Brouillon'}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Bulletins"
        description="Bulletins scolaires des élèves"
        icon={FileText}
      />
      <DataTable columns={columns} data={bulletins ?? []} isLoading={isLoading} searchPlaceholder="Rechercher un bulletin..." />
    </div>
  );
}

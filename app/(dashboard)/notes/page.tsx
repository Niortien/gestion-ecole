'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { ClipboardList } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { useNotesByClasse } from '@/features/notes';
import type { Note } from '@/lib/types';

export default function NotesPage() {
  const { data: notes, isLoading } = useNotesByClasse(0);

  const columns: ColumnDef<Note>[] = [
    {
      id: 'eleve',
      header: 'Élève',
      cell: ({ row }) => {
        const e = row.original.eleve;
        return e ? `${e.prenom} ${e.nom}` : '—';
      },
    },
    {
      id: 'matiere',
      header: 'Matière',
      cell: ({ row }) => row.original.matiere?.nom ?? '—',
    },
    {
      id: 'classe',
      header: 'Classe',
      cell: ({ row }) => row.original.classe?.libelle ?? row.original.classe?.nom ?? '—',
    },
    {
      accessorKey: 'periode',
      header: 'Période',
    },
    {
      accessorKey: 'valeur',
      header: 'Note',
      cell: ({ getValue }) => (
        <span className="font-mono font-semibold">{getValue() as number}/20</span>
      ),
    },
    {
      accessorKey: 'observation',
      header: 'Observation',
      cell: ({ getValue }) => (getValue() as string | undefined) ?? '—',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Notes"
        description="Gestion des notes des élèves"
        icon={ClipboardList}
      />
      <DataTable columns={columns} data={notes ?? []} isLoading={isLoading} searchPlaceholder="Rechercher une note..." />
    </div>
  );
}

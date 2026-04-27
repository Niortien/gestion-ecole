'use client';

import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { ClipboardList } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { useNotesByClasse, useNotesByEleve } from '@/features/notes';
import { useMonProfilParent } from '@/features/parents';
import { useEleves } from '@/features/eleves';
import { useAuthStore } from '@/stores/auth.store';
import { useAppStore } from '@/stores/app.store';
import { UserRole, type Note } from '@/lib/types';

export default function NotesPage() {
  const { user } = useAuthStore();
  const { activeAnneeScolaire } = useAppStore();
  const isParent = user?.role === UserRole.PARENT;

  const [selectedEleveId, setSelectedEleveId] = useState<number | undefined>();

  const { data: parentProfil } = useMonProfilParent();
  const { data: mesEnfants } = useEleves({ parentId: parentProfil?.id });

  const { data: notesAdmin, isLoading: loadingAdmin } = useNotesByClasse(isParent ? 0 : 0);
  const { data: notesEleve, isLoading: loadingEleve } = useNotesByEleve(
    selectedEleveId ?? 0,
    { anneeScolaireId: activeAnneeScolaire?.id },
  );

  const notes = isParent ? (notesEleve ?? []) : (notesAdmin ?? []);
  const isLoading = isParent ? loadingEleve : loadingAdmin;

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
    <div className="space-y-4">
      <PageHeader
        title="Notes"
        description={isParent ? 'Notes scolaires de vos enfants' : 'Gestion des notes des élèves'}
        icon={ClipboardList}
      />
      {isParent && mesEnfants && mesEnfants.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Enfant :</span>
          <Select
            value={selectedEleveId?.toString() ?? ''}
            onValueChange={(v) => setSelectedEleveId(Number(v))}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Sélectionner un enfant" />
            </SelectTrigger>
            <SelectContent>
              {mesEnfants.map((e) => (
                <SelectItem key={e.id} value={e.id.toString()}>
                  {e.prenom} {e.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <DataTable columns={columns} data={notes} isLoading={isLoading} searchPlaceholder="Rechercher une note..." />
    </div>
  );
}


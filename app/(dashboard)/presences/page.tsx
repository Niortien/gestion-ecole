'use client';

import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { CalendarCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { usePresencesByClasse, usePresencesByEleve } from '@/features/presences';
import { useMonProfilParent } from '@/features/parents';
import { useEleves } from '@/features/eleves';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole, type Presence, StatutPresence } from '@/lib/types';
import { cn } from '@/lib/utils';

const STATUT_COLORS: Record<StatutPresence, string> = {
  [StatutPresence.PRESENT]: 'bg-emerald-100 text-emerald-700',
  [StatutPresence.ABSENT]: 'bg-rose-100 text-rose-700',
  [StatutPresence.RETARD]: 'bg-amber-100 text-amber-700',
  [StatutPresence.EXCUSE]: 'bg-blue-100 text-blue-700',
};

export default function PresencesPage() {
  const { user } = useAuthStore();
  const isParent = user?.role === UserRole.PARENT;

  const [selectedEleveId, setSelectedEleveId] = useState<number | undefined>();

  const { data: parentProfil } = useMonProfilParent();
  const { data: mesEnfants } = useEleves({ parentId: parentProfil?.id });

  const { data: presencesAdmin, isLoading: loadingAdmin } = usePresencesByClasse(isParent ? 0 : 0);
  const { data: presencesEleve, isLoading: loadingEleve } = usePresencesByEleve(selectedEleveId ?? 0);

  const presences = isParent ? (presencesEleve ?? []) : (presencesAdmin ?? []);
  const isLoading = isParent ? loadingEleve : loadingAdmin;

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
    <div className="space-y-4">
      <PageHeader
        title="Présences"
        description={isParent ? 'Suivi des présences de vos enfants' : 'Suivi des présences des élèves'}
        icon={CalendarCheck}
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
      <DataTable columns={columns} data={presences} isLoading={isLoading} searchPlaceholder="Rechercher..." />
    </div>
  );
}


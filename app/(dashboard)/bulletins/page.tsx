'use client';

import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { useBulletinsByClasse, useBulletinsByEleve } from '@/features/bulletins';
import { useMonProfilParent } from '@/features/parents';
import { useAuthStore } from '@/stores/auth.store';
import { useAppStore } from '@/stores/app.store';
import { UserRole, type Bulletin } from '@/lib/types';

export default function BulletinsPage() {
  const { user } = useAuthStore();
  const { activeAnneeScolaire } = useAppStore();
  const isParent = user?.role === UserRole.PARENT;

  const [selectedEleveId, setSelectedEleveId] = useState<number | undefined>();

  const { data: parentProfil } = useMonProfilParent();
  const mesEnfants = parentProfil?.eleves;

  const { data: bulletinsAdmin, isLoading: loadingAdmin } = useBulletinsByClasse(isParent ? 0 : 0);
  const { data: bulletinsEleve, isLoading: loadingEleve } = useBulletinsByEleve(
    selectedEleveId ?? 0,
    { anneeScolaireId: activeAnneeScolaire?.id },
  );

  const bulletins = isParent ? (bulletinsEleve ?? []) : (bulletinsAdmin ?? []);
  const isLoading = isParent ? loadingEleve : loadingAdmin;

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
    <div className="space-y-4">
      <PageHeader
        title="Bulletins"
        description={isParent ? 'Bulletins scolaires de vos enfants' : 'Bulletins scolaires des élèves'}
        icon={FileText}
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
      <DataTable
        columns={columns}
        data={bulletins}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un bulletin..."
      />
    </div>
  );
}


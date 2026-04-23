'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { IconRefresh, IconCheck, IconFileText } from '@tabler/icons-react';
import { bulletinsApi, type GenererBulletinsDto } from '@/lib/api/bulletins';
import { classesApi } from '@/lib/api/classes';
import { anneesScolairesApi } from '@/lib/api/annees-scolaires';
import type { Bulletin } from '@/lib/types';
import { Periode } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { FormDialog } from '@/components/ui/form-dialog';

const PERIODE_LABELS: Record<Periode, string> = {
  SEQUENCE1: 'Séquence 1', SEQUENCE2: 'Séquence 2', SEQUENCE3: 'Séquence 3',
  SEQUENCE4: 'Séquence 4', SEQUENCE5: 'Séquence 5', SEQUENCE6: 'Séquence 6',
};

export default function BulletinsPage() {
  const qc = useQueryClient();
  const [genOpen, setGenOpen] = useState(false);
  const [classeId, setClasseId] = useState('');
  const [periode, setPeriode] = useState<Periode>(Periode.SEQUENCE1);
  const [loadList, setLoadList] = useState(false);
  const [genForm, setGenForm] = useState<GenererBulletinsDto>({ classeId: 0, anneeScolaireId: 0, periode: Periode.SEQUENCE1 });

  const { data: anneeActive } = useQuery({ queryKey: ['annees-scolaires', 'active'], queryFn: anneesScolairesApi.active });
  const { data: classes = [] } = useQuery({ queryKey: ['classes', anneeActive?.id], queryFn: () => classesApi.list({ anneeScolaireId: anneeActive?.id }), enabled: !!anneeActive });

  const { data: bulletins = [], isLoading } = useQuery({
    queryKey: ['bulletins', 'classe', classeId, periode, anneeActive?.id],
    queryFn: () => bulletinsApi.byClasse(Number(classeId), { anneeScolaireId: anneeActive!.id, periode }),
    enabled: !!classeId && !!anneeActive && loadList,
  });

  const genMutation = useMutation({
    mutationFn: (dto: GenererBulletinsDto) => bulletinsApi.generer(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bulletins'] }); setGenOpen(false); },
  });
  const publierMutation = useMutation({
    mutationFn: (id: number) => bulletinsApi.publier(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bulletins'] }),
  });

  const handleGen = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!anneeActive) return;
    genMutation.mutate({ ...genForm, anneeScolaireId: anneeActive.id });
  };

  const columns: ColumnDef<Bulletin, unknown>[] = [
    { id: 'eleve', header: 'Élève', accessorFn: (r) => `${r.eleve?.nom} ${r.eleve?.prenom}`, enableSorting: true },
    { accessorKey: 'periode', header: 'Séquence', cell: ({ getValue }) => PERIODE_LABELS[getValue() as Periode] },
    {
      accessorKey: 'moyenne', header: 'Moyenne',
      cell: ({ getValue }) => {
        const v = getValue() as number | undefined;
        if (v == null) return '—';
        const color = v >= 10 ? 'text-green-600' : 'text-red-600';
        return <span className={`font-semibold ${color}`}>{Number(v).toFixed(2)}</span>;
      },
    },
    { accessorKey: 'rang', header: 'Rang', cell: ({ getValue }) => (getValue() as number | undefined) ?? '—' },
    { accessorKey: 'appreciation', header: 'Appréciation', cell: ({ getValue }) => (getValue() as string | undefined) ?? '—' },
    {
      accessorKey: 'publie', header: 'Publié',
      cell: ({ getValue }) => getValue() ? <Badge variant="success">Publié</Badge> : <Badge variant="secondary">Brouillon</Badge>,
    },
    {
      id: 'pdf', header: 'PDF',
      cell: ({ row }) => row.original.pdfUrl ? (
        <a href={`http://localhost:8000/${row.original.pdfUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[hsl(var(--primary))] hover:underline text-xs">
          <IconFileText size={14} />Voir
        </a>
      ) : '—',
    },
    {
      id: 'actions', header: '',
      cell: ({ row }) => !row.original.publie ? (
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => publierMutation.mutate(row.original.id)} loading={publierMutation.isPending}>
          <IconCheck size={12} />Publier
        </Button>
      ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Bulletins" description="Génération et consultation des bulletins" action={
        <Button size="sm" onClick={() => { setGenForm({ classeId: 0, anneeScolaireId: anneeActive?.id ?? 0, periode: Periode.SEQUENCE1 }); setGenOpen(true); }}>
          <IconRefresh size={16} />Générer des bulletins
        </Button>
      } />

      <div className="flex flex-wrap items-end gap-3 mb-6 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="space-y-1"><Label htmlFor="bClasse">Classe</Label>
          <Select id="bClasse" value={classeId} onChange={(e) => { setClasseId(e.target.value); setLoadList(false); }} placeholder="— Sélectionner —">
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </Select></div>
        <div className="space-y-1"><Label htmlFor="bPeriode">Séquence</Label>
          <Select id="bPeriode" value={periode} onChange={(e) => setPeriode(e.target.value as Periode)}>
            {Object.entries(PERIODE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select></div>
        <Button onClick={() => setLoadList(true)} disabled={!classeId} size="sm">Charger</Button>
      </div>

      {loadList && <DataTable data={bulletins} columns={columns} isLoading={isLoading} searchPlaceholder="Rechercher un élève…" />}

      <FormDialog open={genOpen} onOpenChange={setGenOpen} title="Générer les bulletins" onSubmit={handleGen} loading={genMutation.isPending} submitLabel="Générer">
        <div className="space-y-1"><Label htmlFor="genClasse">Classe *</Label>
          <Select id="genClasse" value={genForm.classeId?.toString() ?? ''} onChange={(e) => setGenForm({ ...genForm, classeId: Number(e.target.value) })} placeholder="— Sélectionner —">
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </Select></div>
        <div className="space-y-1"><Label htmlFor="genPeriode">Séquence *</Label>
          <Select id="genPeriode" value={genForm.periode} onChange={(e) => setGenForm({ ...genForm, periode: e.target.value as Periode })}>
            {Object.entries(PERIODE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select></div>
      </FormDialog>
    </div>
  );
}

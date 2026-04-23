'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { IconPlus, IconPencil, IconTrash, IconCheck, IconCalendar, IconBook } from '@tabler/icons-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { anneesScolairesApi, type CreateAnneeScolaireDto } from '@/lib/api/annees-scolaires';
import { matieresApi, type CreateMatiereDto } from '@/lib/api/matieres';
import type { AnneeScolaire, Matiere } from '@/lib/types';
import { NiveauMatiere } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { FormDialog } from '@/components/ui/form-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { NiveauBadge } from '@/components/ui/status-badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// ───────────────────────── Années scolaires ──────────────────────────

const EMPTY_ANNEE: CreateAnneeScolaireDto = { libelle: '', dateDebut: '', dateFin: '' };

function AnneesTab() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<AnneeScolaire | null>(null);
  const [form, setForm] = useState<CreateAnneeScolaireDto>(EMPTY_ANNEE);
  const [deleteTarget, setDeleteTarget] = useState<AnneeScolaire | null>(null);

  const { data: annees = [], isLoading } = useQuery({ queryKey: ['annees-scolaires'], queryFn: anneesScolairesApi.list });
  const createMutation = useMutation({ mutationFn: (dto: CreateAnneeScolaireDto) => anneesScolairesApi.create(dto), onSuccess: () => { qc.invalidateQueries({ queryKey: ['annees-scolaires'] }); setFormOpen(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateAnneeScolaireDto> }) => anneesScolairesApi.update(id, dto), onSuccess: () => { qc.invalidateQueries({ queryKey: ['annees-scolaires'] }); setFormOpen(false); } });
  const deleteMutation = useMutation({ mutationFn: (id: number) => anneesScolairesApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['annees-scolaires'] }); setDeleteOpen(false); } });
  const activerMutation = useMutation({ mutationFn: (id: number) => anneesScolairesApi.activate(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['annees-scolaires'] }) });

  const openCreate = () => { setEditing(null); setForm(EMPTY_ANNEE); setFormOpen(true); };
  const openEdit = (a: AnneeScolaire) => {
    setEditing(a);
    setForm({ libelle: a.libelle, dateDebut: a.dateDebut?.slice(0, 10) ?? '', dateFin: a.dateFin?.slice(0, 10) ?? '' });
    setFormOpen(true);
  };
  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, dto: form });
    else createMutation.mutate(form);
  };
  const fmtDate = (v: unknown) => { try { return v ? format(new Date(v as string), 'dd/MM/yyyy', { locale: fr }) : '—'; } catch { return '—'; } };

  const columns: ColumnDef<AnneeScolaire, unknown>[] = [
    { accessorKey: 'libelle', header: 'Libellé', enableSorting: true },
    { accessorKey: 'dateDebut', header: 'Début', cell: ({ getValue }) => fmtDate(getValue()) },
    { accessorKey: 'dateFin', header: 'Fin', cell: ({ getValue }) => fmtDate(getValue()) },
    {
    { accessorKey: 'estActive', header: 'Statut',
      cell: ({ getValue }) => getValue() ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>,
    },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {!row.original.estActive && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => activerMutation.mutate(row.original.id)} loading={activerMutation.isPending}>
              <IconCheck size={12} />Activer
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Modifier" onClick={() => openEdit(row.original)}><IconPencil size={14} /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-[hsl(var(--destructive))]" aria-label="Supprimer" onClick={() => { setDeleteTarget(row.original); setDeleteOpen(true); }}><IconTrash size={14} /></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} size="sm"><IconPlus size={16} />Nouvelle année</Button>
      </div>
      <DataTable data={annees} columns={columns} isLoading={isLoading} searchPlaceholder="Rechercher une année…" />
      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? 'Modifier l\'année' : 'Nouvelle année scolaire'} onSubmit={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
        <div className="space-y-1"><Label htmlFor="annLib">Libellé *</Label><Input id="annLib" value={form.libelle} placeholder="ex: 2024-2025" onChange={(e) => setForm({ ...form, libelle: e.target.value })} required /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label htmlFor="annDebut">Date de début *</Label><Input id="annDebut" type="date" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} required /></div>
          <div className="space-y-1"><Label htmlFor="annFin">Date de fin *</Label><Input id="annFin" type="date" value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} required /></div>
        </div>
      </FormDialog>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Supprimer cette année ?" description={deleteTarget?.libelle} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} loading={deleteMutation.isPending} confirmLabel="Supprimer" />
    </>
  );
}

// ───────────────────────── Matières ──────────────────────────

const EMPTY_MAT: CreateMatiereDto = { nom: '', code: '', coefficient: 1, niveau: NiveauMatiere.TOUS };

const NIVEAUX: { value: NiveauMatiere; label: string }[] = [
  { value: NiveauMatiere.MATERNELLE, label: 'Maternelle' },
  { value: NiveauMatiere.PRIMAIRE, label: 'Primaire' },
  { value: NiveauMatiere.TOUS, label: 'Tous niveaux' },
];

function MatieresTab() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Matiere | null>(null);
  const [form, setForm] = useState<CreateMatiereDto>(EMPTY_MAT);
  const [deleteTarget, setDeleteTarget] = useState<Matiere | null>(null);

  const { data: matieres = [], isLoading } = useQuery({ queryKey: ['matieres'], queryFn: matieresApi.list });
  const createMutation = useMutation({ mutationFn: (dto: CreateMatiereDto) => matieresApi.create(dto), onSuccess: () => { qc.invalidateQueries({ queryKey: ['matieres'] }); setFormOpen(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateMatiereDto> }) => matieresApi.update(id, dto), onSuccess: () => { qc.invalidateQueries({ queryKey: ['matieres'] }); setFormOpen(false); } });
  const deleteMutation = useMutation({ mutationFn: (id: number) => matieresApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['matieres'] }); setDeleteOpen(false); } });

  const openCreate = () => { setEditing(null); setForm(EMPTY_MAT); setFormOpen(true); };
  const openEdit = (m: Matiere) => {
    setEditing(m);
    setForm({ nom: m.nom, code: m.code, coefficient: m.coefficient, niveau: m.niveau });
    setFormOpen(true);
  };
  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, dto: form });
    else createMutation.mutate(form);
  };

  const columns: ColumnDef<Matiere, unknown>[] = [
    { accessorKey: 'nom', header: 'Nom', enableSorting: true },
    { accessorKey: 'code', header: 'Code' },
    { accessorKey: 'coefficient', header: 'Coeff.' },
    { accessorKey: 'niveau', header: 'Niveau', cell: ({ row }) => <NiveauBadge niveau={row.original.niveau} /> },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Modifier" onClick={() => openEdit(row.original)}><IconPencil size={14} /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-[hsl(var(--destructive))]" aria-label="Supprimer" onClick={() => { setDeleteTarget(row.original); setDeleteOpen(true); }}><IconTrash size={14} /></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} size="sm"><IconPlus size={16} />Nouvelle matière</Button>
      </div>
      <DataTable data={matieres} columns={columns} isLoading={isLoading} searchPlaceholder="Rechercher une matière…" />
      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? 'Modifier la matière' : 'Nouvelle matière'} onSubmit={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label htmlFor="matNom">Nom *</Label><Input id="matNom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required /></div>
          <div className="space-y-1"><Label htmlFor="matCode">Code *</Label><Input id="matCode" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="ex: MATH" required /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label htmlFor="matCoeff">Coefficient *</Label><Input id="matCoeff" type="number" min={1} max={10} step={0.5} value={form.coefficient} onChange={(e) => setForm({ ...form, coefficient: Number(e.target.value) })} required /></div>
          <div className="space-y-1"><Label htmlFor="matNiveau">Niveau</Label>
            <Select id="matNiveau" value={form.niveau} onChange={(e) => setForm({ ...form, niveau: e.target.value as NiveauMatiere })}>
              {NIVEAUX.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
            </Select></div>
        </div>
      </FormDialog>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Supprimer cette matière ?" description={deleteTarget?.nom} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} loading={deleteMutation.isPending} confirmLabel="Supprimer" />
    </>
  );
}

// ───────────────────────── Page ──────────────────────────

export default function ParametresPage() {
  return (
    <div>
      <PageHeader title="Paramètres" description="Configuration générale de l'établissement" />
      <Tabs defaultValue="annees">
        <TabsList>
          <TabsTrigger value="annees"><IconCalendar size={15} className="mr-1.5" />Années scolaires</TabsTrigger>
          <TabsTrigger value="matieres"><IconBook size={15} className="mr-1.5" />Matières</TabsTrigger>
        </TabsList>
        <TabsContent value="annees"><AnneesTab /></TabsContent>
        <TabsContent value="matieres"><MatieresTab /></TabsContent>
      </Tabs>
    </div>
  );
}

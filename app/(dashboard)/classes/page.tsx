'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import { classesApi, type CreateClasseDto } from '@/lib/api/classes';
import { anneesScolairesApi } from '@/lib/api/annees-scolaires';
import type { Classe } from '@/lib/types';
import { NomClasse, NiveauClasse } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { PageHeader } from '@/components/ui/page-header';
import { FormDialog } from '@/components/ui/form-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { NiveauBadge } from '@/components/ui/status-badge';

const EMPTY: CreateClasseDto = { nom: NomClasse.CP, niveau: NiveauClasse.PRIMAIRE, capacite: 30, anneeScolaireId: 0 };

export default function ClassesPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Classe | null>(null);
  const [form, setForm] = useState<CreateClasseDto>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<Classe | null>(null);

  const { data: anneeActive } = useQuery({ queryKey: ['annees-scolaires', 'active'], queryFn: anneesScolairesApi.active });
  const { data: annees = [] } = useQuery({ queryKey: ['annees-scolaires'], queryFn: anneesScolairesApi.list });

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes', anneeActive?.id],
    queryFn: () => classesApi.list({ anneeScolaireId: anneeActive?.id }),
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateClasseDto) => classesApi.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes'] }); setFormOpen(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateClasseDto> }) => classesApi.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes'] }); setFormOpen(false); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => classesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes'] }); setDeleteOpen(false); },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, anneeScolaireId: anneeActive?.id ?? 0 });
    setFormOpen(true);
  };
  const openEdit = (c: Classe) => {
    setEditing(c);
    setForm({ nom: c.nom, libelle: c.libelle ?? '', niveau: c.niveau, capacite: c.capacite, anneeScolaireId: c.anneeScolaire?.id ?? 0 });
    setFormOpen(true);
  };
  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, dto: form });
    else createMutation.mutate(form);
  };

  const columns: ColumnDef<Classe, unknown>[] = [
    { accessorKey: 'nom', header: 'Nom', enableSorting: true },
    { accessorKey: 'libelle', header: 'Libellé', cell: ({ getValue }) => (getValue() as string) || '—' },
    { accessorKey: 'niveau', header: 'Niveau', cell: ({ row }) => <NiveauBadge niveau={row.original.niveau} /> },
    { accessorKey: 'capacite', header: 'Capacité' },
    { id: 'annee', header: 'Année scolaire', accessorFn: (r) => r.anneeScolaire?.libelle ?? '—' },
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
    <div>
      <PageHeader title="Classes" description="Gestion des classes" action={<Button onClick={openCreate} size="sm"><IconPlus size={16} />Ajouter une classe</Button>} />
      <DataTable data={classes} columns={columns} isLoading={isLoading} searchPlaceholder="Rechercher une classe…" />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? 'Modifier la classe' : 'Ajouter une classe'} onSubmit={handleSubmit} loading={createMutation.isPending || updateMutation.isPending} submitLabel={editing ? 'Enregistrer' : 'Ajouter'}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="nomClasse">Nom *</Label>
            <Select id="nomClasse" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value as NomClasse })}>
              {Object.values(NomClasse).map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="niveauClasse">Niveau *</Label>
            <Select id="niveauClasse" value={form.niveau} onChange={(e) => setForm({ ...form, niveau: e.target.value as NiveauClasse })}>
              <option value={NiveauClasse.MATERNELLE}>Maternelle</option>
              <option value={NiveauClasse.PRIMAIRE}>Primaire</option>
            </Select>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="libelle">Libellé</Label>
          <Input id="libelle" value={form.libelle ?? ''} onChange={(e) => setForm({ ...form, libelle: e.target.value })} placeholder="ex: CP A" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="capacite">Capacité</Label>
          <Input id="capacite" type="number" min={1} value={form.capacite ?? 30} onChange={(e) => setForm({ ...form, capacite: Number(e.target.value) })} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="anneeScolaireId">Année scolaire *</Label>
          <Select id="anneeScolaireId" value={form.anneeScolaireId.toString()} onChange={(e) => setForm({ ...form, anneeScolaireId: Number(e.target.value) })} placeholder="— Sélectionner —">
            {annees.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
          </Select>
        </div>
      </FormDialog>

      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Supprimer cette classe ?" description={deleteTarget ? `La classe ${deleteTarget.nom} sera supprimée.` : ''} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} loading={deleteMutation.isPending} confirmLabel="Supprimer" />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import { fraisScolariteApi, type CreateFraisScolariteDto } from '@/lib/api/frais-scolarite';
import { classesApi } from '@/lib/api/classes';
import { anneesScolairesApi } from '@/lib/api/annees-scolaires';
import type { FraisScolarite } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { FormDialog } from '@/components/ui/form-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const EMPTY: CreateFraisScolariteDto = { libelle: '', montant: 0, anneeScolaireId: 0, obligatoire: true };

export default function FraisScolaritePage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<FraisScolarite | null>(null);
  const [form, setForm] = useState<CreateFraisScolariteDto>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<FraisScolarite | null>(null);

  const { data: anneeActive } = useQuery({ queryKey: ['annees-scolaires', 'active'], queryFn: anneesScolairesApi.active });
  const { data: classes = [] } = useQuery({ queryKey: ['classes', anneeActive?.id], queryFn: () => classesApi.list({ anneeScolaireId: anneeActive?.id }), enabled: !!anneeActive });
  const { data: frais = [], isLoading } = useQuery({ queryKey: ['frais-scolarite', anneeActive?.id], queryFn: () => fraisScolariteApi.list({ anneeScolaireId: anneeActive?.id }), enabled: !!anneeActive });

  const createMutation = useMutation({ mutationFn: (dto: CreateFraisScolariteDto) => fraisScolariteApi.create(dto), onSuccess: () => { qc.invalidateQueries({ queryKey: ['frais-scolarite'] }); setFormOpen(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateFraisScolariteDto> }) => fraisScolariteApi.update(id, dto), onSuccess: () => { qc.invalidateQueries({ queryKey: ['frais-scolarite'] }); setFormOpen(false); } });
  const deleteMutation = useMutation({ mutationFn: (id: number) => fraisScolariteApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['frais-scolarite'] }); setDeleteOpen(false); } });

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY, anneeScolaireId: anneeActive?.id ?? 0 }); setFormOpen(true); };
  const openEdit = (f: FraisScolarite) => {
    setEditing(f);
    setForm({ libelle: f.libelle, montant: f.montant, anneeScolaireId: f.anneeScolaire?.id ?? 0, classeId: f.classe?.id, obligatoire: f.obligatoire });
    setFormOpen(true);
  };
  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, dto: form });
    else createMutation.mutate(form);
  };

  const fmtAmount = (v: number) => new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(v);

  const columns: ColumnDef<FraisScolarite, unknown>[] = [
    { accessorKey: 'libelle', header: 'Libellé', enableSorting: true },
    { accessorKey: 'montant', header: 'Montant', cell: ({ getValue }) => <span className="font-semibold">{fmtAmount(getValue() as number)}</span> },
    { id: 'classe', header: 'Classe', accessorFn: (r) => r.classe?.nom ?? 'Toutes les classes', cell: ({ getValue }) => <span className="text-sm">{getValue() as string}</span> },
    {
      accessorKey: 'obligatoire', header: 'Obligatoire',
      cell: ({ getValue }) => getValue() ? <Badge variant="success">Obligatoire</Badge> : <Badge variant="secondary">Facultatif</Badge>,
    },
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
      <PageHeader title="Frais de scolarité" description="Gestion des types de frais scolaires" action={<Button onClick={openCreate} size="sm" disabled={!anneeActive}><IconPlus size={16} />Ajouter des frais</Button>} />
      <DataTable data={frais} columns={columns} isLoading={isLoading} searchPlaceholder="Rechercher…" />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? 'Modifier les frais' : 'Ajouter des frais'} onSubmit={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
        <div className="space-y-1"><Label htmlFor="fsLib">Libellé *</Label><Input id="fsLib" value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} required /></div>
        <div className="space-y-1"><Label htmlFor="fsMontant">Montant (FCFA) *</Label><Input id="fsMontant" type="number" min={0} value={form.montant} onChange={(e) => setForm({ ...form, montant: Number(e.target.value) })} required /></div>
        <div className="space-y-1"><Label htmlFor="fsClasse">Classe (laisser vide = toutes)</Label>
          <Select id="fsClasse" value={form.classeId?.toString() ?? ''} onChange={(e) => setForm({ ...form, classeId: e.target.value ? Number(e.target.value) : undefined })} placeholder="— Toutes les classes —">
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </Select></div>
        <div className="flex items-center gap-2">
          <input id="fsOblig" type="checkbox" checked={form.obligatoire} onChange={(e) => setForm({ ...form, obligatoire: e.target.checked })} className="h-4 w-4 rounded border-[hsl(var(--input))]" />
          <Label htmlFor="fsOblig">Obligatoire</Label>
        </div>
      </FormDialog>

      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Supprimer ces frais ?" description={deleteTarget?.libelle} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} loading={deleteMutation.isPending} confirmLabel="Supprimer" />
    </div>
  );
}

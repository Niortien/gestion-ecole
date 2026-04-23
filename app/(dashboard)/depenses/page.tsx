'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { depensesApi, type CreateDepenseDto } from '@/lib/api/depenses';
import type { Depense } from '@/lib/types';
import { CategorieDepense } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/ui/page-header';
import { FormDialog } from '@/components/ui/form-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CategorieDepenseBadge } from '@/components/ui/status-badge';

const EMPTY: CreateDepenseDto = { libelle: '', montant: 0, categorie: CategorieDepense.AUTRE, date: '' };

const CATS: { value: CategorieDepense; label: string }[] = [
  { value: CategorieDepense.SALAIRE, label: 'Salaire' },
  { value: CategorieDepense.FOURNITURES, label: 'Fournitures' },
  { value: CategorieDepense.MAINTENANCE, label: 'Maintenance' },
  { value: CategorieDepense.EAU_ELECTRICITE, label: 'Eau / Électricité' },
  { value: CategorieDepense.COMMUNICATION, label: 'Communication' },
  { value: CategorieDepense.AUTRE, label: 'Autre' },
];

export default function DepensesPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Depense | null>(null);
  const [form, setForm] = useState<CreateDepenseDto>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<Depense | null>(null);

  const { data: depenses = [], isLoading } = useQuery({ queryKey: ['depenses'], queryFn: () => depensesApi.list({}) });

  const createMutation = useMutation({ mutationFn: (dto: CreateDepenseDto) => depensesApi.create(dto), onSuccess: () => { qc.invalidateQueries({ queryKey: ['depenses'] }); setFormOpen(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateDepenseDto> }) => depensesApi.update(id, dto), onSuccess: () => { qc.invalidateQueries({ queryKey: ['depenses'] }); setFormOpen(false); } });
  const deleteMutation = useMutation({ mutationFn: (id: number) => depensesApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['depenses'] }); setDeleteOpen(false); } });

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY, date: format(new Date(), 'yyyy-MM-dd') }); setFormOpen(true); };
  const openEdit = (d: Depense) => {
    setEditing(d);
    setForm({ libelle: d.libelle, montant: d.montant, categorie: d.categorie, date: d.date?.slice(0, 10) ?? '', description: d.description ?? '' });
    setFormOpen(true);
  };
  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, dto: form });
    else createMutation.mutate(form);
  };

  const fmtAmount = (v: number) => new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(v);
  const fmtDate = (v: unknown) => { try { return format(new Date(v as string), 'dd/MM/yyyy', { locale: fr }); } catch { return '—'; } };

  const totalDepenses = depenses.reduce((sum, d) => sum + (d.montant ?? 0), 0);

  const columns: ColumnDef<Depense, unknown>[] = [
    { accessorKey: 'libelle', header: 'Libellé', enableSorting: true },
    { accessorKey: 'montant', header: 'Montant', cell: ({ getValue }) => <span className="font-semibold">{fmtAmount(getValue() as number)}</span> },
    { accessorKey: 'categorie', header: 'Catégorie', cell: ({ row }) => <CategorieDepenseBadge categorie={row.original.categorie} /> },
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => fmtDate(getValue()), enableSorting: true },
    { accessorKey: 'description', header: 'Description', cell: ({ getValue }) => <span className="text-[hsl(var(--muted-foreground))] text-xs">{(getValue() as string) || '—'}</span> },
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
      <PageHeader
        title="Dépenses"
        description="Enregistrement et suivi des dépenses de l'école"
        action={<Button onClick={openCreate} size="sm"><IconPlus size={16} />Ajouter une dépense</Button>}
      />

      {/* Summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide font-medium">Total des dépenses</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{fmtAmount(totalDepenses)}</p>
        </div>
      </div>

      <DataTable data={depenses} columns={columns} isLoading={isLoading} searchPlaceholder="Rechercher une dépense…" />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? 'Modifier la dépense' : 'Ajouter une dépense'} onSubmit={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
        <div className="space-y-1"><Label htmlFor="depLib">Libellé *</Label><Input id="depLib" value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} required /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label htmlFor="depMontant">Montant (FCFA) *</Label><Input id="depMontant" type="number" min={0} value={form.montant} onChange={(e) => setForm({ ...form, montant: Number(e.target.value) })} required /></div>
          <div className="space-y-1"><Label htmlFor="depDate">Date *</Label><Input id="depDate" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
        </div>
        <div className="space-y-1"><Label htmlFor="depCat">Catégorie *</Label>
          <Select id="depCat" value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value as CategorieDepense })}>
            {CATS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select></div>
        <div className="space-y-1"><Label htmlFor="depDesc">Description</Label><Textarea id="depDesc" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
      </FormDialog>

      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Supprimer cette dépense ?" description={deleteTarget?.libelle} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} loading={deleteMutation.isPending} confirmLabel="Supprimer" />
    </div>
  );
}

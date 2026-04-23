'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { devoirsApi, type CreateDevoirDto } from '@/lib/api/devoirs';
import { classesApi } from '@/lib/api/classes';
import { matieresApi } from '@/lib/api/matieres';
import { anneesScolairesApi } from '@/lib/api/annees-scolaires';
import type { Devoir } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/ui/page-header';
import { FormDialog } from '@/components/ui/form-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const EMPTY: CreateDevoirDto = { titre: '', matiereId: 0, classeId: 0, dateDonnee: '' };

export default function DevoirsPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Devoir | null>(null);
  const [form, setForm] = useState<CreateDevoirDto>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<Devoir | null>(null);
  const [classeFilter, setClasseFilter] = useState('');

  const { data: anneeActive } = useQuery({ queryKey: ['annees-scolaires', 'active'], queryFn: anneesScolairesApi.active });
  const { data: classes = [] } = useQuery({ queryKey: ['classes', anneeActive?.id], queryFn: () => classesApi.list({ anneeScolaireId: anneeActive?.id }), enabled: !!anneeActive });
  const { data: matieres = [] } = useQuery({ queryKey: ['matieres'], queryFn: matieresApi.list });
  const { data: devoirs = [], isLoading } = useQuery({ queryKey: ['devoirs', classeFilter], queryFn: () => devoirsApi.byClasse(Number(classeFilter)), enabled: !!classeFilter });

  const createMutation = useMutation({ mutationFn: (dto: CreateDevoirDto) => devoirsApi.create(dto), onSuccess: () => { qc.invalidateQueries({ queryKey: ['devoirs'] }); setFormOpen(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateDevoirDto> }) => devoirsApi.update(id, dto), onSuccess: () => { qc.invalidateQueries({ queryKey: ['devoirs'] }); setFormOpen(false); } });
  const deleteMutation = useMutation({ mutationFn: (id: number) => devoirsApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['devoirs'] }); setDeleteOpen(false); } });

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY, classeId: Number(classeFilter) || 0 }); setFormOpen(true); };
  const openEdit = (d: Devoir) => {
    setEditing(d);
    setForm({ titre: d.titre, description: d.description ?? '', matiereId: d.matiere?.id ?? 0, classeId: d.classe?.id ?? 0, dateDonnee: d.dateDonnee?.slice(0, 10) ?? '', dateRendu: d.dateRendu?.slice(0, 10) ?? '' });
    setFormOpen(true);
  };
  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, dto: form });
    else createMutation.mutate(form);
  };

  const fmtDate = (v: unknown) => { try { return v ? format(new Date(v as string), 'dd/MM/yyyy', { locale: fr }) : '—'; } catch { return '—'; } };

  const columns: ColumnDef<Devoir, unknown>[] = [
    { accessorKey: 'titre', header: 'Titre', enableSorting: true },
    { id: 'matiere', header: 'Matière', accessorFn: (r) => r.matiere?.nom ?? '—' },
    { id: 'classe', header: 'Classe', accessorFn: (r) => r.classe?.nom ?? '—' },
    { accessorKey: 'dateDonnee', header: 'Donné le', cell: ({ getValue }) => fmtDate(getValue()) },
    { accessorKey: 'dateRendu', header: 'Rendu le', cell: ({ getValue }) => fmtDate(getValue()) },
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
      <PageHeader title="Devoirs" description="Gestion des devoirs à domicile" action={<Button onClick={openCreate} size="sm" disabled={!classeFilter}><IconPlus size={16} />Ajouter un devoir</Button>} />

      <div className="flex items-end gap-3 mb-6 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="space-y-1"><Label htmlFor="devClasse">Classe</Label>
          <Select id="devClasse" value={classeFilter} onChange={(e) => setClasseFilter(e.target.value)} placeholder="— Sélectionner —">
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </Select></div>
      </div>

      {classeFilter && <DataTable data={devoirs} columns={columns} isLoading={isLoading} searchPlaceholder="Rechercher un devoir…" />}

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? 'Modifier le devoir' : 'Ajouter un devoir'} onSubmit={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
        <div className="space-y-1"><Label htmlFor="dvTitre">Titre *</Label><Input id="dvTitre" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required /></div>
        <div className="space-y-1"><Label htmlFor="dvDesc">Description</Label><Textarea id="dvDesc" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label htmlFor="dvClasse">Classe *</Label>
            <Select id="dvClasse" value={form.classeId?.toString() ?? ''} onChange={(e) => setForm({ ...form, classeId: Number(e.target.value) })} placeholder="— Sélectionner —">
              {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </Select></div>
          <div className="space-y-1"><Label htmlFor="dvMatiere">Matière *</Label>
            <Select id="dvMatiere" value={form.matiereId?.toString() ?? ''} onChange={(e) => setForm({ ...form, matiereId: Number(e.target.value) })} placeholder="— Sélectionner —">
              {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </Select></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label htmlFor="dvDonne">Date donnée *</Label><Input id="dvDonne" type="date" value={form.dateDonnee} onChange={(e) => setForm({ ...form, dateDonnee: e.target.value })} required /></div>
          <div className="space-y-1"><Label htmlFor="dvRendu">Date rendu</Label><Input id="dvRendu" type="date" value={form.dateRendu ?? ''} onChange={(e) => setForm({ ...form, dateRendu: e.target.value })} /></div>
        </div>
      </FormDialog>

      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Supprimer ce devoir ?" description={deleteTarget?.titre} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} loading={deleteMutation.isPending} confirmLabel="Supprimer" />
    </div>
  );
}

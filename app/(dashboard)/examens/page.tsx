'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { examensApi, type CreateExamenDto } from '@/lib/api/examens';
import { classesApi } from '@/lib/api/classes';
import { matieresApi } from '@/lib/api/matieres';
import { anneesScolairesApi } from '@/lib/api/annees-scolaires';
import type { Examen } from '@/lib/types';
import { TypeExamen } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { PageHeader } from '@/components/ui/page-header';
import { FormDialog } from '@/components/ui/form-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TypeExamenBadge } from '@/components/ui/status-badge';

const EMPTY: CreateExamenDto = { libelle: '', type: TypeExamen.COMPOSITION, classeId: 0, date: '', anneeScolaireId: 0 };

export default function ExamensPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Examen | null>(null);
  const [form, setForm] = useState<CreateExamenDto>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<Examen | null>(null);

  const { data: anneeActive } = useQuery({ queryKey: ['annees-scolaires', 'active'], queryFn: anneesScolairesApi.active });
  const { data: classes = [] } = useQuery({ queryKey: ['classes', anneeActive?.id], queryFn: () => classesApi.list({ anneeScolaireId: anneeActive?.id }), enabled: !!anneeActive });
  const { data: matieres = [] } = useQuery({ queryKey: ['matieres'], queryFn: matieresApi.list });
  const { data: examens = [], isLoading } = useQuery({ queryKey: ['examens', anneeActive?.id], queryFn: () => examensApi.list({ anneeScolaireId: anneeActive?.id }), enabled: !!anneeActive });

  const createMutation = useMutation({ mutationFn: (dto: CreateExamenDto) => examensApi.create(dto), onSuccess: () => { qc.invalidateQueries({ queryKey: ['examens'] }); setFormOpen(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateExamenDto> }) => examensApi.update(id, dto), onSuccess: () => { qc.invalidateQueries({ queryKey: ['examens'] }); setFormOpen(false); } });
  const deleteMutation = useMutation({ mutationFn: (id: number) => examensApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['examens'] }); setDeleteOpen(false); } });

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY, anneeScolaireId: anneeActive?.id ?? 0 }); setFormOpen(true); };
  const openEdit = (ex: Examen) => {
    setEditing(ex);
    setForm({ libelle: ex.libelle, type: ex.type, classeId: ex.classe?.id ?? 0, matiereId: ex.matiere?.id, date: ex.date?.slice(0, 10) ?? '', dureeMinutes: ex.dureeMinutes, anneeScolaireId: ex.anneeScolaire?.id ?? 0 });
    setFormOpen(true);
  };
  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, dto: form });
    else createMutation.mutate(form);
  };

  const columns: ColumnDef<Examen, unknown>[] = [
    { accessorKey: 'libelle', header: 'Libellé', enableSorting: true },
    { accessorKey: 'type', header: 'Type', cell: ({ row }) => <TypeExamenBadge type={row.original.type} /> },
    { id: 'classe', header: 'Classe', accessorFn: (r) => r.classe?.nom ?? '—' },
    { id: 'matiere', header: 'Matière', accessorFn: (r) => r.matiere?.nom ?? '—' },
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => { try { return format(new Date(getValue() as string), 'dd/MM/yyyy', { locale: fr }); } catch { return '—'; } } },
    { accessorKey: 'dureeMinutes', header: 'Durée (min)', cell: ({ getValue }) => (getValue() as number | undefined) ?? '—' },
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
      <PageHeader title="Examens" description="Planification des examens et compositions" action={<Button onClick={openCreate} size="sm"><IconPlus size={16} />Ajouter un examen</Button>} />
      <DataTable data={examens} columns={columns} isLoading={isLoading} searchPlaceholder="Rechercher un examen…" />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? 'Modifier l\'examen' : 'Ajouter un examen'} onSubmit={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
        <div className="space-y-1"><Label htmlFor="exLib">Libellé *</Label><Input id="exLib" value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} required /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label htmlFor="exType">Type *</Label>
            <Select id="exType" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TypeExamen })}>
              <option value={TypeExamen.DEVOIR}>Devoir</option>
              <option value={TypeExamen.COMPOSITION}>Composition</option>
              <option value={TypeExamen.CEPE}>CEPE</option>
            </Select></div>
          <div className="space-y-1"><Label htmlFor="exDate">Date *</Label><Input id="exDate" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label htmlFor="exClasse">Classe *</Label>
            <Select id="exClasse" value={form.classeId?.toString() ?? ''} onChange={(e) => setForm({ ...form, classeId: Number(e.target.value) })} placeholder="— Sélectionner —">
              {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </Select></div>
          <div className="space-y-1"><Label htmlFor="exMatiere">Matière</Label>
            <Select id="exMatiere" value={form.matiereId?.toString() ?? ''} onChange={(e) => setForm({ ...form, matiereId: e.target.value ? Number(e.target.value) : undefined })} placeholder="— Toutes matières —">
              {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </Select></div>
        </div>
        <div className="space-y-1"><Label htmlFor="exDuree">Durée (minutes)</Label><Input id="exDuree" type="number" min={0} value={form.dureeMinutes ?? ''} onChange={(e) => setForm({ ...form, dureeMinutes: e.target.value ? Number(e.target.value) : undefined })} /></div>
      </FormDialog>

      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Supprimer cet examen ?" description={deleteTarget?.libelle} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} loading={deleteMutation.isPending} confirmLabel="Supprimer" />
    </div>
  );
}

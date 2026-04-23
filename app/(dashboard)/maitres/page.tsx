'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { IconPlus, IconPencil, IconTrash, IconChalkboard } from '@tabler/icons-react';
import { maitresApi, type CreateMaitreDto } from '@/lib/api/maitres';
import { classesApi } from '@/lib/api/classes';
import { anneesScolairesApi } from '@/lib/api/annees-scolaires';
import type { Maitre } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { FormDialog } from '@/components/ui/form-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Badge } from '@/components/ui/badge';

const EMPTY: CreateMaitreDto = { nom: '', prenom: '', email: '', password: '', telephone: '', diplome: '', specialite: '', dateEmbauche: '' };

export default function MaitresPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [affectOpen, setAffectOpen] = useState(false);
  const [editing, setEditing] = useState<Maitre | null>(null);
  const [affectTarget, setAffectTarget] = useState<Maitre | null>(null);
  const [form, setForm] = useState<CreateMaitreDto>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<Maitre | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);

  const { data: anneeActive } = useQuery({ queryKey: ['annees-scolaires', 'active'], queryFn: anneesScolairesApi.active });
  const { data: maitres = [], isLoading } = useQuery({ queryKey: ['maitres'], queryFn: maitresApi.list });
  const { data: classes = [] } = useQuery({
    queryKey: ['classes', anneeActive?.id],
    queryFn: () => classesApi.list({ anneeScolaireId: anneeActive?.id }),
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateMaitreDto) => maitresApi.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['maitres'] }); setFormOpen(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateMaitreDto> }) => maitresApi.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['maitres'] }); setFormOpen(false); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => maitresApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['maitres'] }); setDeleteOpen(false); },
  });
  const affectMutation = useMutation({
    mutationFn: ({ id, classeIds }: { id: number; classeIds: number[] }) => maitresApi.affectClasses(id, classeIds),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['maitres'] }); setAffectOpen(false); },
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY); setFormOpen(true); };
  const openEdit = (m: Maitre) => {
    setEditing(m);
    setForm({ nom: m.nom, prenom: m.prenom, email: m.user?.email ?? '', password: '', telephone: m.telephone ?? '', diplome: m.diplome ?? '', specialite: m.specialite ?? '', dateEmbauche: m.dateEmbauche?.slice(0, 10) ?? '' });
    setFormOpen(true);
  };
  const openAffect = (m: Maitre) => {
    setAffectTarget(m);
    setSelectedClasses(m.classes?.map((c) => c.id) ?? []);
    setAffectOpen(true);
  };
  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const dto = { ...form };
    if (!dto.password) delete (dto as Partial<CreateMaitreDto>).password;
    if (editing) updateMutation.mutate({ id: editing.id, dto });
    else createMutation.mutate(dto);
  };
  const handleAffect = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (affectTarget) affectMutation.mutate({ id: affectTarget.id, classeIds: selectedClasses });
  };

  const columns: ColumnDef<Maitre, unknown>[] = [
    { id: 'nom', header: 'Nom complet', accessorFn: (r) => `${r.nom} ${r.prenom}`, enableSorting: true },
    { id: 'email', header: 'Email', accessorFn: (r) => r.user?.email ?? '—' },
    { accessorKey: 'telephone', header: 'Téléphone', cell: ({ getValue }) => (getValue() as string) || '—' },
    { accessorKey: 'specialite', header: 'Spécialité', cell: ({ getValue }) => (getValue() as string) || '—' },
    {
      id: 'classes', header: 'Classes',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.classes?.length > 0
            ? row.original.classes.map((c) => <Badge key={c.id} variant="secondary">{c.nom}</Badge>)
            : <span className="text-[hsl(var(--muted-foreground))] text-xs">—</span>}
        </div>
      ),
    },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Assigner des classes" onClick={() => openAffect(row.original)}><IconChalkboard size={14} /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Modifier" onClick={() => openEdit(row.original)}><IconPencil size={14} /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-[hsl(var(--destructive))]" aria-label="Supprimer" onClick={() => { setDeleteTarget(row.original); setDeleteOpen(true); }}><IconTrash size={14} /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Maîtres" description="Gestion du personnel enseignant" action={<Button onClick={openCreate} size="sm"><IconPlus size={16} />Ajouter un maître</Button>} />
      <DataTable data={maitres} columns={columns} isLoading={isLoading} searchPlaceholder="Rechercher un maître…" />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? 'Modifier le maître' : 'Ajouter un maître'} onSubmit={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label htmlFor="mNom">Nom *</Label><Input id="mNom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required /></div>
          <div className="space-y-1"><Label htmlFor="mPrenom">Prénom *</Label><Input id="mPrenom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required /></div>
        </div>
        <div className="space-y-1"><Label htmlFor="mEmail">Email *</Label><Input id="mEmail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
        {!editing && <div className="space-y-1"><Label htmlFor="mPassword">Mot de passe *</Label><Input id="mPassword" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label htmlFor="mTel">Téléphone</Label><Input id="mTel" value={form.telephone ?? ''} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="mSpec">Spécialité</Label><Input id="mSpec" value={form.specialite ?? ''} onChange={(e) => setForm({ ...form, specialite: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label htmlFor="mDiplome">Diplôme</Label><Input id="mDiplome" value={form.diplome ?? ''} onChange={(e) => setForm({ ...form, diplome: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="mEmb">Date d'embauche</Label><Input id="mEmb" type="date" value={form.dateEmbauche ?? ''} onChange={(e) => setForm({ ...form, dateEmbauche: e.target.value })} /></div>
        </div>
      </FormDialog>

      {/* Affect classes dialog */}
      <FormDialog open={affectOpen} onOpenChange={setAffectOpen} title={`Assigner des classes — ${affectTarget?.nom} ${affectTarget?.prenom}`} onSubmit={handleAffect} loading={affectMutation.isPending} submitLabel="Assigner">
        <fieldset>
          <legend className="text-sm font-medium mb-2">Sélectionner les classes</legend>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {classes.map((c) => (
              <label key={c.id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[hsl(var(--muted))]">
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(c.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedClasses((prev) => [...prev, c.id]);
                    else setSelectedClasses((prev) => prev.filter((id) => id !== c.id));
                  }}
                  className="rounded"
                />
                <span className="text-sm">{c.nom}{c.libelle ? ` — ${c.libelle}` : ''}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </FormDialog>

      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Supprimer ce maître ?" description={deleteTarget ? `${deleteTarget.nom} ${deleteTarget.prenom} sera supprimé définitivement.` : ''} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} loading={deleteMutation.isPending} confirmLabel="Supprimer" />
    </div>
  );
}

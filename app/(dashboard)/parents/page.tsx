'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import { parentsApi, type CreateParentDto } from '@/lib/api/parents';
import type { Parent } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { FormDialog } from '@/components/ui/form-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const EMPTY: CreateParentDto = { nom: '', prenom: '', email: '', password: '', telephone: '', telephoneUrgence: '', profession: '', adresse: '' };

export default function ParentsPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Parent | null>(null);
  const [form, setForm] = useState<CreateParentDto>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<Parent | null>(null);

  const { data: parents = [], isLoading } = useQuery({ queryKey: ['parents'], queryFn: parentsApi.list });

  const createMutation = useMutation({
    mutationFn: (dto: CreateParentDto) => parentsApi.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parents'] }); setFormOpen(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateParentDto> }) => parentsApi.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parents'] }); setFormOpen(false); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => parentsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parents'] }); setDeleteOpen(false); },
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY); setFormOpen(true); };
  const openEdit = (p: Parent) => {
    setEditing(p);
    setForm({ nom: p.nom, prenom: p.prenom, email: p.user?.email ?? '', password: '', telephone: p.telephone ?? '', telephoneUrgence: p.telephoneUrgence ?? '', profession: p.profession ?? '', adresse: p.adresse ?? '' });
    setFormOpen(true);
  };
  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const dto = { ...form };
    if (!dto.password) delete (dto as Partial<CreateParentDto>).password;
    if (editing) updateMutation.mutate({ id: editing.id, dto });
    else createMutation.mutate(dto);
  };

  const columns: ColumnDef<Parent, unknown>[] = [
    { id: 'nom', header: 'Nom complet', accessorFn: (r) => `${r.nom} ${r.prenom}`, enableSorting: true },
    { id: 'email', header: 'Email', accessorFn: (r) => r.user?.email ?? '—' },
    { accessorKey: 'telephone', header: 'Téléphone', cell: ({ getValue }) => (getValue() as string) || '—' },
    { accessorKey: 'telephoneUrgence', header: 'Tél. urgence', cell: ({ getValue }) => (getValue() as string) || '—' },
    { accessorKey: 'profession', header: 'Profession', cell: ({ getValue }) => (getValue() as string) || '—' },
    { accessorKey: 'adresse', header: 'Adresse', cell: ({ getValue }) => (getValue() as string) || '—' },
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
      <PageHeader title="Parents" description="Gestion des parents d'élèves" action={<Button onClick={openCreate} size="sm"><IconPlus size={16} />Ajouter un parent</Button>} />
      <DataTable data={parents} columns={columns} isLoading={isLoading} searchPlaceholder="Rechercher un parent…" />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? 'Modifier le parent' : 'Ajouter un parent'} onSubmit={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label htmlFor="pNom">Nom *</Label><Input id="pNom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required /></div>
          <div className="space-y-1"><Label htmlFor="pPrenom">Prénom *</Label><Input id="pPrenom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required /></div>
        </div>
        <div className="space-y-1"><Label htmlFor="pEmail">Email *</Label><Input id="pEmail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
        {!editing && <div className="space-y-1"><Label htmlFor="pPassword">Mot de passe *</Label><Input id="pPassword" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label htmlFor="pTel">Téléphone</Label><Input id="pTel" value={form.telephone ?? ''} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="pTelUrg">Tél. urgence</Label><Input id="pTelUrg" value={form.telephoneUrgence ?? ''} onChange={(e) => setForm({ ...form, telephoneUrgence: e.target.value })} /></div>
        </div>
        <div className="space-y-1"><Label htmlFor="pProf">Profession</Label><Input id="pProf" value={form.profession ?? ''} onChange={(e) => setForm({ ...form, profession: e.target.value })} /></div>
        <div className="space-y-1"><Label htmlFor="pAdr">Adresse</Label><Input id="pAdr" value={form.adresse ?? ''} onChange={(e) => setForm({ ...form, adresse: e.target.value })} /></div>
      </FormDialog>

      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Supprimer ce parent ?" description={deleteTarget ? `${deleteTarget.nom} ${deleteTarget.prenom} sera supprimé.` : ''} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} loading={deleteMutation.isPending} confirmLabel="Supprimer" />
    </div>
  );
}

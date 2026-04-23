'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { IconPlus, IconPencil, IconTrash, IconPhoto } from '@tabler/icons-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { elevesApi, type CreateEleveDto } from '@/lib/api/eleves';
import { classesApi } from '@/lib/api/classes';
import { parentsApi } from '@/lib/api/parents';
import { anneesScolairesApi } from '@/lib/api/annees-scolaires';
import type { Eleve, StatutEleve } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { PageHeader } from '@/components/ui/page-header';
import { FormDialog } from '@/components/ui/form-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { StatutEleveBadge } from '@/components/ui/status-badge';

const EMPTY_FORM: CreateEleveDto = {
  nom: '',
  prenom: '',
  dateNaissance: '',
  lieuNaissance: '',
  sexe: 'M',
  numeroDossier: '',
  classeId: undefined,
  parentId: undefined,
};

export default function ElevesPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Eleve | null>(null);
  const [form, setForm] = useState<CreateEleveDto>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Eleve | null>(null);

  const { data: anneeActive } = useQuery({
    queryKey: ['annees-scolaires', 'active'],
    queryFn: anneesScolairesApi.active,
  });

  const { data: eleves = [], isLoading } = useQuery({
    queryKey: ['eleves'],
    queryFn: () => elevesApi.list(),
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', anneeActive?.id],
    queryFn: () => classesApi.list({ anneeScolaireId: anneeActive?.id }),
    enabled: !!anneeActive,
  });

  const { data: parents = [] } = useQuery({
    queryKey: ['parents'],
    queryFn: parentsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateEleveDto) => elevesApi.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['eleves'] }); setFormOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateEleveDto> }) => elevesApi.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['eleves'] }); setFormOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => elevesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['eleves'] }); setDeleteOpen(false); },
  });

  const statutMutation = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: StatutEleve }) => elevesApi.updateStatut(id, statut),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['eleves'] }),
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setFormOpen(true); };
  const openEdit = (e: Eleve) => {
    setEditing(e);
    setForm({
      nom: e.nom,
      prenom: e.prenom,
      dateNaissance: e.dateNaissance?.slice(0, 10) ?? '',
      lieuNaissance: e.lieuNaissance ?? '',
      sexe: e.sexe,
      numeroDossier: e.numeroDossier ?? '',
      classeId: e.classe?.id,
      parentId: e.parent?.id,
    });
    setFormOpen(true);
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const dto = { ...form };
    if (!dto.classeId) delete dto.classeId;
    if (!dto.parentId) delete dto.parentId;
    if (editing) updateMutation.mutate({ id: editing.id, dto });
    else createMutation.mutate(dto);
  };

  const columns: ColumnDef<Eleve, unknown>[] = [
    {
      id: 'photo',
      header: '',
      cell: ({ row }) =>
        row.original.photo ? (
          <img
            src={`http://localhost:8000/uploads/${row.original.photo}`}
            alt={`Photo de ${row.original.prenom}`}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-[hsl(var(--muted-foreground))]">
            <IconPhoto size={14} aria-hidden="true" />
          </div>
        ),
    },
    { accessorKey: 'nom', header: 'Nom', enableSorting: true },
    { accessorKey: 'prenom', header: 'Prénom', enableSorting: true },
    {
      id: 'classe',
      header: 'Classe',
      accessorFn: (r) => r.classe?.nom ?? '—',
      enableSorting: true,
    },
    {
      id: 'parent',
      header: 'Parent',
      accessorFn: (r) => r.parent ? `${r.parent.nom} ${r.parent.prenom}` : '—',
    },
    {
      accessorKey: 'dateNaissance',
      header: 'Date de naissance',
      cell: ({ getValue }) => {
        const v = getValue() as string;
        if (!v) return '—';
        try { return format(new Date(v), 'dd/MM/yyyy', { locale: fr }); }
        catch { return v; }
      },
    },
    {
      accessorKey: 'sexe',
      header: 'Sexe',
      cell: ({ getValue }) => getValue() === 'M' ? 'Masculin' : 'Féminin',
    },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <StatutEleveBadge statut={row.original.statut} />
          <select
            aria-label="Changer le statut"
            value=""
            onChange={(e) => {
              if (!e.target.value) return;
              statutMutation.mutate({ id: row.original.id, statut: e.target.value as StatutEleve });
              e.target.value = '';
            }}
            className="text-xs border rounded px-1 py-0.5 bg-transparent text-[hsl(var(--muted-foreground))]"
          >
            <option value="">Changer…</option>
            <option value="INSCRIT">Inscrit</option>
            <option value="TRANSFERE">Transféré</option>
            <option value="ABANDONNE">Abandonné</option>
          </select>
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Modifier ${row.original.nom}`}
            onClick={() => openEdit(row.original)}
            className="h-7 w-7"
          >
            <IconPencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Supprimer ${row.original.nom}`}
            onClick={() => { setDeleteTarget(row.original); setDeleteOpen(true); }}
            className="h-7 w-7 text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))]"
          >
            <IconTrash size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Élèves"
        description="Gestion des élèves inscrits"
        action={
          <Button onClick={openCreate} size="sm">
            <IconPlus size={16} aria-hidden="true" />
            Ajouter un élève
          </Button>
        }
      />

      <DataTable
        data={eleves}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un élève…"
      />

      {/* Create / Edit dialog */}
      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? 'Modifier un élève' : 'Ajouter un élève'}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        submitLabel={editing ? 'Enregistrer' : 'Ajouter'}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="nom">Nom *</Label>
            <Input id="nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="prenom">Prénom *</Label>
            <Input id="prenom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="dateNaissance">Date de naissance *</Label>
            <Input id="dateNaissance" type="date" value={form.dateNaissance} onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sexe">Sexe *</Label>
            <Select id="sexe" value={form.sexe} onChange={(e) => setForm({ ...form, sexe: e.target.value as 'M' | 'F' })}>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </Select>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="lieuNaissance">Lieu de naissance</Label>
          <Input id="lieuNaissance" value={form.lieuNaissance ?? ''} onChange={(e) => setForm({ ...form, lieuNaissance: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="numeroDossier">Numéro de dossier</Label>
          <Input id="numeroDossier" value={form.numeroDossier ?? ''} onChange={(e) => setForm({ ...form, numeroDossier: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="classeId">Classe</Label>
          <Select
            id="classeId"
            value={form.classeId?.toString() ?? ''}
            onChange={(e) => setForm({ ...form, classeId: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="— Sélectionner une classe —"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}{c.libelle ? ` — ${c.libelle}` : ''}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="parentId">Parent</Label>
          <Select
            id="parentId"
            value={form.parentId?.toString() ?? ''}
            onChange={(e) => setForm({ ...form, parentId: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="— Sélectionner un parent —"
          >
            {parents.map((p) => (
              <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>
            ))}
          </Select>
        </div>
      </FormDialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer cet élève ?"
        description={deleteTarget ? `${deleteTarget.nom} ${deleteTarget.prenom} sera supprimé définitivement.` : ''}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
        confirmLabel="Supprimer"
      />
    </div>
  );
}

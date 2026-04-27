'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Users, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useEleves, useDeleteEleve, useCreateEleve, createEleveSchema } from '@/features/eleves';
import type { CreateEleveFormValues } from '@/features/eleves';
import { useClasses } from '@/features/classes';
import { useParents } from '@/features/parents';
import type { Eleve } from '@/lib/types';
import { StatutEleve, Sexe } from '@/lib/types';
import Link from 'next/link';

export default function ElevesPage() {
  const { data: eleves, isLoading } = useEleves();
  const deleteEleve = useDeleteEleve();
  const createEleve = useCreateEleve();
  const { data: classes } = useClasses();
  const { data: parents } = useParents();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateEleveFormValues>({
    resolver: zodResolver(createEleveSchema),
  });

  const onSubmit = (data: CreateEleveFormValues) => {
    createEleve.mutate(data, { onSuccess: () => { reset(); setShowCreate(false); } });
  };

  const columns: ColumnDef<Eleve>[] = [
    {
      accessorKey: 'numeroDossier',
      header: 'N° Dossier',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.numeroDossier ?? '—'}
        </span>
      ),
    },
    {
      id: 'nom_complet',
      header: 'Élève',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.prenom} {row.original.nom}
          <div className="text-xs text-muted-foreground">
            {row.original.sexe === Sexe.M ? 'Garçon' : 'Fille'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'dateNaissance',
      header: 'Date de naissance',
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return val ? format(new Date(val), 'dd MMM yyyy', { locale: fr }) : '—';
      },
    },
    {
      id: 'classe',
      header: 'Classe',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.classe?.libelle ?? row.original.classe?.nom ?? '—'}</span>
      ),
    },
    {
      id: 'parent',
      header: 'Parent',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.parent ? `${row.original.parent.prenom} ${row.original.parent.nom}` : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: ({ getValue }) => {
        const val = getValue() as StatutEleve;
        return (
          <Badge variant={val === StatutEleve.INSCRIT ? 'default' : 'secondary'} className="text-xs">
            {val}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" render={<Link href={`/eleves/${row.original.id}`} />}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" render={<Link href={`/eleves/${row.original.id}/modifier`} />}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
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
        icon={Users}
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel élève
            </Button>
        }
      />

      <DataTable
        columns={columns}
        data={eleves ?? []}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un élève..."
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Supprimer l'élève ?"
        description="Cette action est irréversible. Toutes les données associées seront supprimées."
        confirmLabel="Supprimer"
        onConfirm={() => {
          if (deleteId) {
            deleteEleve.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
          }
        }}
        isLoading={deleteEleve.isPending}
      />
      <Dialog open={showCreate} onOpenChange={(open) => setShowCreate(open)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><h2 className="text-lg font-semibold">Nouvel élève</h2></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Prénom</Label>
                <Input {...register('prenom')} placeholder="Aminata" />
                {errors.prenom && <p className="text-xs text-destructive">{errors.prenom.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Nom</Label>
                <Input {...register('nom')} placeholder="Ouedraogo" />
                {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Date de naissance</Label>
                <Input type="date" {...register('dateNaissance')} />
                {errors.dateNaissance && <p className="text-xs text-destructive">{errors.dateNaissance.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Lieu de naissance</Label>
                <Input {...register('lieuNaissance')} placeholder="Ouagadougou" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Sexe</Label>
                <select {...register('sexe')} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none">
                  <option value="">Sélectionner</option>
                  <option value={Sexe.M}>Masculin</option>
                  <option value={Sexe.F}>Féminin</option>
                </select>
                {errors.sexe && <p className="text-xs text-destructive">{errors.sexe.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>N° dossier</Label>
                <Input {...register('numeroDossier')} placeholder="2024-001" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Classe</Label>
                <select {...register('classeId', { valueAsNumber: true })} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none">
                  <option value="">Sélectionner</option>
                  {classes?.map((c) => <option key={c.id} value={c.id}>{c.libelle ?? c.nom}</option>)}
                </select>
                {errors.classeId && <p className="text-xs text-destructive">{errors.classeId.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Parent</Label>
                <select {...register('parentId', { valueAsNumber: true })} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none">
                  <option value="">Sélectionner</option>
                  {parents?.map((p) => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                </select>
                {errors.parentId && <p className="text-xs text-destructive">{errors.parentId.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <select {...register('statut')} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none">
                <option value="">Sélectionner</option>
                {Object.values(StatutEleve).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.statut && <p className="text-xs text-destructive">{errors.statut.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { reset(); setShowCreate(false); }}>Annuler</Button>
              <Button type="submit" disabled={createEleve.isPending}>
                {createEleve.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Inscrire
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

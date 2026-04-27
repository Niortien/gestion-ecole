'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, UserSquare2, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useParents, useDeleteParent, useCreateParent, createParentSchema } from '@/features/parents';
import type { CreateParentFormValues } from '@/features/parents';
import type { Parent } from '@/lib/types';

export default function ParentsPage() {
  const { data: parents, isLoading } = useParents();
  const deleteParent = useDeleteParent();
  const createParent = useCreateParent();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateParentFormValues>({
    resolver: zodResolver(createParentSchema),
  });

  const onSubmit = (data: CreateParentFormValues) => {
    createParent.mutate(data, { onSuccess: () => { reset(); setShowCreate(false); } });
  };

  const columns: ColumnDef<Parent>[] = [
    {
      id: 'nom_complet',
      header: 'Parent',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.prenom} {row.original.nom}</div>
          <div className="text-xs text-muted-foreground">{row.original.user?.email}</div>
        </div>
      ),
    },
    { accessorKey: 'telephone', header: 'Téléphone', cell: ({ getValue }) => (getValue() as string | undefined) ?? '—' },
    { accessorKey: 'telephoneUrgence', header: 'Urgence', cell: ({ getValue }) => (getValue() as string | undefined) ?? '—' },
    { accessorKey: 'profession', header: 'Profession', cell: ({ getValue }) => (getValue() as string | undefined) ?? '—' },
    { accessorKey: 'adresse', header: 'Adresse', cell: ({ getValue }) => (getValue() as string | undefined) ?? '—' },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
          <Button
            variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
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
        title="Parents"
        description="Gestion des parents d'élèves"
        icon={UserSquare2}
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Nouveau parent</Button>
        }
      />
      <DataTable columns={columns} data={parents ?? []} isLoading={isLoading} searchPlaceholder="Rechercher un parent..." />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Supprimer le parent ?"
        description="Cette action supprimera définitivement le compte parent."
        confirmLabel="Supprimer"
        onConfirm={() => { if (deleteId) deleteParent.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }}
        isLoading={deleteParent.isPending}
      />
      <Dialog open={showCreate} onOpenChange={(open) => setShowCreate(open)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><h2 className="text-lg font-semibold">Nouveau parent</h2></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Prénom</Label>
                <Input {...register('prenom')} placeholder="Marie" />
                {errors.prenom && <p className="text-xs text-destructive">{errors.prenom.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Nom</Label>
                <Input {...register('nom')} placeholder="Diallo" />
                {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" {...register('email')} placeholder="marie.diallo@email.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Mot de passe</Label>
              <Input type="password" {...register('password')} placeholder="••••••••" />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Téléphone</Label>
                <Input {...register('telephone')} placeholder="+226 70 00 00 00" />
              </div>
              <div className="space-y-1.5">
                <Label>Tél. urgence</Label>
                <Input {...register('telephoneUrgence')} placeholder="+226 71 00 00 00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Profession</Label>
                <Input {...register('profession')} placeholder="Enseignant" />
              </div>
              <div className="space-y-1.5">
                <Label>Adresse</Label>
                <Input {...register('adresse')} placeholder="Ouagadougou" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { reset(); setShowCreate(false); }}>Annuler</Button>
              <Button type="submit" disabled={createParent.isPending}>
                {createParent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

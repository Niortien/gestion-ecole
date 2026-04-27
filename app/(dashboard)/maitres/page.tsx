'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, GraduationCap, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useMaitres, useDeleteMaitre, useCreateMaitre, createMaitreSchema } from '@/features/maitres';
import type { CreateMaitreFormValues } from '@/features/maitres';
import type { Maitre } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MaitresPage() {
  const { data: maitres, isLoading } = useMaitres();
  const deleteMaitre = useDeleteMaitre();
  const createMaitre = useCreateMaitre();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateMaitreFormValues>({
    resolver: zodResolver(createMaitreSchema),
  });

  const onSubmit = (data: CreateMaitreFormValues) => {
    createMaitre.mutate(data, { onSuccess: () => { reset(); setShowCreate(false); } });
  };

  const columns: ColumnDef<Maitre>[] = [
    {
      id: 'nom_complet',
      header: 'Enseignant',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.prenom} {row.original.nom}</div>
          <div className="text-xs text-muted-foreground">{row.original.user?.email}</div>
        </div>
      ),
    },
    { accessorKey: 'telephone', header: 'Téléphone', cell: ({ getValue }) => (getValue() as string | undefined) ?? '—' },
    { accessorKey: 'specialite', header: 'Spécialité', cell: ({ getValue }) => (getValue() as string | undefined) ?? '—' },
    { accessorKey: 'diplome', header: 'Diplôme', cell: ({ getValue }) => (getValue() as string | undefined) ?? '—' },
    {
      accessorKey: 'dateEmbauche',
      header: 'Date embauche',
      cell: ({ getValue }) => {
        const val = getValue() as string | undefined;
        return val ? format(new Date(val), 'dd MMM yyyy', { locale: fr }) : '—';
      },
    },
    {
      id: 'classes',
      header: 'Classes',
      cell: ({ row }) => row.original.classes?.map((c) => c.libelle ?? c.nom).join(', ') || '—',
    },
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
        title="Enseignants"
        description="Gestion du corps enseignant"
        icon={GraduationCap}
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Nouvel enseignant</Button>
        }
      />
      <DataTable columns={columns} data={maitres ?? []} isLoading={isLoading} searchPlaceholder="Rechercher un enseignant..." />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Supprimer l'enseignant ?"
        description="Cette action supprimera définitivement l'enseignant."
        confirmLabel="Supprimer"
        onConfirm={() => { if (deleteId) deleteMaitre.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }}
        isLoading={deleteMaitre.isPending}
      />
      <Dialog open={showCreate} onOpenChange={(open) => setShowCreate(open)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><h2 className="text-lg font-semibold">Nouvel enseignant</h2></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Prénom</Label>
                <Input {...register('prenom')} placeholder="Jean" />
                {errors.prenom && <p className="text-xs text-destructive">{errors.prenom.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Nom</Label>
                <Input {...register('nom')} placeholder="Dupont" />
                {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" {...register('email')} placeholder="jean.dupont@ecole.fr" />
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
                <Label>Spécialité</Label>
                <Input {...register('specialite')} placeholder="Mathématiques" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Diplôme</Label>
                <Input {...register('diplome')} placeholder="Licence" />
              </div>
              <div className="space-y-1.5">
                <Label>Date d'embauche</Label>
                <Input type="date" {...register('dateEmbauche')} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { reset(); setShowCreate(false); }}>Annuler</Button>
              <Button type="submit" disabled={createMaitre.isPending}>
                {createMaitre.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

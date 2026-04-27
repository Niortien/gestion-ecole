'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, ShieldCheck, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useUtilisateurs, useDeleteUtilisateur, useCreateUtilisateur } from '@/features/utilisateurs';
import type { User } from '@/lib/types';
import { UserRole } from '@/lib/types';

const createUtilisateurSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  role: z.nativeEnum(UserRole),
});
type CreateUtilisateurFormValues = z.infer<typeof createUtilisateurSchema>;

export default function UtilisateursPage() {
  const { data: utilisateurs, isLoading } = useUtilisateurs();
  const deleteUser = useDeleteUtilisateur();
  const createUser = useCreateUtilisateur();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUtilisateurFormValues>({
    resolver: zodResolver(createUtilisateurSchema),
  });

  const onSubmit = (data: CreateUtilisateurFormValues) => {
    createUser.mutate(data, { onSuccess: () => { reset(); setShowCreate(false); } });
  };

  const ROLE_COLORS: Record<string, string> = {
    ADMIN: 'bg-rose-100 text-rose-700',
    DIRECTEUR: 'bg-violet-100 text-violet-700',
    MAITRE: 'bg-indigo-100 text-indigo-700',
    PARENT: 'bg-emerald-100 text-emerald-700',
    COMPTABLE: 'bg-amber-100 text-amber-700',
  };

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'email', header: 'Email', cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
    {
      accessorKey: 'role',
      header: 'Rôle',
      cell: ({ getValue }) => {
        const role = getValue() as string;
        return (
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[role] ?? ''}`}>
            {role}
          </span>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Actif',
      cell: ({ getValue }) => (
        <Badge variant={(getValue() as boolean) ? 'default' : 'secondary'} className="text-xs">
          {(getValue() as boolean) ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(row.original.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        description="Gestion des comptes utilisateurs"
        icon={ShieldCheck}
        actions={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Nouvel utilisateur</Button>}
      />
      <DataTable columns={columns} data={utilisateurs ?? []} isLoading={isLoading} searchPlaceholder="Rechercher un utilisateur..." />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Supprimer l'utilisateur ?"
        description="Cette action supprimera définitivement le compte."
        confirmLabel="Supprimer"
        onConfirm={() => { if (deleteId) deleteUser.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }}
        isLoading={deleteUser.isPending}
      />
      <Dialog open={showCreate} onOpenChange={(open) => setShowCreate(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><h2 className="text-lg font-semibold">Nouvel utilisateur</h2></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" {...register('email')} placeholder="user@ecole.fr" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Mot de passe</Label>
              <Input type="password" {...register('password')} placeholder="••••••••" />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Rôle</Label>
              <select {...register('role')} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none">
                <option value="">Sélectionner un rôle</option>
                {Object.values(UserRole).map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { reset(); setShowCreate(false); }}>Annuler</Button>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

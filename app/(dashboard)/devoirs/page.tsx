'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, BookMarked, Pencil, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useDevoirs, useDeleteDevoir, useCreateDevoir, createDevoirSchema } from '@/features/devoirs';
import type { CreateDevoirFormValues } from '@/features/devoirs';
import { useClasses } from '@/features/classes';
import { useMatieres } from '@/features/matieres';
import type { Devoir } from '@/lib/types';

export default function DevoirsPage() {
  const { data: devoirs, isLoading } = useDevoirs(0);
  const deleteDevoir = useDeleteDevoir();
  const createDevoir = useCreateDevoir();
  const { data: classes } = useClasses();
  const { data: matieres } = useMatieres();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateDevoirFormValues>({
    resolver: zodResolver(createDevoirSchema),
  });

  const onSubmit = (data: CreateDevoirFormValues) => {
    createDevoir.mutate(data, { onSuccess: () => { reset(); setShowCreate(false); } });
  };

  const columns: ColumnDef<Devoir>[] = [
    { accessorKey: 'titre', header: 'Titre', cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
    { id: 'matiere', header: 'Matière', cell: ({ row }) => row.original.matiere?.nom ?? '—' },
    { id: 'classe', header: 'Classe', cell: ({ row }) => row.original.classe?.libelle ?? row.original.classe?.nom ?? '—' },
    {
      accessorKey: 'dateRemise',
      header: 'Date de remise',
      cell: ({ getValue }) => {
        const val = getValue() as string | undefined;
        return val ? format(new Date(val), 'dd MMM yyyy', { locale: fr }) : '—';
      },
    },
    { accessorKey: 'description', header: 'Description', cell: ({ getValue }) => (getValue() as string | undefined) ?? '—' },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(row.original.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Devoirs"
        description="Gestion des devoirs à faire"
        icon={BookMarked}
        actions={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Nouveau devoir</Button>}
      />
      <DataTable columns={columns} data={devoirs ?? []} isLoading={isLoading} searchPlaceholder="Rechercher un devoir..." />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Supprimer le devoir ?"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={() => { if (deleteId) deleteDevoir.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }}
        isLoading={deleteDevoir.isPending}
      />
      <Dialog open={showCreate} onOpenChange={(open) => setShowCreate(open)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><h2 className="text-lg font-semibold">Nouveau devoir</h2></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Titre</Label>
              <Input {...register('titre')} placeholder="Exercices chapitre 3" />
              {errors.titre && <p className="text-xs text-destructive">{errors.titre.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Matière</Label>
                <select {...register('matiereId', { valueAsNumber: true })} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none">
                  <option value="">Sélectionner</option>
                  {matieres?.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
                </select>
                {errors.matiereId && <p className="text-xs text-destructive">{errors.matiereId.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Classe</Label>
                <select {...register('classeId', { valueAsNumber: true })} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none">
                  <option value="">Sélectionner</option>
                  {classes?.map((c) => <option key={c.id} value={c.id}>{c.libelle ?? c.nom}</option>)}
                </select>
                {errors.classeId && <p className="text-xs text-destructive">{errors.classeId.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Date donnée</Label>
                <Input type="date" {...register('dateDonnee')} />
                {errors.dateDonnee && <p className="text-xs text-destructive">{errors.dateDonnee.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Date rendu (optionnel)</Label>
                <Input type="date" {...register('dateRendu')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description (optionnel)</Label>
              <Textarea {...register('description')} placeholder="Consignes..." rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { reset(); setShowCreate(false); }}>Annuler</Button>
              <Button type="submit" disabled={createDevoir.isPending}>
                {createDevoir.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

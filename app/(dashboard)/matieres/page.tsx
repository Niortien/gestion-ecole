'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, BookOpen, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useMatieres, useDeleteMatiere, useCreateMatiere, createMatiereSchema } from '@/features/matieres';
import type { CreateMatiereFormValues } from '@/features/matieres';
import type { Matiere } from '@/lib/types';
import { NiveauMatiere } from '@/lib/types';

export default function MatieresPage() {
  const { data: matieres, isLoading } = useMatieres();
  const deleteMatiere = useDeleteMatiere();
  const createMatiere = useCreateMatiere();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateMatiereFormValues>({
    resolver: zodResolver(createMatiereSchema),
  });

  const onSubmit = (data: CreateMatiereFormValues) => {
    createMatiere.mutate(data, { onSuccess: () => { reset(); setShowCreate(false); } });
  };

  const columns: ColumnDef<Matiere>[] = [
    { accessorKey: 'nom', header: 'Matière', cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
    { accessorKey: 'code', header: 'Code', cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() as string}</span> },
    {
      accessorKey: 'coefficient',
      header: 'Coefficient',
      cell: ({ getValue }) => <span className="font-mono">{getValue() as number}</span>,
    },
    {
      accessorKey: 'niveau',
      header: 'Niveau',
      cell: ({ getValue }) => <Badge variant="outline" className="text-xs">{getValue() as string}</Badge>,
    },
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
        title="Matières"
        description="Configuration des matières enseignées"
        icon={BookOpen}
        actions={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Nouvelle matière</Button>}
      />
      <DataTable columns={columns} data={matieres ?? []} isLoading={isLoading} searchPlaceholder="Rechercher une matière..." />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Supprimer la matière ?"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={() => { if (deleteId) deleteMatiere.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }}
        isLoading={deleteMatiere.isPending}
      />
      <Dialog open={showCreate} onOpenChange={(open) => setShowCreate(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><h2 className="text-lg font-semibold">Nouvelle matière</h2></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Nom</Label>
              <Input {...register('nom')} placeholder="Mathématiques" />
              {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Code</Label>
              <Input {...register('code')} placeholder="MATH" />
              {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Coefficient</Label>
              <Input type="number" min={1} max={10} {...register('coefficient', { valueAsNumber: true })} placeholder="2" />
              {errors.coefficient && <p className="text-xs text-destructive">{errors.coefficient.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Niveau</Label>
              <select {...register('niveau')} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none">
                <option value="">Sélectionner un niveau</option>
                {Object.values(NiveauMatiere).map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              {errors.niveau && <p className="text-xs text-destructive">{errors.niveau.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { reset(); setShowCreate(false); }}>Annuler</Button>
              <Button type="submit" disabled={createMatiere.isPending}>
                {createMatiere.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

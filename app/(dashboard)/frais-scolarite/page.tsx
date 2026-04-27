'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Receipt, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useFraisScolarite, useDeleteFraisScolarite, useCreateFraisScolarite } from '@/features/frais-scolarite';
import { useClasses } from '@/features/classes';
import { useAnneesScolaires } from '@/features/annees-scolaires';
import type { FraisScolarite } from '@/lib/types';

const createFraisSchema = z.object({
  libelle: z.string().min(1, 'Libellé requis'),
  montant: z.number().positive('Montant invalide'),
  classeId: z.number().optional(),
  anneeScolaireId: z.number().positive('Année scolaire requise'),
  obligatoire: z.boolean().optional(),
  description: z.string().optional(),
});
type CreateFraisFormValues = z.infer<typeof createFraisSchema>;

export default function FraisScolaritePage() {
  const { data: frais, isLoading } = useFraisScolarite();
  const deleteFrais = useDeleteFraisScolarite();
  const createFrais = useCreateFraisScolarite();
  const { data: classes } = useClasses();
  const { data: annees } = useAnneesScolaires();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateFraisFormValues>({
    resolver: zodResolver(createFraisSchema),
  });

  const onSubmit = (data: CreateFraisFormValues) => {
    createFrais.mutate(data, { onSuccess: () => { reset(); setShowCreate(false); } });
  };

  const columns: ColumnDef<FraisScolarite>[] = [
    { accessorKey: 'libelle', header: 'Libellé', cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
    {
      accessorKey: 'montant',
      header: 'Montant (FCFA)',
      cell: ({ getValue }) => <span className="font-mono">{(getValue() as number).toLocaleString('fr-FR')}</span>,
    },
    {
      id: 'classe',
      header: 'Classe',
      cell: ({ row }) => row.original.classe ? (row.original.classe.libelle ?? row.original.classe.nom) : 'Toutes',
    },
    {
      id: 'annee',
      header: 'Année scolaire',
      cell: ({ row }) => row.original.anneeScolaire?.libelle ?? '—',
    },
    {
      accessorKey: 'obligatoire',
      header: 'Obligatoire',
      cell: ({ getValue }) => (
        <Badge variant={(getValue() as boolean) ? 'default' : 'secondary'} className="text-xs">
          {(getValue() as boolean) ? 'Oui' : 'Non'}
        </Badge>
      ),
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
        title="Frais de scolarité"
        description="Configuration des frais de scolarité"
        icon={Receipt}
        actions={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Nouveau frais</Button>}
      />
      <DataTable columns={columns} data={frais ?? []} isLoading={isLoading} searchPlaceholder="Rechercher..." />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Supprimer le frais ?"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={() => { if (deleteId) deleteFrais.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }}
        isLoading={deleteFrais.isPending}
      />
      <Dialog open={showCreate} onOpenChange={(open) => setShowCreate(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><h2 className="text-lg font-semibold">Nouveau frais de scolarité</h2></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Libellé</Label>
              <Input {...register('libelle')} placeholder="Frais de scolarité 2024-2025" />
              {errors.libelle && <p className="text-xs text-destructive">{errors.libelle.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Montant (FCFA)</Label>
              <Input type="number" min={0} {...register('montant', { valueAsNumber: true })} placeholder="150000" />
              {errors.montant && <p className="text-xs text-destructive">{errors.montant.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Année scolaire</Label>
                <select {...register('anneeScolaireId', { valueAsNumber: true })} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none">
                  <option value="">Sélectionner</option>
                  {annees?.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
                </select>
                {errors.anneeScolaireId && <p className="text-xs text-destructive">{errors.anneeScolaireId.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Classe (optionnel)</Label>
                <select {...register('classeId', { setValueAs: (v) => v === '' ? undefined : parseInt(v) })} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none">
                  <option value="">Toutes classes</option>
                  {classes?.map((c) => <option key={c.id} value={c.id}>{c.libelle ?? c.nom}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="obligatoire" {...register('obligatoire')} className="rounded" />
              <Label htmlFor="obligatoire">Frais obligatoire</Label>
            </div>
            <div className="space-y-1.5">
              <Label>Description (optionnel)</Label>
              <Textarea {...register('description')} placeholder="Détails..." rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { reset(); setShowCreate(false); }}>Annuler</Button>
              <Button type="submit" disabled={createFrais.isPending}>
                {createFrais.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

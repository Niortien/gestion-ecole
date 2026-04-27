'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, TrendingDown, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useDepenses, useDeleteDepense, useCreateDepense } from '@/features/depenses';
import type { Depense } from '@/lib/types';
import { CategorieDepense } from '@/lib/types';

const createDepenseSchema = z.object({
  libelle: z.string().min(1, 'Libellé requis'),
  montant: z.number().positive('Montant invalide'),
  categorie: z.nativeEnum(CategorieDepense),
  date: z.string().min(1, 'Date requise'),
  description: z.string().optional(),
});
type CreateDepenseFormValues = z.infer<typeof createDepenseSchema>;

export default function DepensesPage() {
  const { data: depenses, isLoading } = useDepenses();
  const deleteDepense = useDeleteDepense();
  const createDepense = useCreateDepense();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateDepenseFormValues>({
    resolver: zodResolver(createDepenseSchema),
  });

  const onSubmit = (data: CreateDepenseFormValues) => {
    createDepense.mutate(data, { onSuccess: () => { reset(); setShowCreate(false); } });
  };

  const columns: ColumnDef<Depense>[] = [
    { accessorKey: 'libelle', header: 'Libellé', cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
    {
      accessorKey: 'montant',
      header: 'Montant (FCFA)',
      cell: ({ getValue }) => <span className="font-mono">{(getValue() as number).toLocaleString('fr-FR')}</span>,
    },
    {
      accessorKey: 'categorie',
      header: 'Catégorie',
      cell: ({ getValue }) => (
        <Badge variant="outline" className="text-xs">{(getValue() as string | undefined) ?? '—'}</Badge>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return val ? format(new Date(val), 'dd MMM yyyy', { locale: fr }) : '—';
      },
    },
    { accessorKey: 'description', header: 'Description', cell: ({ getValue }) => (getValue() as string | undefined) ?? '—' },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => setDeleteId(row.original.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dépenses"
        description="Suivi des dépenses de l'établissement"
        icon={TrendingDown}
        actions={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Nouvelle dépense</Button>}
      />
      <DataTable columns={columns} data={depenses ?? []} isLoading={isLoading} searchPlaceholder="Rechercher une dépense..." />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Supprimer la dépense ?"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={() => { if (deleteId) deleteDepense.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }}
        isLoading={deleteDepense.isPending}
      />
      <Dialog open={showCreate} onOpenChange={(open) => setShowCreate(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><h2 className="text-lg font-semibold">Nouvelle dépense</h2></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Libellé</Label>
              <Input {...register('libelle')} placeholder="Achat fournitures" />
              {errors.libelle && <p className="text-xs text-destructive">{errors.libelle.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Montant (FCFA)</Label>
              <Input type="number" min={0} {...register('montant', { valueAsNumber: true })} placeholder="50000" />
              {errors.montant && <p className="text-xs text-destructive">{errors.montant.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <select {...register('categorie')} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none">
                <option value="">Sélectionner une catégorie</option>
                {Object.values(CategorieDepense).map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
              {errors.categorie && <p className="text-xs text-destructive">{errors.categorie.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description (optionnel)</Label>
              <Textarea {...register('description')} placeholder="Détails..." rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { reset(); setShowCreate(false); }}>Annuler</Button>
              <Button type="submit" disabled={createDepense.isPending}>
                {createDepense.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

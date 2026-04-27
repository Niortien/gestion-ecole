'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Award, Pencil, Trash2, Loader2 } from 'lucide-react';
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
import { useExamens, useDeleteExamen, useCreateExamen, createExamenSchema } from '@/features/examens';
import type { CreateExamenFormValues } from '@/features/examens';
import { useClasses } from '@/features/classes';
import { useMatieres } from '@/features/matieres';
import { useAnneesScolaires } from '@/features/annees-scolaires';
import type { Examen } from '@/lib/types';
import { TypeExamen } from '@/lib/types';

export default function ExamensPage() {
  const { data: examens, isLoading } = useExamens();
  const deleteExamen = useDeleteExamen();
  const createExamen = useCreateExamen();
  const { data: classes } = useClasses();
  const { data: matieres } = useMatieres();
  const { data: annees } = useAnneesScolaires();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateExamenFormValues>({
    resolver: zodResolver(createExamenSchema),
  });

  const onSubmit = (data: CreateExamenFormValues) => {
    createExamen.mutate(data, { onSuccess: () => { reset(); setShowCreate(false); } });
  };

  const columns: ColumnDef<Examen>[] = [
    { accessorKey: 'titre', header: 'Titre', cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => <Badge variant="outline" className="text-xs">{getValue() as string}</Badge>,
    },
    { id: 'matiere', header: 'Matière', cell: ({ row }) => row.original.matiere?.nom ?? '—' },
    { id: 'classe', header: 'Classe', cell: ({ row }) => row.original.classe?.libelle ?? row.original.classe?.nom ?? '—' },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => {
        const val = getValue() as string | undefined;
        return val ? format(new Date(val), 'dd MMM yyyy', { locale: fr }) : '—';
      },
    },
    { accessorKey: 'duree', header: 'Durée (min)', cell: ({ getValue }) => (getValue() as number | undefined) ?? '—' },
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
        title="Examens"
        description="Planification et suivi des examens"
        icon={Award}
        actions={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Nouvel examen</Button>}
      />
      <DataTable columns={columns} data={examens ?? []} isLoading={isLoading} searchPlaceholder="Rechercher un examen..." />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Supprimer l'examen ?"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={() => { if (deleteId) deleteExamen.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }}
        isLoading={deleteExamen.isPending}
      />
      <Dialog open={showCreate} onOpenChange={(open) => setShowCreate(open)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><h2 className="text-lg font-semibold">Nouvel examen</h2></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Libellé</Label>
              <Input {...register('libelle')} placeholder="Composition de Mathématiques" />
              {errors.libelle && <p className="text-xs text-destructive">{errors.libelle.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <select {...register('type')} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none">
                  <option value="">Sélectionner</option>
                  {Object.values(TypeExamen).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" {...register('date')} />
                {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
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
                <Label>Matière (optionnel)</Label>
                <select {...register('matiereId', { setValueAs: (v) => v === '' ? undefined : parseInt(v) })} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none">
                  <option value="">Toutes matières</option>
                  {matieres?.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
                </select>
              </div>
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
                <Label>Durée (min)</Label>
                <Input type="number" {...register('dureeMinutes', { setValueAs: (v) => v === '' ? undefined : parseInt(v) })} placeholder="60" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { reset(); setShowCreate(false); }}>Annuler</Button>
              <Button type="submit" disabled={createExamen.isPending}>
                {createExamen.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

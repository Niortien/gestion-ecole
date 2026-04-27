'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, CreditCard, Trash2, Loader2 } from 'lucide-react';
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
import { usePaiements, useAnnulerPaiement, useCreatePaiement } from '@/features/paiements';
import { useEleves } from '@/features/eleves';
import { useFraisScolarite } from '@/features/frais-scolarite';
import type { Paiement } from '@/lib/types';
import { StatutPaiement, ModePaiement } from '@/lib/types';

const createPaiementSchema = z.object({
  eleveId: z.number().positive('Élève requis'),
  fraisScolariteId: z.number().positive('Frais requis'),
  montant: z.number().positive('Montant invalide'),
  datePaiement: z.string().min(1, 'Date requise'),
  modePaiement: z.nativeEnum(ModePaiement).optional(),
  referencePaiement: z.string().optional(),
  commentaire: z.string().optional(),
});
type CreatePaiementFormValues = z.infer<typeof createPaiementSchema>;

export default function PaiementsPage() {
  const { data: paiements, isLoading } = usePaiements();
  const annuler = useAnnulerPaiement();
  const createPaiement = useCreatePaiement();
  const { data: eleves } = useEleves();
  const { data: frais } = useFraisScolarite();
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreatePaiementFormValues>({
    resolver: zodResolver(createPaiementSchema),
  });

  const onSubmit = (data: CreatePaiementFormValues) => {
    createPaiement.mutate(data, { onSuccess: () => { reset(); setShowCreate(false); } });
  };

  const columns: ColumnDef<Paiement>[] = [
    {
      id: 'eleve',
      header: 'Élève',
      cell: ({ row }) => {
        const e = row.original.eleve;
        return e ? `${e.prenom} ${e.nom}` : '—';
      },
    },
    {
      id: 'frais',
      header: 'Frais',
      cell: ({ row }) => row.original.fraisScolarite?.libelle ?? '—',
    },
    {
      accessorKey: 'montant',
      header: 'Montant (FCFA)',
      cell: ({ getValue }) => (
        <span className="font-mono">{(getValue() as number).toLocaleString('fr-FR')}</span>
      ),
    },
    {
      accessorKey: 'datePaiement',
      header: 'Date',
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return val ? format(new Date(val), 'dd MMM yyyy', { locale: fr }) : '—';
      },
    },
    {
      accessorKey: 'modePaiement',
      header: 'Mode',
    },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: ({ getValue }) => {
        const val = getValue() as StatutPaiement;
        return (
          <Badge variant={val === StatutPaiement.VALIDE ? 'default' : 'destructive'} className="text-xs">
            {val}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        row.original.statut === StatutPaiement.VALIDE ? (
          <Button
            variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => setCancelId(row.original.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Paiements"
        description="Suivi des paiements de scolarité"
        icon={CreditCard}
        actions={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Nouveau paiement</Button>}
      />
      <DataTable columns={columns} data={paiements ?? []} isLoading={isLoading} searchPlaceholder="Rechercher un paiement..." />
      <ConfirmDialog
        open={cancelId !== null}
        onOpenChange={(open) => { if (!open) setCancelId(null); }}
        title="Annuler le paiement ?"
        description="Le paiement sera marqué comme annulé."
        confirmLabel="Annuler le paiement"
        onConfirm={() => { if (cancelId) annuler.mutate(cancelId, { onSuccess: () => setCancelId(null) }); }}
        isLoading={annuler.isPending}
      />
      <Dialog open={showCreate} onOpenChange={(open) => setShowCreate(open)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><h2 className="text-lg font-semibold">Nouveau paiement</h2></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Élève</Label>
              <select {...register('eleveId', { valueAsNumber: true })} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none">
                <option value="">Sélectionner un élève</option>
                {eleves?.map((e) => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
              </select>
              {errors.eleveId && <p className="text-xs text-destructive">{errors.eleveId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Frais de scolarité</Label>
              <select {...register('fraisScolariteId', { valueAsNumber: true })} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none">
                <option value="">Sélectionner un frais</option>
                {frais?.map((f) => <option key={f.id} value={f.id}>{f.libelle} — {f.montant.toLocaleString('fr')} FCFA</option>)}
              </select>
              {errors.fraisScolariteId && <p className="text-xs text-destructive">{errors.fraisScolariteId.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Montant (FCFA)</Label>
                <Input type="number" min={0} {...register('montant', { valueAsNumber: true })} placeholder="50000" />
                {errors.montant && <p className="text-xs text-destructive">{errors.montant.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Date de paiement</Label>
                <Input type="date" {...register('datePaiement')} />
                {errors.datePaiement && <p className="text-xs text-destructive">{errors.datePaiement.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Mode de paiement</Label>
                <select {...register('modePaiement')} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none">
                  <option value="">Sélectionner</option>
                  {Object.values(ModePaiement).map((m) => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Référence</Label>
                <Input {...register('referencePaiement')} placeholder="REF-2024-001" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Commentaire</Label>
              <Textarea {...register('commentaire')} placeholder="Notes optionnelles..." rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { reset(); setShowCreate(false); }}>Annuler</Button>
              <Button type="submit" disabled={createPaiement.isPending}>
                {createPaiement.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

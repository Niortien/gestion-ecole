'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { IconPlus, IconBan, IconWallet } from '@tabler/icons-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { paiementsApi, type CreatePaiementDto } from '@/lib/api/paiements';
import { elevesApi } from '@/lib/api/eleves';
import { fraisScolariteApi } from '@/lib/api/frais-scolarite';
import { anneesScolairesApi } from '@/lib/api/annees-scolaires';
import type { Paiement, SituationFinanciere } from '@/lib/types';
import { ModePaiement } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { PageHeader } from '@/components/ui/page-header';
import { FormDialog } from '@/components/ui/form-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StatutPaiementBadge, ModePaiementBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';

const EMPTY: CreatePaiementDto = { eleveId: 0, fraisScolariteId: 0, montant: 0, modePaiement: ModePaiement.ESPECES, anneeScolaireId: 0 };

export default function PaiementsPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Paiement | null>(null);
  const [form, setForm] = useState<CreatePaiementDto>(EMPTY);
  const [situationEleveId, setSituationEleveId] = useState<number | null>(null);
  const [situationOpen, setSituationOpen] = useState(false);

  const { data: anneeActive } = useQuery({ queryKey: ['annees-scolaires', 'active'], queryFn: anneesScolairesApi.active });
  const { data: eleves = [] } = useQuery({ queryKey: ['eleves'], queryFn: () => elevesApi.list({}) });
  const { data: frais = [] } = useQuery({ queryKey: ['frais-scolarite', anneeActive?.id], queryFn: () => fraisScolariteApi.list({ anneeScolaireId: anneeActive?.id }), enabled: !!anneeActive });
  const { data: paiements = [], isLoading } = useQuery({ queryKey: ['paiements', anneeActive?.id], queryFn: () => paiementsApi.list({ anneeScolaireId: anneeActive?.id }), enabled: !!anneeActive });

  const { data: situation, isLoading: loadingSituation } = useQuery<SituationFinanciere>({
    queryKey: ['paiements', 'situation', situationEleveId, anneeActive?.id],
    queryFn: () => paiementsApi.situation(situationEleveId!, anneeActive!.id),
    enabled: !!situationEleveId && !!anneeActive && situationOpen,
  });

  const createMutation = useMutation({ mutationFn: (dto: CreatePaiementDto) => paiementsApi.create(dto), onSuccess: () => { qc.invalidateQueries({ queryKey: ['paiements'] }); setFormOpen(false); } });
  const cancelMutation = useMutation({ mutationFn: (id: number) => paiementsApi.annuler(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['paiements'] }); setCancelOpen(false); } });

  const openCreate = () => { setForm({ ...EMPTY, anneeScolaireId: anneeActive?.id ?? 0 }); setFormOpen(true); };
  const handleSubmit = (ev: React.FormEvent) => { ev.preventDefault(); createMutation.mutate(form); };
  const fmtAmount = (v: number) => new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(v);
  const fmtDate = (v: unknown) => { try { return format(new Date(v as string), 'dd/MM/yyyy', { locale: fr }); } catch { return '—'; } };

  const columns: ColumnDef<Paiement, unknown>[] = [
    { id: 'eleve', header: 'Élève', accessorFn: (r) => `${r.eleve?.nom} ${r.eleve?.prenom}`, enableSorting: true },
    { id: 'frais', header: 'Frais', accessorFn: (r) => r.fraisScolarite?.libelle ?? '—' },
    { accessorKey: 'montant', header: 'Montant', cell: ({ getValue }) => <span className="font-semibold">{fmtAmount(getValue() as number)}</span> },
    { accessorKey: 'modePaiement', header: 'Mode', cell: ({ row }) => <ModePaiementBadge mode={row.original.modePaiement} /> },
    { accessorKey: 'statut', header: 'Statut', cell: ({ row }) => <StatutPaiementBadge statut={row.original.statut} /> },
    { accessorKey: 'datePaiement', header: 'Date', cell: ({ getValue }) => fmtDate(getValue()) },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Voir la situation" title="Situation financière" onClick={() => { setSituationEleveId(row.original.eleve?.id ?? null); setSituationOpen(true); }}>
            <IconWallet size={14} />
          </Button>
          {row.original.statut !== 'ANNULE' && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-[hsl(var(--destructive))]" aria-label="Annuler" title="Annuler le paiement" onClick={() => { setCancelTarget(row.original); setCancelOpen(true); }}>
              <IconBan size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Paiements" description="Enregistrement et suivi des paiements de scolarité" action={<Button onClick={openCreate} size="sm" disabled={!anneeActive}><IconPlus size={16} />Nouveau paiement</Button>} />
      <DataTable data={paiements} columns={columns} isLoading={isLoading} searchPlaceholder="Rechercher un paiement…" />

      {/* Create form */}
      <FormDialog open={formOpen} onOpenChange={setFormOpen} title="Enregistrer un paiement" onSubmit={handleSubmit} loading={createMutation.isPending}>
        <div className="space-y-1"><Label htmlFor="payEleve">Élève *</Label>
          <Select id="payEleve" value={form.eleveId?.toString() ?? ''} onChange={(e) => setForm({ ...form, eleveId: Number(e.target.value) })} placeholder="— Sélectionner —">
            {eleves.map((e) => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
          </Select></div>
        <div className="space-y-1"><Label htmlFor="payFrais">Type de frais *</Label>
          <Select id="payFrais" value={form.fraisScolariteId?.toString() ?? ''} onChange={(e) => setForm({ ...form, fraisScolariteId: Number(e.target.value) })} placeholder="— Sélectionner —">
            {frais.map((f) => <option key={f.id} value={f.id}>{f.libelle}</option>)}
          </Select></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label htmlFor="payMontant">Montant (FCFA) *</Label><Input id="payMontant" type="number" min={0} value={form.montant} onChange={(e) => setForm({ ...form, montant: Number(e.target.value) })} required /></div>
          <div className="space-y-1"><Label htmlFor="payMode">Mode de paiement *</Label>
            <Select id="payMode" value={form.modePaiement} onChange={(e) => setForm({ ...form, modePaiement: e.target.value as ModePaiement })}>
              <option value={ModePaiement.ESPECES}>Espèces</option>
              <option value={ModePaiement.VIREMENT}>Virement</option>
              <option value={ModePaiement.MOBILE_MONEY}>Mobile Money</option>
              <option value={ModePaiement.CHEQUE}>Chèque</option>
            </Select></div>
        </div>
        <div className="space-y-1"><Label htmlFor="payRef">Référence</Label><Input id="payRef" value={form.reference ?? ''} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Numéro de reçu, référence…" /></div>
      </FormDialog>

      {/* Cancel confirm */}
      <ConfirmDialog open={cancelOpen} onOpenChange={setCancelOpen} title="Annuler ce paiement ?" description={cancelTarget ? `${cancelTarget.eleve?.nom} — ${fmtAmount(cancelTarget.montant)}` : undefined} onConfirm={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)} loading={cancelMutation.isPending} confirmLabel="Annuler le paiement" variant="destructive" />

      {/* Situation financière dialog */}
      <Dialog open={situationOpen} onOpenChange={setSituationOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Situation financière</DialogTitle></DialogHeader>
          {loadingSituation ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : situation ? (
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-base">{situation.eleve?.nom} {situation.eleve?.prenom}</p>
              <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Total dû</span><span className="font-medium">{fmtAmount(situation.totalDu ?? 0)}</span></div>
              <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Total payé</span><span className="font-medium text-green-600">{fmtAmount(situation.totalPaye ?? 0)}</span></div>
              <div className="flex justify-between border-t border-[hsl(var(--border))] pt-2">
                <span className="font-semibold">Solde restant</span>
                <span className={`font-bold ${(situation.solde ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>{fmtAmount(situation.solde ?? 0)}</span>
              </div>
              {situation.paiements && situation.paiements.length > 0 && (
                <div className="mt-3 max-h-48 overflow-y-auto">
                  <p className="font-semibold mb-2">Historique</p>
                  {situation.paiements.map((p: Paiement) => (
                    <div key={p.id} className="flex justify-between text-xs py-1 border-b border-[hsl(var(--border))]/50">
                      <span>{p.fraisScolarite?.libelle ?? '—'}</span>
                      <div className="flex items-center gap-2">
                        <StatutPaiementBadge statut={p.statut} />
                        <span>{fmtAmount(p.montant)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Badge } from '@/components/ui/badge';
import { StatutEleve, StatutPaiement, StatutPresence, TypeExamen, CategorieDepense, NiveauClasse, ModePaiement } from '@/lib/types';

export function StatutEleveBadge({ statut }: { statut: StatutEleve }) {
  const map: Record<StatutEleve, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
    INSCRIT: { label: 'Inscrit', variant: 'success' },
    TRANSFERE: { label: 'Transféré', variant: 'warning' },
    ABANDONNE: { label: 'Abandonné', variant: 'destructive' },
  };
  const { label, variant } = map[statut];
  return <Badge variant={variant}>{label}</Badge>;
}

export function StatutPaiementBadge({ statut }: { statut: StatutPaiement }) {
  const map: Record<StatutPaiement, { label: string; variant: 'success' | 'destructive' }> = {
    VALIDE: { label: 'Validé', variant: 'success' },
    ANNULE: { label: 'Annulé', variant: 'destructive' },
  };
  const { label, variant } = map[statut];
  return <Badge variant={variant}>{label}</Badge>;
}

export function StatutPresenceBadge({ statut }: { statut: StatutPresence }) {
  const map: Record<StatutPresence, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
    PRESENT: { label: 'Présent', variant: 'success' },
    ABSENT: { label: 'Absent', variant: 'destructive' },
    RETARD: { label: 'Retard', variant: 'warning' },
    EXCUSE: { label: 'Excusé', variant: 'secondary' },
  };
  const { label, variant } = map[statut];
  return <Badge variant={variant}>{label}</Badge>;
}

export function TypeExamenBadge({ type }: { type: TypeExamen }) {
  const map: Record<TypeExamen, { label: string; variant: 'default' | 'secondary' | 'warning' }> = {
    DEVOIR: { label: 'Devoir', variant: 'secondary' },
    COMPOSITION: { label: 'Composition', variant: 'default' },
    CEPE: { label: 'CEPE', variant: 'warning' },
  };
  const { label, variant } = map[type];
  return <Badge variant={variant}>{label}</Badge>;
}

export function CategorieDepenseBadge({ categorie }: { categorie: CategorieDepense }) {
  const labels: Record<CategorieDepense, string> = {
    SALAIRE: 'Salaire',
    FOURNITURES: 'Fournitures',
    MAINTENANCE: 'Maintenance',
    EAU_ELECTRICITE: 'Eau/Électricité',
    COMMUNICATION: 'Communication',
    AUTRE: 'Autre',
  };
  return <Badge variant="secondary">{labels[categorie]}</Badge>;
}

export function NiveauBadge({ niveau }: { niveau: NiveauClasse }) {
  return <Badge variant={niveau === 'MATERNELLE' ? 'warning' : 'default'}>{niveau === 'MATERNELLE' ? 'Maternelle' : 'Primaire'}</Badge>;
}

export function ModePaiementBadge({ mode }: { mode: ModePaiement }) {
  const labels: Record<ModePaiement, string> = {
    ESPECES: 'Espèces',
    MOBILE_MONEY: 'Mobile Money',
    CHEQUE: 'Chèque',
    VIREMENT: 'Virement',
  };
  return <Badge variant="secondary">{labels[mode]}</Badge>;
}

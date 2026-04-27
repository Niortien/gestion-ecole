'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Tableau de bord',
  eleves: 'Élèves',
  classes: 'Classes',
  maitres: 'Enseignants',
  parents: 'Parents',
  notes: 'Notes',
  bulletins: 'Bulletins',
  presences: 'Présences',
  devoirs: 'Devoirs',
  examens: 'Examens',
  paiements: 'Paiements',
  'frais-scolarite': 'Frais de scolarité',
  depenses: 'Dépenses',
  caisse: 'Caisse',
  messagerie: 'Messagerie',
  rapports: 'Rapports',
  'annee-scolaire': 'Années scolaires',
  utilisateurs: 'Utilisateurs',
  matieres: 'Matières',
  notifications: 'Notifications',
};

export function BreadcrumbNav() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((segment, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const label = ROUTE_LABELS[segment] ?? segment;
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link href="/dashboard" className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

'use client';

import { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnneesScolaires } from '@/features/annees-scolaires';
import { useAppStore } from '@/stores/app.store';
import { CalendarRange } from 'lucide-react';

export function AnneeScolaireSelector() {
  const { data: annees, isLoading } = useAnneesScolaires();
  const { activeAnneeScolaire, setActiveAnneeScolaire } = useAppStore();

  // Auto-set active school year on first load
  useEffect(() => {
    if (annees && !activeAnneeScolaire) {
      const active = annees.find((a) => a.estActive) ?? annees[0];
      if (active) setActiveAnneeScolaire(active);
    }
  }, [annees, activeAnneeScolaire, setActiveAnneeScolaire]);

  if (isLoading) {
    return <Skeleton className="h-8 w-36" />;
  }

  if (!annees?.length) return null;

  return (
    <Select
      value={activeAnneeScolaire?.id.toString() ?? ''}
      onValueChange={(val) => {
        const found = annees.find((a) => a.id.toString() === val);
        if (found) setActiveAnneeScolaire(found);
      }}
    >
      <SelectTrigger className="h-8 w-36 gap-1.5 text-xs">
        <CalendarRange className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <SelectValue placeholder="Année scolaire" />
      </SelectTrigger>
      <SelectContent>
        {annees.map((annee) => (
          <SelectItem key={annee.id} value={annee.id.toString()} className="text-xs">
            {annee.libelle}
            {annee.estActive && (
              <span className="ml-1.5 text-[10px] text-emerald-600 font-medium">(active)</span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

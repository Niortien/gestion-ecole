'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { IconClipboardCheck } from '@tabler/icons-react';
import { presencesApi, type AppelEntryDto } from '@/lib/api/presences';
import { classesApi } from '@/lib/api/classes';
import { elevesApi } from '@/lib/api/eleves';
import { anneesScolairesApi } from '@/lib/api/annees-scolaires';
import type { Eleve } from '@/lib/types';
import { StatutPresence } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { PageHeader } from '@/components/ui/page-header';
import { StatutPresenceBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';

const STATUT_OPTIONS: { value: StatutPresence; label: string }[] = [
  { value: StatutPresence.PRESENT, label: 'Présent' },
  { value: StatutPresence.ABSENT, label: 'Absent' },
  { value: StatutPresence.RETARD, label: 'Retard' },
  { value: StatutPresence.EXCUSE, label: 'Excusé' },
];

export default function PresencesPage() {
  const qc = useQueryClient();
  const [classeId, setClasseId] = useState('');
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [loaded, setLoaded] = useState(false);
  const [presenceMap, setPresenceMap] = useState<Record<number, AppelEntryDto>>({});

  const { data: anneeActive } = useQuery({ queryKey: ['annees-scolaires', 'active'], queryFn: anneesScolairesApi.active });
  const { data: classes = [] } = useQuery({ queryKey: ['classes', anneeActive?.id], queryFn: () => classesApi.list({ anneeScolaireId: anneeActive?.id }), enabled: !!anneeActive });

  const { data: eleves = [], isLoading: loadingEleves } = useQuery({
    queryKey: ['eleves', classeId],
    queryFn: () => elevesApi.list({ classeId: Number(classeId) }),
    enabled: !!classeId && loaded,
  });

  useEffect(() => {
    if (eleves.length > 0) {
      const map: Record<number, AppelEntryDto> = {};
      eleves.forEach((e: Eleve) => { map[e.id] = { eleveId: e.id, statut: StatutPresence.PRESENT }; });
      setPresenceMap(map);
    }
  }, [eleves]);

  const appelMutation = useMutation({
    mutationFn: () => presencesApi.appel({
      classeId: Number(classeId),
      date,
      presences: Object.values(presenceMap),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['presences'] }),
  });

  const handleLoad = () => setLoaded(true);

  const setStatut = (eleveId: number, statut: StatutPresence) => {
    setPresenceMap((prev) => ({ ...prev, [eleveId]: { ...prev[eleveId], statut } }));
  };
  const setMotif = (eleveId: number, motif: string) => {
    setPresenceMap((prev) => ({ ...prev, [eleveId]: { ...prev[eleveId], motif } }));
  };

  const total = eleves.length;
  const presents = Object.values(presenceMap).filter((p) => p.statut === StatutPresence.PRESENT).length;
  const absents = Object.values(presenceMap).filter((p) => p.statut === StatutPresence.ABSENT).length;

  return (
    <div>
      <PageHeader title="Présences" description="Appel quotidien et suivi des présences" />

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3 mb-6 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="space-y-1">
          <Label htmlFor="presClasse">Classe</Label>
          <Select id="presClasse" value={classeId} onChange={(e) => { setClasseId(e.target.value); setLoaded(false); setPresenceMap({}); }} placeholder="— Sélectionner —">
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="presDate">Date</Label>
          <Input id="presDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <Button onClick={handleLoad} disabled={!classeId} size="sm">
          <IconClipboardCheck size={16} />Charger l'appel
        </Button>
      </div>

      {/* Roll call */}
      {loaded && classeId && (
        <>
          {loadingEleves ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : eleves.length === 0 ? (
            <p className="text-center text-sm text-[hsl(var(--muted-foreground))] py-10">Aucun élève dans cette classe.</p>
          ) : (
            <>
              {/* Summary */}
              <div className="flex gap-4 mb-4 text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">Total : <strong className="text-[hsl(var(--foreground))]">{total}</strong></span>
                <span className="text-green-600">Présents : <strong>{presents}</strong></span>
                <span className="text-red-600">Absents : <strong>{absents}</strong></span>
              </div>

              <div className="rounded-lg border border-[hsl(var(--border))] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[hsl(var(--muted))]/50 border-b border-[hsl(var(--border))]">
                      <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">Élève</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">Statut</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">Motif (si absent)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eleves.map((eleve) => {
                      const entry = presenceMap[eleve.id];
                      return (
                        <tr key={eleve.id} className="border-b border-[hsl(var(--border))]">
                          <td className="px-3 py-2 font-medium">{eleve.nom} {eleve.prenom}</td>
                          <td className="px-3 py-2">
                            <div className="flex gap-2 flex-wrap" role="group" aria-label={`Statut de ${eleve.prenom}`}>
                              {STATUT_OPTIONS.map((opt) => (
                                <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`statut-${eleve.id}`}
                                    value={opt.value}
                                    checked={entry?.statut === opt.value}
                                    onChange={() => setStatut(eleve.id, opt.value)}
                                    className="sr-only"
                                  />
                                  <span
                                    className={[
                                      'px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors border',
                                      entry?.statut === opt.value
                                        ? opt.value === 'PRESENT' ? 'bg-green-100 text-green-800 border-green-300'
                                          : opt.value === 'ABSENT' ? 'bg-red-100 text-red-800 border-red-300'
                                          : opt.value === 'RETARD' ? 'bg-amber-100 text-amber-800 border-amber-300'
                                          : 'bg-gray-100 text-gray-800 border-gray-300'
                                        : 'bg-transparent text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]',
                                    ].join(' ')}
                                    onClick={() => setStatut(eleve.id, opt.value)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setStatut(eleve.id, opt.value); }}
                                  >
                                    {opt.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            {(entry?.statut === StatutPresence.ABSENT || entry?.statut === StatutPresence.EXCUSE) && (
                              <input
                                type="text"
                                placeholder="Motif…"
                                value={entry?.motif ?? ''}
                                onChange={(e) => setMotif(eleve.id, e.target.value)}
                                aria-label={`Motif pour ${eleve.prenom}`}
                                className="h-7 px-2 text-sm border border-[hsl(var(--input))] rounded-md w-full max-w-xs bg-transparent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <Button onClick={() => appelMutation.mutate()} loading={appelMutation.isPending}>
                  <IconClipboardCheck size={16} />Soumettre l'appel
                </Button>
                {appelMutation.isSuccess && (
                  <span className="ml-3 text-sm text-green-600">Appel enregistré ✓</span>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { notesApi, type CreateNoteDto } from '@/lib/api/notes';
import { classesApi } from '@/lib/api/classes';
import { matieresApi } from '@/lib/api/matieres';
import { anneesScolairesApi } from '@/lib/api/annees-scolaires';
import { elevesApi } from '@/lib/api/eleves';
import type { Note } from '@/lib/types';
import { Periode } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';

const PERIODE_LABELS: Record<Periode, string> = {
  SEQUENCE1: 'Séquence 1', SEQUENCE2: 'Séquence 2', SEQUENCE3: 'Séquence 3',
  SEQUENCE4: 'Séquence 4', SEQUENCE5: 'Séquence 5', SEQUENCE6: 'Séquence 6',
};

export default function NotesPage() {
  const qc = useQueryClient();
  const [classeId, setClasseId] = useState('');
  const [periode, setPeriode] = useState<Periode>(Periode.SEQUENCE1);
  const [loadNotes, setLoadNotes] = useState(false);

  const { data: anneeActive } = useQuery({ queryKey: ['annees-scolaires', 'active'], queryFn: anneesScolairesApi.active });
  const { data: classes = [] } = useQuery({ queryKey: ['classes', anneeActive?.id], queryFn: () => classesApi.list({ anneeScolaireId: anneeActive?.id }), enabled: !!anneeActive });
  const { data: matieres = [] } = useQuery({ queryKey: ['matieres'], queryFn: matieresApi.list });

  const { data: eleves = [], isLoading: loadingEleves } = useQuery({
    queryKey: ['eleves', classeId],
    queryFn: () => elevesApi.list({ classeId: Number(classeId) }),
    enabled: !!classeId,
  });

  const { data: notes = [], isLoading: loadingNotes } = useQuery({
    queryKey: ['notes', 'classe', classeId, periode, anneeActive?.id],
    queryFn: () => notesApi.byClasse(Number(classeId), { periode, anneeScolaireId: anneeActive!.id }),
    enabled: !!classeId && !!anneeActive && loadNotes,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateNoteDto) => notesApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', 'classe', classeId] }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, valeur }: { id: number; valeur: number }) => notesApi.update(id, { valeur }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', 'classe', classeId] }),
  });

  // Build grid: rows = eleves, cols = matieres
  const getNoteValue = (eleveId: number, matiereId: number): Note | undefined =>
    notes.find((n) => n.eleve?.id === eleveId && n.matiere?.id === matiereId);

  const handleNoteBlur = (eleveId: number, matiereId: number, valeur: string) => {
    const num = parseFloat(valeur);
    if (isNaN(num) || num < 0 || num > 20) return;
    if (!anneeActive) return;
    const existing = getNoteValue(eleveId, matiereId);
    if (existing) {
      updateMutation.mutate({ id: existing.id, valeur: num });
    } else {
      createMutation.mutate({ eleveId, matiereId, classeId: Number(classeId), anneeScolaireId: anneeActive.id, periode, valeur: num });
    }
  };

  const isLoading = loadingEleves || loadingNotes;

  return (
    <div>
      <PageHeader title="Notes" description="Saisie et consultation des notes par séquence" />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-6 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="space-y-1">
          <Label htmlFor="notesClasse">Classe</Label>
          <Select id="notesClasse" value={classeId} onChange={(e) => { setClasseId(e.target.value); setLoadNotes(false); }} placeholder="— Sélectionner —">
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}{c.libelle ? ` — ${c.libelle}` : ''}</option>)}
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="notesPeriode">Séquence</Label>
          <Select id="notesPeriode" value={periode} onChange={(e) => setPeriode(e.target.value as Periode)}>
            {Object.entries(PERIODE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
        </div>
        <Button onClick={() => setLoadNotes(true)} disabled={!classeId} size="sm">
          <IconPlus size={16} />Charger la grille
        </Button>
      </div>

      {/* Notes grid */}
      {loadNotes && classeId && (
        isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : eleves.length === 0 ? (
          <p className="text-center text-sm text-[hsl(var(--muted-foreground))] py-10">Aucun élève dans cette classe.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border))]">
            <table className="w-full text-sm min-w-max" role="grid" aria-label="Grille de notes">
              <thead>
                <tr className="bg-[hsl(var(--muted))]/50 border-b border-[hsl(var(--border))]">
                  <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide sticky left-0 bg-[hsl(var(--muted))]/50 z-10 min-w-[160px]">
                    Élève
                  </th>
                  {matieres.map((m) => (
                    <th key={m.id} scope="col" className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide min-w-[80px]">
                      {m.code}
                      <span className="block text-[10px] font-normal text-[hsl(var(--muted-foreground))] normal-case">{m.nom}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eleves.map((eleve) => (
                  <tr key={eleve.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/20">
                    <td className="px-3 py-1.5 font-medium sticky left-0 bg-[hsl(var(--card))] z-10">
                      {eleve.nom} {eleve.prenom}
                    </td>
                    {matieres.map((matiere) => {
                      const note = getNoteValue(eleve.id, matiere.id);
                      return (
                        <td key={matiere.id} className="px-1 py-1 text-center">
                          <Input
                            type="number"
                            min={0}
                            max={20}
                            step={0.25}
                            defaultValue={note?.valeur ?? ''}
                            onBlur={(e) => handleNoteBlur(eleve.id, matiere.id, e.target.value)}
                            aria-label={`Note de ${eleve.prenom} en ${matiere.nom}`}
                            className="w-16 text-center h-7 text-sm"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      {loadNotes && classeId && !isLoading && (
        <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
          <IconDeviceFloppy size={12} className="inline mr-1" aria-hidden="true" />
          Les notes sont sauvegardées automatiquement à la sortie du champ.
        </p>
      )}
    </div>
  );
}

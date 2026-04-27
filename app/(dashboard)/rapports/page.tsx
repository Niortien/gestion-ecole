'use client';

import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { useRapportDirecteur, useRapportComptable } from '@/features/rapports';
import { useAppStore } from '@/stores/app.store';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/lib/types';
import { Users, BookOpen, GraduationCap, CreditCard, TrendingDown, DollarSign } from 'lucide-react';

export default function RapportsPage() {
  const { activeAnneeScolaire } = useAppStore();
  const { user } = useAuthStore();
  const role = user?.role as UserRole | undefined;
  const params = activeAnneeScolaire ? { anneeScolaireId: activeAnneeScolaire.id } : undefined;

  const { data: rapportDir, isLoading: loadingDir } = useRapportDirecteur(params);
  const { data: rapportComp, isLoading: loadingComp } = useRapportComptable(params);

  return (
    <div>
      <PageHeader
        title="Rapports"
        description="Statistiques et rapports de l'établissement"
        icon={BarChart3}
      />

      <Tabs defaultValue="directeur">
        <TabsList className="mb-6">
          {(role !== UserRole.COMPTABLE) && <TabsTrigger value="directeur">Rapport Directeur</TabsTrigger>}
          {(role !== UserRole.MAITRE && role !== UserRole.PARENT) && <TabsTrigger value="comptable">Rapport Comptable</TabsTrigger>}
        </TabsList>

        {(role !== UserRole.COMPTABLE) && (
          <TabsContent value="directeur">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <StatCard title="Total élèves" value={rapportDir?.totalEleves ?? 0} icon={Users} color="indigo" isLoading={loadingDir} />
              <StatCard title="Total classes" value={rapportDir?.totalClasses ?? 0} icon={BookOpen} color="emerald" isLoading={loadingDir} />
              <StatCard title="Total enseignants" value={rapportDir?.totalMaitres ?? 0} icon={GraduationCap} color="violet" isLoading={loadingDir} />
            </div>
            {rapportDir?.eleveParClasse && (
              <Card className="mt-6 rounded-xl">
                <CardHeader><CardTitle className="text-sm">Stats par classe</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {rapportDir.eleveParClasse.map((stat, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                        <span className="font-medium">{stat.classe}</span>
                        <span className="text-muted-foreground">{stat.count} élèves</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {(role !== UserRole.MAITRE && role !== UserRole.PARENT) && (
          <TabsContent value="comptable">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="Total recettes"
                value={`${(rapportComp?.totalPaiementsValides ?? 0).toLocaleString('fr-FR')} FCFA`}
                icon={CreditCard} color="emerald" isLoading={loadingComp}
              />
              <StatCard
                title="Total dépenses"
                value={`${(rapportComp?.totalDepenses ?? 0).toLocaleString('fr-FR')} FCFA`}
                icon={TrendingDown} color="rose" isLoading={loadingComp}
              />
              <StatCard
                title="Solde net"
                value={`${(rapportComp?.soldeActuel ?? 0).toLocaleString('fr-FR')} FCFA`}
                icon={DollarSign} color="indigo" isLoading={loadingComp}
              />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

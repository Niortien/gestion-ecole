'use client';

import { useQuery } from '@tanstack/react-query';
import {
  IconUsers,
  IconChalkboard,
  IconReceipt,
  IconUserOff,
  IconTrendingUp,
} from '@tabler/icons-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { rapportsApi } from '@/lib/api/rapports';
import { anneesScolairesApi } from '@/lib/api/annees-scolaires';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function StatCard({
  title,
  value,
  icon,
  color,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              {title}
            </p>
            {loading ? (
              <Skeleton className="mt-2 h-7 w-20" />
            ) : (
              <p className="mt-1.5 text-2xl font-bold text-[hsl(var(--foreground))]">{value}</p>
            )}
          </div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const COLORS = ['#4F6AF5', '#22c55e', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const { data: anneeActive } = useQuery({
    queryKey: ['annees-scolaires', 'active'],
    queryFn: anneesScolairesApi.active,
  });

  const { data: rapportDir, isLoading: loadingDir } = useQuery({
    queryKey: ['rapports', 'directeur', anneeActive?.id],
    queryFn: () => rapportsApi.directeur({ anneeScolaireId: anneeActive?.id }),
    enabled: !!anneeActive,
  });

  const { data: rapportCompta, isLoading: loadingCompta } = useQuery({
    queryKey: ['rapports', 'comptable', anneeActive?.id],
    queryFn: () => rapportsApi.comptable({ anneeScolaireId: anneeActive?.id }),
    enabled: !!anneeActive,
  });

  const pieData =
    rapportDir?.eleveParClasse?.map((item) => ({
      name: item.classe,
      value: item.count,
    })) ?? [];

  const barData = rapportCompta?.paiementsParMois ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Tableau de bord</h1>
        {anneeActive && (
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            Année scolaire : <span className="font-medium">{anneeActive.libelle}</span>
          </p>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total élèves"
          value={rapportDir?.totalEleves ?? 0}
          icon={<IconUsers size={20} className="text-white" />}
          color="bg-[hsl(var(--primary))]"
          loading={loadingDir}
        />
        <StatCard
          title="Classes actives"
          value={rapportDir?.totalClasses ?? 0}
          icon={<IconChalkboard size={20} className="text-white" />}
          color="bg-emerald-500"
          loading={loadingDir}
        />
        <StatCard
          title="Paiements du mois"
          value={
            rapportCompta?.totalPaiementsValides
              ? `${Number(rapportCompta.totalPaiementsValides).toLocaleString('fr-FR')} F`
              : '—'
          }
          icon={<IconReceipt size={20} className="text-white" />}
          color="bg-amber-500"
          loading={loadingCompta}
        />
        <StatCard
          title="Absences du jour"
          value={rapportDir?.absencesAujourdhui ?? 0}
          icon={<IconUserOff size={20} className="text-white" />}
          color="bg-rose-500"
          loading={loadingDir}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <IconTrendingUp size={16} aria-hidden="true" />
              Paiements par mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCompta ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: number) => [`${v.toLocaleString('fr-FR')} F`, 'Paiements']}
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <IconUsers size={16} aria-hidden="true" />
              Répartition des élèves par classe
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDir ? (
              <Skeleton className="h-48 w-full" />
            ) : pieData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
                Aucune donnée
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Maîtres</p>
            {loadingDir ? (
              <Skeleton className="h-7 w-12 mx-auto mt-2" />
            ) : (
              <p className="text-2xl font-bold mt-1.5">{rapportDir?.totalMaitres ?? 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Parents</p>
            {loadingDir ? (
              <Skeleton className="h-7 w-12 mx-auto mt-2" />
            ) : (
              <p className="text-2xl font-bold mt-1.5">{rapportDir?.totalParents ?? 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Taux présence</p>
            {loadingDir ? (
              <Skeleton className="h-7 w-16 mx-auto mt-2" />
            ) : (
              <p className="text-2xl font-bold mt-1.5">
                {rapportDir?.tauxPresence != null ? `${rapportDir.tauxPresence}%` : '—'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

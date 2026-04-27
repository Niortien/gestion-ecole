'use client';

import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/lib/types';
import { useEleves } from '@/features/eleves';
import { useClasses } from '@/features/classes';
import { useMaitres } from '@/features/maitres';
import { useNonLus } from '@/features/messagerie';
import { StatCard } from '@/components/common/StatCard';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  School,
} from 'lucide-react';
import Link from 'next/link';

const QUICK_LINKS = [
  { label: 'Gérer les élèves', href: '/eleves', icon: Users, color: 'text-indigo-500' },
  { label: 'Voir les classes', href: '/classes', icon: School, color: 'text-emerald-500' },
  { label: 'Enseignants', href: '/maitres', icon: GraduationCap, color: 'text-violet-500' },
  { label: 'Messagerie', href: '/messagerie', icon: MessageSquare, color: 'text-amber-500' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: eleves, isLoading: loadingEleves } = useEleves();
  const { data: classes, isLoading: loadingClasses } = useClasses();
  const { data: maitres, isLoading: loadingMaitres } = useMaitres();
  const { data: messages, isLoading: loadingMessages } = useNonLus();

  const role = user?.role as UserRole | undefined;
  const firstName = user?.email?.split('@')[0] ?? 'Utilisateur';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour, ${firstName} 👋`}
        description="Bienvenue sur votre tableau de bord EcolePro"
        icon={LayoutDashboard}
        actions={
          <Badge variant="outline" className="text-xs font-medium border-primary/30 text-primary bg-primary/5 px-3 py-1">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {role}
          </Badge>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {role !== UserRole.COMPTABLE && (
          <StatCard
            title="Élèves inscrits"
            value={eleves?.length ?? 0}
            icon={Users}
            color="indigo"
            isLoading={loadingEleves}
            description="Total des élèves actifs"
          />
        )}
        {role !== UserRole.COMPTABLE && (
          <StatCard
            title="Classes actives"
            value={classes?.length ?? 0}
            icon={BookOpen}
            color="emerald"
            isLoading={loadingClasses}
            description="Classes de l'année en cours"
          />
        )}
        {(role === UserRole.ADMIN || role === UserRole.DIRECTEUR) && (
          <StatCard
            title="Enseignants"
            value={maitres?.length ?? 0}
            icon={GraduationCap}
            color="violet"
            isLoading={loadingMaitres}
            description="Personnel enseignant"
          />
        )}
        <StatCard
          title="Messages non lus"
          value={messages?.length ?? 0}
          icon={MessageSquare}
          color="amber"
          isLoading={loadingMessages}
          description="Dans votre messagerie"
        />
      </div>

      {/* Quick access */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Accès rapide</h2>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="group border border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer rounded-xl">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <link.icon className={`h-5 w-5 ${link.color}`} />
                    <span className="text-sm font-medium text-foreground">{link.label}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

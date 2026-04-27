'use client';

import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/lib/types';
import { useEleves } from '@/features/eleves';
import { useClasses } from '@/features/classes';
import { useMaitres } from '@/features/maitres';
import { useNonLus } from '@/features/messagerie';
import { useMonProfilParent } from '@/features/parents';
import { StatCard } from '@/components/common/StatCard';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  School,
  FileText,
  Star,
  CalendarCheck,
  User,
} from 'lucide-react';
import Link from 'next/link';

const ADMIN_QUICK_LINKS = [
  { label: 'Gérer les élèves', href: '/eleves', icon: Users, color: 'text-indigo-500' },
  { label: 'Voir les classes', href: '/classes', icon: School, color: 'text-emerald-500' },
  { label: 'Enseignants', href: '/maitres', icon: GraduationCap, color: 'text-violet-500' },
  { label: 'Messagerie', href: '/messagerie', icon: MessageSquare, color: 'text-amber-500' },
];

const PARENT_QUICK_LINKS = [
  { label: 'Bulletins', href: '/bulletins', icon: FileText, color: 'text-indigo-500' },
  { label: 'Notes', href: '/notes', icon: Star, color: 'text-violet-500' },
  { label: 'Présences', href: '/presences', icon: CalendarCheck, color: 'text-emerald-500' },
  { label: 'Messagerie', href: '/messagerie', icon: MessageSquare, color: 'text-amber-500' },
];

function ParentDashboard() {
  const { data: parentProfil, isLoading: loadingProfil } = useMonProfilParent();
  const parentId = parentProfil?.id;
  const { data: mesEnfants, isLoading: loadingEnfants } = useEleves({ parentId });
  const { data: messages, isLoading: loadingMessages } = useNonLus();

  return (
    <div className="space-y-6">
      {/* Profil parent */}
      {loadingProfil ? (
        <Card className="rounded-xl border border-border/60"><CardContent className="p-4"><Skeleton className="h-6 w-48" /></CardContent></Card>
      ) : parentProfil && (
        <Card className="rounded-xl border border-border/60 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{parentProfil.prenom} {parentProfil.nom}</p>
              {parentProfil.telephone && (
                <p className="text-xs text-muted-foreground">{parentProfil.telephone}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Mes enfants"
          value={mesEnfants?.length ?? 0}
          icon={Users}
          color="indigo"
          isLoading={loadingEnfants}
          description="Enfants inscrits à l'école"
        />
        <StatCard
          title="Messages non lus"
          value={messages?.length ?? 0}
          icon={MessageSquare}
          color="amber"
          isLoading={loadingMessages}
          description="Dans votre messagerie"
        />
      </div>

      {/* Enfants */}
      {(loadingEnfants || (mesEnfants && mesEnfants.length > 0)) && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Mes enfants</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {loadingEnfants
              ? Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="rounded-xl border border-border/60">
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </CardContent>
                  </Card>
                ))
              : mesEnfants?.map((enfant) => (
                  <Card key={enfant.id} className="rounded-xl border border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{enfant.prenom} {enfant.nom}</p>
                          <p className="text-xs text-muted-foreground">{enfant.classe?.libelle ?? enfant.classe?.nom ?? '—'}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {enfant.statut}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Link href="/bulletins" className="flex-1 text-center rounded-lg bg-primary/8 px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/15 transition-colors">
                          Bulletins
                        </Link>
                        <Link href="/notes" className="flex-1 text-center rounded-lg bg-violet-500/8 px-2 py-1.5 text-xs font-medium text-violet-600 hover:bg-violet-500/15 transition-colors">
                          Notes
                        </Link>
                        <Link href="/presences" className="flex-1 text-center rounded-lg bg-emerald-500/8 px-2 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/15 transition-colors">
                          Présences
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Accès rapide</h2>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PARENT_QUICK_LINKS.map((link) => (
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

      {role === UserRole.PARENT ? (
        <ParentDashboard />
      ) : (
        <>
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
              {ADMIN_QUICK_LINKS.map((link) => (
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
        </>
      )}
    </div>
  );
}


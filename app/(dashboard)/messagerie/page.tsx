'use client';

import { MessageSquare, Send, Inbox } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useReception, useEnvoi, useNonLus } from '@/features/messagerie';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MessageriePage() {
  const { data: reception, isLoading: loadingReception } = useReception();
  const { data: envoi, isLoading: loadingEnvoi } = useEnvoi();
  const { data: nonLus } = useNonLus();

  return (
    <div>
      <PageHeader
        title="Messagerie"
        description="Échanges avec parents et équipe pédagogique"
        icon={MessageSquare}
      />

      <Tabs defaultValue="reception">
        <TabsList className="mb-4">
          <TabsTrigger value="reception" className="gap-2">
            <Inbox className="h-4 w-4" />
            Réception
            {(nonLus?.length ?? 0) > 0 && (
              <Badge className="ml-1 h-4 min-w-[16px] rounded-full bg-rose-500 px-1 text-[9px] text-white">
                {nonLus!.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="envoi" className="gap-2">
            <Send className="h-4 w-4" />
            Envoyés
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reception">
          {loadingReception ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : !reception?.length ? (
            <EmptyState icon={Inbox} message="Aucun message reçu" />
          ) : (
            <div className="space-y-2">
              {reception.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 rounded-xl border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{msg.sujet}</p>
                      {!msg.lu && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{msg.contenu}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {msg.dateEnvoi ? format(new Date(msg.dateEnvoi), 'dd MMM', { locale: fr }) : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="envoi">
          {loadingEnvoi ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : !envoi?.length ? (
            <EmptyState icon={Send} message="Aucun message envoyé" />
          ) : (
            <div className="space-y-2">
              {envoi.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 rounded-xl border bg-card p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{msg.sujet}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{msg.contenu}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {msg.dateEnvoi ? format(new Date(msg.dateEnvoi), 'dd MMM', { locale: fr }) : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

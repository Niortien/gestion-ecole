'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconSend, IconInbox, IconMail, IconMailOpened, IconSearch } from '@tabler/icons-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { messageApi, type SendMessageDto } from '@/lib/api/messagerie';
import { maitresApi } from '@/lib/api/maitres';
import { parentsApi } from '@/lib/api/parents';
import type { Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { FormDialog } from '@/components/ui/form-dialog';
import { Skeleton } from '@/components/ui/skeleton';

type Tab = 'reception' | 'envoi';

export default function MessageriePage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('reception');
  const [selected, setSelected] = useState<Message | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<SendMessageDto>({ destinataireId: 0, sujet: '', contenu: '' });

  const { data: reception = [], isLoading: loadingRec } = useQuery({ queryKey: ['messages', 'reception'], queryFn: messageApi.reception });
  const { data: envoi = [], isLoading: loadingEnvoi } = useQuery({ queryKey: ['messages', 'envoi'], queryFn: messageApi.envoi });
  const { data: maitres = [] } = useQuery({ queryKey: ['maitres'], queryFn: () => maitresApi.list({}) });
  const { data: parents = [] } = useQuery({ queryKey: ['parents'], queryFn: () => parentsApi.list({}) });

  const sendMutation = useMutation({
    mutationFn: (dto: SendMessageDto) => messageApi.send(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['messages'] }); setComposeOpen(false); setForm({ destinataireId: 0, sujet: '', contenu: '' }); },
  });
  const readMutation = useMutation({
    mutationFn: (id: number) => messageApi.marquerLu(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });

  const openMessage = (msg: Message) => {
    setSelected(msg);
    if (!msg.lu && tab === 'reception') readMutation.mutate(msg.id);
  };

  const messages = tab === 'reception' ? reception : envoi;
  const isLoading = tab === 'reception' ? loadingRec : loadingEnvoi;

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase();
    return m.sujet?.toLowerCase().includes(q) || m.contenu?.toLowerCase().includes(q) || m.expediteur?.nom?.toLowerCase().includes(q) || m.destinataire?.nom?.toLowerCase().includes(q);
  });

  const recipients = [
    ...maitres.map((m) => ({ id: m.user?.id ?? m.id, label: `${m.nom} ${m.prenom} (Maître)` })),
    ...parents.map((p) => ({ id: p.user?.id ?? p.id, label: `${p.nom} ${p.prenom} (Parent)` })),
  ];

  const fmtDate = (v?: string) => { try { return v ? format(new Date(v), 'dd/MM HH:mm', { locale: fr }) : ''; } catch { return ''; } };

  // map dateEnvoi → createdAt fallback
  const getMsgDate = (msg: Message) => msg.dateEnvoi ?? (msg as unknown as { createdAt?: string }).createdAt;

  const handleSubmit = (ev: React.FormEvent) => { ev.preventDefault(); sendMutation.mutate(form); };

  return (
    <div>
      <PageHeader title="Messagerie" description="Communication interne de l'école" action={
        <Button size="sm" onClick={() => setComposeOpen(true)}><IconSend size={16} />Nouveau message</Button>
      } />

      <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[400px]">
        {/* Left panel */}
        <div className="w-72 flex-shrink-0 flex flex-col border border-[hsl(var(--border))] rounded-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[hsl(var(--border))]">
            <button
              onClick={() => { setTab('reception'); setSelected(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${tab === 'reception' ? 'text-[hsl(var(--primary))] border-b-2 border-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
            >
              <IconInbox size={16} />Réception
              {reception.filter((m) => !m.lu).length > 0 && (
                <Badge className="ml-1 h-4 min-w-4 text-[10px] px-1">{reception.filter((m) => !m.lu).length}</Badge>
              )}
            </button>
            <button
              onClick={() => { setTab('envoi'); setSelected(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${tab === 'envoi' ? 'text-[hsl(var(--primary))] border-b-2 border-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
            >
              <IconSend size={16} />Envoi
            </button>
          </div>

          {/* Search */}
          <div className="p-2 border-b border-[hsl(var(--border))]">
            <div className="relative">
              <IconSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <input
                type="search"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 pr-3 h-8 text-sm border border-[hsl(var(--input))] rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                aria-label="Rechercher dans les messages"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-2 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Aucun message</p>
            ) : (
              filtered.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={[
                    'w-full text-left px-3 py-3 border-b border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--muted))]/40 transition-colors',
                    selected?.id === msg.id ? 'bg-[hsl(var(--primary))]/10' : '',
                    !msg.lu && tab === 'reception' ? 'bg-[hsl(var(--muted))]/20' : '',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-xs font-medium truncate max-w-[120px] ${!msg.lu && tab === 'reception' ? 'font-semibold' : ''}`}>
                      {tab === 'reception' ? `${msg.expediteur?.nom ?? 'Inconnu'}` : `${msg.destinataire?.nom ?? 'Inconnu'}`}
                    </span>
                    <span className={`text-[10px] text-[hsl(var(--muted-foreground))] flex-shrink-0`}>{fmtDate(getMsgDate(msg))}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {!msg.lu && tab === 'reception' ? <IconMail size={11} className="text-[hsl(var(--primary))] flex-shrink-0" /> : <IconMailOpened size={11} className="text-[hsl(var(--muted-foreground))] flex-shrink-0" />}
                    <p className={`text-xs truncate ${!msg.lu && tab === 'reception' ? 'font-medium text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`}>{msg.sujet}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 border border-[hsl(var(--border))] rounded-lg overflow-hidden">
          {selected ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-[hsl(var(--border))]">
                <h2 className="font-semibold text-base">{selected.sujet}</h2>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                De : {selected.expediteur?.nom ?? '—'} → À : {selected.destinataire?.nom ?? '—'} · {fmtDate(getMsgDate(selected))}
                </p>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.contenu}</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <IconInbox size={40} className="mx-auto text-[hsl(var(--muted-foreground))] mb-2" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Sélectionnez un message pour le lire</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose */}
      <FormDialog open={composeOpen} onOpenChange={setComposeOpen} title="Nouveau message" onSubmit={handleSubmit} loading={sendMutation.isPending} submitLabel="Envoyer">
        <div className="space-y-1"><Label htmlFor="msgDest">Destinataire *</Label>
          <Select id="msgDest" value={form.destinataireId?.toString() ?? ''} onChange={(e) => setForm({ ...form, destinataireId: Number(e.target.value) })} placeholder="— Sélectionner —">
            {recipients.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </Select></div>
        <div className="space-y-1"><Label htmlFor="msgSujet">Sujet *</Label><Input id="msgSujet" value={form.sujet} onChange={(e) => setForm({ ...form, sujet: e.target.value })} required /></div>
        <div className="space-y-1"><Label htmlFor="msgContenu">Message *</Label><Textarea id="msgContenu" value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })} rows={5} required /></div>
      </FormDialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, BookOpen, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useClasses, useDeleteClasse, useCreateClasse, createClasseSchema } from '@/features/classes';
import type { CreateClasseFormValues } from '@/features/classes';
import { useAnneesScolaires } from '@/features/annees-scolaires';
import type { Classe } from '@/lib/types';
import { NomClasse, NiveauClasse } from '@/lib/types';

export default function ClassesPage() {
  const { data: classes, isLoading } = useClasses();
  const deleteClasse = useDeleteClasse();
  const createClasse = useCreateClasse();
  const { data: annees } = useAnneesScolaires();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateClasseFormValues>({
    resolver: zodResolver(createClasseSchema),
  });

  const onSubmit = (data: CreateClasseFormValues) => {
    createClasse.mutate(data, { onSuccess: () => { reset(); setShowCreate(false); } });
  };

  const columns: ColumnDef<Classe>[] = [
    {
      accessorKey: 'nom',
      header: 'Nom',
      cell: ({ row }) => <span className="font-medium">{row.original.libelle ?? row.original.nom}</span>,
    },
    {
      accessorKey: 'niveau',
      header: 'Niveau',
    },
    {
      accessorKey: 'capacite',
      header: 'Capacité',
      cell: ({ getValue }) => <span className="font-mono">{getValue() as number}</span>,
    },
    {
      id: 'annee',
      header: 'Année scolaire',
      cell: ({ row }) => row.original.anneeScolaire?.libelle ?? '—',
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Classes"
        description="Gestion des classes de l'établissement"
        icon={BookOpen}
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle classe
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={classes ?? []}
        isLoading={isLoading}
        searchPlaceholder="Rechercher une classe..."
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Supprimer la classe ?"
        description="Cette action supprimera définitivement la classe."
        confirmLabel="Supprimer"
        onConfirm={() => {
          if (deleteId) {
            deleteClasse.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
          }
        }}
        isLoading={deleteClasse.isPending}
      />
    </div>
  );
}

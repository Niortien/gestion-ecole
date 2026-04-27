'use client';

import { Settings } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';

export default function ParametresPage() {
  return (
    <div>
      <PageHeader
        title="Paramètres"
        description="Configuration de l'établissement"
        icon={Settings}
      />
      <p className="text-sm text-muted-foreground">Paramètres à configurer prochainement.</p>
    </div>
  );
}

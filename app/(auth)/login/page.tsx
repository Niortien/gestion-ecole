'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import {
  IconSchool,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconAlertCircle,
} from '@tabler/icons-react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const mutation = useMutation({
    mutationFn: () => authApi.login(email, password),
    onSuccess: (data) => {
      login(data.access_token, data.user);
      router.replace('/dashboard');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const status = axiosError?.response?.status;
      const serverMsg = axiosError?.response?.data?.message;
      if (status === 401 || status === 403) {
        setFormError('Email ou mot de passe incorrect.');
      } else if (serverMsg) {
        setFormError(`Erreur serveur : ${serverMsg}`);
      } else {
        setFormError(`Impossible de contacter le serveur (${axiosError?.message ?? 'erreur inconnue'}). Vérifiez que le backend est démarré.`);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) {
      setFormError('Veuillez remplir tous les champs.');
      return;
    }
    mutation.mutate();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(231,88%,97%)] to-[hsl(231,60%,93%)] dark:from-[hsl(222,47%,8%)] dark:to-[hsl(222,47%,11%)] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[hsl(var(--primary))] text-white shadow-lg mb-4">
            <IconSchool size={32} />
          </div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">École Primaire</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Système de gestion scolaire</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Entrez vos identifiants pour accéder au tableau de bord</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-md bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] px-3 py-2 text-sm"
                >
                  <IconAlertCircle size={16} aria-hidden="true" />
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Adresse e-mail</Label>
                <div className="relative">
                  <IconMail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                    aria-hidden="true"
                  />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@ecole.cm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    aria-describedby={formError ? 'form-error' : undefined}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <IconLock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                    aria-hidden="true"
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" loading={mutation.isPending}>
                {mutation.isPending ? 'Connexion…' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

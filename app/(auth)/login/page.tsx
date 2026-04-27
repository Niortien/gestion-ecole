'use client';

import { Suspense, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, GraduationCap, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/features/auth';
import { loginSchema, type LoginFormValues } from '@/features/auth';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/dashboard';
  const { login, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(from);
    }
  }, [isAuthenticated, router, from]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: ({ email, password }: LoginFormValues) => authApi.login(email, password),
    onSuccess: (data) => {
      login(data.access_token, data.user);
      router.replace(from);
    },
    onError: () => {
      toast.error('Identifiants incorrects. Vérifiez votre email et mot de passe.');
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Adresse email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="email"
            type="email"
            placeholder="admin@ecole-primaire.fr"
            autoComplete="email"
            className="pl-9"
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p id="email-error" className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Mot de passe</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="pl-9"
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
        </div>
        {errors.password && (
          <p id="password-error" className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full h-10 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30"
        disabled={isPending}
      >
        {isPending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connexion en cours...</>
        ) : (
          'Se connecter'
        )}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-slate-900 via-indigo-950 to-violet-950 p-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl animate-pulse [animation-delay:1s]" />
      <div className="absolute top-1/2 left-0 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Glass card */}
        <div className="rounded-2xl border border-white/10 bg-white/8 shadow-2xl backdrop-blur-xl p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/40 mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">EcolePro</h1>
            <p className="mt-1 text-sm text-white/50">Plateforme de gestion scolaire</p>
          </div>

          {/* Form on white background */}
          <div className="rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-5 text-base font-semibold text-foreground">Connexion à votre compte</h2>
            <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
              <LoginForm />
            </Suspense>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-white/30">
            © {new Date().getFullYear()} EcolePro — Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}

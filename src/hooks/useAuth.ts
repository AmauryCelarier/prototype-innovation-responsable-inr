'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'user_accompagnateur' | 'user_startup';

interface AuthState {
  userId: string | null;
  role: UserRole | null;
  loading: boolean;
}

interface UseAuthOptions {
  /** Rôles autorisés. Si non défini, tout utilisateur connecté est accepté. */
  allowedRoles?: UserRole[];
  /** URL de redirection si non autorisé (défaut: /dashboard) */
  redirectTo?: string;
}

/**
 * Hook qui vérifie l'authentification et le rôle côté client.
 * Le middleware fait déjà la protection principale — ce hook sert
 * de couche secondaire pour afficher/masquer des éléments selon le rôle.
 */
export function useAuth(options?: UseAuthOptions): AuthState {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    userId: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
        setState({ userId: null, role: null, loading: false });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = (profile?.role ?? 'user_startup') as UserRole;

      // Vérifier si le rôle est autorisé
      if (options?.allowedRoles && !options.allowedRoles.includes(role)) {
        router.replace(options?.redirectTo ?? '/dashboard');
        setState({ userId: user.id, role, loading: false });
        return;
      }

      setState({ userId: user.id, role, loading: false });
    }

    checkAuth();
  }, [router, options?.allowedRoles, options?.redirectTo]);

  return state;
}
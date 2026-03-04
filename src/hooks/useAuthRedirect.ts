import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

/** Sends unauthenticated users to team setup after stores have hydrated. */
export function useAuthRedirect() {
  const router = useRouter();
  const team = useAuthStore((s) => s.team);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated && !team) {
      router.replace('/');
    }
  }, [isHydrated, team]);

  return { team, isHydrated };
}

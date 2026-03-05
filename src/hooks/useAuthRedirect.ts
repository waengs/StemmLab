import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../stores/authStore';
import { navigateToAuthSetup } from '../navigation/authNavigation';

/** Routes unauthenticated users to setup; users without a team stay on setup for team step. */
export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, team, isHydrated, needsTeam } = useAuthStore(
    useShallow((s) => ({
      user: s.user,
      team: s.team,
      isHydrated: s.isHydrated,
      needsTeam: s.needsTeam,
    }))
  );

  const lastTarget = useRef<string | null>(null);

  const onSetupScreen =
    pathname === '/' || pathname === '/index' || pathname === '';

  useEffect(() => {
    if (!isHydrated) return;

    if (!user || needsTeam) {
      lastTarget.current = null;
    }

    let target: string | null = null;
    if (!user && !onSetupScreen) {
      target = '/';
    } else if (user && team && onSetupScreen) {
      target = '/(tabs)';
    } else if (user && needsTeam && !onSetupScreen) {
      target = '/';
    }

    if (!target || lastTarget.current === target) return;
    lastTarget.current = target;
    if (target === '/') {
      navigateToAuthSetup();
    } else {
      router.replace(target);
    }
  }, [isHydrated, user, team, needsTeam, onSetupScreen, router, pathname]);
}

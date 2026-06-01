import { router } from 'expo-router';

let resetRedirectGuard: (() => void) | null = null;

/** Lets `useAuthRedirect` re-run after logout even if the last target was already `/`. */
export function registerAuthRedirectReset(reset: () => void): void {
  resetRedirectGuard = reset;
}

/** Navigate to sign-in. Safe during logout (navigator is already mounted). */
export function navigateToSignIn(): void {
  resetRedirectGuard?.();
  router.replace('/');
}

/** Defer navigation until after the current render (e.g. cold start / sign-in). */
export function runWhenNavigationReady(action: () => void): void {
  queueMicrotask(() => {
    requestAnimationFrame(action);
  });
}

/** @deprecated Prefer navigateToSignIn */
export function resetToLogin(): void {
  runWhenNavigationReady(navigateToSignIn);
}

/** Open the main app (tabs) after sign-in or team join. */
export function resetToApp(): void {
  runWhenNavigationReady(() => {
    router.replace('/(tabs)');
  });
}

/** @deprecated Use resetToLogin */
export const navigateToAuthSetup = resetToLogin;

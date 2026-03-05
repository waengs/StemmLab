import { router } from 'expo-router';

/** Navigate to the sign-in / setup screen without popping the navigation stack. */
export function navigateToAuthSetup(): void {
  router.replace('/');
}

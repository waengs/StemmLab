import { useAuthRedirect } from '../hooks/useAuthRedirect';

/** Single app-wide auth routing guard — mount once in root layout only. */
export function AuthRedirect() {
  useAuthRedirect();
  return null;
}

import type { ReactNode } from 'react';

/** @deprecated Auth routing lives in `app/_layout.tsx` (conditional root stack). */
export function AuthGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

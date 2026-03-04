import React, { useEffect, useState } from 'react';
import { hydrateStores } from '../stores/hydrateStores';
import { useThemeStore } from '../stores/themeStore';

interface StoreHydratorProps {
  children: React.ReactNode;
}

/** Blocks the UI until persisted theme + app data are loaded into Zustand. */
export function StoreHydrator({ children }: StoreHydratorProps) {
  const [hydrated, setHydrated] = useState(false);
  const isThemeReady = useThemeStore((s) => s.isReady);

  useEffect(() => {
    hydrateStores().finally(() => setHydrated(true));
  }, []);

  if (!hydrated || !isThemeReady) {
    return null;
  }

  return <>{children}</>;
}

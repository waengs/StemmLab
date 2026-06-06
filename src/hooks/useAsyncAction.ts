import { useCallback, useRef, useState } from 'react';

/**
 * Wraps an async function so it cannot run again until the current call finishes.
 */
export function useAsyncAction<T extends (...args: never[]) => Promise<unknown>>(
  action: T
): [(...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | undefined>, boolean] {
  const runningRef = useRef(false);
  const [isRunning, setIsRunning] = useState(false);

  const run = useCallback(
    async (...args: Parameters<T>) => {
      if (runningRef.current) return undefined;

      runningRef.current = true;
      setIsRunning(true);
      try {
        return (await action(...args)) as Awaited<ReturnType<T>>;
      } finally {
        runningRef.current = false;
        setIsRunning(false);
      }
    },
    [action]
  );

  return [run, isRunning];
}

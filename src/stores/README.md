# Zustand stores

Global state lives in `src/stores/`. Persistence goes through `src/utils/storage.ts` → **SQLite** (local) + **Firestore** (cloud sync). See `docs/FIREBASE_SETUP.md`.

## Stores

| Store | Purpose |
|-------|---------|
| `themeStore` | Light/dark mode, colors, typography |
| `authStore` | Current team session (sign in, register, profile update, logout) |
| `activityResultsStore` | Activity submissions + leaderboard source data |
| `forumStore` | Forum posts and replies |
| `sensorStore` | Sensor measurement logs |

## Adding a new feature

1. Create `src/stores/myFeatureStore.ts` with `create()` from zustand.
2. Add `hydrate`, `reset`, and async actions that call `storage.ts` helpers.
3. Register `hydrate()` in `hydrateStores.ts` and `reset()` in `resetDataStores.ts` if needed.
4. Export from `src/stores/index.ts`.
5. In screens, use narrow selectors: `useMyStore((s) => s.items)` — keep UI-only state (search text, modals) local with `useState`.
6. Selectors that return **arrays or objects** must use `useShallow` from `zustand/react/shallow`, or a dedicated hook (see `useResultsForActivity`, `useMySensorLogsAll`). Otherwise React hits "Maximum update depth exceeded".

Auth is **Firebase only** — see `docs/DATA_STORAGE.md` and `docs/FIREBASE_SETUP.md`.

## Bootstrap

`StoreHydrator` in `app/_layout.tsx` runs `hydrateStores()` once before rendering the app.

## Hooks

- `useTheme()` — stable API for themed components (backed by `themeStore`).
- `useRequireAuth()` — read auth state in screens (no navigation).
- `AuthRedirect` in `app/_layout.tsx` — single app-wide route guard.

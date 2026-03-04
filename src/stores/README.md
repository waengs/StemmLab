# Zustand stores

Global state lives in `src/stores/`. AsyncStorage remains the persistence layer in `src/utils/storage.ts`; stores hydrate from it on launch and update both memory and disk on mutations.

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
6. Selectors that return **arrays or objects** must use `useShallow` from `zustand/react/shallow`, or a dedicated hook (see `useResultsForActivity`, `useTeamSensorLogs`). Otherwise React hits "Maximum update depth exceeded".

## Bootstrap

`StoreHydrator` in `app/_layout.tsx` runs `hydrateStores()` once before rendering the app.

## Hooks

- `useTheme()` — stable API for themed components (backed by `themeStore`).
- `useAuthRedirect()` — redirects to `/` when no team after hydration.

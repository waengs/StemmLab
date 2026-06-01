import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { getSensorLogs, saveSensorLog, deleteSensorLogRecord } from '../utils/storage';
import type { SensorLog } from '../types';

const RECENT_LOG_LIMIT = 10;

interface SensorState {
  logs: SensorLog[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  reset: () => void;
  addLog: (log: SensorLog) => Promise<void>;
  updateLog: (log: SensorLog) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
}

export const useSensorStore = create<SensorState>((set) => ({
  logs: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const { getFirebaseAuth } = await import('../config/firebase');
      const uid = getFirebaseAuth().currentUser?.uid;
      if (uid) {
        const { pullUserSensorLogsFromFirestore } = await import('../services/sync/syncService');
        await pullUserSensorLogsFromFirestore(uid);
      }
    } catch (err) {
      console.warn('[sensor] cloud restore failed:', err);
    }
    const logs = await getSensorLogs();
    set({ logs, isHydrated: true });
  },

  reset: () => set({ logs: [], isHydrated: false }),

  addLog: async (log) => {
    await saveSensorLog(log);
    set((state) => ({ logs: [log, ...state.logs] }));
  },

  updateLog: async (log) => {
    await saveSensorLog(log);
    set((state) => ({
      logs: state.logs.map((l) => (l.id === log.id ? log : l)),
    }));
  },

  deleteLog: async (id) => {
    await deleteSensorLogRecord(id);
    set((state) => ({
      logs: state.logs.filter((l) => l.id !== id),
    }));
  },
}));

/** Personal log, or legacy row saved before recorded_by_uid existed (same team). */
export function isOwnedSensorLog(
  log: SensorLog,
  uid: string | undefined,
  teamDiscriminator?: string
): boolean {
  if (!uid) return false;
  if (log.recordedByUid === uid) return true;
  if (!log.recordedByUid && teamDiscriminator && log.teamDiscriminator === teamDiscriminator) {
    return true;
  }
  return false;
}

function myLogsSorted(
  state: { logs: SensorLog[] },
  uid: string | undefined,
  teamDiscriminator?: string
): SensorLog[] {
  if (!uid) return [];
  return state.logs
    .filter((l) => isOwnedSensorLog(l, uid, teamDiscriminator))
    .sort((a, b) => b.timestamp - a.timestamp);
}

/** Recent sensor logs for the signed-in user. */
export function useMySensorLogs(
  uid: string | undefined,
  teamDiscriminator?: string
): SensorLog[] {
  return useSensorStore(
    useShallow((state) => myLogsSorted(state, uid, teamDiscriminator).slice(0, RECENT_LOG_LIMIT))
  );
}

/** All sensor logs for the signed-in user (log book). */
export function useMySensorLogsAll(
  uid: string | undefined,
  teamDiscriminator?: string
): SensorLog[] {
  return useSensorStore(useShallow((state) => myLogsSorted(state, uid, teamDiscriminator)));
}

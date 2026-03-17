import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { getSensorLogs, saveSensorLog, deleteSensorLogRecord } from '../utils/storage';
import type { SensorLog } from '../types';

const TEAM_LOG_LIMIT = 10;

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

export function useTeamSensorLogs(discriminator: string | undefined): SensorLog[] {
  return useSensorStore(
    useShallow((state) => {
      if (!discriminator) return [];
      return state.logs
        .filter((l) => l.teamDiscriminator === discriminator)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, TEAM_LOG_LIMIT);
    })
  );
}

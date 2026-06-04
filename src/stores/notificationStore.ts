import { create } from 'zustand';
import type { AppNotification } from '../types';

interface NotificationState {
  notifications: AppNotification[];
  isLoading: boolean;
  setNotifications: (items: AppNotification[]) => void;
  setLoading: (loading: boolean) => void;
  markReadLocal: (id: string) => void;
  unreadCount: () => number;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,

  setNotifications: (items) =>
    set({
      notifications: items.sort((a, b) => b.timestamp - a.timestamp),
    }),

  setLoading: (isLoading) => set({ isLoading }),

  markReadLocal: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  reset: () => set({ notifications: [], isLoading: false }),
}));

import { create } from 'zustand';
import { getClientDashboardApi } from '@/lib/api/dashboard.api';
import type { ClientDashboard } from '@/lib/types/dashboard.types';

interface DashboardState {
  dashboard:   ClientDashboard | null;
  isLoading:   boolean;
  isRefreshing: boolean;
  lastFetched: Date | null;
  error:       string | null;

  loadDashboard:   () => Promise<void>;
  refreshDashboard:() => Promise<void>;
  clearDashboard:  () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboard:    null,
  isLoading:    false,
  isRefreshing: false,
  lastFetched:  null,
  error:        null,

  loadDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getClientDashboardApi();
      set({
        dashboard:   res.data.data,
        lastFetched: new Date(),
      });
    } catch (e: any) {
      set({ error: e?.response?.data?.message ?? 'Failed to load dashboard' });
      console.error('[Dashboard]', e);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshDashboard: async () => {
    set({ isRefreshing: true, error: null });
    try {
      const res = await getClientDashboardApi();
      set({
        dashboard:   res.data.data,
        lastFetched: new Date(),
      });
    } catch (e: any) {
      set({ error: e?.response?.data?.message ?? 'Failed to refresh' });
    } finally {
      set({ isRefreshing: false });
    }
  },

  clearDashboard: () => set({ dashboard: null, lastFetched: null, error: null }),
}));
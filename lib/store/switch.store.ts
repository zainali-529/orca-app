import { create } from 'zustand';
import {
  cancelSwitchApi,
  getSwitchApi,
  getSwitchSummaryApi,
  listSwitchesApi,
  requestSwitchApi,
  sendClientMessageApi,
} from '@/lib/api/switch.api';
import type {
  CancelSwitchPayload,
  EnergySwitch,
  ListSwitchesFilters,
  RequestSwitchPayload,
  SwitchPagination,
  SwitchSummary,
} from '@/lib/types/switch.types';

interface SwitchState {
  // List
  switches:      EnergySwitch[];
  pagination:    SwitchPagination | null;
  summary:       SwitchSummary | null;
  isLoadingList: boolean;

  // Detail
  selectedSwitch:  EnergySwitch | null;
  isLoadingDetail: boolean;

  // Mutations
  isCancelling:    boolean;
  isSendingMessage: boolean;

  // Actions
  loadSummary:       () => Promise<void>;
  loadSwitches:      (filters?: ListSwitchesFilters) => Promise<void>;
  loadSwitch:        (id: string) => Promise<void>;
  requestSwitch:     (payload: RequestSwitchPayload) => Promise<EnergySwitch>;
  cancelSwitch:      (id: string, payload?: CancelSwitchPayload) => Promise<void>;
  sendMessage:       (id: string, message: string) => Promise<void>;
  clearSelected:     () => void;
}

export const useSwitchStore = create<SwitchState>((set, get) => ({
  switches:         [],
  pagination:       null,
  summary:          null,
  isLoadingList:    false,
  selectedSwitch:   null,
  isLoadingDetail:  false,
  isCancelling:     false,
  isSendingMessage: false,

  // ── Summary ────────────────────────────────────────────────────────
  loadSummary: async () => {
    try {
      const res = await getSwitchSummaryApi();
      set({ summary: res.data.data.summary });
    } catch (e) {
      console.error('loadSummary error:', e);
    }
  },

  // ── List ───────────────────────────────────────────────────────────
  loadSwitches: async (filters) => {
    set({ isLoadingList: true });
    try {
      const res = await listSwitchesApi(filters);
      set({
        switches:   res.data.data.switches,
        pagination: res.data.data.pagination,
      });
    } catch (e) {
      console.error('loadSwitches error:', e);
    } finally {
      set({ isLoadingList: false });
    }
  },

  // ── Single ─────────────────────────────────────────────────────────
  loadSwitch: async (id) => {
    set({ isLoadingDetail: true, selectedSwitch: null });
    try {
      const res = await getSwitchApi(id);
      set({ selectedSwitch: res.data.data.switch });
    } catch (e) {
      console.error('loadSwitch error:', e);
    } finally {
      set({ isLoadingDetail: false });
    }
  },

  // ── Request ────────────────────────────────────────────────────────
  requestSwitch: async (payload) => {
    const res = await requestSwitchApi(payload);
    const sw  = res.data.data.switch;
    set((state) => ({ switches: [sw, ...state.switches] }));
    return sw;
  },

  // ── Cancel ─────────────────────────────────────────────────────────
  cancelSwitch: async (id, payload = {}) => {
    set({ isCancelling: true });
    try {
      const res = await cancelSwitchApi(id, payload);
      const updated = res.data.data.switch;
      set((state) => ({
        switches: state.switches.map((s) => (s._id === id ? updated : s)),
        selectedSwitch:
          state.selectedSwitch?._id === id ? updated : state.selectedSwitch,
      }));
    } finally {
      set({ isCancelling: false });
    }
  },

  // ── Message ────────────────────────────────────────────────────────
  sendMessage: async (id, message) => {
    set({ isSendingMessage: true });
    try {
      const res = await sendClientMessageApi(id, { message });
      const updated = res.data.data.switch;
      set((state) => ({
        selectedSwitch:
          state.selectedSwitch?._id === id ? updated : state.selectedSwitch,
      }));
    } finally {
      set({ isSendingMessage: false });
    }
  },

  clearSelected: () => set({ selectedSwitch: null }),
}));
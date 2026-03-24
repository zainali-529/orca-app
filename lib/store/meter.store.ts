import { create } from 'zustand';
import {
  deleteMeterReadingApi,
  getMeterReadingApi,
  getMeterReadingSummaryApi,
  listMeterReadingsApi,
  requestMeterReadingApi,
} from '@/lib/api/meter.api';
import type {
  ListMeterReadingsFilters,
  MeterReading,
  MeterReadingPagination,
  MeterReadingSummary,
  RequestMeterReadingPayload,
} from '@/lib/types/meter.types';

interface MeterReadingState {
  // List
  readings:      MeterReading[];
  pagination:    MeterReadingPagination | null;
  summary:       MeterReadingSummary | null;
  isLoadingList: boolean;

  // Detail
  selectedReading: MeterReading | null;
  isLoadingDetail: boolean;

  // Mutations
  isRequesting: boolean;

  // Actions
  loadSummary:    () => Promise<void>;
  loadReadings:   (filters?: ListMeterReadingsFilters) => Promise<void>;
  loadReading:    (id: string) => Promise<void>;
  requestReading: (payload: RequestMeterReadingPayload) => Promise<MeterReading>;
  deleteReading:  (id: string) => Promise<void>;
  clearSelected:  () => void;
}

export const useMeterReadingStore = create<MeterReadingState>((set, get) => ({
  readings:        [],
  pagination:      null,
  summary:         null,
  isLoadingList:   false,
  selectedReading: null,
  isLoadingDetail: false,
  isRequesting:    false,

  // ── Summary ────────────────────────────────────────────────────
  loadSummary: async () => {
    try {
      const res = await getMeterReadingSummaryApi();
      set({ summary: res.data.data.summary });
    } catch (e) {
      console.error('loadMeterSummary:', e);
    }
  },

  // ── List ───────────────────────────────────────────────────────
  loadReadings: async (filters) => {
    set({ isLoadingList: true });
    try {
      const res = await listMeterReadingsApi(filters);
      set({ readings: res.data.data.readings, pagination: res.data.data.pagination });
    } catch (e) {
      console.error('loadReadings:', e);
    } finally {
      set({ isLoadingList: false });
    }
  },

  // ── Single ─────────────────────────────────────────────────────
  loadReading: async (id) => {
    set({ isLoadingDetail: true, selectedReading: null });
    try {
      const res = await getMeterReadingApi(id);
      set({ selectedReading: res.data.data.reading });
    } catch (e) {
      console.error('loadReading:', e);
    } finally {
      set({ isLoadingDetail: false });
    }
  },

  // ── Request ────────────────────────────────────────────────────
  requestReading: async (payload) => {
    set({ isRequesting: true });
    try {
      const res = await requestMeterReadingApi(payload);
      const reading = res.data.data.reading;
      set((s) => ({ readings: [reading, ...s.readings] }));
      return reading;
    } finally {
      set({ isRequesting: false });
    }
  },

  // ── Delete ─────────────────────────────────────────────────────
  deleteReading: async (id) => {
    await deleteMeterReadingApi(id);
    set((s) => ({
      readings: s.readings.filter((r) => r._id !== id),
      selectedReading: s.selectedReading?._id === id ? null : s.selectedReading,
    }));
  },

  clearSelected: () => set({ selectedReading: null }),
}));
import { create } from 'zustand';
import {
  calculateTariffCostApi,
  compareTariffsApi,
  getSuppliersApi,
  getTariffApi,
  listTariffsApi,
} from '@/lib/api/tariff.api';
import type {
  ComparePayload,
  ComparisonResult,
  EnrichedTariff,
  Supplier,
  Tariff,
  TariffListFilters,
} from '@/lib/types/tariff.types';

interface TariffState {
  // List
  tariffs:          Tariff[];
  pagination:       { total: number; page: number; totalPages: number } | null;
  isLoadingList:    boolean;

  // Single tariff
  selectedTariff:   Tariff | null;
  isLoadingDetail:  boolean;

  // Comparison
  comparison:       ComparisonResult | null;
  isComparing:      boolean;

  // Suppliers
  suppliers:        Supplier[];
  isLoadingSuppliers: boolean;

  // Filters
  activeFilters:    TariffListFilters;

  // Actions
  loadTariffs:      (filters?: TariffListFilters) => Promise<void>;
  loadTariff:       (id: string) => Promise<void>;
  loadSuppliers:    () => Promise<void>;
  runComparison:    (payload: ComparePayload) => Promise<void>;
  setFilters:       (filters: TariffListFilters) => void;
  clearComparison:  () => void;
  calculateCost:    (payload: { tariffId: string; annualElectricityKwh?: number | null; annualGasKwh?: number | null }) => Promise<any>;
  calculateResult:  any | null;
  isCalculating:    boolean;
}

export const useTariffStore = create<TariffState>((set, get) => ({
  tariffs:            [],
  pagination:         null,
  isLoadingList:      false,
  selectedTariff:     null,
  isLoadingDetail:    false,
  comparison:         null,
  isComparing:        false,
  suppliers:          [],
  isLoadingSuppliers: false,
  activeFilters:      { fuelType: 'dual', sortBy: 'annualCost', order: 'asc', limit: 20 },
  calculateResult:    null,
  isCalculating:      false,

  loadTariffs: async (filters) => {
    const merged = { ...get().activeFilters, ...filters };
    set({ isLoadingList: true, activeFilters: merged });
    try {
      const res = await listTariffsApi(merged);
      set({
        tariffs:    res.data.data.tariffs,
        pagination: res.data.data.pagination,
      });
    } catch (e) {
      console.error('loadTariffs error:', e);
    } finally {
      set({ isLoadingList: false });
    }
  },

  loadTariff: async (id) => {
    set({ isLoadingDetail: true, selectedTariff: null });
    try {
      const res = await getTariffApi(id);
      set({ selectedTariff: res.data.data.tariff });
    } catch (e) {
      console.error('loadTariff error:', e);
    } finally {
      set({ isLoadingDetail: false });
    }
  },

  loadSuppliers: async () => {
    set({ isLoadingSuppliers: true });
    try {
      const res = await getSuppliersApi();
      set({ suppliers: res.data.data.suppliers });
    } catch (e) {
      console.error('loadSuppliers error:', e);
    } finally {
      set({ isLoadingSuppliers: false });
    }
  },

  runComparison: async (payload) => {
    set({ isComparing: true, comparison: null });
    try {
      const res = await compareTariffsApi(payload);
      set({ comparison: res.data.data });
    } catch (e) {
      console.error('runComparison error:', e);
      throw e;
    } finally {
      set({ isComparing: false });
    }
  },

  calculateCost: async (payload) => {
    set({ isCalculating: true, calculateResult: null });
    try {
      const res = await calculateTariffCostApi(payload);
      set({ calculateResult: res.data.data });
      return res.data.data;
    } catch (e) {
      console.error('calculateCost error:', e);
      throw e;
    } finally {
      set({ isCalculating: false });
    }
  },

  setFilters: (filters) => set({ activeFilters: { ...get().activeFilters, ...filters } }),
  clearComparison: () => set({ comparison: null }),
}));

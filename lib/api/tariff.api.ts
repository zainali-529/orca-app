import api from '@/lib/api-instance';
import type { ApiResponse } from '@/lib/types/auth.types';
import type {
  ComparePayload,
  ComparisonResult,
  Supplier,
  Tariff,
  TariffListFilters,
} from '@/lib/types/tariff.types';

// ── List tariffs with filters ──────────────────────────────
export const listTariffsApi = (filters: TariffListFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      params.append(k, String(v));
    }
  });
  return api.get<ApiResponse<{
    tariffs: Tariff[];
    pagination: {
      total: number; page: number; limit: number;
      totalPages: number; hasNext: boolean; hasPrev: boolean;
    };
    meta: { lastSynced: string | null; sources: string[] };
  }>>(`/tariffs?${params.toString()}`);
};

// ── Get single tariff ──────────────────────────────────────
export const getTariffApi = (id: string) =>
  api.get<ApiResponse<{ tariff: Tariff }>>(`/tariffs/${id}`);

// ── Get suppliers list ─────────────────────────────────────
export const getSuppliersApi = () =>
  api.get<ApiResponse<{ suppliers: Supplier[] }>>('/tariffs/suppliers');

// ── Personalised comparison ────────────────────────────────
export const compareTariffsApi = (payload: ComparePayload) =>
  api.post<ApiResponse<ComparisonResult>>('/tariffs/compare', payload);

// ── Cost calculator ────────────────────────────────────────
export const calculateTariffCostApi = (payload: {
  tariffId: string;
  annualElectricityKwh?: number | null;
  annualGasKwh?: number | null;
}) =>
  api.post<ApiResponse<{
    tariff: {
      _id: string; supplier: string; tariffName: string;
      tariffType: string; fuelType: string; isGreen: boolean;
      exitFee: number; contractLengthMonths: number;
    };
    usage: { annualElectricityKwh?: number | null; annualGasKwh?: number | null };
    costs: {
      electricityAnnualCost: number | null;
      gasAnnualCost:         number | null;
      totalAnnualCost:       number | null;
      monthlyAverage:        number | null;
      weeklyAverage:         number | null;
      dailyAverage:          number | null;
    };
    breakdown: {
      electricity: {
        unitRate: number; standingCharge: number;
        usageCost: number | null; standingTotal: number;
      } | null;
      gas: {
        unitRate: number; standingCharge: number;
        usageCost: number | null; standingTotal: number;
      } | null;
    };
  }>>('/tariffs/calculate', payload);

// ── Sync status ────────────────────────────────────────────
export const getSyncStatusApi = () =>
  api.get<ApiResponse<{
    isSyncing: boolean;
    lastSyncedAt: string | null;
    tariffCounts: { total: number; live: number; capBased: number };
    currentOfgemCap: {
      quarter: string; year: number;
      electricity: { unitRate: number; standingCharge: number };
      gas: { unitRate: number; standingCharge: number };
    };
  }>>('/tariffs/sync/status');

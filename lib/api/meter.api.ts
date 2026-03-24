import api from '@/lib/api-instance';
import type { ApiResponse } from '@/lib/types/auth.types';
import type {
  ListMeterReadingsFilters,
  MeterReading,
  MeterReadingPagination,
  MeterReadingSummary,
  RequestMeterReadingPayload,
} from '@/lib/types/meter.types';

// ── Summary (dashboard counts + latest) ──────────────────────────
export const getMeterReadingSummaryApi = () =>
  api.get<ApiResponse<{ summary: MeterReadingSummary }>>('/meter-readings/summary');

// ── List my readings ──────────────────────────────────────────────
export const listMeterReadingsApi = (filters: ListMeterReadingsFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.append(k, String(v));
  });
  return api.get<ApiResponse<{ readings: MeterReading[]; pagination: MeterReadingPagination }>>(
    `/meter-readings?${params.toString()}`
  );
};

// ── Get single reading (with raw data points) ─────────────────────
export const getMeterReadingApi = (id: string) =>
  api.get<ApiResponse<{ reading: MeterReading }>>(`/meter-readings/${id}`);

// ── Request usage data ────────────────────────────────────────────
export const requestMeterReadingApi = (payload: RequestMeterReadingPayload) =>
  api.post<ApiResponse<{ reading: MeterReading }>>('/meter-readings', payload);

// ── Delete pending request ────────────────────────────────────────
export const deleteMeterReadingApi = (id: string) =>
  api.delete<ApiResponse>(`/meter-readings/${id}`);
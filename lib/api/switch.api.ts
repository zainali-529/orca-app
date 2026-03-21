import api from '@/lib/api-instance';
import type { ApiResponse } from '@/lib/types/auth.types';
import type {
  CancelSwitchPayload,
  ClientMessagePayload,
  EnergySwitch,
  ListSwitchesFilters,
  RequestSwitchPayload,
  SwitchPagination,
  SwitchSummary,
} from '@/lib/types/switch.types';

// ── Summary (count by status) ──────────────────────────────────────
export const getSwitchSummaryApi = () =>
  api.get<ApiResponse<{ summary: SwitchSummary }>>('/switches/summary');

// ── List my switches ───────────────────────────────────────────────
export const listSwitchesApi = (filters: ListSwitchesFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.append(k, String(v));
  });
  return api.get<ApiResponse<{ switches: EnergySwitch[]; pagination: SwitchPagination }>>(
    `/switches?${params.toString()}`
  );
};

// ── Get single switch ──────────────────────────────────────────────
export const getSwitchApi = (id: string) =>
  api.get<ApiResponse<{ switch: EnergySwitch }>>(`/switches/${id}`);

// ── Request a switch (client-initiated) ───────────────────────────
export const requestSwitchApi = (payload: RequestSwitchPayload) =>
  api.post<ApiResponse<{ switch: EnergySwitch }>>('/switches', payload);

// ── Cancel a switch ────────────────────────────────────────────────
export const cancelSwitchApi = (id: string, payload: CancelSwitchPayload = {}) =>
  api.post<ApiResponse<{ switch: EnergySwitch }>>(`/switches/${id}/cancel`, payload);

// ── Send a message to the broker ──────────────────────────────────
export const sendClientMessageApi = (id: string, payload: ClientMessagePayload) =>
  api.post<ApiResponse<{ switch: EnergySwitch }>>(`/switches/${id}/message`, payload);
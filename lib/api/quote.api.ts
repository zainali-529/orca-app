import api from '@/lib/api-instance';
import type { ApiResponse } from '@/lib/types/auth.types';
import type {
  CreateQuoteRequestPayload,
  ListQuoteRequestsFilters,
  QuotePagination,
  QuoteRequest,
  QuoteSummary,
  UpdateQuoteRequestPayload,
} from '@/lib/types/quote.types';

// ── Create quote request ───────────────────────────────────────
// Most data (energySnapshot, contactDetails) auto-filled from profile on backend
export const createQuoteRequestApi = (payload: CreateQuoteRequestPayload) =>
  api.post<ApiResponse<{ quote: QuoteRequest }>>('/quotes', payload);

// ── List my quote requests ─────────────────────────────────────
export const listQuoteRequestsApi = (filters: ListQuoteRequestsFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.append(k, String(v));
  });
  return api.get<ApiResponse<{ quotes: QuoteRequest[]; pagination: QuotePagination }>>(
    `/quotes?${params.toString()}`
  );
};

// ── Summary counts ─────────────────────────────────────────────
// GET /api/quotes/summary → { pending, contacted, completed, cancelled, total }
export const getQuoteSummaryApi = () =>
  api.get<ApiResponse<{ summary: QuoteSummary }>>('/quotes/summary');

// ── Single quote request ───────────────────────────────────────
export const getQuoteRequestApi = (id: string) =>
  api.get<ApiResponse<{ quote: QuoteRequest }>>(`/quotes/${id}`);

// ── Update quote request ───────────────────────────────────────
// Client can only update: message, contactDetails, or status = 'cancelled'
export const updateQuoteRequestApi = (id: string, payload: UpdateQuoteRequestPayload) =>
  api.patch<ApiResponse<{ quote: QuoteRequest }>>(`/quotes/${id}`, payload);

// ── Delete quote request ───────────────────────────────────────
// Only allowed if status = 'pending'
export const deleteQuoteRequestApi = (id: string) =>
  api.delete<ApiResponse>(`/quotes/${id}`);
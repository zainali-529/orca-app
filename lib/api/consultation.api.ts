import api from '@/lib/api-instance';
import type { ApiResponse } from '@/lib/types/auth.types';
import type {
  BookConsultationPayload,
  BookConsultationResponse,
  CategoryOption,
  Consultation,
  ConsultationPagination,
  ConsultationSummary,
  ListConsultationsFilters,
} from '@/lib/types/consultation.types';

export const getConsultationOptionsApi = () =>
  api.get<ApiResponse<{ options: CategoryOption[] }>>('/consultations/options');

export const getConsultationSummaryApi = () =>
  api.get<ApiResponse<{ summary: ConsultationSummary }>>('/consultations/summary');

export const listConsultationsApi = (filters: ListConsultationsFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.append(k, String(v));
  });
  return api.get<ApiResponse<{ consultations: Consultation[]; pagination: ConsultationPagination }>>(
    `/consultations?${params.toString()}`
  );
};

export const getConsultationApi = (id: string) =>
  api.get<ApiResponse<{ consultation: Consultation }>>(`/consultations/${id}`);

export const bookConsultationApi = (payload: BookConsultationPayload) =>
  api.post<ApiResponse<BookConsultationResponse>>('/consultations', payload);

export const cancelConsultationApi = (id: string, reason?: string | null) =>
  api.post<ApiResponse<{ consultation: Consultation }>>(`/consultations/${id}/cancel`, { reason });

export const retryPaymentApi = (id: string) =>
  api.post<ApiResponse<BookConsultationResponse>>(`/consultations/${id}/retry-payment`);

export const submitRatingApi = (id: string, rating: number, comment?: string | null) =>
  api.post<ApiResponse<{ consultation: Consultation }>>(`/consultations/${id}/rating`, { rating, comment });
import api from '@/lib/api-instance';
import type { ApiResponse } from '@/lib/types/auth.types';
import type {
  CreateDocumentPayload,
  DocumentPagination,
  LegalDocument,
  ListDocumentsFilters,
  SignDocumentPayload,
} from '@/lib/types/document.types';

// ── Create LOA ────────────────────────────────────────────────────
// Now accepts supplier, fuelType as well (new backend fields)
export const createDocumentApi = (payload: CreateDocumentPayload = { type: 'loa' }) =>
  api.post<ApiResponse<{ document: LegalDocument }>>('/documents', payload);

// ── List my documents ─────────────────────────────────────────────
// Now supports supplier + fuelType filters
export const listDocumentsApi = (filters: ListDocumentsFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.append(k, String(v));
  });
  return api.get<ApiResponse<{ documents: LegalDocument[]; pagination: DocumentPagination }>>(
    `/documents?${params.toString()}`
  );
};

// ── Get single document ────────────────────────────────────────────
export const getDocumentApi = (id: string) =>
  api.get<ApiResponse<{ document: LegalDocument }>>(`/documents/${id}`);

// ── Sign document with base64 signature ───────────────────────────
export const signDocumentApi = (id: string, payload: SignDocumentPayload) =>
  api.post<ApiResponse<{
    document:     LegalDocument;
    pdfAvailable: boolean;
    pdfUrl:       string | null;
  }>>(`/documents/${id}/sign`, payload);

// ── Delete unsigned document ───────────────────────────────────────
export const deleteDocumentApi = (id: string) =>
  api.delete<ApiResponse>(`/documents/${id}`);

// ── Download PDF ───────────────────────────────────────────────────
// Backend does 302 redirect to Cloudinary URL.
// On mobile: use doc.pdf?.url directly with Linking.openURL()
// This helper only needed if you want to call the redirect endpoint.
export const getDocumentDownloadUrl = (id: string, baseUrl: string): string =>
  `${baseUrl}/api/documents/${id}/download`;
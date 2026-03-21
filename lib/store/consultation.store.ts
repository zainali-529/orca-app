import { create } from 'zustand';
import {
  bookConsultationApi,
  cancelConsultationApi,
  getConsultationApi,
  getConsultationOptionsApi,
  getConsultationSummaryApi,
  listConsultationsApi,
  retryPaymentApi,
  submitRatingApi,
} from '@/lib/api/consultation.api';
import type {
  BookConsultationPayload,
  BookConsultationResponse,
  CategoryOption,
  Consultation,
  ConsultationPagination,
  ConsultationSummary,
  ListConsultationsFilters,
} from '@/lib/types/consultation.types';

interface ConsultationState {
  // Options (from server)
  options:       CategoryOption[];
  isLoadingOptions: boolean;

  // List
  consultations: Consultation[];
  pagination:    ConsultationPagination | null;
  summary:       ConsultationSummary | null;
  isLoadingList: boolean;

  // Detail
  selectedConsultation: Consultation | null;
  isLoadingDetail:      boolean;

  // Mutations
  isBooking:       boolean;
  isCancelling:    boolean;
  isRetrying:      boolean;
  isRating:        boolean;

  // Actions
  loadOptions:      () => Promise<void>;
  loadSummary:      () => Promise<void>;
  loadConsultations:(filters?: ListConsultationsFilters) => Promise<void>;
  loadConsultation: (id: string) => Promise<void>;
  book:             (payload: BookConsultationPayload) => Promise<BookConsultationResponse>;
  cancel:           (id: string, reason?: string | null) => Promise<void>;
  retryPayment:     (id: string) => Promise<BookConsultationResponse>;
  submitRating:     (id: string, rating: number, comment?: string | null) => Promise<void>;
  clearSelected:    () => void;
}

export const useConsultationStore = create<ConsultationState>((set, get) => ({
  options:              [],
  isLoadingOptions:     false,
  consultations:        [],
  pagination:           null,
  summary:              null,
  isLoadingList:        false,
  selectedConsultation: null,
  isLoadingDetail:      false,
  isBooking:            false,
  isCancelling:         false,
  isRetrying:           false,
  isRating:             false,

  loadOptions: async () => {
    set({ isLoadingOptions: true });
    try {
      const res = await getConsultationOptionsApi();
      set({ options: res.data.data.options });
    } catch (e) {
      console.error('loadOptions:', e);
    } finally {
      set({ isLoadingOptions: false });
    }
  },

  loadSummary: async () => {
    try {
      const res = await getConsultationSummaryApi();
      set({ summary: res.data.data.summary });
    } catch (e) {
      console.error('loadSummary:', e);
    }
  },

  loadConsultations: async (filters) => {
    set({ isLoadingList: true });
    try {
      const res = await listConsultationsApi(filters);
      set({ consultations: res.data.data.consultations, pagination: res.data.data.pagination });
    } catch (e) {
      console.error('loadConsultations:', e);
    } finally {
      set({ isLoadingList: false });
    }
  },

  loadConsultation: async (id) => {
    set({ isLoadingDetail: true, selectedConsultation: null });
    try {
      const res = await getConsultationApi(id);
      set({ selectedConsultation: res.data.data.consultation });
    } catch (e) {
      console.error('loadConsultation:', e);
    } finally {
      set({ isLoadingDetail: false });
    }
  },

  book: async (payload) => {
    set({ isBooking: true });
    try {
      const res = await bookConsultationApi(payload);
      const data = res.data.data;
      set((s) => ({ consultations: [data.consultation, ...s.consultations] }));
      return data;
    } finally {
      set({ isBooking: false });
    }
  },

  cancel: async (id, reason) => {
    set({ isCancelling: true });
    try {
      const res = await cancelConsultationApi(id, reason);
      const updated = res.data.data.consultation;
      set((s) => ({
        consultations: s.consultations.map((c) => (c._id === id ? updated : c)),
        selectedConsultation: s.selectedConsultation?._id === id ? updated : s.selectedConsultation,
      }));
    } finally {
      set({ isCancelling: false });
    }
  },

  retryPayment: async (id) => {
    set({ isRetrying: true });
    try {
      const res = await retryPaymentApi(id);
      return res.data.data;
    } finally {
      set({ isRetrying: false });
    }
  },

  submitRating: async (id, rating, comment) => {
    set({ isRating: true });
    try {
      const res = await submitRatingApi(id, rating, comment);
      const updated = res.data.data.consultation;
      set((s) => ({
        selectedConsultation: s.selectedConsultation?._id === id ? updated : s.selectedConsultation,
        consultations: s.consultations.map((c) => (c._id === id ? updated : c)),
      }));
    } finally {
      set({ isRating: false });
    }
  },

  clearSelected: () => set({ selectedConsultation: null }),
}));
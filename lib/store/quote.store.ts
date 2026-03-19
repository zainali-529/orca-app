import { create } from 'zustand';
import {
  createQuoteRequestApi,
  deleteQuoteRequestApi,
  getQuoteRequestApi,
  getQuoteSummaryApi,
  listQuoteRequestsApi,
  updateQuoteRequestApi,
} from '@/lib/api/quote.api';
import type {
  CreateQuoteRequestPayload,
  ListQuoteRequestsFilters,
  QuotePagination,
  QuoteRequest,
  QuoteSummary,
  UpdateQuoteRequestPayload,
} from '@/lib/types/quote.types';

interface QuoteState {
  // List
  quotes:          QuoteRequest[];
  pagination:      QuotePagination | null;
  isLoadingList:   boolean;

  // Summary
  summary:         QuoteSummary | null;
  isLoadingSummary: boolean;

  // Detail
  selectedQuote:   QuoteRequest | null;
  isLoadingDetail: boolean;

  // Mutations
  isCreating:      boolean;
  isUpdating:      boolean;

  // Actions
  loadQuotes:     (filters?: ListQuoteRequestsFilters) => Promise<void>;
  loadSummary:    () => Promise<void>;
  loadQuote:      (id: string) => Promise<void>;
  createQuote:    (payload: CreateQuoteRequestPayload) => Promise<QuoteRequest>;
  updateQuote:    (id: string, payload: UpdateQuoteRequestPayload) => Promise<QuoteRequest>;
  cancelQuote:    (id: string) => Promise<QuoteRequest>;
  deleteQuote:    (id: string) => Promise<void>;
  clearSelected:  () => void;
}

export const useQuoteStore = create<QuoteState>((set, get) => ({
  quotes:           [],
  pagination:       null,
  isLoadingList:    false,
  summary:          null,
  isLoadingSummary: false,
  selectedQuote:    null,
  isLoadingDetail:  false,
  isCreating:       false,
  isUpdating:       false,

  // ── List ──────────────────────────────────────────────────────
  loadQuotes: async (filters) => {
    set({ isLoadingList: true });
    try {
      const res = await listQuoteRequestsApi(filters);
      set({
        quotes:     res.data.data.quotes,
        pagination: res.data.data.pagination,
      });
    } catch (e) {
      console.error('loadQuotes error:', e);
    } finally {
      set({ isLoadingList: false });
    }
  },

  // ── Summary ───────────────────────────────────────────────────
  loadSummary: async () => {
    set({ isLoadingSummary: true });
    try {
      const res = await getQuoteSummaryApi();
      set({ summary: res.data.data.summary });
    } catch (e) {
      console.error('loadSummary error:', e);
    } finally {
      set({ isLoadingSummary: false });
    }
  },

  // ── Single ────────────────────────────────────────────────────
  loadQuote: async (id) => {
    set({ isLoadingDetail: true, selectedQuote: null });
    try {
      const res = await getQuoteRequestApi(id);
      set({ selectedQuote: res.data.data.quote });
    } catch (e) {
      console.error('loadQuote error:', e);
    } finally {
      set({ isLoadingDetail: false });
    }
  },

  // ── Create ────────────────────────────────────────────────────
  createQuote: async (payload) => {
    set({ isCreating: true });
    try {
      const res = await createQuoteRequestApi(payload);
      const quote = res.data.data.quote;
      set((state) => ({ quotes: [quote, ...state.quotes] }));
      return quote;
    } finally {
      set({ isCreating: false });
    }
  },

  // ── Update ────────────────────────────────────────────────────
  updateQuote: async (id, payload) => {
    set({ isUpdating: true });
    try {
      const res = await updateQuoteRequestApi(id, payload);
      const updated = res.data.data.quote;
      set((state) => ({
        quotes: state.quotes.map((q) => (q._id === id ? updated : q)),
        selectedQuote:
          state.selectedQuote?._id === id ? updated : state.selectedQuote,
      }));
      return updated;
    } finally {
      set({ isUpdating: false });
    }
  },

  // ── Cancel ────────────────────────────────────────────────────
  cancelQuote: async (id) => {
    return get().updateQuote(id, { status: 'cancelled' });
  },

  // ── Delete (only pending) ─────────────────────────────────────
  deleteQuote: async (id) => {
    try {
      await deleteQuoteRequestApi(id);
      set((state) => ({
        quotes: state.quotes.filter((q) => q._id !== id),
        selectedQuote:
          state.selectedQuote?._id === id ? null : state.selectedQuote,
      }));
    } catch (e) {
      console.error('deleteQuote error:', e);
      throw e;
    }
  },

  clearSelected: () => set({ selectedQuote: null }),
}));
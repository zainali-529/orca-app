import { create } from 'zustand';
import {
  createDocumentApi,
  deleteDocumentApi,
  getDocumentApi,
  listDocumentsApi,
  signDocumentApi,
} from '@/lib/api/document.api';
import type {
  CreateDocumentPayload,
  DocumentPagination,
  LegalDocument,
  ListDocumentsFilters,
  SignDocumentPayload,
} from '@/lib/types/document.types';

interface DocumentState {
  // List
  documents:     LegalDocument[];
  pagination:    DocumentPagination | null;
  isLoadingList: boolean;

  // Detail
  selectedDocument: LegalDocument | null;
  isLoadingDetail:  boolean;

  // Mutations
  isCreating: boolean;
  isSigning:  boolean;

  // Actions
  loadDocuments:  (filters?: ListDocumentsFilters) => Promise<void>;
  loadDocument:   (id: string) => Promise<void>;
  createDocument: (payload?: CreateDocumentPayload) => Promise<LegalDocument>;
  signDocument:   (id: string, payload: SignDocumentPayload) => Promise<{
    document: LegalDocument;
    pdfAvailable: boolean;
    pdfUrl: string | null;
  }>;
  deleteDocument: (id: string) => Promise<void>;
  clearSelected:  () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents:        [],
  pagination:       null,
  isLoadingList:    false,
  selectedDocument: null,
  isLoadingDetail:  false,
  isCreating:       false,
  isSigning:        false,

  // ── List ──────────────────────────────────────────────────────────
  loadDocuments: async (filters) => {
    set({ isLoadingList: true });
    try {
      const res = await listDocumentsApi(filters);
      set({
        documents:  res.data.data.documents,
        pagination: res.data.data.pagination,
      });
    } catch (e) {
      console.error('loadDocuments error:', e);
    } finally {
      set({ isLoadingList: false });
    }
  },

  // ── Single ────────────────────────────────────────────────────────
  loadDocument: async (id) => {
    set({ isLoadingDetail: true, selectedDocument: null });
    try {
      const res = await getDocumentApi(id);
      set({ selectedDocument: res.data.data.document });
    } catch (e) {
      console.error('loadDocument error:', e);
    } finally {
      set({ isLoadingDetail: false });
    }
  },

  // ── Create ────────────────────────────────────────────────────────
  // Now supports supplier + fuelType in payload
  createDocument: async (payload = { type: 'loa' }) => {
    set({ isCreating: true });
    try {
      const res = await createDocumentApi(payload);
      const doc = res.data.data.document;
      set((state) => ({ documents: [doc, ...state.documents] }));
      return doc;
    } finally {
      set({ isCreating: false });
    }
  },

  // ── Sign ──────────────────────────────────────────────────────────
  signDocument: async (id, payload) => {
    set({ isSigning: true });
    try {
      const res = await signDocumentApi(id, payload);
      const { document: signed, pdfAvailable, pdfUrl } = res.data.data;
      set((state) => ({
        documents: state.documents.map((d) => (d._id === id ? signed : d)),
        selectedDocument:
          state.selectedDocument?._id === id ? signed : state.selectedDocument,
      }));
      return { document: signed, pdfAvailable, pdfUrl };
    } finally {
      set({ isSigning: false });
    }
  },

  // ── Delete ────────────────────────────────────────────────────────
  deleteDocument: async (id) => {
    try {
      await deleteDocumentApi(id);
      set((state) => ({
        documents: state.documents.filter((d) => d._id !== id),
        selectedDocument:
          state.selectedDocument?._id === id ? null : state.selectedDocument,
      }));
    } catch (e) {
      console.error('deleteDocument error:', e);
      throw e;
    }
  },

  clearSelected: () => set({ selectedDocument: null }),
}));
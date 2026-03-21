// ── Enums ─────────────────────────────────────────────────────────
export type DocumentStatus = 'pending_signature' | 'signed' | 'expired';
export type DocumentType   = 'loa' | 'contract' | 'bill' | 'vat_declaration' | 'other';
export type FuelType       = 'electricity' | 'gas' | 'dual' | 'any';

// ── Sub-objects ───────────────────────────────────────────────────
export interface SignerDetails {
  fullName:        string  | null;
  email:           string  | null;
  phone:           string  | null;
  companyName:     string  | null;   // ← NEW
  address?: {
    line1:    string | null;
    city:     string | null;
    postcode: string | null;
  };
  mpan:            string  | null;
  mprn:            string  | null;
  currentSupplier: string  | null;
}

export interface DocumentPdf {
  url:         string | null;
  publicId:    string | null;
  generatedAt: string | null;
}

export interface DocumentSignature {
  // data is NEVER returned by API (select:false + toJSON strip)
  signedAt:  string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

// ── Main model ────────────────────────────────────────────────────
export interface LegalDocument {
  _id:        string;
  docNumber:  string;
  client:     string;

  // ── NEW fields ─────────────────────────────────────
  supplier:     string | null;   // specific supplier LOA covers, null = any
  fuelType:     FuelType;        // electricity / gas / dual / any
  sentByAdmin:  boolean;         // true = broker sent to client
  assignedAdmin?: string | null;
  description:  string | null;   // broker message / context

  // ── Core ───────────────────────────────────────────
  type:         DocumentType;
  title:        string;
  status:       DocumentStatus;

  signerDetails: SignerDetails;
  signature?:   DocumentSignature;
  pdf?:         DocumentPdf;

  quote?: string | null;

  expiresAt:       string | null;
  expiryNotified:  boolean;

  createdAt: string;
  updatedAt: string;

  // ── Virtuals ───────────────────────────────────────
  isSigned:         boolean;
  isExpired:        boolean;
  hasPdf:           boolean;
  daysUntilExpiry:  number | null;   // ← NEW: for expiry warning banner
}

// ── Pagination ────────────────────────────────────────────────────
export interface DocumentPagination {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}

// ── API payloads ──────────────────────────────────────────────────

/** POST /api/documents — client creates LOA */
export interface CreateDocumentPayload {
  type?:        DocumentType;
  quoteId?:     string | null;
  supplier?:    string | null;   // ← NEW
  fuelType?:    FuelType;        // ← NEW
  description?: string | null;   // ← NEW (unused by client but part of schema)
}

/** POST /api/documents/:id/sign */
export interface SignDocumentPayload {
  signature: string; // base64 data URI starting with data:image/
}

/** GET /api/documents query filters */
export interface ListDocumentsFilters {
  type?:     DocumentType;
  status?:   DocumentStatus;
  supplier?: string;    // ← NEW: partial match filter
  fuelType?: FuelType;  // ← NEW
  page?:     number;
  limit?:    number;
}
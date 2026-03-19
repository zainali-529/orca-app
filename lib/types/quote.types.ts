// ── Status lifecycle: pending → contacted → completed | cancelled ──

export type QuoteRequestStatus = 'pending' | 'contacted' | 'completed' | 'cancelled';

export interface InterestedTariff {
  tariffId?:             string | null;
  supplier?:             string | null;
  tariffName?:           string | null;
  fuelType?:             string | null;
  tariffType?:           string | null;
  isGreen?:              boolean;
  estimatedAnnualCost?:  number | null;
  estimatedAnnualSaving?: number | null;
}

export interface EnergySnapshot {
  businessType?:               string | null;
  companyName?:                string | null;
  postcode?:                   string | null;
  city?:                       string | null;
  mpan?:                       string | null;
  mprn?:                       string | null;
  currentElectricitySupplier?: string | null;
  currentGasSupplier?:         string | null;
  annualElectricityKwh?:       number | null;
  annualGasKwh?:               number | null;
  electricityTariffType?:      string | null;
  gasTariffType?:              string | null;
  hasSmartMeter?:              boolean;
}

export interface QuoteContactDetails {
  name:                    string;
  email?:                  string | null;
  phone?:                  string | null;
  preferredContactMethod?: 'email' | 'phone' | 'whatsapp';
  bestTimeToContact?:      string | null;
}

export interface QuotePreferences {
  fuelType?:       'electricity' | 'gas' | 'dual' | null;
  preferGreen?:    boolean;
  preferFixed?:    boolean;
  contractLength?: 'no_preference' | 'short' | 'long' | null;
}

export interface QuoteRequest {
  _id:              string;
  quoteNumber:      string;        // QR-2025-000001
  client:           string;        // User ObjectId
  status:           QuoteRequestStatus;
  interestedTariff: InterestedTariff;
  energySnapshot:   EnergySnapshot;
  preferences:      QuotePreferences;
  contactDetails:   QuoteContactDetails;
  message?:         string | null;
  isActive?:        boolean;       // virtual: pending | contacted
  contactedAt?:     string | null;
  completedAt?:     string | null;
  cancelledAt?:     string | null;
  createdAt:        string;
  updatedAt:        string;
}

export interface QuoteSummary {
  pending:   number;
  contacted: number;
  completed: number;
  cancelled: number;
  total:     number;
}

export interface QuotePagination {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}

// ── Create payload — most fields auto-filled from profile on backend ──
export interface CreateQuoteRequestPayload {
  tariffId?:                  string | null;   // optional — tariff they saw
  annualElectricityKwh?:      number | null;
  annualGasKwh?:              number | null;
  currentSupplierAnnualCost?: number | null;
  preferences?: {
    fuelType?:       'electricity' | 'gas' | 'dual';
    preferGreen?:    boolean;
    preferFixed?:    boolean;
    contractLength?: 'no_preference' | 'short' | 'long';
  };
  contactDetails?: {
    name?:                   string;
    email?:                  string;
    phone?:                  string;
    preferredContactMethod?: 'email' | 'phone' | 'whatsapp';
    bestTimeToContact?:      string;
  };
  message?: string;
}

// ── Update payload — client can only update message/contact or cancel ──
export interface UpdateQuoteRequestPayload {
  message?: string | null;
  contactDetails?: {
    phone?:                  string;
    preferredContactMethod?: 'email' | 'phone' | 'whatsapp';
    bestTimeToContact?:      string;
  };
  status?: 'cancelled';
}

export interface ListQuoteRequestsFilters {
  status?: QuoteRequestStatus;
  page?:   number;
  limit?:  number;
}
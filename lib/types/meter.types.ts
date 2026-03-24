// ── Enums ──────────────────────────────────────────────────────────
export type MeterReadingStatus = 'requested' | 'processing' | 'fulfilled' | 'failed';
export type MeterFuelType      = 'electricity' | 'gas' | 'both';
export type MeterRequestType   = 'current_usage' | 'historical' | 'annual_estimate';
export type MeterDataSource    = 'manual' | 'n3rgy_api' | 'supplier_portal' | 'smart_meter_app';

// ── Consumption summary ───────────────────────────────────────────
export interface ConsumptionSummary {
  totalKwh:            number | null;
  dailyAvgKwh:         number | null;
  monthlyAvgKwh:       number | null;
  peakDemandKw:        number | null;
  periodDays:          number | null;
  estimatedAnnualKwh:  number | null;
  estimatedAnnualCost: number | null;
  currency:            string;
}

// ── Individual reading data point (for charts) ────────────────────
export interface ReadingDataPoint {
  timestamp:   string;
  value:       number;
  unit:        string;
  readingType: 'actual' | 'estimated' | 'substituted';
}

// ── Main model ────────────────────────────────────────────────────
export interface MeterReading {
  _id:           string;
  readingNumber: string;  // MR-2026-000001

  client?:        { _id: string; firstName: string; lastName: string; email: string } | string;
  assignedAdmin?: { _id: string; firstName: string; lastName: string; email: string } | null;

  mpan?: string | null;   // electricity meter
  mprn?: string | null;   // gas meter

  fuelType:    MeterFuelType;
  requestType: MeterRequestType;

  // Requested period (historical only)
  periodFrom?: string | null;
  periodTo?:   string | null;

  clientNotes?: string | null;

  status: MeterReadingStatus;

  // Fulfilled data (populated by admin)
  dataFrom?:   string | null;
  dataTo?:     string | null;
  dataSource?: MeterDataSource;

  electricity?: ConsumptionSummary | null;
  gas?:         ConsumptionSummary | null;

  // Raw data points for charts (returned in detail view)
  readings?: ReadingDataPoint[];

  failureReason?: string | null;

  processingAt?: string | null;
  fulfilledAt?:  string | null;
  failedAt?:     string | null;

  createdAt: string;
  updatedAt: string;

  // Virtuals
  isPending?:         boolean;
  hasFuelData?:       boolean;
  combinedAnnualKwh?: number | null;
}

// ── Summary (dashboard) ───────────────────────────────────────────
export interface MeterReadingSummary {
  requested: number;
  processing: number;
  fulfilled:  number;
  failed:     number;
  total:      number;
  active:     number;
  latestFulfilled: MeterReading | null;
}

// ── Pagination ────────────────────────────────────────────────────
export interface MeterReadingPagination {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}

// ── API Payloads ──────────────────────────────────────────────────

/** POST /api/meter-readings */
export interface RequestMeterReadingPayload {
  fuelType?:    MeterFuelType;
  requestType?: MeterRequestType;
  mpan?:        string | null;
  mprn?:        string | null;
  periodFrom?:  string | null;
  periodTo?:    string | null;
  clientNotes?: string | null;
}

/** GET /api/meter-readings filters */
export interface ListMeterReadingsFilters {
  status?:   MeterReadingStatus;
  fuelType?: MeterFuelType;
  page?:     number;
  limit?:    number;
}
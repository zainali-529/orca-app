// ── Enums ──────────────────────────────────────────────────────────
export type SwitchStatus =
  | 'requested'
  | 'submitted_to_supplier'
  | 'cooling_off'
  | 'objected'
  | 'objection_resolved'
  | 'in_progress'
  | 'pending_completion'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type SwitchFuelType = 'electricity' | 'gas' | 'dual';

export type TimelineEventType =
  | 'status_change'
  | 'note_added'
  | 'client_message'
  | 'document_linked'
  | 'quote_linked'
  | 'supplier_update'
  | 'objection_raised'
  | 'objection_resolved'
  | 'date_updated'
  | 'contract_updated';

// ── Sub-objects ────────────────────────────────────────────────────

export interface SwitchMeterDetails {
  mpan?:         string | null;
  mprn?:         string | null;
  meterSerial?:  string | null;
  supplyAddress?: {
    line1?:    string | null;
    city?:     string | null;
    postcode?: string | null;
  };
}

export interface SwitchContractDetails {
  tariffName?:              string | null;
  contractType?:            'fixed' | 'variable' | 'deemed' | null;
  contractLengthMonths?:    number | null;
  contractStartDate?:       string | null;
  contractEndDate?:         string | null;
  electricityUnitRate?:     number | null;   // p/kWh
  electricityStandingCharge?: number | null; // p/day
  gasUnitRate?:             number | null;   // p/kWh
  gasStandingCharge?:       number | null;   // p/day
  estimatedAnnualSaving?:   number | null;   // £
  exitFees?:                number | null;   // £
}

export interface TimelineEvent {
  _id:             string;
  actor:           'admin' | 'client' | 'system';
  type:            TimelineEventType;
  title:           string;
  message?:        string | null;
  fromStatus?:     SwitchStatus | null;
  toStatus?:       SwitchStatus | null;
  visibleToClient: boolean;
  createdAt:       string;
  updatedAt:       string;
}

export interface PopulatedRef {
  _id:       string;
  firstName?: string;
  lastName?:  string;
  email?:     string;
  phone?:     string;
}

// ── Main Switch model ──────────────────────────────────────────────
export interface EnergySwitch {
  _id:          string;
  switchNumber: string;

  client:        string | PopulatedRef;
  assignedAdmin: string | PopulatedRef | null;

  quote?:    string | null;
  document?: string | null;
  tariff?:   string | null;

  fuelType:        SwitchFuelType;
  currentSupplier: string;
  newSupplier:     string;
  status:          SwitchStatus;
  initiatedBy:     'admin' | 'client';

  // Key dates
  estimatedSwitchDate?: string | null;
  coolingOffEndsAt?:    string | null;
  submittedAt?:         string | null;
  completedAt?:         string | null;
  cancelledAt?:         string | null;
  failedAt?:            string | null;
  objectionRaisedAt?:   string | null;

  meterDetails:    SwitchMeterDetails;
  contractDetails: SwitchContractDetails;

  clientMessage?:      string | null;
  objectionReason?:    string | null;
  cancellationReason?: string | null;

  // Timeline — only visibleToClient=true events returned to client
  timeline: TimelineEvent[];

  createdAt: string;
  updatedAt: string;

  // Virtuals
  isActive:           boolean;
  isCompleted:        boolean;
  isCoolingOff:       boolean;
  coolingOffDaysLeft: number | null;
}

// ── Pagination ─────────────────────────────────────────────────────
export interface SwitchPagination {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}

// ── Summary (for dashboard badges) ────────────────────────────────
export interface SwitchSummary {
  requested:             number;
  submitted_to_supplier: number;
  cooling_off:           number;
  objected:              number;
  objection_resolved:    number;
  in_progress:           number;
  pending_completion:    number;
  completed:             number;
  cancelled:             number;
  failed:                number;
  total:                 number;
  active:                number;
}

// ── API payloads ───────────────────────────────────────────────────

/** POST /api/switches — client requests a switch */
export interface RequestSwitchPayload {
  fuelType:        SwitchFuelType;
  currentSupplier: string;
  newSupplier:     string;
  quoteId?:        string | null;
  documentId?:     string | null;
  estimatedSwitchDate?: string | null;
  clientMessage?:  string | null;
}

/** POST /api/switches/:id/cancel */
export interface CancelSwitchPayload {
  reason?: string | null;
}

/** POST /api/switches/:id/message */
export interface ClientMessagePayload {
  message: string;
}

/** GET /api/switches filters */
export interface ListSwitchesFilters {
  status?:   SwitchStatus;
  fuelType?: SwitchFuelType;
  page?:     number;
  limit?:    number;
}
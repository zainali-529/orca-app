export type ConsultationStatus =
  | 'requested'
  | 'awaiting_payment'
  | 'payment_failed'
  | 'payment_confirmed'
  | 'confirmed'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'refunded';

export type ConsultationCategory =
  | 'general'
  | 'tariff_review'
  | 'switch_advice'
  | 'contract_review'
  | 'energy_audit'
  | 'renewal_advice'
  | 'new_connection';

export type MeetingMethod = 'phone' | 'video' | 'in_person';
export type TimeSlot      = 'morning' | 'afternoon' | 'evening';

export interface ConsultationPayment {
  stripePaymentIntentId: string | null;
  amount:       number;   // pence
  currency:     string;
  amountPounds: number;   // £
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  paidAt?:       string | null;
  refundedAt?:   string | null;
  refundAmount?: number | null;
}

export interface Consultation {
  _id:                string;
  consultationNumber: string;
  client?:        { _id: string; firstName: string; lastName: string; email: string } | string;
  assignedBroker?: { _id: string; firstName: string; lastName: string; email: string } | null;
  category:    ConsultationCategory;
  status:      ConsultationStatus;
  duration:    30 | 45 | 60;
  price:       number;
  pricePence:  number;
  label?:      string | null;
  currency:    string;
  scheduledAt?:        string | null;
  confirmedAt?:        string | null;
  completedAt?:        string | null;
  cancelledAt?:        string | null;
  preferredDateFrom?:  string | null;
  preferredDateTo?:    string | null;
  preferredTimeSlots?: TimeSlot[];
  meetingMethod: MeetingMethod;
  meetingLink?:  string | null;
  meetingPhone?: string | null;
  clientNotes?:  string | null;
  outcome?:      string | null;
  nextSteps?:    string | null;
  cancellationReason?: string | null;
  cancelledBy?:        'client' | 'admin' | 'system' | null;
  relatedSwitch?:   { _id: string; switchNumber: string; status: string; newSupplier: string } | null;
  payment?:         ConsultationPayment | null;
  paymentAttempts?: number;
  rating?:          number | null;
  ratingComment?:   string | null;
  ratedAt?:         string | null;
  createdAt: string;
  updatedAt: string;
  isUpcoming?:       boolean;
  isPaymentPending?: boolean;
  canCancel?:        boolean;
  isActive?:         boolean;
}

export interface PricingOption {
  duration:   30 | 45 | 60;
  price:      number;
  pricePence: number;
  label:      string;
}

export interface CategoryOption {
  category:    ConsultationCategory;
  icon:        string;
  title:       string;
  description: string;
  options:     PricingOption[];
  minPrice:    number;
  maxPrice:    number;
}

export interface ConsultationSummary {
  requested: number; awaiting_payment: number; payment_failed: number;
  payment_confirmed: number; confirmed: number; scheduled: number;
  in_progress: number; completed: number; cancelled: number;
  no_show: number; refunded: number;
  total: number; active: number; upcoming: number;
}

export interface ConsultationPagination {
  total: number; page: number; limit: number;
  totalPages: number; hasNext: boolean; hasPrev: boolean;
}

export interface BookConsultationPayload {
  category?:           ConsultationCategory;
  duration?:           30 | 45 | 60;
  meetingMethod?:      MeetingMethod;
  preferredDateFrom?:  string | null;
  preferredDateTo?:    string | null;
  preferredTimeSlots?: TimeSlot[];
  clientNotes?:        string | null;
}

export interface BookConsultationResponse {
  consultation:  Consultation;
  clientSecret:  string;
  publishableKey: string;
}

export interface ListConsultationsFilters {
  status?: ConsultationStatus;
  page?:   number;
  limit?:  number;
}
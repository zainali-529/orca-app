// ─── Greeting ─────────────────────────────────────────────────────
export interface DashboardGreeting {
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  message:   string;
  firstName: string;
}

// ─── Profile ──────────────────────────────────────────────────────
export interface DashboardProfile {
  completionPercent: number;
  missing:           string[];
  businessType:      string | null;
  companyName:       string | null;
  hasMpan:           boolean;
  hasMprn:           boolean;
}

// ─── Summary badges ───────────────────────────────────────────────
export interface DashboardSummary {
  activeSwitches:          number;
  pendingDocuments:        number;
  upcomingConsultations:   number;
  pendingMeterRequests:    number;
  pendingQuotes:           number;
  highPriorityAlerts:      number;
  hasBrokerDocuments:      boolean;
}

// ─── Pipeline ─────────────────────────────────────────────────────
export interface PipelineQuotes {
  pending:   number;
  contacted: number;
  completed: number;
  cancelled: number;
  total:     number;
}
export interface PipelineDocuments {
  pendingSignature: number;
  signed:           number;
  expired:          number;
  total:            number;
}
export interface PipelineSwitches {
  active:    number;
  completed: number;
  coolingOff: number;
  objected:  number;
  cancelled: number;
  failed:    number;
  total:     number;
}
export interface PipelineConsultations {
  awaitingPayment:  number;
  paymentConfirmed: number;
  confirmed:        number;
  scheduled:        number;
  completed:        number;
  cancelled:        number;
  total:            number;
}
export interface PipelineMeterReadings {
  requested:  number;
  processing: number;
  fulfilled:  number;
  failed:     number;
  total:      number;
}
export interface DashboardPipeline {
  quotes:        PipelineQuotes;
  documents:     PipelineDocuments;
  switches:      PipelineSwitches;
  consultations: PipelineConsultations;
  meterReadings: PipelineMeterReadings;
}

// ─── Savings potential ────────────────────────────────────────────
export interface BestTariff {
  _id:                  string;
  supplier:             string;
  tariffName:           string;
  isGreen:              boolean;
  cashback:             number;
  contractLengthMonths: number;
  exitFee:              number;
  electricityUnitRate:  number;
  gasUnitRate:          number;
}
export interface SavingsPotential {
  currentAnnualCost:    number;
  currentElecCost:      number | null;
  currentGasCost:       number | null;
  bestAvailableCost:    number | null;
  bestElecCost:         number | null;
  bestGasCost:          number | null;
  potentialSaving:      number | null;
  annualSavingMonthly:  number | null;
  bestTariff:           BestTariff | null;
  dataQuality:          'estimated' | 'from_meter';
  basedOn: {
    annualElecKwh: number;
    annualGasKwh:  number;
  };
}

// ─── Upcoming events ──────────────────────────────────────────────
export type EventUrgency = 'high' | 'medium' | 'low';
export interface UpcomingEvent {
  type:          'consultation' | 'contract_renewal';
  id?:           string;
  title:         string;
  description?:  string;
  date:          string;
  daysUntil:     number;
  urgency:       EventUrgency;
  status?:       string;
  meetingMethod?: string;
  reference?:    string;
  fuelType?:     string;
  supplier?:     string;
  category?:     string;
}

// ─── Alerts ───────────────────────────────────────────────────────
export type AlertSeverity = 'high' | 'medium' | 'info';
export interface DashboardAlert {
  id?:          string;
  type:         string;
  severity:     AlertSeverity;
  icon:         string;
  title:        string;
  description:  string;
  actionRoute:  string;
  priority:     number;
}

// ─── Recent activity ──────────────────────────────────────────────
export interface ActivityItem {
  type:        string;
  id?:         string;
  icon:        string;
  title:       string;
  description: string;
  timestamp:   string;
  status:      string;
  reference?:  string;
  route:       string;
}

// ─── Quick stats ──────────────────────────────────────────────────
export interface QuickStats {
  switchesCompleted:          number;
  totalSavingsDelivered:      number;
  consultationsCompleted:     number;
  documentsSignedCount:       number;
  totalSpentOnConsultations:  number;
  totalQuoteRequests:         number;
}

// ─── Energy snapshot ──────────────────────────────────────────────
export interface EnergySnapshot {
  mpan:                string | null;
  mprn:                string | null;
  currentElecSupplier: string | null;
  currentGasSupplier:  string | null;
  annualElecKwh:       number | null;
  annualGasKwh:        number | null;
  hasSmartMeter:       boolean;
  elecContractEnds:    string | null;
  gasContractEnds:     string | null;
  elecTariffType:      string | null;
  gasTariffType:       string | null;
}

// ─── Active switch ────────────────────────────────────────────────
export interface ActiveSwitch {
  _id:                 string;
  switchNumber:        string;
  status:              string;
  currentSupplier:     string;
  newSupplier:         string;
  fuelType:            string;
  estimatedSwitchDate: string | null;
  coolingOffEndsAt:    string | null;
  updatedAt:           string;
  contractDetails?: {
    estimatedAnnualSaving?: number | null;
    tariffName?:            string | null;
  };
  coolingOffDaysLeft?: number | null;
  isActive?:           boolean;
}

// ─── Latest meter reading ─────────────────────────────────────────
export interface LatestMeterReading {
  _id:          string;
  readingNumber: string;
  fuelType:      string;
  fulfilledAt:   string;
  dataSource:    string;
  electricity?: {
    estimatedAnnualKwh:  number | null;
    estimatedAnnualCost: number | null;
    dailyAvgKwh:         number | null;
  };
  gas?: {
    estimatedAnnualKwh:  number | null;
    estimatedAnnualCost: number | null;
    dailyAvgKwh:         number | null;
  };
}

// ─── Full dashboard response ──────────────────────────────────────
export interface ClientDashboard {
  greeting:           DashboardGreeting;
  profile:            DashboardProfile;
  summary:            DashboardSummary;
  pipeline:           DashboardPipeline;
  savingsPotential:   SavingsPotential | null;
  upcomingEvents:     UpcomingEvent[];
  alerts:             DashboardAlert[];
  recentActivity:     ActivityItem[];
  quickStats:         QuickStats;
  energySnapshot:     EnergySnapshot;
  latestMeterReading: LatestMeterReading | null;
  activeSwitch:       ActiveSwitch | null;
  meta: {
    generatedAt: string;
    version:     string;
  };
}
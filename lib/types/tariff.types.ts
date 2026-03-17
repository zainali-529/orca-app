export interface TariffRates {
  unitRate:       number | null;
  standingCharge: number | null;
}

export interface Tariff {
  _id:               string;
  supplier:          string;
  supplierLogo?:     string | null;
  supplierRating?:   number | null;
  tariffName:        string;
  tariffCode?:       string | null;
  fuelType:          'electricity' | 'gas' | 'dual';
  tariffType:        'fixed' | 'variable' | 'flexible' | 'prepayment';
  region:            string;
  electricity:       TariffRates;
  gas:               TariffRates;
  contractLengthMonths: number;
  exitFee:           number;
  isGreen:           boolean;
  onlineDiscount:    boolean;
  cashback:          number;
  features:          string[];
  smartMeterRequired: boolean;
  source:            string;
  isLive?:           boolean;
  dataLabel?:        string;
  lastUpdated:       string;
  isActive:          boolean;
  // Virtuals
  annualCostElecAvg?: number | null;
  annualCostGasAvg?:  number | null;
}

export interface TariffCalculated {
  electricityAnnualCost: number | null;
  gasAnnualCost:         number | null;
  totalAnnualCost:       number | null;
  annualSaving:          number | null;
  monthlyCost:           number | null;
  isCheaper:             boolean | null;
}

export interface EnrichedTariff extends Tariff {
  calculated: TariffCalculated;
}

export interface ComparisonResult {
  comparison: {
    currentAnnualCost:          number;
    currentElecCost:            number | null;
    currentGasCost:             number | null;
    currentElectricitySupplier: string;
    currentGasSupplier:         string;
    usageProfile: {
      annualElectricityKwh: number;
      annualGasKwh:         number;
      fuelType:             string;
    };
  };
  bestDeal: {
    tariffId:    string;
    supplier:    string;
    tariffName:  string;
    annualCost:  number;
    annualSaving:number | null;
    monthlyCost: number;
  } | null;
  tariffs:    EnrichedTariff[];
  totalFound: number;
}

export interface ComparePayload {
  annualElectricityKwh?:       number | null;
  annualGasKwh?:               number | null;
  currentElectricitySupplier?: string | null;
  currentGasSupplier?:         string | null;
  currentElectricityUnitRate?: number | null;
  currentElectricityStanding?: number | null;
  currentGasUnitRate?:         number | null;
  currentGasStanding?:         number | null;
  fuelType?:                   'electricity' | 'gas' | 'dual' | 'any';
  tariffType?:                 'fixed' | 'variable' | 'flexible' | 'prepayment' | 'any';
  region?:                     string;
  isGreen?:                    boolean;
  limit?:                      number;
}

export interface Supplier {
  name:        string;
  rating?:     number | null;
  tariffCount: number;
  hasGreen:    boolean;
  fuelTypes:   string[];
  tariffTypes: string[];
  minElecRate?: number | null;
  minGasRate?:  number | null;
}

export interface TariffListFilters {
  fuelType?:   string;
  tariffType?: string;
  supplier?:   string;
  isGreen?:    string;
  sortBy?:     string;
  order?:      string;
  page?:       number;
  limit?:      number;
}

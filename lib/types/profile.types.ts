export interface Address {
  line1:    string;
  line2?:   string | null;
  city:     string;
  county?:  string | null;
  postcode: string;
  country:  string;
}

export interface EnergyDetails {
  mpan?:                       string | null;
  currentElectricitySupplier?: string | null;
  annualElectricityKwh?:       number | null;
  electricityContractEndDate?: string | null;
  electricityTariffType?:      'fixed' | 'variable' | 'flexible' | 'unknown' | null;
  mprn?:                       string | null;
  currentGasSupplier?:         string | null;
  annualGasKwh?:               number | null;
  gasContractEndDate?:         string | null;
  gasTariffType?:              'fixed' | 'variable' | 'flexible' | 'unknown' | null;
  hasSmartMeter?:              boolean;
}

export interface OnboardingSteps {
  businessType:    boolean;
  businessDetails: boolean;
  address:         boolean;
  energyDetails:   boolean;
  review:          boolean;
}

export interface OnboardingStatus {
  isCompleted:  boolean;
  completedAt:  string | null;
  currentStep:  number;
  totalSteps:   number;
  steps:        OnboardingSteps;
  businessType: string | null;
}

export interface UserProfile {
  _id:               string;
  user:              string;
  businessType:      'residential' | 'sme' | 'commercial' | 'industrial' | null;
  companyName?:      string | null;
  companyNumber?:    string | null;
  vatNumber?:        string | null;
  sicCode?:          string | null;
  numberOfEmployees?: string | null;
  businessPhone?:    string | null;
  businessEmail?:    string | null;
  billingAddress?:   Address;
  supplyAddress?:    Address | null;
  sameAddress:       boolean;
  energy:            EnergyDetails;
  preferGreenEnergy: boolean;
  preferFixedTariff: boolean;
  contactPreference: 'email' | 'phone' | 'whatsapp';
  onboarding:        {
    isCompleted:  boolean;
    completedAt:  string | null;
    currentStep:  number;
    steps:        OnboardingSteps;
  };
  avatarUrl?:        string | null;
  createdAt:         string;
  updatedAt:         string;
}

// Step payloads
export interface Step1Payload {
  businessType: 'residential' | 'sme' | 'commercial' | 'industrial';
}

export interface Step2Payload {
  companyName?:       string;
  companyNumber?:     string;
  vatNumber?:         string;
  numberOfEmployees?: string;
  businessPhone?:     string;
  businessEmail?:     string;
}

export interface Step3Payload {
  billingAddress: Omit<Address, 'country'> & { country?: string };
  sameAddress:    boolean;
  supplyAddress?: Omit<Address, 'country'> & { country?: string };
}

export interface Step4Payload {
  mpan?:                       string;
  currentElectricitySupplier?: string;
  annualElectricityKwh?:       number;
  electricityContractEndDate?: string;
  electricityTariffType?:      string;
  mprn?:                       string;
  currentGasSupplier?:         string;
  annualGasKwh?:               number;
  gasContractEndDate?:         string;
  gasTariffType?:              string;
  hasSmartMeter?:              boolean;
}

export interface Step5Payload {
  preferGreenEnergy?: boolean;
  preferFixedTariff?: boolean;
  contactPreference?: 'email' | 'phone' | 'whatsapp';
}
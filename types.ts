
export type BusinessType = 
  'Allgemein' | 'Ferkelzucht' | 'Putenzucht' | 'Hähnchenstall' | 'Fleischerei' | 
  'Catering' | 'Hotel' | 'Logistikbetrieb' | 'Immobilienverwalter' | 
  'Industriebetrieb' | 'Verwaltung' | 'Schule' | 'BBZ';

export interface SimulationInput {
  businessType: BusinessType;
  annualConsumption: number;
  annualProduction: number;
  electricityPrice: number;
  feedInTariff: number;
  batterySize: number;
  maxChargePower: number;
  batteryEfficiency: number;
  constructionSubsidy: number;
}

export interface BusinessProfileConfig {
  weekendFactor: number; // Multiplikator für den Verbrauch am Wochenende (1.0 = keine Änderung)
  seasonalProfile: 'none' | 'winter_peak' | 'summer_peak' | 'summer_low';
}

export interface CostParameters {
  capacity: number;
  specificCost: number;
}

export interface InvestmentDetails {
  specificCost: number;
  totalBessCost: number;
  totalSubsidyCost: number;
  totalInvestment: number;
}

export interface HourlyDataPoint {
  hour: number;
  consumption: number;
  production: number;
  pvToLoad: number;
  batteryDischarge: number;
  gridImport: number;
  batteryCharge: number;
  gridExport: number;
  batterySoC: number;
}

export interface DailyBreakdown {
  [key: string]: HourlyDataPoint[];
}

export interface SimulationResult {
  batterySize: number;
  investment: number;
  gridImportWithBattery: number;
  gridExportWithBattery: number;
  annualCostWithBattery: number;
  annualCostWithoutBattery: number;
  annualSavings: number;
  selfSufficiency: number;
  selfConsumption: number;
  paybackPeriod: number | null;
  dailyData?: DailyBreakdown;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'error';
  content: string;
}

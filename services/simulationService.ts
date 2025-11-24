
import { SimulationInput, SimulationResult, InvestmentDetails, DailyBreakdown, HourlyDataPoint, BusinessType } from '../types';
import { COST_PARAMETERS, LOAD_PROFILES, BUSINESS_PROFILE_CONFIGS } from '../constants';

// Generates a synthetic hourly profile for a whole year (8760 hours)
const generateHourlyProfiles = (annualConsumption: number, annualProduction: number, businessType: BusinessType): { consumption: number[], production: number[] } => {
  const hoursInYear = 8760;
  const consumptionProfile: number[] = [];
  const productionProfile: number[] = [];

  const dailyConsumptionPattern = LOAD_PROFILES[businessType] || LOAD_PROFILES['Allgemein'];
  const profileConfig = BUSINESS_PROFILE_CONFIGS[businessType] || BUSINESS_PROFILE_CONFIGS['Allgemein'];
  const dailyProductionPattern = [0, 0, 0, 0, 0, 0.1, 0.4, 0.7, 0.9, 1.0, 1.1, 1.2, 1.1, 1.0, 0.9, 0.7, 0.4, 0.1, 0, 0, 0, 0, 0, 0];

  let totalConsumptionFactor = 0;
  let totalProductionFactor = 0;

  // We use a fixed year (non-leap) for consistent day-of-week calculation.
  const yearForDayCalc = 2023; 

  for (let day = 0; day < 365; day++) {
    const dayOfYear = day + 1;
    
    // Determine day of week (0=Sun, 6=Sat)
    const date = new Date(yearForDayCalc, 0, dayOfYear);
    const dayOfWeek = date.getDay();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

    // Production seasonal factor (peaks in summer)
    const productionSeasonalFactor = 1 + 0.4 * Math.cos(2 * Math.PI * (dayOfYear - 172) / 365);

    // Consumption seasonal factor based on business type
    let consumptionSeasonalFactor = 1.0;
    switch (profileConfig.seasonalProfile) {
      case 'summer_peak':
        consumptionSeasonalFactor = 1 + 0.3 * Math.cos(2 * Math.PI * (dayOfYear - 196) / 365); // Peak in mid-July
        break;
      case 'winter_peak':
        consumptionSeasonalFactor = 1 - 0.4 * Math.cos(2 * Math.PI * (dayOfYear - 196) / 365); // Peak in mid-January
        break;
      case 'summer_low':
        // Strong dip for ~6 weeks during summer holidays (July/August)
        consumptionSeasonalFactor = 1.0 - 0.9 * Math.exp(-Math.pow((dayOfYear - 208) / 25, 2));
        break;
      case 'none':
      default:
        consumptionSeasonalFactor = 1.0;
        break;
    }
    
    for (let hour = 0; hour < 24; hour++) {
      let consumptionFactor = dailyConsumptionPattern[hour];
      
      // Apply weekend factor
      if (isWeekend) {
        consumptionFactor *= profileConfig.weekendFactor;
      }
      
      // Apply seasonal factor
      consumptionFactor *= consumptionSeasonalFactor;
      
      // To avoid negative consumption from deep seasonal dips
      consumptionFactor = Math.max(0, consumptionFactor);

      const productionFactor = dailyProductionPattern[hour] * productionSeasonalFactor;
      
      totalConsumptionFactor += consumptionFactor;
      totalProductionFactor += productionFactor;
      
      consumptionProfile.push(consumptionFactor);
      productionProfile.push(productionFactor);
    }
  }

  // Normalize to match annual totals provided by the user
  const consumptionScaling = (totalConsumptionFactor > 0) ? annualConsumption / totalConsumptionFactor : 0;
  const productionScaling = (totalProductionFactor > 0) ? annualProduction / totalProductionFactor : 0;

  return {
    consumption: consumptionProfile.map(v => v * consumptionScaling),
    production: productionProfile.map(v => v * productionScaling),
  };
};

// Gets specific cost per kWh based on capacity, with interpolation
const getSpecificCost = (capacity: number): number => {
  const sortedCosts = [...COST_PARAMETERS].sort((a, b) => a.capacity - b.capacity);
  if (capacity <= sortedCosts[0].capacity) return sortedCosts[0].specificCost;
  if (capacity >= sortedCosts[sortedCosts.length - 1].capacity) return sortedCosts[sortedCosts.length - 1].specificCost;

  for (let i = 0; i < sortedCosts.length - 1; i++) {
    const lower = sortedCosts[i];
    const upper = sortedCosts[i + 1];
    if (capacity >= lower.capacity && capacity <= upper.capacity) {
      const range = upper.capacity - lower.capacity;
      const pos = capacity - lower.capacity;
      const costRange = upper.specificCost - lower.specificCost;
      return lower.specificCost + (pos / range) * costRange;
    }
  }
  return sortedCosts[sortedCosts.length - 1].specificCost; // Fallback
};

// Calculates investment details
export const calculateInvestment = (batterySize: number, maxChargePower: number, constructionSubsidy: number): InvestmentDetails => {
  const specificCost = getSpecificCost(batterySize);
  const totalBessCost = batterySize * specificCost;
  const totalSubsidyCost = maxChargePower * constructionSubsidy;
  const totalInvestment = totalBessCost + totalSubsidyCost;
  return { specificCost, totalBessCost, totalSubsidyCost, totalInvestment };
};


// The main simulation function
export const runSimulation = (input: SimulationInput, includeDailyData: boolean = false): SimulationResult => {
  const { businessType, annualConsumption, annualProduction, electricityPrice, feedInTariff, batterySize, maxChargePower, batteryEfficiency, constructionSubsidy } = input;
  
  const investmentDetails = calculateInvestment(batterySize, maxChargePower, constructionSubsidy);
  const totalInvestment = investmentDetails.totalInvestment;

  const { consumption, production } = generateHourlyProfiles(annualConsumption, annualProduction, businessType);

  let batterySoC = 0;
  let gridImportWithBattery = 0;
  let gridExportWithBattery = 0;
  let gridImportWithoutBattery = 0;
  let gridExportWithoutBattery = 0;
  
  const representativeDays: { [key: string]: number } = { 'Januar': 14, 'April': 104, 'Juli': 195, 'November': 319 };
  const dailyData: DailyBreakdown = { 'Januar': [], 'April': [], 'Juli': [], 'November': [] };

  const maxDischargePower = maxChargePower; // Assuming symmetrical power

  for (let i = 0; i < consumption.length; i++) {
    const hourlyConsumption = consumption[i];
    const hourlyProduction = production[i];
    const netEnergy = hourlyProduction - hourlyConsumption;
    const initialSoC = batterySoC;

    // --- Calculation WITHOUT battery (for baseline comparison) ---
    if (netEnergy > 0) {
      gridExportWithoutBattery += netEnergy;
    } else {
      gridImportWithoutBattery -= netEnergy; // netEnergy is negative, so add absolute value
    }

    // --- Simulation WITH battery ---
    if (netEnergy > 0) { // Surplus energy: charge battery or export
      const chargeAmount = Math.min(netEnergy, maxChargePower, batterySize - batterySoC);
      batterySoC += chargeAmount;
      gridExportWithBattery += (netEnergy - chargeAmount);
    } else { // Deficit energy: discharge battery or import
      const deficit = -netEnergy;
      
      const dischargeAmount = Math.min(deficit, maxDischargePower, batterySoC);
      batterySoC -= dischargeAmount;
      
      const effectiveDischarge = dischargeAmount * batteryEfficiency;
      
      gridImportWithBattery += (deficit - effectiveDischarge);
    }

    // Capture data for representative day if requested
    if (includeDailyData) {
      const dayOfYear = Math.floor(i / 24);
      const hourOfDay = i % 24;
      const monthName = Object.keys(representativeDays).find(key => representativeDays[key] === dayOfYear);
      
      if (monthName) {
        let hourlyDataPoint: HourlyDataPoint;
        if (netEnergy > 0) { // Surplus
            const pvDirectToLoad = Math.min(hourlyProduction, hourlyConsumption);
            const chargeAmount = Math.min(netEnergy, maxChargePower, batterySize - initialSoC);
            hourlyDataPoint = {
                hour: hourOfDay, consumption: hourlyConsumption, production: hourlyProduction,
                pvToLoad: pvDirectToLoad, batteryDischarge: 0, gridImport: 0,
                batteryCharge: chargeAmount, gridExport: netEnergy - chargeAmount, batterySoC: batterySoC,
            };
        } else { // Deficit
            const deficit = -netEnergy;
            const pvDirectToLoad = hourlyProduction;
            const dischargeAmount = Math.min(deficit, maxDischargePower, initialSoC);
            const effectiveDischarge = dischargeAmount * batteryEfficiency;
            const gridImport = Math.max(0, deficit - effectiveDischarge);

            hourlyDataPoint = {
                hour: hourOfDay, consumption: hourlyConsumption, production: hourlyProduction,
                pvToLoad: pvDirectToLoad, batteryDischarge: effectiveDischarge, gridImport: gridImport,
                batteryCharge: 0, gridExport: 0, batterySoC: batterySoC,
            };
        }
        dailyData[monthName].push(hourlyDataPoint);
      }
    }
  }

  const annualCostWithoutBattery = (gridImportWithoutBattery * electricityPrice) - (gridExportWithoutBattery * feedInTariff);
  const annualCostWithBattery = (gridImportWithBattery * electricityPrice) - (gridExportWithBattery * feedInTariff);
  const annualSavings = annualCostWithoutBattery - annualCostWithBattery;

  const selfConsumption = (annualProduction > 0) ? (annualProduction - gridExportWithBattery) / annualProduction : 0;
  const selfSufficiency = (annualConsumption > 0) ? 1 - (gridImportWithBattery / annualConsumption) : 1;

  const paybackPeriod = (annualSavings > 0) ? totalInvestment / annualSavings : null;

  return {
    batterySize,
    investment: totalInvestment,
    gridImportWithBattery,
    gridExportWithBattery,
    annualCostWithBattery,
    annualCostWithoutBattery,
    annualSavings,
    selfSufficiency,
    selfConsumption,
    paybackPeriod,
    dailyData: includeDailyData ? dailyData : undefined,
  };
};

/**
 * Finds the optimal battery size by simulating a range of sizes.
 * The "optimal" size is defined as the one with the shortest payback period.
 * If no size is profitable, it defaults to the one with the highest self-sufficiency.
 */
export const findOptimalBatterySize = (baseInput: Omit<SimulationInput, 'batterySize' | 'maxChargePower'>): SimulationResult => {
  const testSizes: number[] = [];
  // Create a comprehensive range of sizes to test
  for (let i = 10; i <= 200; i += 10) testSizes.push(i);
  for (let i = 250; i <= 1000; i += 50) testSizes.push(i);
  for (let i = 1100; i <= 2000; i += 100) testSizes.push(i);

  // Run simulation for all test sizes
  const results: SimulationResult[] = testSizes.map(size => {
    // Assume max charge/discharge power is C-Rate of 0.5 for optimization purposes
    const simInput = { ...baseInput, batterySize: size, maxChargePower: size / 2 };
    return runSimulation(simInput, false); // Daily data not needed for optimization
  });

  // Filter for profitable options (those with a valid, positive payback period)
  const profitableResults = results.filter(r => r.paybackPeriod !== null && r.paybackPeriod > 0);

  let bestResult: SimulationResult | null = null;

  if (profitableResults.length > 0) {
    // Of the profitable options, find the one with the SHORTEST payback period
    bestResult = profitableResults.reduce((best, current) => 
      current.paybackPeriod! < best.paybackPeriod! ? current : best
    );
  } else if (results.length > 0) {
    // If no profitable options exist, fall back to the one with the highest self-sufficiency
    bestResult = results.reduce((best, current) => 
      current.selfSufficiency > best.selfSufficiency ? current : best
    );
  }

  // Fallback in case no simulations could be run
  if (!bestResult) {
      return runSimulation({ ...baseInput, batterySize: 100, maxChargePower: 50 });
  }

  return bestResult;
};
import { CostParameters, BusinessType, BusinessProfileConfig } from './types';

export const COST_PARAMETERS: CostParameters[] = [
  { capacity: 0, specificCost: 500 }, // Base cost for smaller systems
  { capacity: 100, specificCost: 400 },
  { capacity: 250, specificCost: 350 },
  { capacity: 500, specificCost: 315 },
  { capacity: 1000, specificCost: 280 },
  { capacity: 2000, specificCost: 255 },
];

export const BATTERY_SIZES_TO_COMPARE = [50, 100, 250, 500, 1000];

export const BUSINESS_TYPES: BusinessType[] = [
  'Allgemein', 'Ferkelzucht', 'Putenzucht', 'Hähnchenstall', 'Fleischerei', 'Catering', 
  'Hotel', 'Logistikbetrieb', 'Immobilienverwalter', 'Industriebetrieb', 'Verwaltung', 
  'Schule', 'BBZ'
];

// Simplified 24h load profiles for different business types
// These are multipliers for the average hourly consumption
export const LOAD_PROFILES: Record<BusinessType, number[]> = {
    'Allgemein': [0.6,0.6,0.6,0.6,0.7,0.8,1.2,1.4,1.5,1.4,1.3,1.2,1.2,1.3,1.4,1.5,1.6,1.8,2.0,1.8,1.6,1.2,0.9,0.7],
    'Ferkelzucht': [1.2,1.2,1.2,1.2,1.2,1.2,1.1,1.0,1.0,0.9,0.9,0.9,0.9,0.9,1.0,1.0,1.1,1.2,1.2,1.2,1.2,1.2,1.2,1.2], // High constant load (ventilation)
    'Putenzucht': [1.1,1.1,1.1,1.1,1.1,1.2,1.2,1.1,1.0,0.9,0.8,0.8,0.8,0.9,1.0,1.1,1.2,1.2,1.2,1.1,1.1,1.1,1.1,1.1], // Similar to piglet breeding
    'Hähnchenstall': [1.3,1.3,1.2,1.2,1.2,1.1,1.0,0.9,0.8,0.8,0.8,0.8,0.8,0.8,0.9,1.0,1.1,1.2,1.2,1.2,1.3,1.3,1.3,1.3], // High ventilation, slightly different pattern
    'Fleischerei': [0.8,0.8,0.8,0.9,1.2,1.8,2.0,1.9,1.7,1.5,1.4,1.3,1.2,1.1,0.9,0.8,0.7,0.7,0.7,0.7,0.7,0.7,0.7,0.8], // Morning heavy (cooling, machines)
    'Catering': [0.5,0.5,0.5,0.6,0.8,1.2,1.5,1.2,1.0,0.8,0.9,1.0,1.2,1.3,1.5,1.8,2.2,2.5,2.0,1.5,0.8,0.6,0.5,0.5], // Bimodal: prep and evening event
    'Hotel': [0.9,0.8,0.8,0.8,0.9,1.2,1.5,1.6,1.2,1.0,0.9,0.9,1.0,1.1,1.2,1.4,1.6,1.8,1.9,1.7,1.5,1.2,1.0,0.9], // Morning and evening peaks
    'Logistikbetrieb': [1.1,1.0,1.0,1.0,1.1,1.2,1.2,1.2,1.2,1.2,1.2,1.1,1.1,1.1,1.1,1.1,1.1,1.0,1.0,0.9,0.9,0.9,0.9,1.0], // High, fairly constant load
    'Immobilienverwalter': [0.7,0.6,0.6,0.6,0.7,0.9,1.1,1.3,1.4,1.5,1.5,1.4,1.3,1.3,1.4,1.4,1.2,1.1,0.9,0.8,0.8,0.7,0.7,0.7], // General commercial profile
    'Industriebetrieb': [0.8,0.8,0.8,0.8,0.9,1.2,1.4,1.5,1.5,1.5,1.4,1.4,1.4,1.4,1.5,1.5,1.4,1.2,1.0,0.9,0.8,0.8,0.8,0.8], // Two-shift operation profile
    'Verwaltung': [0.4,0.4,0.4,0.4,0.5,0.8,1.2,1.8,1.9,1.9,1.8,1.6,1.6,1.6,1.8,1.8,1.2,0.8,0.6,0.5,0.4,0.4,0.4,0.4], // Classic office 9-5
    'Schule': [0.3,0.3,0.3,0.3,0.4,0.6,1.2,2.0,2.2,2.0,1.8,1.5,1.4,1.2,1.0,0.8,0.5,0.4,0.3,0.3,0.3,0.3,0.3,0.3], // 8-4 profile, sharp peaks
    'BBZ': [0.3,0.3,0.3,0.3,0.5,0.8,1.5,2.0,2.1,2.0,1.9,1.7,1.6,1.5,1.4,1.1,0.7,0.5,0.4,0.4,0.3,0.3,0.3,0.3], // Similar to school, slightly longer day
};

export const BUSINESS_PROFILE_CONFIGS: Record<BusinessType, BusinessProfileConfig> = {
    'Allgemein': { weekendFactor: 0.8, seasonalProfile: 'none' },
    'Ferkelzucht': { weekendFactor: 1.0, seasonalProfile: 'winter_peak' }, // Heating in winter
    'Putenzucht': { weekendFactor: 1.0, seasonalProfile: 'winter_peak' }, // Heating in winter
    'Hähnchenstall': { weekendFactor: 1.0, seasonalProfile: 'winter_peak' }, // Heating in winter
    'Fleischerei': { weekendFactor: 0.3, seasonalProfile: 'none' }, // Closed on Sunday
    'Catering': { weekendFactor: 1.2, seasonalProfile: 'summer_peak' }, // Events on weekends, summer peak
    'Hotel': { weekendFactor: 1.1, seasonalProfile: 'summer_peak' }, // More guests on weekends/summer
    'Logistikbetrieb': { weekendFactor: 0.7, seasonalProfile: 'none' }, // Less shifts on weekends
    'Immobilienverwalter': { weekendFactor: 0.2, seasonalProfile: 'summer_low' }, // Offices closed
    'Industriebetrieb': { weekendFactor: 0.4, seasonalProfile: 'none' }, // Fewer shifts/maintenance
    'Verwaltung': { weekendFactor: 0.1, seasonalProfile: 'summer_low' }, // Closed, holidays
    'Schule': { weekendFactor: 0.05, seasonalProfile: 'summer_low' }, // Closed, holidays
    'BBZ': { weekendFactor: 0.1, seasonalProfile: 'summer_low' }, // Closed, holidays
};

export const BUSINESS_DESCRIPTIONS: Record<BusinessType, string> = {
    'Allgemein': "Ein allgemeines Gewerbeprofil mit einem Anstieg des Verbrauchs während der typischen Geschäftszeiten am Vormittag und Nachmittag. Ein moderater Grundverbrauch bleibt außerhalb der Spitzenzeiten bestehen, was auf durchlaufende Geräte wie Beleuchtung oder IT-Infrastruktur hindeutet.",
    'Ferkelzucht': "Dieses Profil ist durch einen sehr hohen und konstanten Grundverbrauch über 24 Stunden geprägt. Hauptverbraucher sind hier die Lüftungs- und Heizsysteme, die für das Wohlbefinden der Tiere rund um die Uhr eine stabile Umgebung gewährleisten müssen, was zu geringen Schwankungen führt.",
    'Putenzucht': "Ähnlich der Ferkelzucht zeigt die Putenzucht einen hohen, relativ konstanten Energiebedarf für Lüftung und Heizung. Leichte Schwankungen können durch Fütterungszyklen oder tageszeitabhängige Anpassungen der Stallklimatisierung entstehen.",
    'Hähnchenstall': "Hähnchenställe weisen ebenfalls einen hohen Grundverbrauch durch Lüftung und Heizung auf. Das Profil kann je nach Mastphase variieren. Die konstante Energienachfrage macht sie zu einem idealen Kandidaten für Eigenverbrauchslösungen, um die dauerhaften Betriebskosten zu senken.",
    'Fleischerei': "Der Energieverbrauch einer Fleischerei ist stark durch die Kühlkette und die Verarbeitungsmaschinen geprägt. Eine hohe Lastspitze am Morgen und Vormittag entsteht durch den Betrieb von Kuttern, Wölfen und Kühlaggregaten. Der Verbrauch sinkt nachmittags, während die Kühlung eine konstante Grundlast bildet.",
    'Catering': "Catering-Betriebe zeigen ein bimodales Verbrauchsprofil. Eine erste Spitze entsteht während der Vorbereitungszeiten am Vormittag durch Kochgeräte und Kühlung. Eine zweite, oft höhere Spitze tritt während der Abendveranstaltungen auf. Nachts ist der Verbrauch typischerweise gering.",
    'Hotel': "Hotels haben einen charakteristischen Verbrauch mit zwei Spitzen: morgens, wenn Gäste duschen und das Frühstück zubereitet wird, und abends, wenn die Beleuchtung, Küchen und Klimaanlagen/Heizungen in den Zimmern aktiv sind. Eine signifikante Grundlast bleibt rund um die Uhr für Gemeinschaftsbereiche und Infrastruktur bestehen.",
    'Logistikbetrieb': "Logistikbetriebe, insbesondere solche mit Schichtbetrieb, weisen einen hohen und sehr gleichmäßigen Energieverbrauch auf. Förderbänder, Beleuchtung in den Lagerhallen und das Laden von Flurförderzeugen erzeugen eine konstante Last, die sich ideal für eine Grundlastdeckung durch erneuerbare Energien eignet.",
    'Immobilienverwalter': "Dieses Profil entspricht einem typischen Büro- oder Verwaltungsgebäude mit einem klaren Tagesgang. Der Verbrauch steigt morgens stark an, erreicht zur Mittagszeit seinen Höhepunkt und fällt nach Geschäftsschluss wieder ab. Am Wochenende ist der Verbrauch minimal.",
    'Industriebetrieb': "Das Profil eines Industriebetriebs wird durch die Produktionszeiten bestimmt, oft im Ein- oder Zweischichtbetrieb. Die Last steigt mit Schichtbeginn stark an und bleibt während der Produktion auf hohem Niveau. Maschinenstillstände oder Pausen können zu kurzzeitigen Lastsenkungen führen.",
    'Verwaltung': "Ein klassisches Büroprofil mit einem sehr ausgeprägten Peak während der Kernarbeitszeiten (ca. 8-17 Uhr). Hauptverbraucher sind Computer, Beleuchtung und Klimatisierung/Heizung. Außerhalb dieser Zeiten sowie an Wochenenden ist der Verbrauch sehr gering.",
    'Schule': "Schulen zeigen ein sehr scharfes Lastprofil, das eng an die Unterrichtszeiten gekoppelt ist. Der Verbrauch steigt morgens rapide an, bleibt über den Vormittag hoch und fällt nachmittags schnell wieder ab. In den Ferien und an Wochenenden ist der Energiebedarf minimal.",
    'BBZ': "Ähnlich wie Schulen haben BBZs einen tageszeitlich stark schwankenden Verbrauch, der sich an den Kurszeiten orientiert. Der Betrieb kann sich jedoch bis in die Abendstunden erstrecken, was zu einer längeren Haltedauer der Spitzenlast im Vergleich zu einer regulären Schule führt.",
};

// batterySize is removed as it will be calculated automatically
export const INITIAL_INPUTS = {
  businessType: 'Allgemein' as BusinessType,
  annualConsumption: 50000,
  annualProduction: 60000,
  electricityPrice: 0.28,
  feedInTariff: 0.07,
  maxChargePower: 50, // This will be coupled to the optimal size later
  batteryEfficiency: 0.90,
  constructionSubsidy: 100,
};
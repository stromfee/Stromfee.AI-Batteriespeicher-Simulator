
import { GoogleGenAI, Chat } from "@google/genai";
import { SimulationResult, InvestmentDetails, BusinessType } from '../types';

// This is a placeholder check. In a real environment, the key would be set.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
let chat: Chat | null = null;

function formatResultsForPrompt(result: SimulationResult, investment: InvestmentDetails, businessType: BusinessType): string {
    const formatCurrency = (value: number) => value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
    const formatNumber = (value: number) => value.toLocaleString('de-DE', { maximumFractionDigits: 0 });
    const formatPercentage = (value: number) => (value * 100).toFixed(1) + '%';
    const formatYears = (value: number | null) => value ? `${value.toFixed(1)} Jahre` : 'Nie';

    return `
    Analysiere die folgenden Ergebnisse einer Batteriespeicher-Simulation für ein Unternehmen des Typs "${businessType}".

    **Investitionsdetails:**
    - Batteriegröße: ${formatNumber(result.batterySize)} kWh
    - Spezifische Kosten: ${formatCurrency(investment.specificCost)} / kWh
    - Gesamtinvestition: ${formatCurrency(investment.totalInvestment)}

    **Wirtschaftlichkeit:**
    - Jährliche Ersparnis: ${formatCurrency(result.annualSavings)}
    - Amortisationszeit: ${formatYears(result.paybackPeriod)}
    - Jährliche Kosten ohne Speicher: ${formatCurrency(result.annualCostWithoutBattery)}
    - Jährliche Kosten mit Speicher: ${formatCurrency(result.annualCostWithBattery)}

    **Technische Kennzahlen:**
    - Autarkiegrad: ${formatPercentage(result.selfSufficiency)}
    - Eigenverbrauchsquote: ${formatPercentage(result.selfConsumption)}
    - Netzbezug mit Speicher: ${formatNumber(result.gridImportWithBattery)} kWh/Jahr
    - Netzeinspeisung mit Speicher: ${formatNumber(result.gridExportWithBattery)} kWh/Jahr

    Bitte gib eine Zusammenfassung der Ergebnisse. Bewerte die Wirtschaftlichkeit und die technischen Vorteile. Gehe auf mögliche Risiken oder Nachteile ein und gib eine abschließende Empfehlung, ob sich die Investition lohnt. Strukturiere deine Antwort übersichtlich mit Markdown.
    `;
}

export const startAiChat = async (result: SimulationResult, investment: InvestmentDetails, businessType: BusinessType): Promise<string> => {
    if (!API_KEY) return "Der API-Schlüssel für den KI-Dienst ist nicht konfiguriert.";
    
    const initialPrompt = formatResultsForPrompt(result, investment, businessType);
    
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `Du bist ein Experte für erneuerbare Energien und Batteriespeichersysteme. Deine Aufgabe ist es, die Simulationsergebnisse für gewerbliche Kunden zu analysieren. Sei präzise, hilfreich und formuliere deine Antworten klar und verständlich auf Deutsch. Präsentiere deine Analyse in Markdown-Formatierung.`,
        },
    });
    
    const response = await chat.sendMessage({ message: initialPrompt });
    return response.text;
};

export const continueAiChat = async (message: string): Promise<string> => {
    if (!chat) {
        return "Chat nicht initialisiert. Bitte starten Sie eine neue Analyse.";
    }
    const response = await chat.sendMessage({ message });
    return response.text;
};

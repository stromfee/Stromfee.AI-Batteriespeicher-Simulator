
import React from 'react';
import { SimulationResult, InvestmentDetails } from '../types';

interface ResultsDashboardProps {
  result: SimulationResult | null;
  investment: InvestmentDetails | null;
  isLoading: boolean;
  onDouble: () => void;
  onHalve: () => void;
  onAnalyze: () => void;
  showDailyChart: boolean;
  onToggleDailyChart: () => void;
}

const formatCurrency = (value: number | undefined) => value?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) || 'N/A';
const formatNumber = (value: number | undefined) => value?.toLocaleString('de-DE', { maximumFractionDigits: 0 }) || 'N/A';
const formatPercentage = (value: number | undefined) => value?.toLocaleString('de-DE', { style: 'percent', minimumFractionDigits: 1 }) || 'N/A';
const formatYears = (value: number | null | undefined) => value ? `${value.toFixed(1)} Jahre` : 'Nie';

const MetricCard: React.FC<{ title: string; value: string; extra?: string; bgColorClass?: string;}> = ({ title, value, extra, bgColorClass = 'bg-white' }) => (
  <div className={`p-4 rounded-lg shadow ${bgColorClass}`}>
    <h4 className="text-sm font-medium text-gray-500">{title}</h4>
    <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    {extra && <p className="text-xs text-gray-500">{extra}</p>}
  </div>
);

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, investment, isLoading, onDouble, onHalve, onAnalyze, showDailyChart, onToggleDailyChart }) => {
  if (isLoading) {
    return <div className="text-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Simuliere Ergebnisse...</p>
    </div>;
  }

  if (!result || !investment) {
    return <div className="text-center p-10 bg-white rounded-lg shadow">
        <p className="text-gray-500">Bitte geben Sie Ihre Daten ein und starten Sie die Simulation.</p>
    </div>;
  }

  // Dynamic background colors based on metric values
  const paybackColor = (() => {
    if (result.paybackPeriod === null) return 'bg-red-100';
    if (result.paybackPeriod < 8) return 'bg-green-100';
    if (result.paybackPeriod <= 15) return 'bg-yellow-100';
    return 'bg-red-100';
  })();

  const savingsColor = result.annualSavings > 0 ? 'bg-green-100' : 'bg-red-100';

  const selfSufficiencyColor = (() => {
    if (result.selfSufficiency >= 0.7) return 'bg-blue-100';
    if (result.selfSufficiency > 0.4) return 'bg-indigo-50';
    return 'bg-white';
  })();

  const selfConsumptionColor = (() => {
    if (result.selfConsumption >= 0.7) return 'bg-blue-100';
    if (result.selfConsumption > 0.4) return 'bg-indigo-50';
    return 'bg-white';
  })();

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h3 className="text-xl font-bold text-gray-800">Investitionsrechnung (für {result.batterySize.toFixed(1)} kWh)</h3>
            <div className="flex items-center space-x-2">
                <button
                    onClick={onHalve}
                    disabled={isLoading || result.batterySize <= 1}
                    className="px-3 py-1 text-sm bg-secondary text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    title="Batteriegröße halbieren"
                >
                    / 2
                </button>
                <button
                    onClick={onDouble}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm bg-secondary text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    title="Batteriegröße verdoppeln"
                >
                    x 2
                </button>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Spezifische Kosten" value={formatCurrency(investment.specificCost)} extra="/ kWh" />
          <MetricCard title="Gesamtkosten BESS" value={formatCurrency(investment.totalBessCost)} />
          <MetricCard title="Gesamtkosten BKZ" value={formatCurrency(investment.totalSubsidyCost)} />
          <MetricCard title="Gesamtinvestition" value={formatCurrency(investment.totalInvestment)} bgColorClass="bg-yellow-100" />
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h3 className="text-xl font-bold text-gray-800">Ergebnisse der Simulation</h3>
             <label htmlFor="daily-toggle" className="inline-flex items-center cursor-pointer">
                <span className="mr-3 text-sm font-medium text-gray-900">Tagesdetails anzeigen</span>
                <span className="relative">
                <input
                    type="checkbox"
                    id="daily-toggle"
                    className="sr-only peer"
                    checked={showDailyChart}
                    onChange={onToggleDailyChart}
                    disabled={isLoading}
                />
                <span className="w-11 h-6 bg-gray-200 rounded-full block peer-focus:ring-2 peer-focus:ring-secondary peer-checked:bg-primary transition"></span>
                <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full block peer-checked:translate-x-full transition"></span>
                </span>
            </label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Jährliche Ersparnis" value={formatCurrency(result.annualSavings)} extra={`vs. ${formatCurrency(result.annualCostWithoutBattery)} ohne BESS`} bgColorClass={savingsColor} />
          <MetricCard title="Amortisationszeit" value={formatYears(result.paybackPeriod)} bgColorClass={paybackColor}/>
          <MetricCard title="Autarkiegrad" value={formatPercentage(result.selfSufficiency)} extra={`Netzbezug: ${formatNumber(result.gridImportWithBattery)} kWh`} bgColorClass={selfSufficiencyColor} />
          <MetricCard title="Eigenverbrauchsquote" value={formatPercentage(result.selfConsumption)} extra={`Netzeinspeisung: ${formatNumber(result.gridExportWithBattery)} kWh`} bgColorClass={selfConsumptionColor} />
        </div>
      </div>
      <div className="text-center pt-4 border-t border-gray-100 mt-4">
        <button
          onClick={onAnalyze}
          className="bg-accent hover:bg-yellow-500 text-primary font-bold py-2 px-5 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center mx-auto"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          KI-Analyse anfordern
        </button>
      </div>
    </div>
  );
};

export default ResultsDashboard;

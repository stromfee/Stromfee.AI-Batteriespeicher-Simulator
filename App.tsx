
import React, { useState, useEffect, useCallback } from 'react';
import InputPanel from './components/InputPanel';
import ResultsDashboard from './components/ResultsDashboard';
import ComparisonChart from './components/ComparisonChart';
import DailyChart from './components/DailyChart';
import AIAnalysis from './components/AIAnalysis';
import { SimulationInput, SimulationResult, InvestmentDetails, DailyBreakdown, BusinessType, ChatMessage } from './types';
import { runSimulation, calculateInvestment, findOptimalBatterySize } from './services/simulationService';
import { startAiChat, continueAiChat } from './services/aiService';
import { INITIAL_INPUTS, BATTERY_SIZES_TO_COMPARE } from './constants';

type UserInput = Omit<SimulationInput, 'batterySize'>;

const App: React.FC = () => {
  const [inputs, setInputs] = useState<UserInput>({
    ...INITIAL_INPUTS,
    batteryEfficiency: INITIAL_INPUTS.batteryEfficiency * 100, // Display as percentage
  });
  const [mainResult, setMainResult] = useState<SimulationResult | null>(null);
  const [mainInvestment, setMainInvestment] = useState<InvestmentDetails | null>(null);
  const [comparisonResults, setComparisonResults] = useState<SimulationResult[]>([]);
  const [dailyData, setDailyData] = useState<DailyBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showDailyChart, setShowDailyChart] = useState<boolean>(false);

  // State for AI Analysis Panel
  const [isAiPanelVisible, setIsAiPanelVisible] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const handleInputChange = (name: keyof UserInput, value: number | string) => {
    setInputs(prev => ({ ...prev, [name]: value }));
    setIsAiPanelVisible(false); // Hide AI panel on input change
    setChatHistory([]);
  };

  const runSingleSimulation = useCallback((size: number) => {
    setIsLoading(true);
    setIsAiPanelVisible(false);
    
    // Only clear daily data if the toggle is off.
    if (!showDailyChart) {
        setDailyData(null);
    }

    setTimeout(() => {
        const calculationInputs = {
            ...inputs,
            batteryEfficiency: inputs.batteryEfficiency / 100,
        };
        const chargePower = size / 2;
        const simInput = { ...calculationInputs, batterySize: size, maxChargePower: chargePower };
        
        const newResult = runSimulation(simInput, showDailyChart);
        const newInvestment = calculateInvestment(size, chargePower, inputs.constructionSubsidy);

        setMainResult(newResult);
        setMainInvestment(newInvestment);
        setDailyData(newResult.dailyData ?? null);
        setIsLoading(false);
    }, 250);
  }, [inputs, showDailyChart]);

  const handleDoubleBatterySize = useCallback(() => {
    if (!mainResult) return;
    runSingleSimulation(mainResult.batterySize * 2);
  }, [mainResult, runSingleSimulation]);
  
  const handleHalveBatterySize = useCallback(() => {
    if (!mainResult || mainResult.batterySize <= 1) return;
    runSingleSimulation(mainResult.batterySize / 2);
  }, [mainResult, runSingleSimulation]);

  const handleRunOptimization = useCallback(() => {
    setIsLoading(true);
    setIsAiPanelVisible(false);
    setDailyData(null);
    
    setTimeout(() => {
      const calculationInputs = {
          ...inputs,
          batteryEfficiency: inputs.batteryEfficiency / 100,
      };
      
      const optimalResult = findOptimalBatterySize(calculationInputs);
      const optimalChargePower = optimalResult.batterySize / 2;
      const finalInput = { ...calculationInputs, batterySize: optimalResult.batterySize, maxChargePower: optimalChargePower };
      const finalResultWithDaily = runSimulation(finalInput, showDailyChart);

      setMainResult(finalResultWithDaily);
      setDailyData(finalResultWithDaily.dailyData ?? null);
      setMainInvestment(calculateInvestment(finalResultWithDaily.batterySize, optimalChargePower, inputs.constructionSubsidy));
      
      const compared = BATTERY_SIZES_TO_COMPARE.map(size => {
        const simInput = { ...calculationInputs, batterySize: size, maxChargePower: size / 2 }; 
        return runSimulation(simInput, false);
      });
      setComparisonResults(compared);

      setIsLoading(false);
    }, 500);
  }, [inputs, showDailyChart]);

  useEffect(() => {
    handleRunOptimization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-run simulation to get daily data if toggle is switched ON
  // and we have a result but no corresponding daily data.
  useEffect(() => {
    if (showDailyChart && mainResult && !dailyData) {
      runSingleSimulation(mainResult.batterySize);
    }
  }, [showDailyChart, mainResult, dailyData, runSingleSimulation]);


  const handleAnalyzeRequest = async () => {
    if (!mainResult || !mainInvestment) return;
    setIsAiPanelVisible(true);
    setIsAiLoading(true);
    setChatHistory([]);
    try {
        const initialResponse = await startAiChat(mainResult, mainInvestment, inputs.businessType);
        setChatHistory([{ role: 'model', content: initialResponse }]);
    } catch (error) {
        console.error("AI Analysis failed:", error);
        setChatHistory([{ role: 'error', content: 'Fehler bei der Analyse. Bitte stellen Sie sicher, dass Ihr API-Schlüssel korrekt ist und versuchen Sie es später erneut.' }]);
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, userMessage]);
    setIsAiLoading(true);
    try {
        const modelResponse = await continueAiChat(message);
        setChatHistory(prev => [...prev, { role: 'model', content: modelResponse }]);
    } catch (error) {
        console.error("AI Chat failed:", error);
        setChatHistory(prev => [...prev, { role: 'error', content: 'Fehler bei der Antwort. Bitte versuchen Sie es später erneut.' }]);
    } finally {
        setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Batteriespeicher-Simulator</h1>
          <p className="mt-2 text-lg text-gray-600">Ermittelt die wirtschaftlichste Batteriegröße mit der kürzesten Amortisationszeit durch iterative Simulation.</p>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <InputPanel 
              inputs={inputs} 
              onInputChange={handleInputChange} 
            />
            <button 
              onClick={handleRunOptimization}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>}
              {isLoading ? 'Optimiere & Simuliere...' : 'Optimale Größe finden & Simulieren'}
            </button>
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <ResultsDashboard 
                    result={mainResult} 
                    investment={mainInvestment} 
                    isLoading={isLoading} 
                    onDouble={handleDoubleBatterySize}
                    onHalve={handleHalveBatterySize}
                    onAnalyze={handleAnalyzeRequest}
                    showDailyChart={showDailyChart}
                    onToggleDailyChart={() => setShowDailyChart(prev => !prev)}
                />
            </div>
            {isAiPanelVisible && (
              <AIAnalysis 
                history={chatHistory}
                isLoading={isAiLoading}
                onSendMessage={handleSendMessage}
              />
            )}
            {!isLoading && <ComparisonChart data={comparisonResults} />}
            {!isLoading && dailyData && showDailyChart && <DailyChart data={dailyData} businessType={inputs.businessType} />}
          </div>
        </main>
        
        <footer className="text-center mt-12 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Batteriespeicher-Simulator. Basierend auf Modellen zur Preisdegression und Energieflusssimulation.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
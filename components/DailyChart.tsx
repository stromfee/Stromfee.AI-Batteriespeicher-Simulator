
import React, { useState } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { DailyBreakdown, BusinessType } from '../types';
import { BUSINESS_DESCRIPTIONS } from '../constants';

interface DailyChartProps {
  data: DailyBreakdown | null;
  businessType: BusinessType;
}

const TABS = ['Januar', 'April', 'Juli', 'November'];

const CustomTooltipContent: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formatVal = (val: number) => val.toFixed(2);
    const consumption = payload.find(p => p.dataKey === 'consumption')?.value;
    const production = payload.find(p => p.dataKey === 'production')?.value;
    const pvToLoad = payload.find(p => p.dataKey === 'pvToLoad')?.value;
    const batteryDischarge = payload.find(p => p.dataKey === 'batteryDischarge')?.value;
    const gridImport = payload.find(p => p.dataKey === 'gridImport')?.value;

    return (
      <div className="p-3 bg-white/90 border border-gray-300 rounded shadow-lg text-sm">
        <p className="font-bold mb-2">{`Stunde: ${label}:00`}</p>
        <div className="space-y-1">
            <p><span className="font-semibold text-blue-900">Verbrauch:</span> {formatVal(consumption)} kWh</p>
            <p><span className="font-semibold text-orange-600">PV-Erzeugung:</span> {formatVal(production)} kWh</p>
            <hr className="my-1"/>
            <p className="font-semibold">Deckung durch:</p>
            <p className="text-green-600 ml-2">PV-Direkt: {formatVal(pvToLoad)} kWh</p>
            <p className="text-yellow-500 ml-2">Batterie: {formatVal(batteryDischarge)} kWh</p>
            <p className="text-red-600 ml-2">Netzbezug: {formatVal(gridImport)} kWh</p>
        </div>
      </div>
    );
  }
  return null;
};


const DailyChart: React.FC<DailyChartProps> = ({ data, businessType }) => {
  const [activeTab, setActiveTab] = useState<string>(TABS[0]);

  if (!data) return null;

  const chartData = data[activeTab];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Tagesanalyse der Energieflüsse</h3>
      <p className="text-sm text-gray-500 mb-4">Zeigt, wie der Verbrauch an einem typischen Tag im ausgewählten Monat gedeckt wird.</p>
      
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour">
              <Label value="Stunde des Tages" offset={-15} position="insideBottom" />
            </XAxis>
            <YAxis>
                <Label value="Leistung (kWh)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
            </YAxis>
            <Tooltip content={<CustomTooltipContent />} />
            <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '20px'}}/>

            {/* Stacked Area for consumption breakdown */}
            <Area type="monotone" dataKey="pvToLoad" stackId="1" stroke="#16a34a" fill="#16a34a" fillOpacity={0.8} name="PV-Direktverbrauch" />
            <Area type="monotone" dataKey="batteryDischarge" stackId="1" stroke="#facc15" fill="#facc15" fillOpacity={0.8} name="Batterieentladung" />
            <Area type="monotone" dataKey="gridImport" stackId="1" stroke="#dc2626" fill="#dc2626" fillOpacity={0.8} name="Netzbezug" />
            
            {/* Overlay Area for total Production */}
            <Area type="monotone" dataKey="production" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="PV-Erzeugung" />

            {/* Line for total Consumption */}
            <Line type="monotone" dataKey="consumption" stroke="#1e40af" strokeWidth={2.5} name="Gesamtverbrauch" dot={false} />
            
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-md font-semibold text-gray-700">Charakteristik des Lastgangs für: {businessType}</h4>
        <p className="mt-2 text-sm text-gray-600">
          {BUSINESS_DESCRIPTIONS[businessType]}
        </p>
      </div>
    </div>
  );
};

export default DailyChart;
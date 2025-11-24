
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { SimulationResult } from '../types';

interface ComparisonChartProps {
  data: SimulationResult[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const investment = payload[0]?.payload?.investment;
    return (
      <div className="p-2 bg-white border border-gray-300 rounded shadow-lg">
        <p className="font-bold">{`Batterie: ${label} kWh`}</p>
        <p className="text-blue-600">{`Amortisation: ${payload[0].value ? payload[0].value.toFixed(1) : 'N/A'} Jahre`}</p>
        <p className="text-green-600">{`Autarkie: ${(payload[1].value * 100).toFixed(1)} %`}</p>
        <p className="text-yellow-600">{`Investition: ${investment ? investment.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : 'N/A'}`}</p>
      </div>
    );
  }
  return null;
};

const ComparisonChart: React.FC<ComparisonChartProps> = ({ data }) => {
  if (!data.length) return null;
  
  const chartData = data.map(r => ({
    name: `${r.batterySize}`,
    payback: r.paybackPeriod,
    selfSufficiency: r.selfSufficiency,
    investment: r.investment,
  }));

  const maxPayback = Math.max(...chartData.map(d => d.payback || 0), 10);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Vergleich der Batteriegrößen</h3>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" >
                 <Label value="Batteriegröße (kWh)" offset={-15} position="insideBottom" />
            </XAxis>
            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" domain={[0, dataMax => Math.ceil(dataMax * 1.1)]}>
                <Label value="Amortisation (Jahre)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} stroke="#3b82f6" />
            </YAxis>
            <YAxis yAxisId="right" orientation="right" stroke="#16a34a" domain={[0, 1]}>
                 <Label value="Autarkiegrad" angle={90} position="insideRight" style={{ textAnchor: 'middle' }} stroke="#16a34a" />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '20px'}}/>
            <Bar yAxisId="left" dataKey="payback" name="Amortisation (Jahre)" fill="#3b82f6" barSize={30}/>
            <Bar yAxisId="right" dataKey="selfSufficiency" name="Autarkiegrad (%)" fill="#16a34a" barSize={30} label={{ formatter: (v: number) => `${(v*100).toFixed(0)}%`, position: 'top' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ComparisonChart;

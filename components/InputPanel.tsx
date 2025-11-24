import React from 'react';
import { SimulationInput, BusinessType } from '../types';
import { BUSINESS_TYPES } from '../constants';

type PanelInput = Omit<SimulationInput, 'batterySize'>;

interface InputPanelProps {
  inputs: PanelInput;
  onInputChange: (name: keyof PanelInput, value: number | string) => void;
}

const InputField: React.FC<{ label: string; name: keyof PanelInput; value: number; unit: string; onInputChange: (name: keyof PanelInput, value: number) => void; min?: number; max?: number; step?: number; }> = ({ label, name, value, unit, onInputChange, min = 0, max, step = 1 }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="mt-1 relative rounded-md shadow-sm">
      <input
        type="number"
        name={name}
        id={name}
        className="focus:ring-primary focus:border-primary block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
        value={value}
        onChange={(e) => onInputChange(name as any, parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span className="text-gray-500 sm:text-sm">{unit}</span>
      </div>
    </div>
  </div>
);


const InputPanel: React.FC<InputPanelProps> = ({ inputs, onInputChange }) => {
  return (
    <div className="p-6 bg-base-100 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Eingabeparameter</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="md:col-span-2">
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">Art des Betriebs</label>
            <select
                id="businessType"
                name="businessType"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                value={inputs.businessType}
                onChange={(e) => onInputChange('businessType', e.target.value)}
            >
                {BUSINESS_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
        </div>

        <InputField label="Jährlicher Stromverbrauch" name="annualConsumption" value={inputs.annualConsumption} unit="kWh" onInputChange={onInputChange as any} step={1000} />
        <InputField label="Jährliche PV-Produktion" name="annualProduction" value={inputs.annualProduction} unit="kWh" onInputChange={onInputChange as any} step={1000} />
        <InputField label="Aktueller Strompreis" name="electricityPrice" value={inputs.electricityPrice} unit="€/kWh" onInputChange={onInputChange as any} step={0.01} />
        <InputField label="Einspeisevergütung" name="feedInTariff" value={inputs.feedInTariff} unit="€/kWh" onInputChange={onInputChange as any} step={0.01} />
        <InputField label="Max. Lade-/Entladeleistung" name="maxChargePower" value={inputs.maxChargePower} unit="kW" onInputChange={onInputChange as any} step={5} />
        <InputField label="Wirkungsgrad Batterie (Roundtrip)" name="batteryEfficiency" value={inputs.batteryEfficiency} unit="%" onInputChange={onInputChange as any} min={0} max={100} />
        <InputField label="Baukostenzuschuss (BKZ)" name="constructionSubsidy" value={inputs.constructionSubsidy} unit="€/kW" onInputChange={onInputChange as any} step={10} />
      </div>
    </div>
  );
};

export default InputPanel;
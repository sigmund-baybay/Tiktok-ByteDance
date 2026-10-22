import React from 'react';
import { RefreshCw, Shuffle, Sliders, Calculator } from 'lucide-react';
import { DIMENSIONS } from '../../constants/riskModifiers.ts';
import { DimensionSelect } from './DimensionSelect.tsx';
import { PresetSelector } from './PresetSelector.tsx';
import type {
  DimensionKey,
  PresetProfile,
  RiskCalculationResult,
  RiskProfileSelections,
} from '../../types/riskModel.types.ts';

interface ControlPanelProps {
  selections: RiskProfileSelections;
  calculation: RiskCalculationResult;
  onSelectChange: (dimensionKey: DimensionKey, optionId: string) => void;
  onReset: () => void;
  onRandomize: () => void;
  onSelectPreset: (preset: PresetProfile) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  selections,
  calculation,
  onSelectChange,
  onReset,
  onRandomize,
  onSelectPreset,
}) => {
  const dimensionKeys = Object.keys(DIMENSIONS) as DimensionKey[];

  return (
    <section className="bg-[#121212]/95 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
      
      {/* Panel Header + Reset / Randomize Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#25F4EE]" />
            <span>Order Feature Dimensions</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Configure the 6 vectors to simulate proactive ML checkout friction
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#1F1F23] hover:bg-white/10 text-slate-300 border border-white/10 transition-all active:scale-95 cursor-pointer"
            title="Reset to default baseline"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={onRandomize}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FE2C55] hover:bg-[#e02449] text-white shadow-lg shadow-[#FE2C55]/25 transition-all active:scale-95 cursor-pointer"
            title="Randomize all dimensions"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Randomize</span>
          </button>
        </div>
      </div>

      {/* Quick Buyer Personas */}
      <PresetSelector
        currentSelections={selections}
        onSelectPreset={onSelectPreset}
      />

      {/* The 6 Feature Dimensions */}
      <div className="space-y-3.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FE2C55]" />
          Feature Vector Inputs
        </div>

        {dimensionKeys.map((dimKey) => (
          <DimensionSelect
            key={dimKey}
            dimensionKey={dimKey}
            config={DIMENSIONS[dimKey]}
            selectedOptionId={selections[dimKey]}
            onSelectChange={onSelectChange}
          />
        ))}
      </div>

      {/* Live Additive Formula Computation Bar */}
      <div className="p-4 rounded-xl bg-[#08080a] border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-bold flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-[#25F4EE]" />
            Live Additive Computation
          </span>
          <span className="font-mono text-xs text-slate-400">
            29% Base {calculation.sumModifiers >= 0 ? '+' : '-'} {Math.abs(calculation.sumModifiers)}%
          </span>
        </div>

        {/* Individual Modifier Badges Equation */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="px-2 py-1 rounded bg-[#1F1F23] text-slate-200 border border-white/10 font-bold">
            29% Base
          </span>

          {calculation.breakdown.map((item) => (
            <span
              key={item.key}
              className={`px-2 py-1 rounded border text-[11px] transition-all ${
                item.modifier > 0
                  ? 'bg-rose-950/60 text-[#FE2C55] border-rose-800/60 font-semibold'
                  : item.modifier < 0
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60 font-semibold'
                  : 'bg-[#1F1F23] text-slate-400 border-white/10'
              }`}
              title={`${item.dimensionLabel}: ${item.optionLabel} (${item.actualRate} historical)`}
            >
              {item.modifier >= 0 ? `+${item.modifier}%` : `${item.modifier}%`}
            </span>
          ))}

          <span className="text-slate-400 px-1 font-bold">=</span>

          <span
            className={`px-2.5 py-1 rounded font-bold border ${calculation.tier.theme.badgeBg}`}
          >
            {calculation.finalScore}% Final Score
          </span>
        </div>

        <p className="text-[10px] text-slate-400 italic">
          Hover over each modifier to view feature dimension source and empirical baseline rate.
        </p>
      </div>
    </section>
  );
};

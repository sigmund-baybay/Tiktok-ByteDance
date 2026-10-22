import React from 'react';
import type { DimensionConfig, DimensionKey, DimensionOption } from '../../types/riskModel.types.ts';

interface DimensionSelectProps {
  dimensionKey: DimensionKey;
  config: DimensionConfig;
  selectedOptionId: string;
  onSelectChange: (dimensionKey: DimensionKey, optionId: string) => void;
}

export const DimensionSelect: React.FC<DimensionSelectProps> = ({
  dimensionKey,
  config,
  selectedOptionId,
  onSelectChange,
}) => {
  const IconComponent = config.icon;
  const selectedOption: DimensionOption =
    config.options.find((opt) => opt.id === selectedOptionId) ?? config.options[0];

  const isPositiveRisk = selectedOption.modifier > 0;
  const isNegativeRisk = selectedOption.modifier < 0;

  return (
    <div className="p-3.5 rounded-xl bg-[#0c0c0e]/80 border border-white/10 hover:border-white/20 transition-all duration-200 group">
      
      {/* Header: Icon + Label + Live Modifier Badge */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <label
          htmlFor={`select-${dimensionKey}`}
          className="text-xs font-bold text-slate-200 flex items-center gap-2 select-none cursor-pointer"
        >
          <span className="p-1.5 rounded-lg bg-[#1F1F23] border border-white/10 text-[#25F4EE] group-hover:text-[#FE2C55] transition-colors">
            <IconComponent className="w-3.5 h-3.5" />
          </span>
          <span className="truncate">{config.label}</span>
        </label>

        {/* Live Modifier Badge */}
        <span
          className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border transition-colors shrink-0 ${
            isPositiveRisk
              ? 'bg-rose-500/15 text-[#FE2C55] border-[#FE2C55]/30'
              : isNegativeRisk
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-white/5 text-slate-400 border-white/10'
          }`}
        >
          {selectedOption.modifier > 0 ? `+${selectedOption.modifier}%` : `${selectedOption.modifier}%`}{' '}
          risk
        </span>
      </div>

      {/* Styled Native Select */}
      <div className="relative">
        <select
          id={`select-${dimensionKey}`}
          value={selectedOptionId}
          onChange={(e) => onSelectChange(dimensionKey, e.target.value)}
          className="w-full appearance-none bg-[#1F1F23] border border-white/15 focus:border-[#25F4EE] focus:ring-2 focus:ring-[#25F4EE]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-medium outline-none transition-all cursor-pointer pr-10"
        >
          {config.options.map((option) => {
            const modText = option.modifier > 0 ? `+${option.modifier}%` : `${option.modifier}%`;
            return (
              <option key={option.id} value={option.id} className="bg-[#121212] text-white">
                {option.label} ({modText})
              </option>
            );
          })}
        </select>
        {/* Custom Chevron Indicator */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Description & Actual Historical Failure Rate */}
      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400 gap-2">
        <span className="truncate">{config.description}</span>
        <span className="font-mono text-slate-400 shrink-0">
          Historical: <strong className="text-slate-200">{selectedOption.actualRate}</strong>
        </span>
      </div>
    </div>
  );
};

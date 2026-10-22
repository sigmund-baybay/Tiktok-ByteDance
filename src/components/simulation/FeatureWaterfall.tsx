import React from 'react';
import type { RiskCalculationResult } from '../../types/riskModel.types.ts';

interface FeatureWaterfallProps {
  calculation: RiskCalculationResult;
}

export const FeatureWaterfall: React.FC<FeatureWaterfallProps> = ({ calculation }) => {
  return (
    <div className="p-4 rounded-xl bg-[#0a0a0c] border border-white/10 space-y-3 shadow-inner">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#25F4EE]" />
          Feature Contribution Breakdown
        </h4>
        <span className="text-[11px] font-mono text-slate-400">
          Base: 29.0%
        </span>
      </div>

      <div className="space-y-2">
        {calculation.breakdown.map((item) => {
          // Normalize bar width relative to maximum modifier (+17% or -17%)
          const widthPct = Math.min(100, (Math.abs(item.modifier) / 17) * 100);

          return (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate max-w-[210px]">
                  {item.dimensionLabel}:{' '}
                  <strong className="text-slate-200">{item.optionLabel}</strong>
                </span>
                <span
                  className={`font-mono font-bold text-xs shrink-0 ${
                    item.modifier > 0
                      ? 'text-[#FE2C55]'
                      : item.modifier < 0
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {item.modifier > 0 ? `+${item.modifier}%` : `${item.modifier}%`}
                </span>
              </div>

              {/* Visual Contribution Bar */}
              <div className="w-full h-1.5 bg-[#1F1F23] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    item.modifier > 0
                      ? 'bg-[#FE2C55]'
                      : item.modifier < 0
                      ? 'bg-emerald-500'
                      : 'bg-slate-700'
                  }`}
                  style={{ width: `${Math.max(6, widthPct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

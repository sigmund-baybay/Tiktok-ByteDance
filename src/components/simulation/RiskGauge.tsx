import React from 'react';
import { TIER_CONFIGS } from '../../constants/riskModifiers.ts';
import type { RiskCalculationResult } from '../../types/riskModel.types.ts';

interface RiskGaugeProps {
  calculation: RiskCalculationResult;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ calculation }) => {
  const { finalScore, sumModifiers, tier } = calculation;
  const radius = 80;
  const arcLength = Math.PI * radius; // Approx 251.327
  const strokeOffset = arcLength - (arcLength * finalScore) / 100;

  return (
    <div className="flex flex-col items-center justify-center bg-[#0a0a0c] rounded-2xl p-5 border border-white/10 relative overflow-hidden shadow-inner">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Predicted COD Failure Risk
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          Clamped 0%–100%
        </span>
      </div>

      {/* Semi-Circular SVG Gauge */}
      <div className="relative w-56 h-32 flex items-end justify-center overflow-hidden my-1">
        <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="55%" stopColor="#F97316" />
              <stop offset="85%" stopColor="#FE2C55" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1F1F23"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Dynamic Active Progress Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={tier.theme.accentHex}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeOffset}
            style={{
              transition: 'stroke-dashoffset 0.7s cubic-bezier(0.2, 0.9, 0.3, 1), stroke 0.4s ease',
            }}
          />

          {/* 29% Baseline Marker Pin on Arc */}
          {/* Angle for 29%: 180 - (29 * 1.8) = 127.8 deg */}
          <circle
            cx={100 - 80 * Math.cos((29 * Math.PI) / 100)}
            cy={100 - 80 * Math.sin((29 * Math.PI) / 100)}
            r="3"
            fill="#FFFFFF"
            className="animate-pulse"
          />
        </svg>

        {/* Central Bold Readout */}
        <div className="absolute bottom-1 flex flex-col items-center text-center">
          <div className="flex items-baseline justify-center">
            <span
              className={`text-4xl sm:text-5xl font-extrabold tracking-tight font-mono transition-colors duration-300 ${tier.theme.text}`}
            >
              {finalScore}%
            </span>
          </div>

          <span className="text-[11px] text-slate-400 mt-0.5 font-medium">
            {sumModifiers === 0
              ? 'At 29% Platform Baseline'
              : sumModifiers > 0
              ? `+${sumModifiers}% vs. 29% Baseline`
              : `${sumModifiers}% vs. 29% Baseline`}
          </span>
        </div>
      </div>

      {/* Axis Labels */}
      <div className="w-full flex justify-between text-[10px] font-mono text-slate-400 px-3 mt-1.5">
        <span className="text-emerald-400">0% (Low)</span>
        <span className="text-slate-300 font-bold">• 29% Base</span>
        <span className="text-[#FE2C55]">100% (Critical)</span>
      </div>

      {/* 4-Tier Matrix Mini Bar */}
      <div className="w-full mt-4 pt-3 border-t border-white/10">
        <div className="grid grid-cols-4 gap-1.5">
          {Object.values(TIER_CONFIGS).map((t) => {
            const isActive = tier.id === t.id;
            return (
              <div
                key={t.id}
                className={`py-1.5 px-1 rounded-lg border text-center transition-all ${
                  isActive
                    ? `${t.theme.bgLight} ${t.theme.border} ring-1 ring-white/20 scale-[1.02]`
                    : 'bg-[#121212] border-white/5 opacity-40'
                }`}
              >
                <div className="text-[11px] font-bold text-white truncate">
                  {t.emoji} T{t.id}
                </div>
                <div className={`text-[9px] font-mono ${isActive ? t.theme.text : 'text-slate-400'}`}>
                  {t.range}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

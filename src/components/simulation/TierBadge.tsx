import React from 'react';
import { Info, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';
import type { RiskTierConfig } from '../../types/riskModel.types.ts';

interface TierBadgeProps {
  tier: RiskTierConfig;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier }) => {
  return (
    <div className="space-y-3.5">
      {/* Tier Category Badge & Action Mode */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${tier.theme.badgeBg}`}
        >
          <span>{tier.emoji}</span>
          <span>{tier.name}</span>
          <span className="opacity-80 font-mono text-[11px]">({tier.range})</span>
        </span>

        <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#25F4EE]" />
          Engine Action: <strong className="text-white">Proactive Interception</strong>
        </span>
      </div>

      {/* Primary UI Experience Assigned */}
      <div>
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
          {tier.id <= 2 ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-[#FE2C55]" />
          )}
          Assigned Checkout Architecture
        </div>
        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
          {tier.uiState}
        </h3>
      </div>

      {/* Dynamic Customer Copy Callout */}
      <div className={`p-3.5 rounded-xl border ${tier.theme.bgLight} ${tier.theme.border} transition-all`}>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#25F4EE]" />
          Dynamic Buyer Checkout Copy:
        </div>
        <p className="text-xs sm:text-sm font-medium text-white italic leading-relaxed">
          &ldquo;{tier.copy}&rdquo;
        </p>
      </div>

      {/* Behavioral Mechanism Insight */}
      <div className="flex items-start gap-2.5 text-xs text-slate-300 bg-[#08080a] p-3 rounded-xl border border-white/10">
        <Zap className={`w-4 h-4 shrink-0 mt-0.5 ${tier.theme.text}`} />
        <div className="leading-snug">
          <span className="font-bold text-white">Behavioral Mechanism: </span>
          <span className="text-slate-300">{tier.actionSummary}</span>
        </div>
      </div>
    </div>
  );
};

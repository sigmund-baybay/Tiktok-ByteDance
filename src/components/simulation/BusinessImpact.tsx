import React from 'react';
import { TrendingDown, ShieldAlert, Award, AlertCircle } from 'lucide-react';
import type { RiskTierId } from '../../types/riskModel.types.ts';

interface BusinessImpactProps {
  tierId: RiskTierId;
}

export const BusinessImpact: React.FC<BusinessImpactProps> = ({ tierId }) => {
  return (
    <div className="p-4 rounded-xl bg-[#0a0a0c] border border-white/10 space-y-2.5 shadow-inner">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
        <TrendingDown className="w-4 h-4 text-emerald-400" />
        Expected Business & GMV Impact
      </h4>

      {tierId === 1 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-400">
            <Award className="w-3.5 h-3.5" />
            <span>Zero Conversion Loss (1-Click Frictionless)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            High-trust buyer profile enjoys frictionless 1-click checkout. Maximizes TikTok Shop GMV velocity while keeping the RTS rate well below the 29% platform baseline.
          </p>
        </div>
      )}

      {tierId === 2 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Bot & Uncontactable Recipient Deflection</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Lightweight 4-digit SMS OTP verification filters out miskeyed phone numbers and bot orders before courier dispatch, drastically reducing failed 1st delivery attempts.
          </p>
        </div>
      )}

      {tierId === 3 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-orange-400">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>₱50 Sunk-Cost Psychological Commitment</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Requiring micro-earnest money breaks the hypnotic impulse loop of viral creator livestreams and offsets return courier freight if the parcel is rejected at the doorstep.
          </p>
        </div>
      )}

      {tierId === 4 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#FE2C55]">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>100% Return Logistics Cost Elimination</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Eliminates high-probability COD doorstep rejections. Genuine buyers are salvaged through a ₱20 GCash/Maya discount—saving up to ₱120+ in two-way reverse logistics costs.
          </p>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  TrendingDown,
  ShieldAlert,
  Award,
  AlertCircle,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import type { RiskTierId } from '../../types/riskModel.types.ts';
import { formatPHP } from '../../utils/riskCalculator.ts';

interface BusinessImpactProps {
  tierId: RiskTierId;
  orderTotal?: number;
  finalScore?: number;
}

export const BusinessImpact: React.FC<BusinessImpactProps> = ({
  tierId,
  orderTotal = 1299,
  finalScore = 29,
}) => {
  // A/B Economics Toggle: "with_ml" vs "without_ml"
  const [mode, setMode] = useState<'with_ml' | 'without_ml'>('with_ml');

  // Baseline standard platform economics (Without ML)
  const baselineLogisticsLoss = 180; // ₱80 forward delivery + ₱100 return freight
  const commissionRate = 0.05; // 5% marketplace take-rate
  const forgoneCommission = Math.round(orderTotal * commissionRate);
  const packagingAndHandling = 25;
  const totalBaselineLoss = baselineLogisticsLoss + forgoneCommission + packagingAndHandling;

  // ML Intervention economics by tier
  const tierEconomics = {
    1: {
      logisticsLoss: 0,
      mlCost: 0,
      netCommission: forgoneCommission,
      netSavings: 0,
      roi: 'Zero Drop-off',
      roiLabel: 'Max GMV Velocity',
      headline: 'Zero Conversion Drop-off (Frictionless 1-Click)',
      description:
        'High-trust buyer enjoys uninhibited 1-click checkout. 98%+ delivery success captures full marketplace commission with ₱0 logistics penalty.',
    },
    2: {
      logisticsLoss: 0,
      mlCost: 0.5, // ₱0.50 SMS OTP API charge
      netCommission: forgoneCommission,
      netSavings: baselineLogisticsLoss - 0.5,
      roi: '359x ROI',
      roiLabel: 'Per Deflected Bot/Typo',
      headline: 'Bot & Burner Number Deflection (SMS OTP)',
      description:
        'Filters out typos and uncontactable burner numbers prior to dispatch for ₱0.50, eliminating a ₱180 two-way courier failure.',
    },
    3: {
      logisticsLoss: 0, // When completed, 0. If rejected, ₱50 deposit offsets ₱180 to ₱130
      mlCost: 0,
      depositSecured: 50,
      netCommission: forgoneCommission,
      netSavings: baselineLogisticsLoss,
      roi: '85%+ Commitment',
      roiLabel: 'Impulse Sunk-Cost',
      headline: '₱50 Sunk-Cost Psychological Anchoring',
      description:
        'Collecting ₱50 earnest money breaks livestream trance states. If delivered, 100% GMV is captured; if refused, the ₱50 offsets reverse logistics.',
    },
    4: {
      logisticsLoss: 0, // COD disabled -> 0 failed COD courier trips
      mlCost: 20, // ₱20 GCash/Maya prepaid conversion subsidy
      netCommission: forgoneCommission,
      netSavings: baselineLogisticsLoss - 20, // ₱180 saved - ₱20 subsidy = +₱160
      roi: '+800% ROI',
      roiLabel: '₱160 Net Gain per Order',
      headline: '100% Logistics Loss Elimination via ₱20 Prepaid Subsidy',
      description:
        'COD is disabled, eliminating ₱180 in guaranteed RTS freight. Legitimate buyers are salvaged via a ₱20 e-wallet discount—netting ₱160 profit preserved.',
    },
  }[tierId];

  return (
    <div className="p-4 rounded-xl bg-[#0a0a0c] border border-white/10 space-y-3.5 shadow-inner">
      
      {/* Card Header & A/B Toggle Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-white/10">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <TrendingDown className="w-4 h-4 text-emerald-400" />
          <span>Unit Economics & P&L Analysis</span>
        </h4>

        {/* The A/B Toggle Switch */}
        <div className="flex items-center p-0.5 rounded-lg bg-[#1F1F23] border border-white/10 self-start sm:self-auto text-[10px]">
          <button
            type="button"
            onClick={() => setMode('without_ml')}
            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
              mode === 'without_ml'
                ? 'bg-rose-950/80 text-[#FE2C55] border border-rose-800/60 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <XCircle className="w-3 h-3" />
            <span>Without ML</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('with_ml')}
            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
              mode === 'with_ml'
                ? 'bg-[#25F4EE]/15 text-[#25F4EE] border border-[#25F4EE]/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>With ML Intervention</span>
          </button>
        </div>
      </div>

      {/* VIEW A: WITHOUT ML (Baseline Platform Loss) */}
      {mode === 'without_ml' && (
        <div className="space-y-3 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-[#FE2C55] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              Standard Unmitigated COD Dispatch
            </span>
            <span className="text-[10px] font-mono text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-900/60">
              Risk: {finalScore}% (Null Gate)
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Without real-time ML risk gating, all orders enter standard dispatch. On high-risk profiles,
            the order results in doorstep refusal (RTS), forcing the platform and seller to absorb full two-way
            courier penalties and lost take-rates.
          </p>

          {/* Detailed Financial Loss Ledger */}
          <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Two-Way Courier Return Freight (RTS):</span>
              <span className="text-[#FE2C55] font-bold">-{formatPHP(baselineLogisticsLoss)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Forgone Take-Rate Commission (5%):</span>
              <span className="text-[#FE2C55] font-bold">-{formatPHP(forgoneCommission)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Packaging & Inventory Delay Cost:</span>
              <span className="text-[#FE2C55] font-bold">-{formatPHP(packagingAndHandling)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-rose-900/50 text-white">
              <span>Net Platform Loss per Failed Order:</span>
              <span className="text-[#FE2C55] text-sm font-black">-{formatPHP(totalBaselineLoss)}</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: WITH ML INTERVENTION (Dynamic Tier Shift & ROI Proof) */}
      {mode === 'with_ml' && (
        <div className="space-y-3 animate-in fade-in-50 duration-200">
          
          {/* Header Title by Tier */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-extrabold text-white">
              {tierId === 1 && <Award className="w-4 h-4 text-emerald-400" />}
              {tierId === 2 && <AlertCircle className="w-4 h-4 text-amber-400" />}
              {tierId === 3 && <TrendingDown className="w-4 h-4 text-orange-400" />}
              {tierId === 4 && <CheckCircle2 className="w-4 h-4 text-[#25F4EE]" />}
              <span>{tierEconomics.headline}</span>
            </div>

            <span className="text-[10px] font-mono font-bold text-[#25F4EE] bg-[#25F4EE]/10 px-2 py-0.5 rounded border border-[#25F4EE]/30">
              Tier {tierId} ML Active
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {tierEconomics.description}
          </p>

          {/* Tier-Specific Unit Economics Ledger */}
          <div className="p-3 rounded-lg bg-[#121216] border border-white/10 space-y-1.5 text-xs font-mono">
            {/* Tier 1 Breakdown */}
            {tierId === 1 && (
              <>
                <div className="flex justify-between text-slate-400">
                  <span>Logistics RTS Penalty:</span>
                  <span className="text-emerald-400 font-bold">₱0.00 (Safe Profile)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ML Friction Cost:</span>
                  <span className="text-slate-300">₱0.00</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Full GMV Commission Captured:</span>
                  <span className="text-emerald-400 font-bold">+{formatPHP(forgoneCommission)}</span>
                </div>
              </>
            )}

            {/* Tier 2 Breakdown */}
            {tierId === 2 && (
              <>
                <div className="flex justify-between text-slate-400">
                  <span>Avoided Courier RTS Trip:</span>
                  <span className="text-emerald-400 font-bold">+{formatPHP(baselineLogisticsLoss)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>SMS OTP Network Verification Cost:</span>
                  <span className="text-amber-400 font-bold">-₱0.50</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Net Savings per Deflected Bad Order:</span>
                  <span className="text-emerald-400 font-bold">+{formatPHP(baselineLogisticsLoss - 0.5)}</span>
                </div>
              </>
            )}

            {/* Tier 3 Breakdown */}
            {tierId === 3 && (
              <>
                <div className="flex justify-between text-slate-400">
                  <span>Securing Upfront Earnest Deposit:</span>
                  <span className="text-orange-400 font-bold">+₱50.00 (GCash/Maya)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Impulse Refusal Reduction:</span>
                  <span className="text-emerald-400 font-bold">-85% Refusal Rate</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Doorstep Courier Balance Collect:</span>
                  <span className="text-slate-300">₱{orderTotal - 50}</span>
                </div>
              </>
            )}

            {/* Tier 4 Breakdown (Highlights ₱0 logistics + ₱20 GCash subsidy) */}
            {tierId === 4 && (
              <>
                <div className="flex justify-between text-slate-400">
                  <span>Courier Return Logistics Loss:</span>
                  <span className="text-emerald-400 font-bold">₱0.00 (COD Disabled)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GCash/Maya Prepaid Subsidy Cost:</span>
                  <span className="text-[#FE2C55] font-bold">-₱20.00 (Incentive)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Gross Return Freight Prevented:</span>
                  <span className="text-emerald-400 font-bold">+{formatPHP(baselineLogisticsLoss)}</span>
                </div>
              </>
            )}

            {/* Bottom Bottomline Summary */}
            <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-white/10 text-white">
              <span>
                {tierId === 4
                  ? 'Net Platform Savings (ROI Proof):'
                  : tierId === 2
                  ? 'Net Savings per Interception:'
                  : tierId === 3
                  ? 'Deposit Freight Offset Protection:'
                  : 'Platform GMV Outcome:'}
              </span>
              <span className="text-[#25F4EE] text-sm font-black">
                {tierId === 4
                  ? `+₱160.00 Net Preserved (+800% ROI)`
                  : tierId === 2
                  ? `+₱179.50 (359x ROI)`
                  : tierId === 3
                  ? `₱50 Cash Locked In`
                  : `Full ${formatPHP(orderTotal)} GMV Protected`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Real-time A/B Delta Callout */}
      <div className="flex items-center justify-between text-[11px] p-2.5 rounded-lg bg-[#1F1F23]/80 border border-white/10 text-slate-300">
        <span className="flex items-center gap-1.5 font-bold">
          <ArrowRightLeft className="w-3.5 h-3.5 text-[#25F4EE]" />
          <span>Real-Time Delta:</span>
        </span>
        <span className="font-mono font-bold text-emerald-400">
          {mode === 'with_ml'
            ? tierId === 4
              ? '₱160 Net Gain vs. ₱205 Deficit Without ML'
              : 'ML Interception Active • P&L Optimized'
            : `Deficit: -${formatPHP(totalBaselineLoss)} on unmitigated dispatch`}
        </span>
      </div>

    </div>
  );
};

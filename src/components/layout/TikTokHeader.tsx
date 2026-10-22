import React from 'react';
import {
  HelpCircle,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { MONTHLY_GMV_CONTEXT } from '../../constants/riskModifiers.ts';

interface TikTokHeaderProps {
  showFormulaModal: boolean;
  setShowFormulaModal: (show: boolean) => void;
}

export const TikTokHeader: React.FC<TikTokHeaderProps> = ({
  showFormulaModal,
  setShowFormulaModal,
}) => {
  return (
    <header className="border-b border-white/10 bg-[#121212]/90 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
        
        {/* TikTok Shop PH Brand & Engine Identity */}
        <div className="flex items-center gap-3.5">
          {/* TikTok Dual-Tone Note Icon with Glitch Shadow */}
          <div className="relative group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#010101] border border-white/15 flex items-center justify-center tiktok-glitch-badge transition-transform duration-200 group-hover:scale-105">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                {/* TikTok Cyan Layer */}
                <path
                  d="M16.5 7.5C15.3 7.3 14.3 6.6 13.8 5.6V13.5C13.8 15.7 12 17.5 9.8 17.5C7.6 17.5 5.8 15.7 5.8 13.5C5.8 11.3 7.6 9.5 9.8 9.5C10.1 9.5 10.4 9.5 10.7 9.6V12.1C10.4 12 10.1 11.9 9.8 11.9C8.9 11.9 8.2 12.6 8.2 13.5C8.2 14.4 8.9 15.1 9.8 15.1C10.7 15.1 11.4 14.4 11.4 13.5V3H13.8C14 4.8 15.4 6.2 17.2 6.4V7.5H16.5Z"
                  fill="#25F4EE"
                  transform="translate(-0.8, -0.8)"
                />
                {/* TikTok Pink Layer */}
                <path
                  d="M16.5 7.5C15.3 7.3 14.3 6.6 13.8 5.6V13.5C13.8 15.7 12 17.5 9.8 17.5C7.6 17.5 5.8 15.7 5.8 13.5C5.8 11.3 7.6 9.5 9.8 9.5C10.1 9.5 10.4 9.5 10.7 9.6V12.1C10.4 12 10.1 11.9 9.8 11.9C8.9 11.9 8.2 12.6 8.2 13.5C8.2 14.4 8.9 15.1 9.8 15.1C10.7 15.1 11.4 14.4 11.4 13.5V3H13.8C14 4.8 15.4 6.2 17.2 6.4V7.5H16.5Z"
                  fill="#FE2C55"
                  transform="translate(0.8, 0.8)"
                />
                {/* TikTok White Core */}
                <path
                  d="M16.5 7.5C15.3 7.3 14.3 6.6 13.8 5.6V13.5C13.8 15.7 12 17.5 9.8 17.5C7.6 17.5 5.8 15.7 5.8 13.5C5.8 11.3 7.6 9.5 9.8 9.5C10.1 9.5 10.4 9.5 10.7 9.6V12.1C10.4 12 10.1 11.9 9.8 11.9C8.9 11.9 8.2 12.6 8.2 13.5C8.2 14.4 8.9 15.1 9.8 15.1C10.7 15.1 11.4 14.4 11.4 13.5V3H13.8C14 4.8 15.4 6.2 17.2 6.4V7.5H16.5Z"
                  fill="#FFFFFF"
                />
              </svg>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white font-sans">
                  TikTok <span className="text-[#FE2C55]">Shop</span>
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded font-black bg-[#25F4EE]/10 text-[#25F4EE] border border-[#25F4EE]/30">
                  PH
                </span>
              </div>
              <span className="text-white/20 hidden sm:inline">•</span>
              <h1 className="text-xs sm:text-sm font-semibold tracking-wide text-slate-200">
                Dynamic COD Risk Scoring Model
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#25F4EE]/10 text-[#25F4EE] border border-[#25F4EE]/25">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25F4EE] animate-pulse" />
                LIVE Risk Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Proactive real-time checkout friction interception replacing blunt platform account bans
            </p>
          </div>
        </div>

        {/* Executive Context Badges & Model Spec Trigger */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start md:self-auto">
          
          {/* PHP 5.79B/mo Context Badge */}
          <div className="bg-[#1F1F23] border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm">
            <TrendingUp className="w-3.5 h-3.5 text-[#25F4EE]" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none">
                PH Monthly GMV
              </span>
              <span className="text-xs font-mono font-bold text-white leading-tight">
                {MONTHLY_GMV_CONTEXT.gmv}
              </span>
            </div>
          </div>

          {/* Baseline Failure Rate Badge */}
          <div className="bg-[#1F1F23] border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#FE2C55] animate-ping" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none">
                Platform Baseline
              </span>
              <span className="text-xs font-mono font-bold text-[#FE2C55] leading-tight">
                29.0% Failure
              </span>
            </div>
          </div>

          {/* Model Spec Modal Trigger */}
          <button
            onClick={() => setShowFormulaModal(!showFormulaModal)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#1F1F23] hover:bg-white/10 text-slate-200 border border-white/10 hover:border-[#25F4EE]/50 transition-all text-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Inspect Additive Scoring Architecture"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#25F4EE]" />
            <span className="font-semibold text-xs hidden sm:inline">Model Spec</span>
          </button>
        </div>
      </div>

      {/* Collapsible Model Specification Drawer */}
      {showFormulaModal && (
        <div className="border-t border-white/10 bg-[#0c0c0e] px-4 sm:px-6 lg:px-8 py-4 animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-300">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-[#25F4EE]/10 text-[#25F4EE]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm text-white">
                  TikTok Shop PH Additive Risk Scoring Architecture (60,000+ Order Training Dataset)
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                Every Philippine transaction originates at the baseline{' '}
                <strong className="text-white">29.0% Cash-on-Delivery Failure Rate</strong>.
                As the buyer configures their cart, 6 discrete feature vectors (Region, Tenure, Speed, Category,
                Traffic Scenario, Courier) apply additive percentage modifiers:
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                <code className="px-2.5 py-1 rounded-lg bg-[#010101] text-[#25F4EE] border border-[#25F4EE]/30 font-bold">
                  Final Risk Score = Clamp(29% Base + Σ Modifiers, 0%, 100%)
                </code>
                <span className="text-slate-400 text-[11px]">
                  Protected GMV: <strong className="text-white">{MONTHLY_GMV_CONTEXT.targetRecovery}</strong> mitigated RTS loss
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowFormulaModal(false)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 transition-colors shrink-0"
              aria-label="Dismiss Model Spec"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

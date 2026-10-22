import React from 'react';
import { Smartphone } from 'lucide-react';
import { useRiskSimulation } from './hooks/useRiskSimulation.ts';
import { TikTokHeader } from './components/layout/TikTokHeader.tsx';
import { ControlPanel } from './components/controls/ControlPanel.tsx';
import { RiskGauge } from './components/simulation/RiskGauge.tsx';
import { TierBadge } from './components/simulation/TierBadge.tsx';
import { TikTokShopCheckout } from './components/simulation/TikTokShopCheckout.tsx';
import { FeatureWaterfall } from './components/simulation/FeatureWaterfall.tsx';
import { BusinessImpact } from './components/simulation/BusinessImpact.tsx';

export default function App(): React.JSX.Element {
  const {
    selections,
    calculation,
    otpInput,
    setOtpInput,
    otpVerified,
    setOtpVerified,
    depositPaid,
    setDepositPaid,
    selectedPrepaidWallet,
    setSelectedPrepaidWallet,
    orderSubmitted,
    setOrderSubmitted,
    showFormulaModal,
    setShowFormulaModal,
    handleSelectChange,
    handleReset,
    handleRandomize,
    handleApplyPreset,
    currentProduct,
    currentRegionObj,
    currentSpeedObj,
    currentCourierObj,
    subtotal,
    shipping,
    totalOrderAmount,
    tier3Deposit,
    tier3CollectOnDelivery,
    isCheckoutReady,
  } = useRiskSimulation();

  return (
    <div className="min-h-screen bg-[#010101] text-slate-100 font-sans selection:bg-[#FE2C55] selection:text-white pb-16">
      
      {/* Top Header with TikTok Shop PH Branding & GMV Context */}
      <TikTokHeader
        showFormulaModal={showFormulaModal}
        setShowFormulaModal={setShowFormulaModal}
      />

      {/* Main Split-Screen Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Feature Controls & Presets (5 Cols) */}
          <div className="lg:col-span-5">
            <ControlPanel
              selections={selections}
              calculation={calculation}
              onSelectChange={handleSelectChange}
              onReset={handleReset}
              onRandomize={handleRandomize}
              onSelectPreset={handleApplyPreset}
            />
          </div>

          {/* Right Column: Predictive Scoring & Real-Time Checkout Simulator (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Card: Animated Gauge & Active Tier Architecture */}
            <div
              className={`rounded-2xl border p-5 sm:p-6 transition-all duration-500 shadow-2xl bg-[#121212]/95 ${calculation.tier.theme.border}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Gauge Column */}
                <div className="md:col-span-5">
                  <RiskGauge calculation={calculation} />
                </div>

                {/* Tier Details Column */}
                <div className="md:col-span-7">
                  <TierBadge tier={calculation.tier} />
                </div>
              </div>
            </div>

            {/* Bottom Section: Live Mobile Phone Simulator + Factor Contribution Waterfall */}
            <div className="bg-[#121212]/95 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
              
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-white/10">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#25F4EE]" />
                    <span>Live Buyer Checkout Simulation</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Interactive mobile viewport dynamically adapting payment gates and friction in real time
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold border self-start sm:self-auto ${calculation.tier.theme.badgeBg}`}
                >
                  Active Gate: {calculation.tier.uiState}
                </span>
              </div>

              {/* Two-Column Simulation Layout: Phone + Waterfall / Business Impact */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Authentic TikTok Shop Phone Mockup */}
                <div className="xl:col-span-7 flex justify-center">
                  <TikTokShopCheckout
                    calculation={calculation}
                    currentProduct={currentProduct}
                    currentRegionObj={currentRegionObj}
                    currentSpeedObj={currentSpeedObj}
                    currentCourierObj={currentCourierObj}
                    subtotal={subtotal}
                    shipping={shipping}
                    totalOrderAmount={totalOrderAmount}
                    tier3Deposit={tier3Deposit}
                    tier3CollectOnDelivery={tier3CollectOnDelivery}
                    isCheckoutReady={isCheckoutReady}
                    otpInput={otpInput}
                    setOtpInput={setOtpInput}
                    otpVerified={otpVerified}
                    setOtpVerified={setOtpVerified}
                    depositPaid={depositPaid}
                    setDepositPaid={setDepositPaid}
                    selectedPrepaidWallet={selectedPrepaidWallet}
                    setSelectedPrepaidWallet={setSelectedPrepaidWallet}
                    orderSubmitted={orderSubmitted}
                    setOrderSubmitted={setOrderSubmitted}
                  />
                </div>

                {/* Side Breakdown & Impact Cards */}
                <div className="xl:col-span-5 space-y-4">
                  <FeatureWaterfall calculation={calculation} />
                  <BusinessImpact
                    tierId={calculation.tier.id}
                    orderTotal={totalOrderAmount}
                    finalScore={calculation.finalScore}
                  />
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Enterprise Executive Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">TikTok Shop Philippines</span>
          <span className="text-white/20">•</span>
          <span>Risk Engineering & Applied AI Architecture</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>Trained on 60,000+ PH Transactions</span>
          <span>Clamped Additive Model</span>
        </div>
      </footer>
    </div>
  );
}

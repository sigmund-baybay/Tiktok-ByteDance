import React from 'react';
import {
  MapPin,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldOff,
  Wallet,
  Smartphone,
  Check,
  ArrowRight,
  Tag,
  Flame,
  Store,
  Ticket,
} from 'lucide-react';
import { formatPHP } from '../../utils/riskCalculator.ts';
import type {
  DimensionOption,
  MockProduct,
  PrepaidWallet,
  RiskCalculationResult,
} from '../../types/riskModel.types.ts';

interface TikTokShopCheckoutProps {
  calculation: RiskCalculationResult;
  currentProduct: MockProduct;
  currentRegionObj: DimensionOption;
  currentSpeedObj: DimensionOption;
  currentCourierObj: DimensionOption;
  subtotal: number;
  shipping: number;
  totalOrderAmount: number;
  tier3Deposit: number;
  tier3CollectOnDelivery: number;
  isCheckoutReady: boolean;
  otpInput: string;
  setOtpInput: (val: string) => void;
  otpVerified: boolean;
  setOtpVerified: (val: boolean) => void;
  depositPaid: boolean;
  setDepositPaid: (val: boolean) => void;
  selectedPrepaidWallet: PrepaidWallet;
  setSelectedPrepaidWallet: (wallet: PrepaidWallet) => void;
  orderSubmitted: boolean;
  setOrderSubmitted: (val: boolean) => void;
}

export const TikTokShopCheckout: React.FC<TikTokShopCheckoutProps> = ({
  calculation,
  currentProduct,
  currentRegionObj,
  currentSpeedObj,
  currentCourierObj,
  subtotal,
  shipping,
  totalOrderAmount,
  tier3CollectOnDelivery,
  isCheckoutReady,
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
}) => {
  const { tier, finalScore } = calculation;

  return (
    <div className="w-full max-w-[390px] rounded-[2.5rem] bg-[#0c0c0e] p-3 border-[6px] border-[#222226] shadow-2xl relative shrink-0 mx-auto select-none">
      
      {/* Top Phone Speaker Notch & Hardware Bar */}
      <div className="w-32 h-4 bg-[#1a1a1e] rounded-b-xl mx-auto mb-2 flex items-center justify-center gap-1.5">
        <div className="w-10 h-1 rounded-full bg-slate-700/80" />
        <div className="w-2 h-2 rounded-full bg-slate-800" />
      </div>

      {/* Mobile Screen Viewport (Authentic TikTok Shop PH Canvas: #F8F8F8) */}
      <div className="bg-[#F8F8F8] text-slate-900 rounded-[1.8rem] overflow-hidden shadow-inner border border-slate-300/80 flex flex-col min-h-[590px] justify-between relative font-sans">
        
        {/* Scrollable Upper Section */}
        <div className="overflow-y-auto max-h-[490px]">
          
          {/* Top Status & App Bar */}
          <div className="bg-white px-4 py-3 border-b border-slate-200/90 sticky top-0 z-20 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-700 font-bold text-sm cursor-pointer hover:text-black">←</span>
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">Order Summary</span>
              </div>

              {/* TikTok Dual-Tone Glitch Risk Pill */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#010101] text-white tiktok-glitch-badge">
                  COD RISK: {finalScore}%
                </span>
              </div>
            </div>
          </div>

          {/* TikTok Shop Mall Verified Banner */}
          <div className="bg-gradient-to-r from-[#FE2C55]/10 to-[#25F4EE]/10 px-4 py-1.5 border-b border-slate-200/60 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 text-[#FE2C55] font-extrabold">
              <Store className="w-3.5 h-3.5" />
              <span>TikTok Shop Mall</span>
              <span className="text-[9px] bg-[#FE2C55] text-white px-1 rounded font-bold ml-1">100% Authentic</span>
            </div>
            <span className="text-[10px] font-medium text-slate-500">Free Returns</span>
          </div>

          {/* Shipping Address Block */}
          <div className="bg-white px-4 py-2.5 border-b border-slate-100 flex items-start gap-2.5 text-xs">
            <MapPin className="w-4 h-4 text-[#FE2C55] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span>Juan Dela Cruz</span>
                <span className="text-slate-500 font-normal font-mono text-[11px]">+63 917 ••• 8421</span>
              </div>
              <div className="text-slate-500 text-[11px] truncate mt-0.5">
                {currentRegionObj.label} • {currentSpeedObj.label} Delivery via {currentCourierObj.label}
              </div>
            </div>
          </div>

          {/* Voucher Section: Single Voucher (Tiers 1-3) vs. Stacked Vouchers (Tier 4 Edge Case) */}
          <div className="mx-3 mt-2.5 space-y-1.5">
            {tier.id === 4 ? (
              /* TIER 4: VOUCHER STACKING (Free Shipping -₱45 + GCash/Maya Prepaid Subsidy -₱20 = -₱65 Total) */
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-rose-50 border border-emerald-300 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1">
                    <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                    <span>2 Vouchers Stacked & Applied</span>
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-700 text-white shadow-2xs">
                    No Subsidy Cannibalization
                  </span>
                </div>

                {/* Voucher 1: Standard Free Shipping */}
                <div className="flex items-center justify-between bg-white/90 p-1.5 rounded-lg border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2 text-emerald-900">
                    <span className="text-[10px] font-extrabold px-1 rounded bg-emerald-100 text-emerald-800">1</span>
                    <div>
                      <div className="font-bold text-[11px]">Free Shipping Voucher</div>
                      <div className="text-[9px] text-slate-500">Capped at ₱45 delivery allowance</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    -₱45.00
                  </span>
                </div>

                {/* Voucher 2: Tier 4 Digital E-Wallet Conversion Incentive */}
                <div className="flex items-center justify-between bg-white/90 p-1.5 rounded-lg border border-rose-200 text-xs">
                  <div className="flex items-center gap-2 text-rose-950">
                    <span className="text-[10px] font-extrabold px-1 rounded bg-rose-100 text-[#FE2C55]">2</span>
                    <div>
                      <div className="font-bold text-[11px] text-[#FE2C55]">Prepaid Conversion Subsidy</div>
                      <div className="text-[9px] text-slate-500">Tier 4 GCash/Maya Incentive • Stacked</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-[#FE2C55] bg-rose-100 px-1.5 py-0.5 rounded">
                    -₱20.00
                  </span>
                </div>

                <div className="flex items-center justify-between pt-0.5 px-1 text-[10px] text-slate-700 font-extrabold border-t border-emerald-200/60">
                  <span className="text-emerald-900">Combined Non-Cannibalized Savings:</span>
                  <span className="text-emerald-800 font-mono font-black">-₱65.00 Total Off</span>
                </div>
              </div>
            ) : (
              /* Standard Single Free Shipping Voucher for Tiers 1-3 */
              <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between text-xs shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Ticket className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-[11px]">TikTok Shop Free Shipping Voucher Applied</span>
                    <div className="text-[9px] text-emerald-700 font-medium">Capped at ₱50 discount on delivery</div>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  -₱{shipping === 0 ? '45' : '0'}
                </span>
              </div>
            )}
          </div>

          {/* Product Order Summary Card */}
          <div className="bg-white p-3.5 mx-3 mt-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex gap-3 items-center">
            <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0 relative overflow-hidden text-slate-600">
              <ShoppingBag className="w-6 h-6 text-[#FE2C55]" />
              <div className="absolute top-0 right-0 bg-[#FE2C55] text-white text-[8px] font-black px-1 rounded-bl">
                LIVE
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black text-[#FE2C55] uppercase tracking-wider flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5" />
                  Flash Deal
                </span>
                <span className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded font-medium truncate">
                  {currentProduct.tag}
                </span>
              </div>

              <div className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                {currentProduct.title}
              </div>
              <div className="text-[10px] text-slate-500">{currentProduct.variant}</div>
              
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-black text-[#FE2C55]">
                    {formatPHP(currentProduct.price)}
                  </span>
                  <span className="text-[10px] text-slate-400 line-through">
                    {formatPHP(Math.round(currentProduct.price * 1.35))}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500">Qty: 1</span>
              </div>
            </div>
          </div>

          {/* Dynamic Risk Interception Banner (Matches exact prompt copy) */}
          <div className="px-3 mt-2.5">
            <div className={`p-3 rounded-xl border text-xs transition-all duration-300 shadow-2xs ${tier.theme.mobileBannerBg}`}>
              <div className="flex items-start gap-2">
                <span className="text-base leading-none mt-0.5 shrink-0">{tier.emoji}</span>
                <div className="space-y-1">
                  <div className="font-extrabold text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                    <span>{tier.uiState}</span>
                  </div>
                  <p className="text-[11px] leading-snug font-medium">
                    {tier.copy}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Payment Method Choice Architecture */}
          <div className="px-3 mt-3 space-y-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 px-1 flex items-center justify-between">
              <span>Payment Options</span>
              <span className="text-[10px] text-slate-400 font-normal">Real-Time Friction Gate</span>
            </div>

            {/* TIER 1: LOW RISK (0-34%) -> Standard 1-Click COD */}
            {tier.id === 1 && (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-emerald-50/80 border-2 border-emerald-500 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span>Cash on Delivery (COD)</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-extrabold">
                          1-Click Ready
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-600">
                        Pay {formatPHP(totalOrderAmount)} in cash upon doorstep arrival
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between opacity-70">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">GCash / Maya e-Wallet</span>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-slate-300" />
                </div>
              </div>
            )}

            {/* TIER 2: MEDIUM RISK (35-45%) -> SMS OTP Intent Verification */}
            {tier.id === 2 && (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-amber-50/90 border-2 border-amber-400 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Cash on Delivery (OTP Required)
                        </div>
                        <div className="text-[10px] text-slate-600">
                          Verification code sent to +63 917 ••• 8421
                        </div>
                      </div>
                    </div>

                    {otpVerified ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                        Pending OTP
                      </span>
                    )}
                  </div>

                  {/* Interactive OTP Input Simulation */}
                  {!otpVerified ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        maxLength={4}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        placeholder="4-digit OTP"
                        className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold tracking-widest text-center text-slate-900 outline-none focus:border-amber-600 shadow-2xs"
                      />
                      <button
                        onClick={() => setOtpVerified(true)}
                        className="px-3 py-1.5 rounded-lg bg-[#010101] hover:bg-slate-800 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                      >
                        Verify OTP
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-emerald-900 bg-emerald-100 border border-emerald-300 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                      <span className="font-semibold">✓ Mobile number confirmed. COD unlocked!</span>
                      <button
                        onClick={() => setOtpVerified(false)}
                        className="text-[9px] underline font-bold text-emerald-900 cursor-pointer ml-2"
                      >
                        Undo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TIER 3: HIGH RISK (46-55%) -> Padlocked COD + PHP 50 Earnest Deposit */}
            {tier.id === 3 && (
              <div className="space-y-2">
                {/* Padlocked / Unlocked COD Option */}
                <div
                  className={`p-3 rounded-xl border-2 transition-all shadow-2xs ${
                    depositPaid
                      ? 'bg-emerald-50 border-emerald-500'
                      : 'bg-slate-200/90 border-slate-300 opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          depositPaid
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-400 text-slate-800'
                        }`}
                      >
                        {depositPaid ? (
                          <Unlock className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>Cash on Delivery</span>
                          {!depositPaid && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-300 text-slate-700 font-bold">
                              Locked
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-600">
                          {depositPaid
                            ? `₱50 deposit paid • Collect ${formatPHP(tier3CollectOnDelivery)} on delivery`
                            : 'Requires ₱50 securing deposit to unlock'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Earnest Money Micro-Deposit Action Box */}
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-300 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-orange-950 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-orange-600" />
                      Securing Deposit (GCash / Maya)
                    </span>
                    <span className="font-extrabold text-orange-700">₱50.00</span>
                  </div>

                  {!depositPaid ? (
                    <button
                      onClick={() => setDepositPaid(true)}
                      className="w-full py-2 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      Pay ₱50 Deposit via GCash/Maya to Unlock COD
                    </button>
                  ) : (
                    <div className="flex items-center justify-between text-[10px] text-emerald-900 bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-300 font-bold">
                      <span>✓ ₱50.00 Deposit Confirmed via GCash</span>
                      <button
                        onClick={() => setDepositPaid(false)}
                        className="text-[9px] underline font-bold cursor-pointer text-emerald-900"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TIER 4: CRITICAL RISK (56%+) -> COD Disabled + PHP 20 Prepaid Incentive */}
            {tier.id === 4 && (
              <div className="space-y-2">
                {/* Disabled COD Row */}
                <div className="p-2.5 rounded-xl bg-slate-200/80 border border-slate-300 flex items-center justify-between opacity-60 cursor-not-allowed select-none">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                      <ShieldOff className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 line-through">
                        Cash on Delivery (COD)
                      </div>
                      <div className="text-[10px] text-rose-700 font-bold">
                        Unavailable for this route/profile
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-300 text-slate-700">
                    Disabled
                  </span>
                </div>

                {/* Defaulted Prepaid E-Wallet Options with PHP 20 Off */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPrepaidWallet('gcash')}
                    className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      selectedPrepaidWallet === 'gcash'
                        ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500/30'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-700">GCash</span>
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-[#FE2C55] text-white">
                        -₱20 OFF
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5 font-medium">
                      Instant e-Wallet
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPrepaidWallet('maya')}
                    className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      selectedPrepaidWallet === 'maya'
                        ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-500/30'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-800">Maya</span>
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-[#FE2C55] text-white">
                        -₱20 OFF
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5 font-medium">
                      e-Wallet / Card
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Bottom Checkout Bill & Place Order CTA Button */}
        <div className="bg-white border-t border-slate-200/90 p-3.5 space-y-2.5 sticky bottom-0 z-20 shadow-md">
          <div className="space-y-1.5 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span>Merchandise Subtotal</span>
              <span className="font-mono">{formatPHP(subtotal)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Shipping ({currentSpeedObj.label})</span>
              <span className="font-mono">{shipping === 0 ? 'FREE' : formatPHP(shipping)}</span>
            </div>

            {/* TIER 3 EDGE CASE: EXPLICIT MICRO-DEPOSIT DEDUCTION */}
            {tier.id === 3 ? (
              <div className="space-y-1 pt-1 border-t border-slate-100">
                <div className="flex justify-between text-slate-700 font-bold">
                  <span>Gross Order Value:</span>
                  <span className="font-mono">{formatPHP(totalOrderAmount)}</span>
                </div>

                <div className="flex justify-between text-orange-700 font-bold">
                  <span className="flex items-center gap-1">
                    <span>Deposit {depositPaid ? 'Paid' : 'Required'} (GCash/Maya):</span>
                  </span>
                  <span className="font-mono">-₱50.00</span>
                </div>

                {/* Explicit Formula Banner per Stakeholder Requirements */}
                <div className="my-1 py-1 px-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-950 text-[10px] font-mono font-bold text-center tracking-tight">
                  Total: {formatPHP(totalOrderAmount)} | Deposit Paid: -₱50 | Amount to Collect at Door: {formatPHP(tier3CollectOnDelivery)}
                </div>

                <div className="flex justify-between text-xs font-black text-slate-900 pt-1 border-t border-dashed border-slate-300">
                  <span className="text-emerald-900 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Amount to Collect at Door</span>
                  </span>
                  <span className="font-mono text-sm text-[#FE2C55]">
                    {formatPHP(tier3CollectOnDelivery)}
                  </span>
                </div>
              </div>
            ) : tier.id === 4 ? (
              /* TIER 4 EDGE CASE: VOUCHER STACKING BREAKDOWN */
              <div className="space-y-1 pt-1 border-t border-slate-100">
                <div className="flex justify-between text-[#FE2C55] font-bold text-[10px]">
                  <span>Voucher 1: Free Shipping Allowance</span>
                  <span className="font-mono">-₱45.00</span>
                </div>

                <div className="flex justify-between text-[#FE2C55] font-black text-[10px]">
                  <span>Voucher 2: Prepaid GCash/Maya Subsidy</span>
                  <span className="font-mono">-₱20.00</span>
                </div>

                <div className="my-1 py-1 px-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-950 text-[10px] font-mono font-bold text-center tracking-tight">
                  Stacked Savings: Free Shipping (-₱45) + Prepaid (-₱20) = -₱65 Total
                </div>

                <div className="flex justify-between text-xs font-black text-slate-900 pt-1 border-t border-slate-100">
                  <span>Net Total Payment (Prepaid)</span>
                  <span className="font-mono text-sm text-[#FE2C55]">
                    {formatPHP(totalOrderAmount)}
                  </span>
                </div>
              </div>
            ) : (
              /* TIER 1 & 2 STANDARD BILLING */
              <div className="flex justify-between text-xs font-black text-slate-900 pt-1 border-t border-slate-100">
                <span>Total Payment</span>
                <span className="font-mono text-sm text-[#FE2C55]">
                  {formatPHP(totalOrderAmount)}
                </span>
              </div>
            )}
          </div>

          {!orderSubmitted ? (
            <button
              disabled={!isCheckoutReady}
              onClick={() => setOrderSubmitted(true)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isCheckoutReady
                  ? tier.theme.buttonBg
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              {tier.id === 1 && (
                <>
                  <span>Place 1-Click COD Order ({formatPHP(totalOrderAmount)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
              {tier.id === 2 && (
                <>
                  <span>
                    {otpVerified
                      ? `Place Verified COD Order (${formatPHP(totalOrderAmount)})`
                      : 'Verify OTP Above to Place COD Order'}
                  </span>
                </>
              )}
              {tier.id === 3 && (
                <>
                  <span>
                    {depositPaid
                      ? `Complete COD Order (${formatPHP(tier3CollectOnDelivery)} due on delivery)`
                      : 'Locked — Pay ₱50 Deposit Above First'}
                  </span>
                </>
              )}
              {tier.id === 4 && (
                <>
                  <span>
                    Pay Now with {selectedPrepaidWallet === 'gcash' ? 'GCash' : 'Maya'} ({formatPHP(totalOrderAmount)})
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between animate-in zoom-in-95 duration-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Order Confirmed ({tier.name})!
              </span>
              <button
                onClick={() => setOrderSubmitted(false)}
                className="text-[10px] underline opacity-90 hover:opacity-100 cursor-pointer ml-2"
              >
                Test Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

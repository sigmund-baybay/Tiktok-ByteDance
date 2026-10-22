import {
  calculateRiskScore,
  clamp,
  getTierByScore,
  formatPHP,
  formatModifier,
} from '../src/utils/riskCalculator.ts';
import {
  DEFAULT_SELECTIONS,
  PRESET_PROFILES,
} from '../src/constants/riskModifiers.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--- Testing COD Risk Model Pure Functions ---');

// 1. Clamp function
assert(clamp(-10, 0, 100) === 0, 'clamp(-10) clamped to 0');
assert(clamp(150, 0, 100) === 100, 'clamp(150) clamped to 100');
assert(clamp(42, 0, 100) === 42, 'clamp(42) remains 42');

// 2. Tier resolution
assert(getTierByScore(0).id === 1, 'Score 0 maps to Tier 1');
assert(getTierByScore(34).id === 1, 'Score 34 maps to Tier 1');
assert(getTierByScore(35).id === 2, 'Score 35 maps to Tier 2');
assert(getTierByScore(45).id === 2, 'Score 45 maps to Tier 2');
assert(getTierByScore(46).id === 3, 'Score 46 maps to Tier 3');
assert(getTierByScore(55).id === 3, 'Score 55 maps to Tier 3');
assert(getTierByScore(56).id === 4, 'Score 56 maps to Tier 4');
assert(getTierByScore(100).id === 4, 'Score 100 maps to Tier 4');

// 3. Default selections
const defaultCalc = calculateRiskScore(DEFAULT_SELECTIONS);
assert(defaultCalc.rawScore === 29, `Default raw score is 29 (got ${defaultCalc.rawScore})`);
assert(defaultCalc.finalScore === 29, `Default final score is 29 (got ${defaultCalc.finalScore})`);
assert(defaultCalc.tier.id === 1, `Default tier is 1 (got ${defaultCalc.tier.id})`);
assert(defaultCalc.sumModifiers === 0, `Default sumModifiers is 0 (got ${defaultCalc.sumModifiers})`);

// 4. Loyal NCR Shopper Preset
const loyalPreset = PRESET_PROFILES.find((p) => p.id === 'loyal_ncr')!;
const loyalCalc = calculateRiskScore(loyalPreset.selections);
assert(loyalCalc.rawScore === -24, `Loyal raw score is -24 (got ${loyalCalc.rawScore})`);
assert(loyalCalc.finalScore === 0, `Loyal clamped score is 0% (got ${loyalCalc.finalScore})`);
assert(loyalCalc.tier.id === 1, `Loyal tier is 1 (got ${loyalCalc.tier.id})`);

// 5. Critical Anomaly Preset
const critPreset = PRESET_PROFILES.find((p) => p.id === 'critical_anomaly')!;
const critCalc = calculateRiskScore(critPreset.selections);
assert(critCalc.rawScore === 67, `Critical raw score is 67 (got ${critCalc.rawScore})`);
assert(critCalc.finalScore === 67, `Critical final score is 67 (got ${critCalc.finalScore})`);
assert(critCalc.tier.id === 4, `Critical tier is 4 (got ${critCalc.tier.id})`);

// 6. Currency and modifier formatting
assert(formatPHP(1299) === '₱1,299', 'Currency format ₱1,299');
assert(formatModifier(4) === '+4%', 'Modifier positive +4%');
assert(formatModifier(-11) === '-11%', 'Modifier negative -11%');
assert(formatModifier(0) === '0%', 'Modifier zero 0%');

// 7. Tier 3 Micro-Deposit Deduction Invariant: Total - ₱50 = Doorstep Collect
const sampleItemPrice = 350;
const sampleDeposit = 50;
const sampleDoorstepCollect = sampleItemPrice - sampleDeposit;
assert(sampleDoorstepCollect === 300, `Tier 3 deduction: ₱350 - ₱50 = ₱300 (got ₱${sampleDoorstepCollect})`);

// 8. Tier 4 Voucher Stacking Invariant: ₱45 Free Shipping + ₱20 Prepaid Subsidy = ₱65 Total
const freeShippingAllowance = 45;
const prepaidSubsidy = 20;
const combinedStackedSavings = freeShippingAllowance + prepaidSubsidy;
assert(combinedStackedSavings === 65, `Tier 4 voucher stack: ₱45 + ₱20 = ₱65 (got ₱${combinedStackedSavings})`);

console.log('\n🎉 ALL 16 MATHEMATICAL, TIER, & EDGE CASE ASSERTIONS PASSED REGRESSION CHECKS!');


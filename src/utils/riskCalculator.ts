import {
  BASE_FAILURE_RATE,
  DIMENSIONS,
  TIER_CONFIGS,
} from '../constants/riskModifiers.ts';
import type {
  DimensionKey,
  ModifierBreakdownItem,
  RiskCalculationResult,
  RiskProfileSelections,
  RiskTierConfig,
  RiskTierId,
} from '../types/riskModel.types.ts';

/**
 * Clamps a numerical value within the given min and max boundaries.
 */
export function clamp(val: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Resolves the active Risk Tier given a clamped risk score.
 * Thresholds:
 *   Tier 1: 0% – 34%
 *   Tier 2: 35% – 45%
 *   Tier 3: 46% – 55%
 *   Tier 4: 56%+
 */
export function getTierByScore(score: number): RiskTierConfig {
  let tierId: RiskTierId = 1;
  if (score >= 56) {
    tierId = 4;
  } else if (score >= 46) {
    tierId = 3;
  } else if (score >= 35) {
    tierId = 2;
  } else {
    tierId = 1;
  }
  return TIER_CONFIGS[tierId];
}

/**
 * Calculates the additive risk score based on the 6 feature dimensions.
 * Formula: Final Risk Score = Clamp(29% Base + Σ Modifiers, 0%, 100%)
 */
export function calculateRiskScore(selections: RiskProfileSelections): RiskCalculationResult {
  const dimensionKeys = Object.keys(DIMENSIONS) as DimensionKey[];

  const breakdown: ModifierBreakdownItem[] = dimensionKeys.map((key) => {
    const dim = DIMENSIONS[key];
    const selectedOption =
      dim.options.find((opt) => opt.id === selections[key]) ?? dim.options[0];

    return {
      key,
      dimensionLabel: dim.label.replace(/^\d+\.\s*/, ''),
      optionLabel: selectedOption.label,
      modifier: selectedOption.modifier,
      actualRate: selectedOption.actualRate,
    };
  });

  const sumModifiers = breakdown.reduce((acc, item) => acc + item.modifier, 0);
  const rawScore = BASE_FAILURE_RATE + sumModifiers;
  const finalScore = clamp(rawScore, 0, 100);
  const tier = getTierByScore(finalScore);

  return {
    breakdown,
    sumModifiers,
    rawScore,
    finalScore,
    tier,
  };
}

/**
 * Formats Philippine Peso currency cleanly with commas.
 */
export function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString('en-PH')}`;
}

/**
 * Formats a modifier with positive or negative sign.
 */
export function formatModifier(modifier: number): string {
  return modifier > 0 ? `+${modifier}%` : `${modifier}%`;
}

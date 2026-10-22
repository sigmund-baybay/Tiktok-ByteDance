import React from 'react';

export type DimensionKey = 'region' | 'tenure' | 'speed' | 'category' | 'scenario' | 'courier';

export interface DimensionOption {
  readonly id: string;
  readonly label: string;
  readonly modifier: number;
  readonly actualRate: string;
}

export interface DimensionConfig {
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly description: string;
  readonly options: readonly DimensionOption[];
}

export type DimensionsMap = Record<DimensionKey, DimensionConfig>;

export type RiskProfileSelections = Record<DimensionKey, string>;

export type RiskTierId = 1 | 2 | 3 | 4;

export interface RiskTierTheme {
  readonly bgLight: string;
  readonly border: string;
  readonly text: string;
  readonly badgeBg: string;
  readonly accentHex: string;
  readonly mobileBannerBg: string;
  readonly mobileBadge: string;
  readonly buttonBg: string;
}

export interface RiskTierConfig {
  readonly id: RiskTierId;
  readonly name: string;
  readonly range: string;
  readonly emoji: string;
  readonly uiState: string;
  readonly copy: string;
  readonly actionSummary: string;
  readonly theme: RiskTierTheme;
}

export interface PresetProfile {
  readonly id: string;
  readonly name: string;
  readonly badge: string;
  readonly color: 'emerald' | 'amber' | 'orange' | 'rose';
  readonly description?: string;
  readonly selections: RiskProfileSelections;
}

export interface ModifierBreakdownItem {
  readonly key: DimensionKey;
  readonly dimensionLabel: string;
  readonly optionLabel: string;
  readonly modifier: number;
  readonly actualRate: string;
}

export interface RiskCalculationResult {
  readonly breakdown: readonly ModifierBreakdownItem[];
  readonly sumModifiers: number;
  readonly rawScore: number;
  readonly finalScore: number;
  readonly tier: RiskTierConfig;
}

export interface MockProduct {
  readonly title: string;
  readonly variant: string;
  readonly price: number;
  readonly shipping: number;
  readonly tag: string;
}

export type PrepaidWallet = 'gcash' | 'maya';

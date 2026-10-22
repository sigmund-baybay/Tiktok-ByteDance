import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  DEFAULT_SELECTIONS,
  DIMENSIONS,
  MOCK_PRODUCTS,
} from '../constants/riskModifiers.ts';
import { calculateRiskScore } from '../utils/riskCalculator.ts';
import type {
  DimensionKey,
  PrepaidWallet,
  PresetProfile,
  RiskProfileSelections,
} from '../types/riskModel.types.ts';

export function useRiskSimulation() {
  const [selections, setSelections] = useState<RiskProfileSelections>(DEFAULT_SELECTIONS);

  // Interactive checkout states for micro-flow simulations
  const [otpInput, setOtpInput] = useState<string>('4829');
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [depositPaid, setDepositPaid] = useState<boolean>(false);
  const [selectedPrepaidWallet, setSelectedPrepaidWallet] = useState<PrepaidWallet>('gcash');
  const [orderSubmitted, setOrderSubmitted] = useState<boolean>(false);
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  // Reset checkout micro-states whenever profile dimensions change
  useEffect(() => {
    setOtpVerified(false);
    setDepositPaid(false);
    setOrderSubmitted(false);
  }, [selections]);

  // Pure additive risk computation
  const calculation = useMemo(() => {
    return calculateRiskScore(selections);
  }, [selections]);

  // Dimension selection change handler
  const handleSelectChange = useCallback((dimensionKey: DimensionKey, optionId: string) => {
    setSelections((prev) => ({
      ...prev,
      [dimensionKey]: optionId,
    }));
  }, []);

  // Reset to default baseline selections
  const handleReset = useCallback(() => {
    setSelections(DEFAULT_SELECTIONS);
  }, []);

  // Randomize all 6 dimensions
  const handleRandomize = useCallback(() => {
    const randomSelections: Partial<RiskProfileSelections> = {};
    const dimensionKeys = Object.keys(DIMENSIONS) as DimensionKey[];

    dimensionKeys.forEach((key) => {
      const dim = DIMENSIONS[key];
      const randomIndex = Math.floor(Math.random() * dim.options.length);
      randomSelections[key] = dim.options[randomIndex].id;
    });

    setSelections(randomSelections as RiskProfileSelections);
  }, []);

  // Apply a preset profile
  const handleApplyPreset = useCallback((preset: PresetProfile) => {
    setSelections(preset.selections);
  }, []);

  // Derived checkout entities
  const currentProduct = MOCK_PRODUCTS[selections.category] ?? MOCK_PRODUCTS.elec_refurb;
  const currentRegionObj =
    DIMENSIONS.region.options.find((r) => r.id === selections.region) ??
    DIMENSIONS.region.options[0];
  const currentSpeedObj =
    DIMENSIONS.speed.options.find((s) => s.id === selections.speed) ??
    DIMENSIONS.speed.options[0];
  const currentCourierObj =
    DIMENSIONS.courier.options.find((c) => c.id === selections.courier) ??
    DIMENSIONS.courier.options[0];

  // Dynamic pricing calculations
  const subtotal = currentProduct.price;
  const shipping = currentProduct.shipping;
  const tier4Discount = calculation.tier.id === 4 ? 20 : 0;
  const totalOrderAmount = subtotal + shipping - tier4Discount;
  const tier3Deposit = 50;
  const tier3CollectOnDelivery = totalOrderAmount - tier3Deposit;

  // Checkout button unlock validation
  const isCheckoutReady = useMemo(() => {
    if (calculation.tier.id === 1) return true;
    if (calculation.tier.id === 2) return otpVerified;
    if (calculation.tier.id === 3) return depositPaid;
    if (calculation.tier.id === 4) return true;
    return false;
  }, [calculation.tier.id, otpVerified, depositPaid]);

  return {
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
    tier4Discount,
    totalOrderAmount,
    tier3Deposit,
    tier3CollectOnDelivery,
    isCheckoutReady,
  };
}

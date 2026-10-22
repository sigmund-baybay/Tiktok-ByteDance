import {
  MapPin,
  Clock,
  Truck,
  ShoppingBag,
  Tv,
  UserCheck,
} from 'lucide-react';
import type {
  DimensionsMap,
  RiskProfileSelections,
  PresetProfile,
  RiskTierConfig,
  RiskTierId,
  MockProduct,
} from '../types/riskModel.types.ts';

export const BASE_FAILURE_RATE = 29;

export const MONTHLY_GMV_CONTEXT = {
  gmv: '₱5.79B/mo',
  volume: '12.4M Orders/mo',
  baselineLoss: '₱1.68B at Risk',
  targetRecovery: '₱420M+ Saved',
};

export const DIMENSIONS: DimensionsMap = {
  region: {
    label: '1. Buyer Region',
    icon: MapPin,
    description: 'Geographic delivery zone in the Philippines',
    options: [
      { id: 'ncr', label: 'Metro Manila (NCR)', modifier: -11, actualRate: '18%' },
      { id: 'luzon', label: 'Luzon (excl. NCR)', modifier: -3, actualRate: '26%' },
      { id: 'visayas', label: 'Visayas', modifier: 3, actualRate: '32%' },
      { id: 'mindanao', label: 'Mindanao', modifier: 6, actualRate: '35%' },
    ],
  },
  tenure: {
    label: '2. Buyer Tenure',
    icon: UserCheck,
    description: 'Account age & historical platform reliability',
    options: [
      { id: 'lt_1m', label: '< 1 month', modifier: 9, actualRate: '38%' },
      { id: '1_3m', label: '1-3 months', modifier: 3, actualRate: '32%' },
      { id: '3_6m', label: '3-6 months', modifier: -2, actualRate: '27%' },
      { id: '6_12m', label: '6-12 months', modifier: -6, actualRate: '23%' },
      { id: 'gt_12m', label: '> 12 months', modifier: -11, actualRate: '18%' },
    ],
  },
  speed: {
    label: '3. Delivery Speed',
    icon: Clock,
    description: 'Estimated fulfillment & transit window (buyer remorse window)',
    options: [
      { id: 'sameday', label: 'Same-Day', modifier: -17, actualRate: '12%' },
      { id: 'nextday', label: 'Next-Day', modifier: -12, actualRate: '17%' },
      { id: 'standard', label: 'Standard', modifier: 0, actualRate: '29%' },
      { id: 'extended', label: 'Extended', modifier: 9, actualRate: '38%' },
    ],
  },
  category: {
    label: '4. Product Category',
    icon: ShoppingBag,
    description: 'Item classification and impulse/sizing return sensitivity',
    options: [
      { id: 'fashion_apparel', label: 'Fashion Apparel', modifier: 4, actualRate: '33%' },
      { id: 'elec_new', label: 'Electronics (New)', modifier: 2, actualRate: '31%' },
      { id: 'elec_refurb', label: 'Electronics (Refurb)', modifier: 0, actualRate: '29%' },
      { id: 'fashion_non_apparel', label: 'Fashion Non-Apparel', modifier: -4, actualRate: '25%' },
      { id: 'fmcg', label: 'FMCG (Beauty/Grocery)', modifier: -7, actualRate: '22%' },
      { id: 'lifestyle', label: 'Lifestyle', modifier: -11, actualRate: '18%' },
    ],
  },
  scenario: {
    label: '5. Scenario (Traffic Source)',
    icon: Tv,
    description: 'Discovery surface and purchase intent depth',
    options: [
      { id: 'creator_live', label: 'Creator livestream', modifier: 3, actualRate: '32%' },
      { id: 'seller_live', label: 'Seller self-livestream', modifier: -5, actualRate: '24%' },
      { id: 'short_video', label: 'Short video (product link)', modifier: 0, actualRate: '29%' },
      { id: 'shoptab', label: 'ShopTab (search & browse)', modifier: -9, actualRate: '20%' },
    ],
  },
  courier: {
    label: '6. Assigned Courier',
    icon: Truck,
    description: 'Last-mile 3PL fulfillment partner performance',
    options: [
      { id: 'ab_express', label: 'A&B Express', modifier: 0, actualRate: '29%' },
      { id: 'fast_express', label: 'Fast Express', modifier: 2, actualRate: '31%' },
      { id: 'quick_van', label: 'Quick Van', modifier: 4, actualRate: '33%' },
      { id: 'xyz_express', label: 'XYZ Express', modifier: -3, actualRate: '26%' },
      { id: 'others', label: 'Others', modifier: 7, actualRate: '36%' },
    ],
  },
};

export const DEFAULT_SELECTIONS: RiskProfileSelections = {
  region: 'luzon',
  tenure: '1_3m',
  speed: 'standard',
  category: 'elec_refurb',
  scenario: 'short_video',
  courier: 'ab_express',
};

export const PRESET_PROFILES: readonly PresetProfile[] = [
  {
    id: 'loyal_ncr',
    name: 'Loyal NCR Shopper',
    badge: 'Tier 1 (Low)',
    color: 'emerald',
    description: 'Verified NCR resident buying high-repurchasing FMCG via search tab',
    selections: {
      region: 'ncr',
      tenure: 'gt_12m',
      speed: 'nextday',
      category: 'fmcg',
      scenario: 'shoptab',
      courier: 'xyz_express',
    },
  },
  {
    id: 'casual_scroller',
    name: 'Casual Video Scroller',
    badge: 'Tier 2 (Medium)',
    color: 'amber',
    description: 'Visayas user discovering trending consumer electronics in video feed',
    selections: {
      region: 'visayas',
      tenure: '1_3m',
      speed: 'standard',
      category: 'elec_new',
      scenario: 'short_video',
      courier: 'fast_express',
    },
  },
  {
    id: 'impulse_live',
    name: 'Impulse Live Buyer',
    badge: 'Tier 3 (High)',
    color: 'orange',
    description: 'New account in Visayas ordering apparel from viral creator livestream',
    selections: {
      region: 'visayas',
      tenure: 'lt_1m',
      speed: 'extended',
      category: 'fashion_apparel',
      scenario: 'creator_live',
      courier: 'ab_express',
    },
  },
  {
    id: 'critical_anomaly',
    name: 'Critical Anomaly Profile',
    badge: 'Tier 4 (Critical)',
    color: 'rose',
    description: 'Brand-new account in Mindanao with extended freight via unrated courier',
    selections: {
      region: 'mindanao',
      tenure: 'lt_1m',
      speed: 'extended',
      category: 'fashion_apparel',
      scenario: 'creator_live',
      courier: 'others',
    },
  },
];

export const TIER_CONFIGS: Record<RiskTierId, RiskTierConfig> = {
  1: {
    id: 1,
    name: 'Tier 1: Low Risk',
    range: '0% – 34%',
    emoji: '🟢',
    uiState: 'Frictionless 1-Click COD',
    copy: 'Eligible for Standard COD.',
    actionSummary: 'Standard checkout proceeds normally with zero conversion friction.',
    theme: {
      bgLight: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      accentHex: '#10b981',
      mobileBannerBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      mobileBadge: 'bg-emerald-600 text-white',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 active:scale-[0.99]',
    },
  },
  2: {
    id: 2,
    name: 'Tier 2: Medium Risk',
    range: '35% – 45%',
    emoji: '🟡',
    uiState: 'Intent Confirmation Required',
    copy: 'Please confirm your mobile number via OTP to secure your COD order.',
    actionSummary: 'Filters out automated bots and low-intent impulsive scrollers.',
    theme: {
      bgLight: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      accentHex: '#f59e0b',
      mobileBannerBg: 'bg-amber-50 border-amber-300 text-amber-950',
      mobileBadge: 'bg-amber-500 text-slate-950',
      buttonBg: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/25 active:scale-[0.99]',
    },
  },
  3: {
    id: 3,
    name: 'Tier 3: High Risk',
    range: '46% – 55%',
    emoji: '🟠',
    uiState: 'Quick Downpayment (Earnest Money)',
    copy: 'To unlock Cash on Delivery for this high-demand item, a PHP 50 securing deposit via GCash/Maya is required. The rest will be collected upon delivery.',
    actionSummary: 'COD option is greyed out with a padlock until the micro-downpayment is made. Breaks the impulse flow state.',
    theme: {
      bgLight: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      accentHex: '#f97316',
      mobileBannerBg: 'bg-orange-50 border-orange-300 text-orange-950',
      mobileBadge: 'bg-orange-600 text-white',
      buttonBg: 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25 active:scale-[0.99]',
    },
  },
  4: {
    id: 4,
    name: 'Tier 4: Critical Risk',
    range: '56%+',
    emoji: '🔴',
    uiState: 'Pay Now, Rest Easy (COD Disabled)',
    copy: 'COD is currently unavailable for this route/profile, but take PHP 20 off by paying with Maya or GCash!',
    actionSummary: 'COD is completely disabled. Automatically defaults to prepaid e-Wallet/Card options with a small incentive.',
    theme: {
      bgLight: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      accentHex: '#fe2c55',
      mobileBannerBg: 'bg-rose-50 border-rose-300 text-rose-950',
      mobileBadge: 'bg-rose-600 text-white',
      buttonBg: 'bg-[#FE2C55] hover:bg-[#e02449] text-white shadow-lg shadow-[#FE2C55]/30 active:scale-[0.99]',
    },
  },
};

export const MOCK_PRODUCTS: Record<string, MockProduct> = {
  fashion_apparel: {
    title: 'Oversized Linen Button-Down Shirt (Unisex)',
    variant: 'Size: L • Oat Beige',
    price: 649,
    shipping: 45,
    tag: 'High Return Sensitivity',
  },
  elec_new: {
    title: 'TWS Active Noise Cancelling Earbuds Pro 5',
    variant: 'Matte Black • 1 Yr Warranty',
    price: 1299,
    shipping: 38,
    tag: 'High Value Parcel',
  },
  elec_refurb: {
    title: 'Certified Refurbished Portable Mini Projector',
    variant: '1080p Supported • Grade A',
    price: 1850,
    shipping: 60,
    tag: 'Refurbished Tech',
  },
  fashion_non_apparel: {
    title: 'Polarized Retro Acetate Sunglasses UV400',
    variant: 'Tortoiseshell Frame',
    price: 420,
    shipping: 38,
    tag: 'Fashion Accessory',
  },
  fmcg: {
    title: 'Niacinamide 10% + Zinc Barrier Repair Serum (2-Pack)',
    variant: '30ml x 2 • FDA Approved',
    price: 549,
    shipping: 0,
    tag: 'Essential Restock',
  },
  lifestyle: {
    title: 'Insulated Stainless Steel Tumbler 40oz w/ Straw',
    variant: 'Sage Green • Leakproof',
    price: 599,
    shipping: 45,
    tag: 'Home & Living',
  },
};

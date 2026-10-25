import React, { useState, useMemo } from 'react';
import {
  Sliders,
  TrendingDown,
  RefreshCw,
  Shuffle,
  MapPin,
  Clock,
  Truck,
  ShoppingBag,
  Tv,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldOff,
  Wallet,
  Check,
  Sparkles,
  Store,
  Ticket,
  Flame,
  UserCheck,
  HelpCircle,
  X,
  BellRing,
  CalendarClock,
  MessageSquareQuote,
  Layers,
  Activity,
  Send,
  XCircle,
  Radio,
  PackageCheck,
  DollarSign,
} from 'lucide-react';

/* ==========================================================================
   CONSTANTS & DOMAIN DATA
   ========================================================================== */

const BASE_FAILURE_RATE = 29;

/* --------------------------------------------------------------------------
   COST STRUCTURE (case pack). Sellers bear forward delivery; the platform
   bears reverse logistics and cash-handling overhead.
   -------------------------------------------------------------------------- */
const FORWARD_DELIVERY_COST = 70; // seller-borne
const REVERSE_LOGISTICS_COST = 50; // platform-borne
const CASH_HANDLING_COST = 60; // platform-borne; the only cost removed by every prepaid conversion, failed or not
const FAILED_ORDER_LOGISTICS = FORWARD_DELIVERY_COST + REVERSE_LOGISTICS_COST + CASH_HANDLING_COST; // ₱180
const PLATFORM_FAIL_EXPOSURE = REVERSE_LOGISTICS_COST + CASH_HANDLING_COST; // ₱110
const SELLER_FAIL_EXPOSURE = FORWARD_DELIVERY_COST; // ₱70
const COMMISSION_RATE = 0.1;

// Market scale (case pack)
const DAILY_ORDERS = 5_000_000;
const AVERAGE_ORDER_VALUE = 800;
const COD_SHARE = 0.7;
const DAYS_PER_MONTH = 30;
const MONTHLY_GMV = DAILY_ORDERS * AVERAGE_ORDER_VALUE * DAYS_PER_MONTH; // ₱120B
const MONTHLY_PLATFORM_FAIL_COST =
  DAILY_ORDERS * COD_SHARE * (BASE_FAILURE_RATE / 100) * DAYS_PER_MONTH * PLATFORM_FAIL_EXPOSURE; // ≈ ₱3.35B

const SECURING_DEPOSIT = 50;
const FREE_SHIPPING_VOUCHER_CAP = 45;
const PREPAID_INCENTIVE: Record<1 | 2 | 3 | 4, number> = { 1: 5, 2: 10, 3: 15, 4: 20 };
const POST_CHECKOUT_PREPAID_INCENTIVE = 20;
const SMS_OTP_COST = 0.5;
const DEMO_OTP = '4829';
const REPEAT_REFUSER_THRESHOLD = 2;

interface DimensionOption {
  id: string;
  label: string;
  modifier: number;
  actualRate: string;
}

interface DimensionConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  options: DimensionOption[];
}

const DIMENSIONS: Record<string, DimensionConfig> = {
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
    description: 'Fulfillment & transit window (remorse window)',
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
    description: 'Item classification and sizing return sensitivity',
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
      { id: 'short_video', label: 'Short video link', modifier: 0, actualRate: '29%' },
      { id: 'shoptab', label: 'ShopTab (search)', modifier: -9, actualRate: '20%' },
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
      { id: 'others', label: 'Others (Regional)', modifier: 7, actualRate: '36%' },
    ],
  },
};

const DEFAULT_SELECTIONS: Record<string, string> = {
  region: 'luzon',
  tenure: '1_3m',
  speed: 'standard',
  category: 'elec_refurb',
  scenario: 'short_video',
  courier: 'ab_express',
};

const PRESET_PROFILES = [
  {
    name: 'Loyal NCR Shopper',
    badge: 'Tier 1 (Low)',
    color: 'emerald',
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
    name: 'Casual Video Scroller',
    badge: 'Tier 2 (Medium)',
    color: 'amber',
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
    name: 'Impulse Live Buyer',
    badge: 'Tier 3 (High)',
    color: 'orange',
    // 29 + 3 + 9 + 0 + 4 + 3 + 0 = 48 → Tier 3 (46–55)
    selections: {
      region: 'visayas',
      tenure: 'lt_1m',
      speed: 'standard',
      category: 'fashion_apparel',
      scenario: 'creator_live',
      courier: 'ab_express',
    },
  },
  {
    name: 'Critical Anomaly Profile',
    badge: 'Tier 4 (Critical)',
    color: 'rose',
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

const TIER_CONFIGS = {
  1: {
    id: 1,
    name: 'Tier 1: Low Risk',
    range: '0% – 34%',
    emoji: '🟢',
    uiState: 'Frictionless 1-Click COD',
    copy: `Eligible for standard COD. Pay now and save ₱${PREPAID_INCENTIVE[1]}.`,
    actionSummary: 'Standard checkout proceeds normally with zero conversion friction.',
    theme: {
      bgLight: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      accentHex: '#10b981',
      mobileBannerBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      mobileBadge: 'bg-emerald-600 text-white',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25',
    },
  },
  2: {
    id: 2,
    name: 'Tier 2: Medium Risk',
    range: '35% – 45%',
    emoji: '🟡',
    uiState: 'Confirm your order',
    copy: `Verify your mobile number, then confirm you still want this item to place your COD order. Pay now and save ₱${PREPAID_INCENTIVE[2]}.`,
    actionSummary: 'SMS OTP proves the number is reachable; the intent confirmation step catches remorse and absence that OTP alone does not.',
    theme: {
      bgLight: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      accentHex: '#f59e0b',
      mobileBannerBg: 'bg-amber-50 border-amber-300 text-amber-950',
      mobileBadge: 'bg-amber-500 text-slate-950',
      buttonBg: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-amber-500/25',
    },
  },
  3: {
    id: 3,
    name: 'Tier 3: High Risk',
    range: '46% – 55%',
    emoji: '🟠',
    uiState: 'Secure your order',
    copy: `Cash on Delivery is available. Secure it with a refundable ₱${SECURING_DEPOSIT} deposit, or, without a linked wallet, commit to a delivery window or pickup point. Pay now and save ₱${PREPAID_INCENTIVE[3]}.`,
    actionSummary: 'COD stays available. Wallet holders pay a refundable deposit; buyers without a wallet must commit to a delivery window or pickup point before ordering.',
    theme: {
      bgLight: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      accentHex: '#f97316',
      mobileBannerBg: 'bg-orange-50 border-orange-300 text-orange-950',
      mobileBadge: 'bg-orange-600 text-white',
      buttonBg: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/25',
    },
  },
  4: {
    id: 4,
    name: 'Tier 4: Critical Risk',
    range: '56%+',
    emoji: '🔴',
    uiState: 'Pay now, rest easy',
    copy: `Pay now with GCash or Maya and save ₱${PREPAID_INCENTIVE[4]}, with nothing to hand over at the door. Cash on Delivery is still available below.`,
    actionSummary: 'Prepaid is shown first with the largest incentive. COD remains selectable behind the strongest gate: a refundable deposit, or a delivery window and pickup point.',
    theme: {
      bgLight: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      accentHex: '#fe2c55',
      mobileBannerBg: 'bg-rose-50 border-rose-300 text-rose-950',
      mobileBadge: 'bg-rose-600 text-white',
      buttonBg: 'bg-[#FE2C55] hover:bg-[#e02449] text-white shadow-[#FE2C55]/30',
    },
  },
};

const MOCK_PRODUCTS: Record<string, { title: string; variant: string; price: number; shipping: number; tag: string }> = {
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

const LOW_FAILURE_COURIER = DIMENSIONS.courier.options.find((c) => c.id === 'xyz_express')!;

// Unsourced planning assumptions, not measured results. Deflection = share of
// Tier 2+ COD orders cancelled before dispatch that would otherwise have failed.
// gateDeflection = share of remaining would-be failures removed by the Tier 3/4 gate.
type ScenarioKey = 'conservative' | 'base' | 'optimistic';
const SCENARIOS: Record<ScenarioKey, { label: string; verifyDeflection: number; gateDeflection: number; prepaidUptake: Record<1 | 2 | 3 | 4, number> }> = {
  conservative: { label: 'Conservative', verifyDeflection: 0.03, gateDeflection: 0.15, prepaidUptake: { 1: 0.02, 2: 0.04, 3: 0.08, 4: 0.2 } },
  base: { label: 'Base', verifyDeflection: 0.05, gateDeflection: 0.3, prepaidUptake: { 1: 0.04, 2: 0.08, 3: 0.15, 4: 0.35 } },
  optimistic: { label: 'Optimistic', verifyDeflection: 0.1, gateDeflection: 0.5, prepaidUptake: { 1: 0.06, 2: 0.12, 3: 0.25, 4: 0.5 } },
};

// Tier intervention matrix. COD is available at every tier; only the
// repeat-refuser lock (order history, outside this ladder) removes it.
const TIER_POLICY_ROWS: Array<{ label: string; values: Record<1 | 2 | 3 | 4, string> }> = [
  { label: 'COD available', values: { 1: 'Yes', 2: 'Yes', 3: 'Yes', 4: 'Yes' } },
  { label: 'Shown first', values: { 1: 'COD', 2: 'COD', 3: 'COD', 4: 'Prepaid' } },
  { label: 'Prepaid incentive', values: { 1: `₱${PREPAID_INCENTIVE[1]}`, 2: `₱${PREPAID_INCENTIVE[2]}`, 3: `₱${PREPAID_INCENTIVE[3]}`, 4: `₱${PREPAID_INCENTIVE[4]}` } },
  { label: 'SMS OTP + intent confirm', values: { 1: '—', 2: 'Required', 3: 'Required', 4: 'Required' } },
  { label: 'Gate (wallet linked)', values: { 1: '—', 2: '—', 3: `₱${SECURING_DEPOSIT} refundable deposit`, 4: `₱${SECURING_DEPOSIT} refundable deposit` } },
  { label: 'Gate (no wallet)', values: { 1: '—', 2: '—', 3: 'Window OR pickup', 4: 'Window AND pickup' } },
  { label: 'Courier routing', values: { 1: 'Default', 2: 'Default', 3: 'Prefer low-failure', 4: 'Lowest-failure + speed upgrade' } },
  { label: 'Free-shipping voucher', values: { 1: 'Normal', 2: 'Normal', 3: 'After deposit / pay-now', 4: 'After deposit / pay-now' } },
  { label: 'Post-checkout', values: { 1: 'Delivery-day reminder', 2: '+ 24hr cooling-off', 3: '+ courier AI outreach', 4: 'All three, earliest' } },
];

type OrderStage =
  | 'Awaiting Checkout'
  | 'Pending Warehouse Packing'
  | 'Dispatched & In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'At Pickup Point';

interface PendingOrder {
  id: string;
  orderNumber: string;
  buyerName: string;
  itemTitle: string;
  itemPrice: number;
  region: string;
  riskScore: number;
  riskTier: 1 | 2 | 3 | 4;
  riskReason: string;
  courier: string;
  stage: OrderStage;
  resolution: 'open' | 'confirmed' | 'cancelled';
  paymentMode: 'cod' | 'prepaid';
  activeMitigation: 'none' | 'reminder_sent' | 'window_locked' | 'ai_dispatched';
  windowSelected?: string;
  codDue?: number; // cash due at the door when it differs from itemPrice (deposit, vouchers)
  attemptCount?: number;
}

// Seeded Tab 2 dashboard counters (restored by the Tab 2 Reset button).
const INITIAL_IMPACT = { logisticsSaved: 1430, rtsDeflected: 9, windowsLocked: 14, prepaidConverted: 0 };

// Each dispatcher action only applies at the stage it was designed for.
const ACTION_STAGE: Record<'push_reminder' | 'inbox_window' | 'courier_chat', OrderStage> = {
  push_reminder: 'Pending Warehouse Packing',
  inbox_window: 'Dispatched & In Transit',
  courier_chat: 'Out for Delivery',
};

const collectAtDoor = (order: PendingOrder) =>
  order.paymentMode === 'prepaid' ? 0 : order.codDue ?? order.itemPrice;

const courierOpeningMessage = (order: PendingOrder) => ({
  sender: 'bot' as const,
  text: order.paymentMode === 'prepaid'
    ? `Magandang araw! 👋 This is ${order.courier} AI Dispatcher. Your prepaid parcel for ${order.orderNumber} is scheduled for delivery today between 1:00 PM – 3:00 PM. Will someone be home to receive it?`
    : `Magandang araw! 👋 This is ${order.courier} AI Dispatcher. Your COD parcel for ${order.orderNumber} (₱${collectAtDoor(order).toLocaleString()}.00) is scheduled for delivery today between 1:00 PM – 3:00 PM. Will someone be home with the exact cash amount?`,
  time: '12:45 PM',
});

const INITIAL_PENDING_ORDERS: PendingOrder[] = [
  {
    id: 'ord-882',
    orderNumber: 'Order #882',
    buyerName: 'Maria Santos',
    itemTitle: 'Oversized Linen Shirt',
    itemPrice: 649,
    region: 'Visayas (Cebu City)',
    riskScore: 54,
    riskTier: 3,
    riskReason: 'High-Risk Livestream Impulse',
    courier: 'A&B Express',
    stage: 'Pending Warehouse Packing',
    resolution: 'open',
    paymentMode: 'cod',
    activeMitigation: 'none',
  },
  {
    id: 'ord-991',
    orderNumber: 'Order #991',
    buyerName: 'Joshua Tan',
    itemTitle: 'TWS Noise Cancelling Earbuds',
    itemPrice: 1299,
    region: 'Metro Manila (NCR)',
    riskScore: 18,
    riskTier: 1,
    riskReason: 'Standard NCR Verified Buyer',
    courier: 'XYZ Express',
    stage: 'Dispatched & In Transit',
    resolution: 'open',
    paymentMode: 'cod',
    activeMitigation: 'none',
  },
  {
    id: 'ord-743',
    orderNumber: 'Order #743',
    buyerName: 'Princess Mae D.',
    itemTitle: 'Refurbished Mini Projector',
    itemPrice: 1850,
    region: 'Mindanao (Davao)',
    riskScore: 67,
    riskTier: 4,
    riskReason: 'Critical Remote Route Anomaly',
    courier: 'Fast Express',
    stage: 'Out for Delivery',
    resolution: 'open',
    paymentMode: 'cod',
    activeMitigation: 'none',
  },
  {
    id: 'ord-619',
    orderNumber: 'Order #619',
    buyerName: 'Kenji Ramos',
    itemTitle: 'Stainless Steel Tumbler 40oz',
    itemPrice: 599,
    region: 'Luzon (Pampanga)',
    riskScore: 41,
    riskTier: 2,
    riskReason: 'Short Video Link Impulse',
    courier: 'A&B Express',
    stage: 'Pending Warehouse Packing',
    resolution: 'open',
    paymentMode: 'cod',
    activeMitigation: 'none',
  },
];

/* --------------------------------------------------------------------------
   SHARED ORDER: the one transaction configured in Tab 1 and viewed by Tab 2
   (platform ops), Tab 3 (seller) and Tab 4 (rider). Not separate simulators.
   -------------------------------------------------------------------------- */
const SHARED_ORDER_ID = 'shared';
const SHARED_ORDER_NUMBER = 'Order #1001';
const SHARED_BUYER_NAME = 'Juan Dela Cruz';
const TAB1_DELIVERY_WINDOW = 'Sat 9 AM – 12 PM';

type FulfillmentStatus =
  | 'awaiting_confirmation'
  | 'confirmed'
  | 'packed'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'at_pickup_point'
  | 'cancelled';

// Mutable part of the shared order. Score, tier, product, totals and courier
// are derived from the Tab 1 configuration (see SharedOrder).
interface SharedOrderState {
  paymentMethod: 'cod' | 'prepaid';
  paidVia: 'checkout' | 'post_checkout' | 'qr_at_door' | null;
  depositPaid: boolean;
  otpVerified: boolean;
  intentConfirmed: boolean;
  windowSelected: string | null;
  pickupSelected: boolean;
  status: FulfillmentStatus;
  cancelledFrom: FulfillmentStatus | null;
  attemptCount: number;
  // Listing adjustment the order was scored with, locked at checkout so a later listing
  // change never re-scores (and re-prices) an order that was already placed.
  scoredListingAdjustment: number | null;
}

interface SharedOrder extends SharedOrderState {
  id: string;
  riskScore: number;
  tier: 1 | 2 | 3 | 4;
  product: { title: string; price: number; shipping: number; category: string };
  totalOrderAmount: number;
  collectAtDoor: number;
  assignedCourier: string;
}

const newSharedOrderState = (paymentMethod: 'cod' | 'prepaid'): SharedOrderState => ({
  paymentMethod,
  paidVia: paymentMethod === 'prepaid' ? 'checkout' : null,
  depositPaid: false,
  otpVerified: false,
  intentConfirmed: false,
  windowSelected: null,
  pickupSelected: false,
  status: 'awaiting_confirmation',
  cancelledFrom: null,
  attemptCount: 0,
  scoredListingAdjustment: null,
});

// Re-routing to a pickup point is offered only from the SECOND failed attempt.
// Case data: re-attempt rate correlates inversely with failure (A&B 1.8 attempts / 29%,
// XYZ 1.7 / 26%, Quick Van 1.3 / 33%, Others 1.2 / 36%), so diverting after a single
// attempt would forfeit a lever that works.
const REROUTE_MIN_ATTEMPTS = 2;
const PICKUP_TRANSFER_COST = 20; // unsourced assumption, labelled in the UI

/* --------------------------------------------------------------------------
   LISTING QUALITY GATE (Tab 3). A published, complete listing lowers that
   category's contribution to the Tab 1 score. The size of the reduction is an
   unsourced planning assumption, labelled in the UI.
   -------------------------------------------------------------------------- */
const LISTING_MAX_REDUCTION = 3;
const LISTING_SIZES = ['S', 'M', 'L', 'XL'] as const;
type ListingSize = (typeof LISTING_SIZES)[number];
type GatedCategory = 'fashion_apparel' | 'elec_refurb';
const REFURB_GRADES: Array<{ id: 'A' | 'B' | 'C'; criteria: string }> = [
  { id: 'A', criteria: 'Like new: no visible marks, all accessories, 90%+ battery/lamp life' },
  { id: 'B', criteria: 'Light wear: minor cosmetic marks, fully functional, 80%+ battery/lamp life' },
  { id: 'C', criteria: 'Visible wear: noticeable marks or missing accessories, fully functional' },
];
const LISTING_CASE: Record<GatedCategory, { label: string; share: string; failure: string; driver: string }> = {
  fashion_apparel: {
    label: 'Fashion Apparel',
    share: '28%',
    failure: '33%',
    driver: 'Size and fit uncertainty: buyers cannot try before purchase; sizing varies across brands.',
  },
  elec_refurb: {
    label: 'Electronics (Refurb)',
    share: '7%',
    failure: '29%',
    driver: 'Quality and authenticity concerns: buyers worry about actual condition vs. listing description.',
  },
};

interface ListingState {
  apparelSizes: Record<ListingSize, { chest: string; length: string }>;
  apparelPublished: boolean;
  refurbPhoto: boolean;
  refurbGrade: 'A' | 'B' | 'C' | null;
  refurbPublished: boolean;
}

const INITIAL_LISTING: ListingState = {
  apparelSizes: { S: { chest: '', length: '' }, M: { chest: '', length: '' }, L: { chest: '', length: '' }, XL: { chest: '', length: '' } },
  apparelPublished: false,
  refurbPhoto: false,
  refurbGrade: null,
  refurbPublished: false,
};

const apparelCompleteness = (l: ListingState) =>
  LISTING_SIZES.reduce((n, s) => n + (Number(l.apparelSizes[s].chest) > 0 ? 1 : 0) + (Number(l.apparelSizes[s].length) > 0 ? 1 : 0), 0) /
  (LISTING_SIZES.length * 2);
const refurbCompleteness = (l: ListingState) => ((l.refurbPhoto ? 1 : 0) + (l.refurbGrade ? 1 : 0)) / 2;

// Listing adjustment applied to the Tab 1 score: only for a published, complete listing.
const listingAdjustmentFor = (category: string, l: ListingState) =>
  (category === 'fashion_apparel' && l.apparelPublished && apparelCompleteness(l) === 1) ||
  (category === 'elec_refurb' && l.refurbPublished && refurbCompleteness(l) === 1)
    ? -LISTING_MAX_REDUCTION
    : 0;

const computeRisk = (selections: Record<string, string>, listingAdjustment: number) => {
  const breakdown = Object.entries(DIMENSIONS).map(([key, dim]) => {
    const selectedOption = dim.options.find((opt) => opt.id === selections[key]) ?? dim.options[0];
    return {
      key,
      dimensionLabel: dim.label.replace(/^\d+\.\s*/, ''),
      optionLabel: selectedOption.label,
      modifier: selectedOption.modifier,
      actualRate: selectedOption.actualRate,
    };
  });

  const sumModifiers = breakdown.reduce((acc, item) => acc + item.modifier, 0);
  const rawScore = BASE_FAILURE_RATE + sumModifiers + listingAdjustment;
  const finalScore = Math.max(0, Math.min(100, rawScore));

  let tierId: 1 | 2 | 3 | 4 = 1;
  if (finalScore >= 56) tierId = 4;
  else if (finalScore >= 46) tierId = 3;
  else if (finalScore >= 35) tierId = 2;
  else tierId = 1;

  return {
    breakdown,
    sumModifiers,
    listingAdjustment,
    rawScore,
    finalScore,
    tier: TIER_CONFIGS[tierId],
  };
};

type TabKey = 'tab1_pre' | 'tab2_post' | 'tab3_seller' | 'tab4_courier';

// Shared order status → the stage vocabulary Tab 2 dispatches against and Tab 3 displays.
const STATUS_STAGE: Record<FulfillmentStatus, OrderStage> = {
  awaiting_confirmation: 'Awaiting Checkout',
  confirmed: 'Pending Warehouse Packing',
  packed: 'Pending Warehouse Packing',
  in_transit: 'Dispatched & In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  at_pickup_point: 'At Pickup Point',
  cancelled: 'Pending Warehouse Packing',
};

const PRE_DISPATCH_STAGES: OrderStage[] = ['Awaiting Checkout', 'Pending Warehouse Packing'];
const RIDER_RUN_STAGES: OrderStage[] = ['Dispatched & In Transit', 'Out for Delivery', 'Delivered'];

/* ==========================================================================
   MAIN COMPONENT: COD OPTIMIZATION COMMAND CENTER
   ========================================================================== */

export default function App(): React.JSX.Element {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabKey>('tab1_pre');
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  /* --------------------------------------------------------------------------
     TAB 1 STATE: PRE-CHECKOUT ML ENGINE
     -------------------------------------------------------------------------- */
  const [selections, setSelections] = useState<Record<string, string>>(DEFAULT_SELECTIONS);
  // ROUTING ONLY. walletLinked chooses which Tier 3/4 gate the buyer sees. It must never become a
  // risk-score modifier: penalising unbanked buyers in the score is the exclusion this design removes.
  const [walletLinked, setWalletLinked] = useState<boolean>(true);
  // Demonstrated abuse from order history, not predicted risk. Drives the repeat-refuser lock only.
  const [pastRefusals, setPastRefusals] = useState<number>(0);
  const [appealSubmitted, setAppealSubmitted] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>(DEMO_OTP);
  const [otpError, setOtpError] = useState<boolean>(false);
  const [selectedPrepaidWallet, setSelectedPrepaidWallet] = useState<'gcash' | 'maya'>('gcash');
  const [abMode, setAbMode] = useState<'with_ml' | 'without_ml'>('with_ml');
  const [scenario, setScenario] = useState<ScenarioKey>('base');
  const [verifyDeflectionRate, setVerifyDeflectionRate] = useState<number>(SCENARIOS.base.verifyDeflection);

  // THE shared order. Tab 1 configures it; Tabs 2, 3 and 4 read and write this same object.
  const [orderState, setOrderState] = useState<SharedOrderState>(() => newSharedOrderState('cod'));
  const patchOrder = (patch: Partial<SharedOrderState>) => setOrderState((prev) => ({ ...prev, ...patch }));

  // Tab 3 listing quality gate (feeds the Tab 1 score once published)
  const [listing, setListing] = useState<ListingState>(INITIAL_LISTING);
  const [listingCategory, setListingCategory] = useState<GatedCategory>('fashion_apparel');

  const liveListingAdjustment = listingAdjustmentFor(selections.category, listing);
  const listingAdjustment = orderState.scoredListingAdjustment ?? liveListingAdjustment;
  const calculation = useMemo(() => computeRisk(selections, listingAdjustment), [selections, listingAdjustment]);

  const tierId = calculation.tier.id as 1 | 2 | 3 | 4;
  const codLocked = pastRefusals >= REPEAT_REFUSER_THRESHOLD;

  // Changing the buyer configuration starts a fresh shared order.
  const startNewOrder = (next: { selections?: Record<string, string>; walletLinked?: boolean; pastRefusals?: number } = {}) => {
    const nextSelections = next.selections ?? selections;
    const nextWallet = next.walletLinked ?? walletLinked;
    const nextRefusals = next.pastRefusals ?? pastRefusals;
    if (next.selections) setSelections(nextSelections);
    if (next.walletLinked !== undefined) setWalletLinked(nextWallet);
    if (next.pastRefusals !== undefined) setPastRefusals(nextRefusals);
    const nextTier = computeRisk(nextSelections, listingAdjustmentFor(nextSelections.category, listing)).tier.id;
    const prepaidFirst = nextWallet && (nextTier === 4 || nextRefusals >= REPEAT_REFUSER_THRESHOLD);
    setOrderState(newSharedOrderState(prepaidFirst ? 'prepaid' : 'cod'));
    setOtpError(false);
    setAppealSubmitted(false);
  };

  const { otpVerified, intentConfirmed, depositPaid, pickupSelected } = orderState;
  const windowSelected = orderState.windowSelected !== null;
  const orderPlaced = orderState.status !== 'awaiting_confirmation';

  const currentProduct = MOCK_PRODUCTS[selections.category] ?? MOCK_PRODUCTS.elec_refurb;
  const currentRegionObj = DIMENSIONS.region.options.find((r) => r.id === selections.region) ?? DIMENSIONS.region.options[0];
  const currentSpeedObj = DIMENSIONS.speed.options.find((s) => s.id === selections.speed) ?? DIMENSIONS.speed.options[0];
  const currentCourierObj = DIMENSIONS.courier.options.find((c) => c.id === selections.courier) ?? DIMENSIONS.courier.options[0];

  const payingNow = orderState.paymentMethod === 'prepaid';
  // QR at the door is a payment method, not a pre-delivery conversion: no incentive or voucher unlock.
  const prepaidBeforeDelivery = payingNow && orderState.paidVia !== 'qr_at_door';
  const prepaidIncentive = PREPAID_INCENTIVE[tierId];
  const subtotal = currentProduct.price;
  const shipping = currentProduct.shipping;
  const shippingVoucher = Math.min(FREE_SHIPPING_VOUCHER_CAP, shipping);
  // Tiers 3–4 release the free-shipping voucher only once the buyer has skin in the game.
  const voucherUnlocked = tierId <= 2 || prepaidBeforeDelivery || depositPaid;
  const appliedVoucher = voucherUnlocked ? shippingVoucher : 0;
  const appliedIncentive = prepaidBeforeDelivery ? prepaidIncentive : 0;
  const totalOrderAmount = subtotal + shipping - appliedVoucher - appliedIncentive;
  const depositCredit = !payingNow && depositPaid ? SECURING_DEPOSIT : 0;
  const amountDueAtDoor = payingNow ? 0 : totalOrderAmount - depositCredit;

  // Tier 3–4 COD gate. Both no-wallet gates are hard gates so the no-wallet path is never the lighter option.
  const codGateSatisfied =
    tierId <= 2 ||
    (walletLinked ? depositPaid : tierId === 3 ? windowSelected || pickupSelected : windowSelected && pickupSelected);
  const codReady = !codLocked && (tierId === 1 || (otpVerified && intentConfirmed && codGateSatisfied));
  // Paying now removes the failure risk, so it skips the COD-only verification steps.
  const isCheckoutReady = payingNow ? walletLinked : codReady;

  const codNextStep =
    codLocked ? 'COD paused: appeal or pay now'
    : tierId >= 2 && !otpVerified ? 'Verify OTP above first'
    : tierId >= 2 && !intentConfirmed ? 'Confirm your order above'
    : !codGateSatisfied && walletLinked ? `Pay ₱${SECURING_DEPOSIT} refundable deposit above`
    : !codGateSatisfied && tierId === 3 ? 'Choose a delivery window or pickup point'
    : !codGateSatisfied ? 'Choose a delivery window and pickup point'
    : '';

  const handleVerifyOtp = () => {
    if (otpInput === DEMO_OTP) {
      patchOrder({ otpVerified: true });
      setOtpError(false);
    } else {
      setOtpError(true);
    }
  };

  // Tiers 3–4 override the buyer-facing courier with the lowest-failure partner (platform-side, invisible to buyer).
  const routedCourier = tierId >= 3 ? LOW_FAILURE_COURIER : currentCourierObj;

  const sharedOrder: SharedOrder = {
    ...orderState,
    id: SHARED_ORDER_ID,
    riskScore: calculation.finalScore,
    tier: tierId,
    product: { title: currentProduct.title, price: currentProduct.price, shipping: currentProduct.shipping, category: selections.category },
    totalOrderAmount,
    collectAtDoor: amountDueAtDoor,
    assignedCourier: routedCourier.label,
  };

  /* --------------------------------------------------------------------------
     UNIT ECONOMICS (expected value per order at this profile)
     -------------------------------------------------------------------------- */
  const economics = useMemo(() => {
    const p = calculation.finalScore / 100;
    // Counterfactual uses the undiscounted item price, never the post-subsidy total.
    const commission = Math.round(subtotal * COMMISSION_RATE);
    const s = SCENARIOS[scenario];
    const uptake = s.prepaidUptake[tierId];
    const verifyDeflect = tierId >= 2 ? Math.min(verifyDeflectionRate, p) : 0;
    const afterVerify = p - verifyDeflect;
    const codFailP = tierId >= 3 ? afterVerify * (1 - s.gateDeflection) : afterVerify;
    const failuresAvoided = p - (1 - uptake) * codFailP;
    const exposureAvoided = failuresAvoided * PLATFORM_FAIL_EXPOSURE;
    const cashHandlingSaved = uptake * (1 - p) * CASH_HANDLING_COST;
    const incentiveCost = uptake * PREPAID_INCENTIVE[tierId];
    const smsCost = tierId >= 2 ? (1 - uptake) * SMS_OTP_COST : 0;
    const gain = exposureAvoided + cashHandlingSaved;
    const cost = incentiveCost + smsCost;
    return {
      p,
      commission,
      uptake,
      platformLossPerFailure: PLATFORM_FAIL_EXPOSURE + commission,
      expectedPlatformLoss: p * (PLATFORM_FAIL_EXPOSURE + commission),
      expectedSellerLoss: p * SELLER_FAIL_EXPOSURE,
      failuresAvoided,
      exposureAvoided,
      cashHandlingSaved,
      incentiveCost,
      smsCost,
      net: gain - cost,
      roi: cost > 0 ? gain / cost : null,
      sellerSaved: failuresAvoided * SELLER_FAIL_EXPOSURE,
      residualFailureRate: (1 - uptake) * codFailP,
      verifyRoi: (verifyDeflectionRate * PLATFORM_FAIL_EXPOSURE) / SMS_OTP_COST,
    };
  }, [calculation.finalScore, subtotal, scenario, tierId, verifyDeflectionRate]);

  /* --------------------------------------------------------------------------
     TAB 2 STATE: POST-CHECKOUT MITIGATION (LOGISTICS COMMAND CENTER)
     -------------------------------------------------------------------------- */
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>(INITIAL_PENDING_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ord-882');
  const [buyerScreenState, setBuyerScreenState] = useState<'idle' | 'push_reminder' | 'inbox_window' | 'courier_chat'>('push_reminder');
  
  // Dynamic Impact Metrics
  const [logisticsSaved, setLogisticsSaved] = useState<number>(INITIAL_IMPACT.logisticsSaved);
  const [rtsDeflectedCount, setRtsDeflectedCount] = useState<number>(INITIAL_IMPACT.rtsDeflected);
  const [windowsLockedCount, setWindowsLockedCount] = useState<number>(INITIAL_IMPACT.windowsLocked);
  const [prepaidConvertedCount, setPrepaidConvertedCount] = useState<number>(INITIAL_IMPACT.prepaidConverted);
  const [mitigationToast, setMitigationToast] = useState<string | null>(null);

  // Chat conversation state for the Courier AI WhatsApp simulator
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'buyer'; text: string; time: string }>>([]);

  // The shared order seen through Tab 2's order-feed vocabulary (a view, not a copy).
  const sharedAsPending: PendingOrder = {
    id: SHARED_ORDER_ID,
    orderNumber: SHARED_ORDER_NUMBER,
    buyerName: SHARED_BUYER_NAME,
    itemTitle: sharedOrder.product.title,
    itemPrice: sharedOrder.totalOrderAmount,
    region: currentRegionObj.label,
    riskScore: sharedOrder.riskScore,
    riskTier: sharedOrder.tier,
    riskReason: 'Configured live in Tab 1',
    courier: sharedOrder.assignedCourier,
    stage: STATUS_STAGE[orderState.status === 'cancelled' ? orderState.cancelledFrom ?? 'confirmed' : orderState.status],
    resolution: orderState.status === 'cancelled' ? 'cancelled' : orderState.intentConfirmed ? 'confirmed' : 'open',
    paymentMode: orderState.paymentMethod,
    activeMitigation: 'none',
    windowSelected: orderState.windowSelected ?? undefined,
    codDue: sharedOrder.collectAtDoor,
    attemptCount: orderState.attemptCount,
  };
  const allOrders = [sharedAsPending, ...pendingOrders];

  const activeOrder = allOrders.find((o) => o.id === selectedOrderId) ?? allOrders[0];
  const isSharedActive = activeOrder.id === SHARED_ORDER_ID;
  // The shared order converts at its own tier incentive; seeded orders use the flat post-checkout offer.
  const activePayNowSaving = isSharedActive ? prepaidIncentive : POST_CHECKOUT_PREPAID_INCENTIVE;

  const isCancelled = activeOrder.resolution === 'cancelled';
  const isPrepaid = activeOrder.paymentMode === 'prepaid';
  const actionBlockedReason = (action: keyof typeof ACTION_STAGE): string | null => {
    if (isCancelled) return 'Order already cancelled';
    if (activeOrder.stage !== ACTION_STAGE[action]) return `Only at "${ACTION_STAGE[action]}" (order is "${activeOrder.stage}")`;
    return null;
  };

  // Translates a Tab 2 order-feed patch onto the shared order, so every tab sees the change.
  const applyToSharedOrder = (patch: Partial<PendingOrder>) => {
    setOrderState((prev) => {
      const next = { ...prev };
      if (patch.resolution === 'cancelled') {
        next.status = 'cancelled';
        next.cancelledFrom = prev.status;
      }
      if (patch.resolution === 'confirmed') next.intentConfirmed = true;
      if (patch.paymentMode === 'prepaid') {
        next.paymentMethod = 'prepaid';
        next.paidVia = 'post_checkout';
      }
      if (patch.windowSelected !== undefined) next.windowSelected = patch.windowSelected;
      return next;
    });
  };

  const updateActiveOrder = (patch: Partial<PendingOrder>) => {
    if (isSharedActive) {
      applyToSharedOrder(patch);
      return;
    }
    setPendingOrders((prev) => prev.map((o) => (o.id === selectedOrderId ? { ...o, ...patch } : o)));
  };

  const handleResetTab2 = () => {
    setPendingOrders(INITIAL_PENDING_ORDERS);
    setSelectedOrderId('ord-882');
    setBuyerScreenState('push_reminder');
    setChatMessages([]);
    setLogisticsSaved(INITIAL_IMPACT.logisticsSaved);
    setRtsDeflectedCount(INITIAL_IMPACT.rtsDeflected);
    setWindowsLockedCount(INITIAL_IMPACT.windowsLocked);
    setPrepaidConvertedCount(INITIAL_IMPACT.prepaidConverted);
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setBuyerScreenState('idle');
  };

  // Dispatcher Actions
  const handleTriggerPushReminder = () => {
    if (actionBlockedReason('push_reminder')) return;
    setBuyerScreenState('push_reminder');
    updateActiveOrder({ activeMitigation: 'reminder_sent' });
    showToast('24-Hour Cooling Off Push Notification dispatched to buyer.');
  };

  const handleTriggerWindowPicker = () => {
    if (actionBlockedReason('inbox_window')) return;
    setBuyerScreenState('inbox_window');
    updateActiveOrder({ activeMitigation: 'window_locked' });
    showToast('Delivery Window Picker message sent to TikTok System Inbox.');
  };

  const handleTriggerCourierAI = () => {
    if (actionBlockedReason('courier_chat')) return;
    setBuyerScreenState('courier_chat');
    setChatMessages([courierOpeningMessage(activeOrder)]);
    updateActiveOrder({ activeMitigation: 'ai_dispatched' });
    showToast('Courier AI WhatsApp/Viber outreach dispatched to buyer mobile.');
  };

  // Helper toast notification
  const showToast = (msg: string) => {
    setMitigationToast(msg);
    setTimeout(() => setMitigationToast(null), 3500);
  };

  // Buyer Interaction Handlers (Connected State Management)
  const handleBuyerConfirmPush = () => {
    if (isCancelled) return;
    updateActiveOrder({ resolution: 'confirmed' });
    showToast('Buyer Confirmed COD Order: Pack & dispatch authorized!');
    setBuyerScreenState('idle');
  };

  const handleBuyerCancelPush = () => {
    if (isCancelled) return;
    updateActiveOrder({ resolution: 'cancelled' });
    // Pre-packing cancel: the parcel never ships, so forward delivery (₱70) and
    // cash handling (₱60) are never incurred → ₱130. A prepaid order already had
    // its ₱60 cash handling credited at conversion, so only the forward leg counts.
    const saved = FORWARD_DELIVERY_COST + (isPrepaid ? 0 : CASH_HANDLING_COST);
    setLogisticsSaved((prev) => prev + saved);
    setRtsDeflectedCount((prev) => prev + 1);
    showToast(
      isPrepaid
        ? `🚨 Buyer cancelled prepaid order prior to packing! +₱${saved} forward freight saved.`
        : `🚨 Buyer cancelled COD order prior to packing! +₱${saved} saved (₱${FORWARD_DELIVERY_COST} forward + ₱${CASH_HANDLING_COST} cash handling).`
    );
    setBuyerScreenState('idle');
  };

  // Converts an open COD order to prepaid. ₱60 cash handling is saved on every
  // conversion, independent of whether the order would have failed.
  const handleConvertToPrepaid = (source: 'push' | 'inbox' | 'chat') => {
    if (isCancelled || isPrepaid) return;
    updateActiveOrder({ paymentMode: 'prepaid' });
    setPrepaidConvertedCount((prev) => prev + 1);
    setLogisticsSaved((prev) => prev + CASH_HANDLING_COST);
    if (source === 'chat') {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatMessages((prev) => [
        ...prev,
        { sender: 'buyer', text: 'I will pay now via GCash. 💳', time },
        { sender: 'bot', text: `Payment received, salamat! ${activeOrder.orderNumber} is now prepaid. Nothing to collect at the door. ✅`, time },
      ]);
    }
    showToast(`💳 ${activeOrder.orderNumber} converted to prepaid: ₱0 to collect at door. +₱${CASH_HANDLING_COST} cash handling saved.`);
  };

  const handleSelectDeliveryWindow = (windowLabel: string) => {
    if (isCancelled) return;
    if (!activeOrder.windowSelected) setWindowsLockedCount((prev) => prev + 1);
    updateActiveOrder({ windowSelected: windowLabel });
    showToast(`✓ Buyer selected window: ${windowLabel}. Handover guaranteed.`);
  };

  const handleCourierReply = (action: 'yes' | 'reschedule' | 'cancel') => {
    if (isCancelled) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (action === 'yes') {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'buyer', text: isPrepaid ? 'Yes, I am home to receive it! 👍' : 'Yes, I am home with exact cash! 👍', time },
        { sender: 'bot', text: 'Maraming salamat! Rider Juan (Plate #ND-8421) is 15 mins away. See you!', time },
      ]);
      updateActiveOrder({ resolution: 'confirmed' });
      showToast(isPrepaid ? 'Doorstep delivery confirmed.' : 'Doorstep delivery confirmed with exact cash.');
    } else if (action === 'reschedule') {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'buyer', text: 'Please reschedule for tomorrow morning.', time },
        { sender: 'bot', text: 'Noted! Your parcel has been rescheduled for tomorrow 9 AM - 12 PM. Safe trip!', time },
      ]);
      showToast('Delivery rescheduled. Avoided uncontactable missed attempt.');
    } else if (action === 'cancel') {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'buyer', text: `Please cancel my ${isPrepaid ? '' : 'COD '}order. I am no longer interested.`, time },
        { sender: 'bot', text: `Understood. ${activeOrder.orderNumber} has been cancelled before rider arrival. RTS trip deflected.`, time },
      ]);
      updateActiveOrder({ resolution: 'cancelled' });
      // Out for delivery: the forward leg (₱70) is already sunk; the cancel avoids the return leg (₱50).
      setLogisticsSaved((prev) => prev + REVERSE_LOGISTICS_COST);
      setRtsDeflectedCount((prev) => prev + 1);
      showToast(`🚨 Courier AI intercepted cancellation! +₱${REVERSE_LOGISTICS_COST} return freight saved.`);
    }
  };

  /* --------------------------------------------------------------------------
     TAB 3: SELLER VIEW (reads the same orders as Tab 2)
     -------------------------------------------------------------------------- */
  // Tier 3–4 orders wait for buyer intent confirmation before the seller may pack.
  const isHeld = (o: PendingOrder) =>
    o.resolution === 'open' && o.riskTier >= 3 && PRE_DISPATCH_STAGES.includes(o.stage);
  // The seller's ₱70 forward leg is saved whenever an order is cancelled before dispatch.
  const sellerFreightSaved =
    allOrders.filter((o) => o.resolution === 'cancelled' && PRE_DISPATCH_STAGES.includes(o.stage)).length * FORWARD_DELIVERY_COST;

  const handlePackAndShip = (o: PendingOrder) => {
    if (isHeld(o) || o.resolution === 'cancelled' || o.stage !== 'Pending Warehouse Packing') return;
    if (o.id === SHARED_ORDER_ID) patchOrder({ status: 'in_transit' });
    else setPendingOrders((prev) => prev.map((p) => (p.id === o.id ? { ...p, stage: 'Dispatched & In Transit' } : p)));
    showToast(`📦 ${o.orderNumber} packed and handed to ${o.courier}.`);
  };

  const apparelDone = apparelCompleteness(listing);
  const refurbDone = refurbCompleteness(listing);
  const listingDone: Record<GatedCategory, number> = { fashion_apparel: apparelDone, elec_refurb: refurbDone };
  const listingPublished: Record<GatedCategory, boolean> = {
    fashion_apparel: listing.apparelPublished && apparelDone === 1,
    elec_refurb: listing.refurbPublished && refurbDone === 1,
  };
  const categoryModifier = (cat: GatedCategory) => DIMENSIONS.category.options.find((o) => o.id === cat)?.modifier ?? 0;
  // Predicted failure contribution falls in proportion to listing completeness.
  const projectedContribution = (cat: GatedCategory) => categoryModifier(cat) - LISTING_MAX_REDUCTION * listingDone[cat];

  const setApparelField = (size: ListingSize, field: 'chest' | 'length', value: string) =>
    setListing((prev) => ({
      ...prev,
      apparelPublished: false, // editing a published listing takes it back to draft
      apparelSizes: { ...prev.apparelSizes, [size]: { ...prev.apparelSizes[size], [field]: value.replace(/[^0-9.]/g, '') } },
    }));

  const handlePublishListing = (cat: GatedCategory) => {
    if (listingDone[cat] < 1) return;
    setListing((prev) => (cat === 'fashion_apparel' ? { ...prev, apparelPublished: true } : { ...prev, refurbPublished: true }));
    showToast(`✓ ${LISTING_CASE[cat].label} listing published: category contribution ${categoryModifier(cat) >= 0 ? '+' : ''}${categoryModifier(cat)} → ${categoryModifier(cat) - LISTING_MAX_REDUCTION >= 0 ? '+' : ''}${categoryModifier(cat) - LISTING_MAX_REDUCTION} pts.`);
  };

  /* --------------------------------------------------------------------------
     TAB 4: RIDER VIEW (acts on the shared order)
     -------------------------------------------------------------------------- */
  const [qrOpen, setQrOpen] = useState<boolean>(false);
  const riderRun = allOrders.filter((o) => o.resolution !== 'cancelled' && RIDER_RUN_STAGES.includes(o.stage));
  const cashCarried = riderRun.reduce((sum, o) => sum + collectAtDoor(o), 0);
  const sharedOnRun = ['out_for_delivery'].includes(orderState.status);
  const riderBuyerStatus = orderState.pickupSelected
    ? 'Pickup point chosen at checkout'
    : orderState.windowSelected
      ? `At home — window ${orderState.windowSelected}`
      : orderState.intentConfirmed
        ? 'No window set'
        : 'Unconfirmed';

  const handleStartRun = () => {
    if (orderState.status !== 'in_transit') return;
    patchOrder({ status: 'out_for_delivery' });
    showToast(`🛵 ${SHARED_ORDER_NUMBER} is out for delivery with ${sharedOrder.assignedCourier}.`);
  };

  const handleQrPaid = () => {
    if (!sharedOnRun || payingNow) return;
    patchOrder({ paymentMethod: 'prepaid', paidVia: 'qr_at_door' });
    setPrepaidConvertedCount((prev) => prev + 1);
    setLogisticsSaved((prev) => prev + CASH_HANDLING_COST);
    setQrOpen(false);
    showToast(`💳 ${SHARED_ORDER_NUMBER} paid by QR at the door: no cash carried. +₱${CASH_HANDLING_COST} cash handling saved.`);
  };

  const handleMarkDelivered = () => {
    if (!sharedOnRun) return;
    patchOrder({ status: 'delivered' });
    setQrOpen(false);
    showToast(`✓ ${SHARED_ORDER_NUMBER} delivered.`);
  };

  const handleAttemptFailed = () => {
    if (!sharedOnRun) return;
    const attempts = orderState.attemptCount + 1;
    patchOrder({ attemptCount: attempts });
    setQrOpen(false);
    showToast(
      attempts >= REROUTE_MIN_ATTEMPTS
        ? `⚠️ Failed attempt #${attempts}. Pickup-point re-route now available.`
        : `⚠️ Failed attempt #${attempts}. Re-attempt scheduled (re-attempts lower failure; no re-route yet).`
    );
  };

  const rerouteSaving = REVERSE_LOGISTICS_COST - PICKUP_TRANSFER_COST;
  const handleReroute = () => {
    if (!sharedOnRun || orderState.attemptCount < REROUTE_MIN_ATTEMPTS) return;
    patchOrder({ status: 'at_pickup_point' });
    setLogisticsSaved((prev) => prev + rerouteSaving);
    showToast(`📍 ${SHARED_ORDER_NUMBER} re-routed to pickup point. +₱${rerouteSaving} net (₱${REVERSE_LOGISTICS_COST} return avoided − ₱${PICKUP_TRANSFER_COST} transfer).`);
  };

  /* --------------------------------------------------------------------------
     CHECKOUT PAYMENT OPTIONS (phone simulator)
     -------------------------------------------------------------------------- */
  const codTheme: Record<1 | 2 | 3 | 4, string> = {
    1: 'bg-emerald-50 border-emerald-500',
    2: 'bg-amber-50 border-amber-400',
    3: 'bg-orange-50 border-orange-400',
    4: 'bg-rose-50 border-rose-400',
  };

  const choiceDot = (on: boolean) =>
    on ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />;

  const prepaidOption = (
    <div className={`p-2.5 rounded-xl border-2 space-y-2 ${payingNow ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200'}`}>
      <button
        onClick={() => patchOrder({ paymentMethod: 'prepaid', paidVia: 'checkout' })}
        disabled={!walletLinked}
        className="w-full flex justify-between items-center text-xs font-bold text-slate-900 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-blue-600" />
          Pay now (GCash / Maya)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-[8px] bg-[#FE2C55] text-white px-1 rounded">-₱{prepaidIncentive} OFF</span>
          {choiceDot(payingNow)}
        </span>
      </button>
      {!walletLinked && (
        <p className="text-[10px] text-slate-500 leading-snug">
          {codLocked
            ? 'No linked wallet. Link GCash/Maya to pay now, or appeal the COD pause below.'
            : `No linked wallet. Cash on Delivery stays available${tierId >= 3 ? ' with a delivery window or pickup point.' : '.'}`}
        </p>
      )}
      {payingNow && walletLinked && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedPrepaidWallet('gcash')}
            className={`p-1.5 rounded-lg border text-xs font-extrabold text-blue-700 cursor-pointer ${
              selectedPrepaidWallet === 'gcash' ? 'bg-white border-blue-600' : 'bg-white/60 border-slate-200'
            }`}
          >
            GCash
          </button>
          <button
            onClick={() => setSelectedPrepaidWallet('maya')}
            className={`p-1.5 rounded-lg border text-xs font-extrabold text-emerald-800 cursor-pointer ${
              selectedPrepaidWallet === 'maya' ? 'bg-white border-emerald-600' : 'bg-white/60 border-slate-200'
            }`}
          >
            Maya
          </button>
        </div>
      )}
    </div>
  );

  const codOption = codLocked ? (
    // Repeat-refuser lock: behavioural, outside the tier ladder, and visually distinct from it.
    <div className="p-2.5 rounded-xl bg-violet-50 border-2 border-dashed border-violet-400 space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-bold text-violet-900">
        <ShieldOff className="w-3.5 h-3.5" />
        Cash on Delivery paused ({pastRefusals >= 3 ? 90 : 30} days)
      </div>
      <p className="text-[10px] text-violet-800 leading-snug">
        Your account has {pastRefusals} confirmed refusals to accept COD parcels. This pause comes from your order history, not this order's risk score.
      </p>
      {appealSubmitted ? (
        <div className="text-[10px] font-bold text-violet-900 bg-violet-100 p-1.5 rounded">
          ✓ Appeal submitted. We'll review it within 48 hours.
        </div>
      ) : (
        <button
          onClick={() => setAppealSubmitted(true)}
          className="w-full py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold cursor-pointer"
        >
          Appeal this pause
        </button>
      )}
    </div>
  ) : (
    <div className={`p-2.5 rounded-xl border-2 space-y-2 ${!payingNow ? codTheme[tierId] : 'bg-white border-slate-200'}`}>
      <button
        onClick={() => patchOrder({ paymentMethod: 'cod', paidVia: null })}
        className="w-full flex items-center justify-between text-xs font-bold text-slate-900 cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          {tierId >= 3 && walletLinked
            ? depositPaid ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-orange-600" />
            : <Truck className="w-4 h-4 text-emerald-600" />}
          {tierId === 1 ? 'Cash on Delivery (1-Click Ready)' : 'Cash on Delivery'}
        </span>
        {choiceDot(!payingNow)}
      </button>

      {!payingNow && tierId >= 2 && (
        <div className="space-y-2">
          {/* Step 1: SMS OTP */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-700 flex justify-between">
              <span>1. SMS code sent to +63 917 ••• 8421</span>
              {otpVerified && <span className="text-emerald-700">✓ Verified</span>}
            </div>
            {!otpVerified && (
              <>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => {
                      setOtpInput(e.target.value);
                      setOtpError(false);
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-center"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    className="px-2.5 py-1 rounded bg-slate-900 text-white text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
                <p className={`text-[9px] ${otpError ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                  {otpError ? `Code doesn't match. Demo code: ${DEMO_OTP}` : `Demo code: ${DEMO_OTP}`}
                </p>
              </>
            )}
          </div>

          {/* Step 2: intent confirmation */}
          {otpVerified && (
            <div className="space-y-1 pt-1.5 border-t border-black/10">
              <div className="text-[10px] font-bold text-slate-700 flex justify-between">
                <span>2. Still want this?</span>
                {intentConfirmed && <span className="text-emerald-700">✓ Confirmed</span>}
              </div>
              {!intentConfirmed && (
                <>
                  <p className="text-[10px] text-slate-600 leading-snug">
                    You'll pay ₱{amountDueAtDoor} in cash at the door on {currentSpeedObj.label.toLowerCase()} delivery. Will you be there to accept it?
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => patchOrder({ intentConfirmed: true })}
                      className="py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold cursor-pointer"
                    >
                      Yes, I'll be there
                    </button>
                    <button
                      onClick={() => patchOrder({ paymentMethod: 'prepaid', paidVia: 'checkout' })}
                      disabled={!walletLinked}
                      className="py-1.5 rounded-lg bg-[#FE2C55] text-white text-[10px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Pay now, save ₱{prepaidIncentive}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Tier 3–4 gate, branched on wallet (routing only) */}
          {tierId >= 3 && otpVerified && intentConfirmed && (
            <div className="space-y-1.5 pt-1.5 border-t border-black/10">
              {walletLinked ? (
                <>
                  <div className="text-[10px] font-bold text-slate-700">3. Refundable ₱{SECURING_DEPOSIT} deposit</div>
                  {!depositPaid ? (
                    <button
                      onClick={() => patchOrder({ depositPaid: true })}
                      className="w-full py-1.5 px-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      Pay ₱{SECURING_DEPOSIT} Refundable Deposit ({selectedPrepaidWallet === 'gcash' ? 'GCash' : 'Maya'})
                    </button>
                  ) : (
                    <div className="text-[10px] text-emerald-900 bg-emerald-100 p-1.5 rounded flex justify-between font-bold">
                      <span>✓ ₱{SECURING_DEPOSIT} deposit paid, credited to your order</span>
                      <button onClick={() => patchOrder({ depositPaid: false })} className="underline text-[9px] cursor-pointer">Reset</button>
                    </div>
                  )}
                  <p className="text-[9px] text-slate-600 leading-snug">
                    Refunded in full if you cancel before dispatch. Credited to your order on delivery. Forfeited only after a confirmed
                    refusal to accept, never if you're not home or the address fails.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-[10px] font-bold text-slate-700">
                    3. {tierId === 3 ? 'Choose one to secure COD' : 'Both required to secure COD'}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => patchOrder({ windowSelected: windowSelected ? null : TAB1_DELIVERY_WINDOW })}
                      className={`p-1.5 rounded-lg border text-left cursor-pointer ${
                        windowSelected ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-400' : 'bg-white border-slate-300'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-slate-900 flex items-center gap-1">
                        <CalendarClock className="w-3 h-3" /> Delivery window {windowSelected && '✓'}
                      </div>
                      <div className="text-[9px] text-slate-500">{TAB1_DELIVERY_WINDOW}</div>
                    </button>
                    <button
                      onClick={() => patchOrder({ pickupSelected: !pickupSelected })}
                      className={`p-1.5 rounded-lg border text-left cursor-pointer ${
                        pickupSelected ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-400' : 'bg-white border-slate-300'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-slate-900 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Pickup point {pickupSelected && '✓'}
                      </div>
                      <div className="text-[9px] text-slate-500">Nearest partner hub</div>
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-600 leading-snug">
                    No wallet needed. Required before the order can be placed.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#010101] text-slate-100 font-sans selection:bg-[#FE2C55] selection:text-white pb-16">
      
      {/* ====================================================================
          TOP EXECUTIVE COMMAND BAR WITH UNIFIED TAB SWITCHER
          ==================================================================== */}
      <header className="border-b border-white/10 bg-[#121212]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand & Command Center Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#010101] border border-white/15 flex items-center justify-center tiktok-glitch-badge shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M16.5 7.5C15.3 7.3 14.3 6.6 13.8 5.6V13.5C13.8 15.7 12 17.5 9.8 17.5C7.6 17.5 5.8 15.7 5.8 13.5C5.8 11.3 7.6 9.5 9.8 9.5C10.1 9.5 10.4 9.5 10.7 9.6V12.1C10.4 12 10.1 11.9 9.8 11.9C8.9 11.9 8.2 12.6 8.2 13.5C8.2 14.4 8.9 15.1 9.8 15.1C10.7 15.1 11.4 14.4 11.4 13.5V3H13.8C14 4.8 15.4 6.2 17.2 6.4V7.5H16.5Z" fill="#25F4EE" transform="translate(-0.8, -0.8)" />
                <path d="M16.5 7.5C15.3 7.3 14.3 6.6 13.8 5.6V13.5C13.8 15.7 12 17.5 9.8 17.5C7.6 17.5 5.8 15.7 5.8 13.5C5.8 11.3 7.6 9.5 9.8 9.5C10.1 9.5 10.4 9.5 10.7 9.6V12.1C10.4 12 10.1 11.9 9.8 11.9C8.9 11.9 8.2 12.6 8.2 13.5C8.2 14.4 8.9 15.1 9.8 15.1C10.7 15.1 11.4 14.4 11.4 13.5V3H13.8C14 4.8 15.4 6.2 17.2 6.4V7.5H16.5Z" fill="#FE2C55" transform="translate(0.8, 0.8)" />
                <path d="M16.5 7.5C15.3 7.3 14.3 6.6 13.8 5.6V13.5C13.8 15.7 12 17.5 9.8 17.5C7.6 17.5 5.8 15.7 5.8 13.5C5.8 11.3 7.6 9.5 9.8 9.5C10.1 9.5 10.4 9.5 10.7 9.6V12.1C10.4 12 10.1 11.9 9.8 11.9C8.9 11.9 8.2 12.6 8.2 13.5C8.2 14.4 8.9 15.1 9.8 15.1C10.7 15.1 11.4 14.4 11.4 13.5V3H13.8C14 4.8 15.4 6.2 17.2 6.4V7.5H16.5Z" fill="#FFFFFF" />
              </svg>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-black text-white tracking-tight">
                  TikTok <span className="text-[#FE2C55]">Shop</span> Philippines
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-black bg-[#25F4EE]/10 text-[#25F4EE] border border-[#25F4EE]/30">
                  COD DILEMMA
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-[#FE2C55]/20 via-purple-500/20 to-[#25F4EE]/20 text-white border border-white/25 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE2C55] animate-pulse" />
                  Team: Joes and the Mars
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                Cash on Delivery (COD) Dilemma: Balancing explosive GMV growth with reverse logistics through pre-checkout predictive risk gating & post-checkout delivery deflection
              </p>
            </div>
          </div>

          {/* Master Tab Switcher: four views of the same shared order */}
          <div className="grid grid-cols-2 sm:flex items-center gap-1 p-1 rounded-xl bg-[#1F1F23] border border-white/10 self-start md:self-auto shadow-inner">
            {([
              { key: 'tab1_pre', label: 'Tab 1: Buyer Checkout', icon: Activity, active: 'bg-[#FE2C55] text-white shadow-md shadow-[#FE2C55]/30' },
              { key: 'tab2_post', label: 'Tab 2: Post-Checkout', icon: Layers, active: 'bg-[#25F4EE] text-slate-950 shadow-md shadow-[#25F4EE]/30' },
              { key: 'tab3_seller', label: 'Tab 3: Seller', icon: Store, active: 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' },
              { key: 'tab4_courier', label: 'Tab 4: Rider', icon: Truck, active: 'bg-violet-500 text-white shadow-md shadow-violet-500/30' },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === t.key ? t.active : 'text-slate-400 hover:text-white'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Executive Context Badge & Modal */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="bg-[#1F1F23] border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#25F4EE] animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">
                  Active PH GMV
                </span>
                <span className="text-xs font-mono font-bold text-white">₱{(MONTHLY_GMV / 1e9).toFixed(0)}B/mo</span>
              </div>
            </div>

            <button
              onClick={() => setShowFormulaModal(!showFormulaModal)}
              className="p-2 rounded-xl bg-[#1F1F23] hover:bg-white/10 text-slate-300 border border-white/10 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
              title="View Model Specification"
            >
              <HelpCircle className="w-4 h-4 text-[#25F4EE]" />
              <span className="font-semibold text-xs">Spec</span>
            </button>
          </div>
        </div>

        {/* Collapsible Model Spec Drawer */}
        {showFormulaModal && (
          <div className="border-t border-white/10 bg-[#0a0a0c] px-4 sm:px-6 lg:px-8 py-3 animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-300">
              <div className="space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-[#25F4EE]" />
                  Dual-Layer Architecture: Pre-Checkout ML Interception + Post-Checkout Logistics Deflection
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Tab 1 applies an additive 6-dimension risk model, with modifiers derived from the case pack's stated segment failure rates, to price checkout friction by tier.
                  Tab 2 coordinates reactive logistics triggers (cooling-off reminders, delivery windows, and courier AI WhatsApp outreach)
                  to deflect failed doorstep RTS attempts before courier arrival.
                </p>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Real-time Logistics Toast Notification */}
      {mitigationToast && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-3.5 rounded-xl bg-[#121216] border border-[#25F4EE] shadow-2xl flex items-center gap-3 text-xs font-semibold text-white">
            <Radio className="w-4 h-4 text-[#25F4EE] animate-pulse" />
            <span>{mitigationToast}</span>
          </div>
        </div>
      )}

      {/* ====================================================================
          MAIN DUAL-PANE VIEWPORT
          ==================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================================================================
              LEFT PANEL (PLATFORM VIEW): CONTROLS & COMMAND CENTER
              ================================================================ */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* --------------------------------------------------------------
                TAB 1: PRE-CHECKOUT ML RISK ENGINE (PREDICTIVE CONTROLS)
                -------------------------------------------------------------- */}
            {activeTab === 'tab1_pre' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* Control Panel Header */}
                <div className="bg-[#121212]/95 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div>
                      <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-[#FE2C55]" />
                        <span>Pre-Checkout Feature Vector Controls</span>
                      </h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Configure the 6 feature dimensions to simulate real-time ML risk scoring
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startNewOrder({ selections: DEFAULT_SELECTIONS, walletLinked: true, pastRefusals: 0 })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1F1F23] hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                        Reset
                      </button>
                      <button
                        onClick={() => {
                          const randomSelections: Record<string, string> = {};
                          Object.entries(DIMENSIONS).forEach(([k, dim]) => {
                            const idx = Math.floor(Math.random() * dim.options.length);
                            randomSelections[k] = dim.options[idx].id;
                          });
                          startNewOrder({ selections: randomSelections });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FE2C55] hover:bg-[#e02449] text-white shadow-md shadow-[#FE2C55]/25 transition-all cursor-pointer"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        Randomize
                      </button>
                    </div>
                  </div>

                  {/* 1-Click Buyer Persona Shortcuts */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25F4EE]" />
                      Quick Personas (Tiers 1–4)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_PROFILES.map((p) => {
                        const isMatch = Object.entries(p.selections).every(([k, v]) => selections[k] === v);
                        return (
                          <button
                            key={p.name}
                            onClick={() => startNewOrder({ selections: p.selections })}
                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                              isMatch
                                ? 'bg-[#1F1F23] border-[#25F4EE] ring-1 ring-[#25F4EE]/50'
                                : 'bg-[#0a0a0c] hover:bg-[#1F1F23]/60 border-white/10'
                            }`}
                          >
                            <div className="text-xs font-bold text-white truncate">{p.name}</div>
                            <div className={`text-[10px] font-semibold mt-0.5 ${
                              p.color === 'emerald' ? 'text-emerald-400' :
                              p.color === 'amber' ? 'text-amber-400' :
                              p.color === 'orange' ? 'text-orange-400' : 'text-[#FE2C55]'
                            }`}>
                              ● {p.badge}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* The 6 Feature Dimensions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(DIMENSIONS).map(([dimKey, dim]) => {
                      const IconComp = dim.icon;
                      const selectedOpt = dim.options.find((o) => o.id === selections[dimKey]) ?? dim.options[0];
                      return (
                        <div key={dimKey} className="p-3 rounded-xl bg-[#0c0c0e] border border-white/10 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                              <span className="p-1 rounded bg-[#1F1F23] text-[#25F4EE]">
                                <IconComp className="w-3 h-3" />
                              </span>
                              <span className="truncate">{dim.label}</span>
                            </label>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              selectedOpt.modifier > 0 ? 'bg-rose-950/60 text-[#FE2C55]' :
                              selectedOpt.modifier < 0 ? 'bg-emerald-950/60 text-emerald-400' :
                              'bg-white/10 text-slate-400'
                            }`}>
                              {selectedOpt.modifier > 0 ? `+${selectedOpt.modifier}%` : `${selectedOpt.modifier}%`}
                            </span>
                          </div>

                          <select
                            value={selections[dimKey]}
                            onChange={(e) => startNewOrder({ selections: { ...selections, [dimKey]: e.target.value } })}
                            className="w-full bg-[#1F1F23] border border-white/15 focus:border-[#25F4EE] rounded-lg px-2.5 py-1.5 text-xs text-white font-medium outline-none cursor-pointer"
                          >
                            {dim.options.map((opt) => (
                              <option key={opt.id} value={opt.id} className="bg-[#121212] text-white">
                                {opt.label} ({opt.modifier > 0 ? `+${opt.modifier}%` : `${opt.modifier}%`})
                              </option>
                            ))}
                          </select>

                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span className="truncate">{dim.description}</span>
                            <span className="font-mono text-slate-300 shrink-0 ml-1">Fail: {selectedOpt.actualRate}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Routing attributes: change which gate is shown, never the score */}
                  <div className="p-3 rounded-xl bg-[#0a0a0c] border border-dashed border-white/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Routing Attributes
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                        Not scored (0% modifier)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => startNewOrder({ walletLinked: !walletLinked })}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#1F1F23] border border-white/10 text-left cursor-pointer"
                      >
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-[#25F4EE]" />
                          Buyer has linked wallet
                        </span>
                        <span className={`relative w-8 h-4 rounded-full transition-colors shrink-0 ${walletLinked ? 'bg-[#25F4EE]' : 'bg-slate-600'}`}>
                          <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${walletLinked ? 'left-4' : 'left-0.5'}`} />
                        </span>
                      </button>
                      <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#1F1F23] border border-white/10">
                        <span className="text-xs font-bold text-slate-200">Confirmed past refusals</span>
                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 3].map((n) => (
                            <button
                              key={n}
                              onClick={() => startNewOrder({ pastRefusals: n })}
                              className={`w-6 h-6 rounded text-[11px] font-mono font-bold cursor-pointer ${
                                pastRefusals === n ? 'bg-violet-500 text-white' : 'bg-[#0a0a0c] text-slate-400 hover:text-white'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Wallet status picks the Tier 3/4 gate branch only. Past refusals feed the separate repeat-refuser lock, not the score.
                    </p>
                  </div>

                  {/* Additive Formula Bar */}
                  <div className="p-3 rounded-xl bg-[#0a0a0c] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-slate-400 font-sans font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#25F4EE]" />
                      Formula:
                    </span>
                    <div className="flex flex-wrap items-center gap-1 text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-[#1F1F23] text-slate-300">29% Base</span>
                      {calculation.breakdown.map((item) => (
                        <span key={item.key} className={`px-1.5 py-0.5 rounded ${
                          item.modifier > 0 ? 'bg-rose-950/80 text-[#FE2C55]' :
                          item.modifier < 0 ? 'bg-emerald-950/80 text-emerald-400' : 'bg-[#1F1F23] text-slate-400'
                        }`}>
                          {item.modifier >= 0 ? `+${item.modifier}%` : `${item.modifier}%`}
                        </span>
                      ))}
                      {calculation.listingAdjustment !== 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-700/60" title="Published listing from the Tab 3 Listing Quality Gate">
                          {calculation.listingAdjustment}% listing
                        </span>
                      )}
                      <span className="text-slate-400">=</span>
                      <span className={`px-2 py-0.5 rounded font-bold border ${calculation.tier.theme.badgeBg}`}>
                        {calculation.finalScore}% Final Score ({calculation.tier.name})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tier Intervention Matrix */}
                <div className="bg-[#121212]/95 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#25F4EE]" />
                    <span>Tier Intervention Matrix (Predicted Risk → Priced Friction)</span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px] border-collapse">
                      <thead>
                        <tr>
                          <th className="text-left p-1.5 text-slate-500 font-bold" />
                          {([1, 2, 3, 4] as const).map((t) => (
                            <th
                              key={t}
                              className={`text-left p-1.5 font-extrabold whitespace-nowrap ${
                                t === tierId ? `${TIER_CONFIGS[t].theme.bgLight} ${TIER_CONFIGS[t].theme.text}` : 'text-slate-400'
                              }`}
                            >
                              {TIER_CONFIGS[t].emoji} T{t} <span className="font-mono font-normal">({TIER_CONFIGS[t].range})</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {TIER_POLICY_ROWS.map((row) => (
                          <tr key={row.label} className="border-t border-white/5">
                            <td className="p-1.5 text-slate-400 font-bold whitespace-nowrap">{row.label}</td>
                            {([1, 2, 3, 4] as const).map((t) => (
                              <td
                                key={t}
                                className={`p-1.5 ${t === tierId ? `${TIER_CONFIGS[t].theme.bgLight} text-white font-semibold` : 'text-slate-500'}`}
                              >
                                {row.values[t]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0a0a0c] border border-white/10 text-[11px] flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#25F4EE]" />
                      Courier routing:
                    </span>
                    {tierId >= 3 ? (
                      <span className="text-slate-200">
                        <span className="line-through text-slate-500">{currentCourierObj.label} ({currentCourierObj.actualRate})</span>{' '}
                        → <strong className="text-[#25F4EE]">{routedCourier.label} ({routedCourier.actualRate} failure)</strong>
                        {tierId === 4 && <span className="text-slate-300"> + Next-Day speed upgrade</span>}
                        <span className="block text-[10px] text-slate-500">Platform-cost intervention, invisible to the buyer.</span>
                      </span>
                    ) : (
                      <span className="text-slate-200">{currentCourierObj.label} ({currentCourierObj.actualRate} failure), default</span>
                    )}
                  </div>
                </div>

                {/* Outside the ladder: repeat-refuser lock (demonstrated abuse, not predicted risk) */}
                <div className={`rounded-2xl p-4 border-2 border-dashed space-y-1.5 ${
                  codLocked ? 'bg-violet-950/30 border-violet-500/60' : 'bg-[#0a0a0c] border-violet-500/25'
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
                      <ShieldOff className="w-4 h-4" />
                      <span>Outside the Ladder: Repeat-Refuser Lock</span>
                    </h3>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      codLocked ? 'bg-violet-500 text-white' : pastRefusals === 1 ? 'bg-violet-500/20 text-violet-200' : 'bg-white/10 text-slate-400'
                    }`}>
                      {codLocked ? `COD paused ${pastRefusals >= 3 ? '90' : '30'} days` : pastRefusals === 1 ? 'Warning issued' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Triggered only by order history: {REPEAT_REFUSER_THRESHOLD}+ confirmed refusals-to-accept (never not-at-home or address failures).
                    Graduated (1 = warning, 2 = 30-day COD pause, 3+ = 90-day pause) and appealable. This is the only place COD is ever removed.
                    Current buyer: <strong className="text-white">{pastRefusals} confirmed refusal{pastRefusals === 1 ? '' : 's'}</strong>.
                  </p>
                </div>

                {/* Real-Time Unit Economics & P&L Card with A/B Toggle */}
                <div className="bg-[#121212]/95 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-emerald-400" />
                      <span>Unit Economics & P&L Analysis</span>
                    </h3>

                    {/* A/B Economics Toggle */}
                    <div className="flex items-center p-0.5 rounded-lg bg-[#1F1F23] border border-white/10 text-[10px]">
                      <button
                        onClick={() => setAbMode('without_ml')}
                        className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          abMode === 'without_ml'
                            ? 'bg-rose-950/80 text-[#FE2C55] border border-rose-800/60 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Without ML</span>
                      </button>
                      <button
                        onClick={() => setAbMode('with_ml')}
                        className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          abMode === 'with_ml'
                            ? 'bg-[#25F4EE]/15 text-[#25F4EE] border border-[#25F4EE]/40 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>With ML Intervention</span>
                      </button>
                    </div>
                  </div>

                  {abMode === 'without_ml' ? (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-1.5">
                        <div className="text-[10px] font-sans font-bold uppercase text-slate-400">
                          Cost of one failed COD order (₱{FAILED_ORDER_LOGISTICS} logistics + commission)
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Forward delivery <span className="text-slate-500">(seller)</span>:</span>
                          <span className="text-[#FE2C55] font-bold">-₱{FORWARD_DELIVERY_COST}.00</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Reverse logistics <span className="text-slate-500">(platform)</span>:</span>
                          <span className="text-[#FE2C55] font-bold">-₱{REVERSE_LOGISTICS_COST}.00</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Cash handling <span className="text-slate-500">(platform)</span>:</span>
                          <span className="text-[#FE2C55] font-bold">-₱{CASH_HANDLING_COST}.00</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Forgone commission ({COMMISSION_RATE * 100}% of ₱{subtotal.toLocaleString()} list price):</span>
                          <span className="text-[#FE2C55] font-bold">-₱{economics.commission}.00</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-rose-900/50 font-sans">
                          <div className="p-2 rounded-lg bg-black/30">
                            <div className="text-[10px] text-slate-400 font-bold">Platform exposure</div>
                            <div className="text-sm font-black font-mono text-[#FE2C55]">-₱{economics.platformLossPerFailure}</div>
                            <div className="text-[9px] text-slate-500">₱{PLATFORM_FAIL_EXPOSURE} logistics + ₱{economics.commission} commission</div>
                          </div>
                          <div className="p-2 rounded-lg bg-black/30">
                            <div className="text-[10px] text-slate-400 font-bold">Seller exposure</div>
                            <div className="text-sm font-black font-mono text-[#FE2C55]">-₱{SELLER_FAIL_EXPOSURE}</div>
                            <div className="text-[9px] text-slate-500">Forward delivery, sunk</div>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-rose-900/50 text-white font-sans">
                          <span>Expected platform loss per order at {calculation.finalScore}% failure:</span>
                          <span className="text-[#FE2C55] font-black font-mono">-₱{economics.expectedPlatformLoss.toFixed(2)}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans italic">
                        Without risk-priced checkout, this order enters standard COD dispatch at a {calculation.finalScore}% predicted failure rate.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs font-mono">
                      {/* Scenario toggle */}
                      <div className="flex flex-wrap items-center justify-between gap-2 font-sans">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Assumption scenario</span>
                        <div className="flex items-center p-0.5 rounded-lg bg-[#1F1F23] border border-white/10 text-[10px]">
                          {(Object.keys(SCENARIOS) as ScenarioKey[]).map((k) => (
                            <button
                              key={k}
                              onClick={() => {
                                setScenario(k);
                                setVerifyDeflectionRate(SCENARIOS[k].verifyDeflection);
                              }}
                              className={`px-2.5 py-1 rounded-md font-bold cursor-pointer ${
                                scenario === k ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {SCENARIOS[k].label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#121216] border border-white/10 space-y-1.5">
                        <div className="text-[10px] font-sans font-bold uppercase text-slate-400">
                          Expected value per order, {calculation.tier.name}
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Failed-delivery exposure avoided ({(economics.failuresAvoided * 100).toFixed(1)} pts × ₱{PLATFORM_FAIL_EXPOSURE}):</span>
                          <span className="text-emerald-400 font-bold">+₱{economics.exposureAvoided.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Cash handling saved on prepaid conversions ({(economics.uptake * 100).toFixed(0)}% uptake):</span>
                          <span className="text-emerald-400 font-bold">+₱{economics.cashHandlingSaved.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Prepaid incentive (₱{prepaidIncentive} × {(economics.uptake * 100).toFixed(0)}%):</span>
                          <span className="text-[#FE2C55] font-bold">-₱{economics.incentiveCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>SMS OTP (₱{SMS_OTP_COST.toFixed(2)} on every COD order at Tier 2+):</span>
                          <span className="text-[#FE2C55] font-bold">-₱{economics.smsCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-white/10 text-white font-sans">
                          <span>Net platform value per order:</span>
                          <span className={`text-sm font-black font-mono ${economics.net >= 0 ? 'text-[#25F4EE]' : 'text-[#FE2C55]'}`}>
                            {economics.net >= 0 ? '+' : '-'}₱{Math.abs(economics.net).toFixed(2)}
                            {economics.roi !== null && ` (${economics.roi.toFixed(1)}× return)`}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-sans">
                          <span>Predicted failure {calculation.finalScore}% → residual {(economics.residualFailureRate * 100).toFixed(1)}%</span>
                          <span>Seller saves ₱{economics.sellerSaved.toFixed(2)} forward freight</span>
                        </div>
                      </div>

                      {tierId >= 2 && (
                        <div className="p-3 rounded-xl bg-[#121216] border border-amber-500/20 space-y-2 font-sans">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-300 font-bold">Verification ROI (OTP + intent confirmation)</span>
                            <span className="font-mono font-black text-amber-400">{economics.verifyRoi.toFixed(1)}×</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            P(deflect) {(verifyDeflectionRate * 100).toFixed(1)}% × ₱{PLATFORM_FAIL_EXPOSURE} ÷ ₱{SMS_OTP_COST.toFixed(2)} SMS paid on every order
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={0.2}
                            step={0.005}
                            value={verifyDeflectionRate}
                            onChange={(e) => setVerifyDeflectionRate(Number(e.target.value))}
                            className="w-full accent-amber-400 cursor-pointer"
                            aria-label="Deflection rate"
                          />
                        </div>
                      )}

                      <p className="text-[10px] text-slate-500 font-sans italic leading-snug">
                        Deflection, gate-effect and prepaid-uptake rates are unsourced planning assumptions, not measured results.
                        Compare scenarios rather than quoting one figure.
                      </p>
                    </div>
                  )}

                  {/* Market reconciliation against the case pack */}
                  <div className="p-2.5 rounded-xl bg-[#0a0a0c] border border-white/10 text-[10px] font-mono text-slate-400 space-y-0.5">
                    <div className="font-sans font-bold text-slate-300 text-[11px]">Market check: platform failed-COD logistics cost</div>
                    <div>
                      {DAILY_ORDERS.toLocaleString()} orders/day × {COD_SHARE * 100}% COD × {BASE_FAILURE_RATE}% failure × {DAYS_PER_MONTH} days × ₱{PLATFORM_FAIL_EXPOSURE}
                    </div>
                    <div className="text-white font-bold">
                      = ₱{(MONTHLY_PLATFORM_FAIL_COST / 1e9).toFixed(2)}B / month <span className="text-slate-500 font-normal">(case pack: ₱3.3B ✓)</span>
                    </div>
                  </div>
                </div>

              </div>
            )}


            {/* --------------------------------------------------------------
                TAB 2: POST-CHECKOUT MITIGATION (LOGISTICS COMMAND CENTER)
                -------------------------------------------------------------- */}
            {activeTab === 'tab2_post' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* Cumulative Impact Dashboard */}
                <div className="bg-[#121212]/95 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span>Post-Checkout Cumulative Impact Dashboard</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Real-time telemetry measuring RTS loss mitigation from reactive dispatch actions
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                        LIVE DISPATCH INTERCEPTION
                      </span>
                      <button
                        onClick={handleResetTab2}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1F1F23] hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="p-3 rounded-xl bg-[#0a0a0c] border border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Logistics Cost Saved</div>
                      <div className="text-xl font-extrabold font-mono text-emerald-400 mt-1">
                        ₱{logisticsSaved.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Freight + cash handling avoided</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0a0a0c] border border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">RTS Parcels Deflected</div>
                      <div className="text-xl font-extrabold font-mono text-[#25F4EE] mt-1">
                        {rtsDeflectedCount} Orders
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Cancelled prior to courier</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0a0a0c] border border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Windows Locked</div>
                      <div className="text-xl font-extrabold font-mono text-amber-400 mt-1">
                        {windowsLockedCount} Orders
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Handover slots secured</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0a0a0c] border border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">COD→Prepaid Converted</div>
                      <div className="text-xl font-extrabold font-mono text-violet-400 mt-1">
                        {prepaidConvertedCount} Orders
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">₱{CASH_HANDLING_COST} cash handling saved each</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0a0a0c] border border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Capital Protected</div>
                      <div className="text-xl font-extrabold font-mono text-white mt-1">
                        ₱8,450
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Merchandise inventory value</div>
                    </div>
                  </div>
                </div>

                {/* Dispatcher Actions Panel */}
                <div className="bg-[#121212]/95 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Send className="w-4 h-4 text-[#25F4EE]" />
                      <span>Interactive Dispatcher Actions (Target: {activeOrder.orderNumber})</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Trigger proactive customer interventions on the buyer's phone simulator on the right. Each action is enabled only at its order stage
                      ({activeOrder.orderNumber} is <strong className="text-slate-200">{isCancelled ? 'cancelled' : activeOrder.stage}</strong>).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    {/* Action 1: Cooling-off push */}
                    <button
                      onClick={handleTriggerPushReminder}
                      disabled={actionBlockedReason('push_reminder') !== null}
                      title={actionBlockedReason('push_reminder') ?? undefined}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group disabled:opacity-40 disabled:cursor-not-allowed ${
                        buyerScreenState === 'push_reminder'
                          ? 'bg-[#1F1F23] border-[#FE2C55] ring-2 ring-[#FE2C55]/30'
                          : 'bg-[#0a0a0c] hover:bg-[#1F1F23] border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-1.5 rounded-lg bg-[#FE2C55]/10 text-[#FE2C55]">
                          <BellRing className="w-4 h-4" />
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                          Pre-Packing
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white group-hover:text-[#FE2C55] transition-colors">
                        1. 24-hr Cooling Off Reminder
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                        Overlays push notification giving buyer a chance to cancel impulse orders before warehouse packing.
                      </div>
                    </button>

                    {/* Action 2: Delivery window picker */}
                    <button
                      onClick={handleTriggerWindowPicker}
                      disabled={actionBlockedReason('inbox_window') !== null}
                      title={actionBlockedReason('inbox_window') ?? undefined}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group disabled:opacity-40 disabled:cursor-not-allowed ${
                        buyerScreenState === 'inbox_window'
                          ? 'bg-[#1F1F23] border-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-[#0a0a0c] hover:bg-[#1F1F23] border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                          <CalendarClock className="w-4 h-4" />
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                          In-Transit
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        2. Send Delivery Window Picker
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                        Sends TikTok System Inbox prompt to secure morning, afternoon, or weekend availability.
                      </div>
                    </button>

                    {/* Action 3: Courier AI dispatch */}
                    <button
                      onClick={handleTriggerCourierAI}
                      disabled={actionBlockedReason('courier_chat') !== null}
                      title={actionBlockedReason('courier_chat') ?? undefined}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group disabled:opacity-40 disabled:cursor-not-allowed ${
                        buyerScreenState === 'courier_chat'
                          ? 'bg-[#1F1F23] border-[#25F4EE] ring-2 ring-[#25F4EE]/30'
                          : 'bg-[#0a0a0c] hover:bg-[#1F1F23] border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-1.5 rounded-lg bg-[#25F4EE]/10 text-[#25F4EE]">
                          <MessageSquareQuote className="w-4 h-4" />
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                          Out for Delivery
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white group-hover:text-[#25F4EE] transition-colors">
                        3. Initiate Courier AI Dispatch
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                        Triggers WhatsApp/Viber AI rider outreach with cash confirmation & reschedule options.
                      </div>
                    </button>

                  </div>
                </div>

                {/* Live Pending Orders Feed */}
                <div className="bg-[#121212]/95 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <PackageCheck className="w-4 h-4 text-[#25F4EE]" />
                      <span>Live Pending Orders Feed (Select to Target)</span>
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      {allOrders.length} Orders
                    </span>
                  </div>

                  <div className="space-y-2">
                    {allOrders.map((ord) => {
                      const isSelected = ord.id === selectedOrderId;
                      return (
                        <div
                          key={ord.id}
                          onClick={() => handleSelectOrder(ord.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-[#1F1F23] border-[#25F4EE] ring-1 ring-[#25F4EE]/40'
                              : 'bg-[#0a0a0c] hover:bg-[#1F1F23]/60 border-white/10'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{ord.orderNumber}</span>
                              {ord.id === SHARED_ORDER_ID && (
                                <span className="text-[9px] px-1.5 rounded font-bold bg-[#25F4EE]/15 text-[#25F4EE] border border-[#25F4EE]/40">
                                  FROM TAB 1
                                </span>
                              )}
                              <span className="text-white/20">•</span>
                              <span className="text-xs text-slate-300">{ord.buyerName}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                ord.riskTier === 4 ? 'bg-rose-950/80 text-[#FE2C55] border border-rose-800' :
                                ord.riskTier === 3 ? 'bg-orange-950/80 text-orange-400 border border-orange-800' :
                                ord.riskTier === 2 ? 'bg-amber-950/80 text-amber-400 border border-amber-800' :
                                'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                              }`}>
                                Tier {ord.riskTier} ({ord.riskScore}%)
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {ord.itemTitle} (₱{ord.itemPrice.toLocaleString()}) • {ord.region} via {ord.courier} • Collect at door: ₱{collectAtDoor(ord).toLocaleString()}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                            {ord.paymentMode === 'prepaid' && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-violet-950 text-violet-300 border border-violet-800">
                                Prepaid
                              </span>
                            )}
                            {ord.resolution === 'confirmed' && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                Confirmed
                              </span>
                            )}
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                              ord.resolution === 'cancelled' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-white/10 text-slate-300'
                            }`}>
                              {ord.resolution === 'cancelled' ? 'Order Cancelled' : ord.stage}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* --------------------------------------------------------------
                TAB 3: SELLER VIEW
                PRIVACY: the seller sees the tier label only. Never the numeric risk score, and never
                the buyer's name or phone beside a risk indicator. Showing a third party an automated
                risk judgment about a named individual creates exposure under the Data Privacy Act of
                2012 (RA 10173), which requires disclosure of automated decision-making and grants a
                right to object. "This order: Tier 3" carries the decision without the problem.
                -------------------------------------------------------------- */}
            {activeTab === 'tab3_seller' && (
              <div className="space-y-6 animate-in fade-in duration-300">

                {/* Seller summary */}
                <div className="bg-[#121212]/95 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
                  <div className="pb-3 border-b border-white/10">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Store className="w-4 h-4 text-amber-400" />
                      <span>Seller Center: Order Hold Queue</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tier 3–4 COD orders are held until the buyer confirms intent, so you only pack orders likely to be accepted.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-[#0a0a0c] border border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Forward Freight Saved</div>
                      <div className="text-xl font-extrabold font-mono text-emerald-400 mt-1">₱{sellerFreightSaved.toLocaleString()}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">₱{FORWARD_DELIVERY_COST} per order cancelled before dispatch</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0a0a0c] border border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Orders Held</div>
                      <div className="text-xl font-extrabold font-mono text-amber-400 mt-1">{allOrders.filter(isHeld).length} Orders</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Awaiting buyer confirmation</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0a0a0c] border border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Your Exposure / Failed COD</div>
                      <div className="text-xl font-extrabold font-mono text-white mt-1">₱{SELLER_FAIL_EXPOSURE}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Forward delivery (case cost split)</div>
                    </div>
                  </div>
                </div>

                {/* Hold queue */}
                <div className="bg-[#121212]/95 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <PackageCheck className="w-4 h-4 text-amber-400" />
                      <span>Incoming Orders</span>
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">Risk shown as tier only</span>
                  </div>
                  <div className="space-y-2">
                    {allOrders.map((o) => {
                      const held = isHeld(o);
                      const cancelled = o.resolution === 'cancelled';
                      const preDispatch = PRE_DISPATCH_STAGES.includes(o.stage);
                      const canPack = !held && !cancelled && o.stage === 'Pending Warehouse Packing';
                      const statusLabel = cancelled
                        ? 'CANCELLED'
                        : held
                          ? 'HELD — awaiting buyer confirmation'
                          : o.stage === 'Awaiting Checkout'
                            ? 'RELEASED — awaiting checkout'
                            : o.stage === 'Pending Warehouse Packing'
                              ? 'RELEASED — ready to pack'
                              : o.stage === 'Dispatched & In Transit'
                                ? 'SHIPPED — in transit'
                                : o.stage === 'Out for Delivery'
                                  ? `OUT FOR DELIVERY${o.attemptCount ? ` · ${o.attemptCount} failed attempt${o.attemptCount > 1 ? 's' : ''}` : ''}`
                                  : o.stage === 'Delivered'
                                    ? 'DELIVERED'
                                    : 'AT PICKUP POINT';
                      return (
                        <div
                          key={o.id}
                          className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            held ? 'bg-amber-950/20 border-amber-700/40' : 'bg-[#0a0a0c] border-white/10'
                          }`}
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-white">{o.orderNumber}</span>
                              {o.id === SHARED_ORDER_ID && (
                                <span className="text-[9px] px-1.5 rounded font-bold bg-[#25F4EE]/15 text-[#25F4EE] border border-[#25F4EE]/40">
                                  FROM TAB 1
                                </span>
                              )}
                              <span className={`text-[9px] px-1.5 rounded font-bold ${
                                o.riskTier === 4 ? 'bg-rose-950/80 text-[#FE2C55] border border-rose-800' :
                                o.riskTier === 3 ? 'bg-orange-950/80 text-orange-400 border border-orange-800' :
                                o.riskTier === 2 ? 'bg-amber-950/80 text-amber-400 border border-amber-800' :
                                'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                              }`}>
                                Tier {o.riskTier}
                              </span>
                              <span className="text-[9px] px-1.5 rounded font-bold bg-white/10 text-slate-300">
                                {o.paymentMode === 'prepaid' ? 'Prepaid' : 'COD'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {o.itemTitle} • ₱{o.itemPrice.toLocaleString()}
                            </div>
                            <div className={`text-[10px] font-mono font-bold ${
                              cancelled ? 'text-rose-300' : held ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              {statusLabel}
                            </div>
                            <div className={`text-[10px] ${cancelled && preDispatch ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                              {cancelled && preDispatch
                                ? `₱${FORWARD_DELIVERY_COST} forward freight saved`
                                : preDispatch
                                  ? `Forward freight at risk: ₱${FORWARD_DELIVERY_COST}`
                                  : `Forward freight committed: ₱${FORWARD_DELIVERY_COST}`}
                            </div>
                          </div>
                          <button
                            onClick={() => handlePackAndShip(o)}
                            disabled={!canPack}
                            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer disabled:bg-white/10 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {held ? <Lock className="w-3 h-3" /> : <PackageCheck className="w-3 h-3" />}
                            {canPack || held || o.stage === 'Awaiting Checkout' ? 'Pack & Ship' : cancelled ? 'Cancelled' : 'Shipped ✓'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Listing quality → risk model */}
                <div className="bg-[#121212]/95 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#25F4EE]" />
                    <span>Listing Quality → Risk Model (Supply Side)</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Object.keys(LISTING_CASE) as GatedCategory[]).map((cat) => {
                      const base = categoryModifier(cat);
                      const projected = projectedContribution(cat);
                      return (
                        <div key={cat} className="p-3 rounded-xl bg-[#0a0a0c] border border-white/10 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{LISTING_CASE[cat].label}</span>
                            <span className={`text-[9px] px-1.5 rounded font-bold ${
                              listingPublished[cat] ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-white/10 text-slate-400'
                            }`}>
                              {listingPublished[cat] ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {LISTING_CASE[cat].share} of orders · {LISTING_CASE[cat].failure} failure
                          </div>
                          <div className="text-[11px] font-mono text-slate-300">
                            Category contribution: {base >= 0 ? '+' : ''}{base} → <strong className="text-emerald-400">{projected >= 0 ? '+' : ''}{projected.toFixed(1)} pts</strong>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full bg-emerald-400 transition-all" style={{ width: `${listingDone[cat] * 100}%` }} />
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {selections.category === cat
                              ? listingPublished[cat] && calculation.listingAdjustment === 0
                                ? `Applies from the next order; ${SHARED_ORDER_NUMBER} was already scored at checkout.`
                                : listingPublished[cat]
                                ? `Applied to the Tab 1 score (−${LISTING_MAX_REDUCTION} pts).`
                                : 'Tab 1 is selling this category: publish to lower its score.'
                              : 'Switch Tab 1 to this category to see the score effect.'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    The reduction (up to {LISTING_MAX_REDUCTION} pts for a complete listing) is an unsourced planning assumption.
                  </p>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------
                TAB 4: COURIER / RIDER VIEW
                -------------------------------------------------------------- */}
            {activeTab === 'tab4_courier' && (
              <div className="space-y-6 animate-in fade-in duration-300">

                <div className="bg-[#121212]/95 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
                  <div className="pb-3 border-b border-white/10">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Truck className="w-4 h-4 text-violet-400" />
                      <span>Rider Run Overview</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Every prepaid conversion, in any tab, takes cash off the rider's person.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#0a0a0c] border border-violet-500/30">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Cash Currently Carried</div>
                      <div className="text-2xl font-extrabold font-mono text-violet-300 mt-1">₱{cashCarried.toLocaleString()}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">
                        Case: security concerns for couriers carrying cash drive Mindanao's 35% failure rate, the highest in the country.
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0a0a0c] border border-white/10 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Stops on This Run</div>
                      {riderRun.length === 0 && <div className="text-[11px] text-slate-500">No parcels handed over yet.</div>}
                      {riderRun.map((o) => (
                        <div key={o.id} className="flex justify-between text-[11px]">
                          <span className="text-slate-300 truncate">
                            {o.orderNumber} · {o.region}
                          </span>
                          <span className={`font-mono font-bold shrink-0 ml-2 ${collectAtDoor(o) === 0 ? 'text-emerald-400' : 'text-white'}`}>
                            {o.stage === 'Delivered' ? 'Delivered' : collectAtDoor(o) === 0 ? 'Prepaid' : `₱${collectAtDoor(o).toLocaleString()}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#121212]/95 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-violet-400" />
                    <span>Failed-Attempt Policy</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Pickup-point re-route unlocks only after the <strong className="text-white">second</strong> failed attempt. Re-attempt rate
                    correlates inversely with failure, so diverting after one attempt would give up a lever that works.
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                    {[
                      ['A&B', '1.8', '29%'],
                      ['XYZ', '1.7', '26%'],
                      ['Quick Van', '1.3', '33%'],
                      ['Others', '1.2', '36%'],
                    ].map(([name, attempts, fail]) => (
                      <div key={name} className="p-2 rounded-lg bg-[#0a0a0c] border border-white/10">
                        <div className="text-slate-300 font-sans font-bold">{name}</div>
                        <div className="text-slate-400">{attempts} attempts</div>
                        <div className="text-[#FE2C55]">{fail} fail</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    Re-route saving = ₱{REVERSE_LOGISTICS_COST} return leg avoided − ₱{PICKUP_TRANSFER_COST} transfer to pickup point (assumed) = ₱{rerouteSaving}.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0a0a0c] border border-dashed border-white/15 text-[11px] text-slate-400 space-y-1">
                  <div className="font-bold text-slate-200">Getting {SHARED_ORDER_NUMBER} onto the run</div>
                  <div>1. Tab 1: place the order. 2. Tab 3: Pack & Ship. 3. Phone → Start delivery run.</div>
                  <div>
                    Current status: <strong className="text-white">{orderState.status.replace(/_/g, ' ')}</strong>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ================================================================
              RIGHT PANEL: PERSISTENT MOBILE PHONE SIMULATOR (BUYER VIEW)
              ================================================================ */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            <div className="w-full max-w-[390px] rounded-[2.5rem] bg-[#0c0c0e] p-3 border-[6px] border-[#222226] shadow-2xl relative shrink-0 select-none">
              
              {/* Phone Hardware Notch & Camera Aperture */}
              <div className="w-32 h-4 bg-[#1a1a1e] rounded-b-xl mx-auto mb-2 flex items-center justify-center gap-1.5">
                <div className="w-10 h-1 rounded-full bg-slate-700/80" />
                <div className="w-2 h-2 rounded-full bg-slate-800" />
              </div>

              {/* Mobile Viewport Screen */}
              <div className="bg-[#F8F8F8] text-slate-900 rounded-[1.8rem] overflow-hidden shadow-inner border border-slate-300/80 flex flex-col min-h-[610px] justify-between relative font-sans">
                
                {/* ------------------------------------------------------------
                    PHONE CONTENT A: TAB 1 PRE-CHECKOUT CHECKOUT PAGE
                    ------------------------------------------------------------ */}
                {activeTab === 'tab1_pre' && (
                  <div className="flex flex-col h-full justify-between animate-in fade-in duration-200">
                    <div className="overflow-y-auto max-h-[500px]">
                      
                      {/* Top Status & App Bar */}
                      <div className="bg-white px-4 py-3 border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700 font-bold text-sm">←</span>
                          <span className="font-extrabold text-sm text-slate-900">Order Summary</span>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#010101] text-white tiktok-glitch-badge">
                          COD RISK: {calculation.finalScore}%
                        </span>
                      </div>

                      {/* TikTok Shop Mall Badge */}
                      <div className="bg-gradient-to-r from-[#FE2C55]/10 to-[#25F4EE]/10 px-4 py-1.5 border-b border-slate-200/60 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1 text-[#FE2C55] font-extrabold">
                          <Store className="w-3.5 h-3.5" />
                          <span>TikTok Shop Mall</span>
                          <span className="text-[9px] bg-[#FE2C55] text-white px-1 rounded font-bold ml-1">100% Authentic</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">Free Returns</span>
                      </div>

                      {/* Address */}
                      <div className="bg-white px-4 py-2 border-b border-slate-100 flex items-start gap-2 text-xs">
                        <MapPin className="w-4 h-4 text-[#FE2C55] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-800 flex justify-between">
                            <span>Juan Dela Cruz</span>
                            <span className="text-slate-500 font-mono text-[11px]">+63 917 ••• 8421</span>
                          </div>
                          <div className="text-slate-500 text-[11px] truncate">
                            {currentRegionObj.label} • {currentSpeedObj.label} via {currentCourierObj.label}
                          </div>
                          {/* Platform annotation: routing is a platform-cost lever with no buyer-facing UI. */}
                          <div className="mt-1 text-[9px] font-mono text-slate-400 border-t border-dashed border-slate-200 pt-1">
                            {tierId >= 3
                              ? `Platform override: ${currentCourierObj.label} → ${routedCourier.label} (${routedCourier.actualRate} failure rate) · not shown to buyer`
                              : `Routed to ${routedCourier.label} — ${routedCourier.actualRate} failure rate`}
                          </div>
                        </div>
                      </div>

                      {/* Voucher Section */}
                      <div className="mx-3 mt-2 p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-rose-50 border border-emerald-200 space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-slate-800 flex items-center gap-1">
                          <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Vouchers</span>
                        </span>
                        <div className="flex items-center justify-between bg-white/90 p-1.5 rounded-lg border border-emerald-200 text-xs">
                          <span className="font-bold text-[11px] text-emerald-900">Free Shipping Voucher</span>
                          {shipping === 0 ? (
                            <span className="text-[10px] font-bold text-slate-500">Shipping already free</span>
                          ) : voucherUnlocked ? (
                            <span className="text-[10px] font-black text-emerald-700">-₱{shippingVoucher}.00</span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> After deposit or pay-now
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between bg-white/90 p-1.5 rounded-lg border border-rose-200 text-xs">
                          <span className="font-bold text-[11px] text-[#FE2C55]">Pay-Now Saving (Tier {tierId})</span>
                          <span className={`text-[10px] font-black ${prepaidBeforeDelivery ? 'text-[#FE2C55]' : 'text-slate-500'}`}>
                            {prepaidBeforeDelivery ? `-₱${prepaidIncentive}.00` : `Save ₱${prepaidIncentive} with GCash/Maya`}
                          </span>
                        </div>
                      </div>

                      {/* Product Card */}
                      <div className="bg-white p-3 mx-3 mt-2 rounded-xl border border-slate-200 flex gap-2.5 items-center">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-5 h-5 text-[#FE2C55]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-black text-[#FE2C55] uppercase flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5" /> Flash Deal
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-900 truncate">{currentProduct.title}</div>
                          {selections.category === 'fashion_apparel' && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {['True to size', 'Runs small in shoulders', ...(calculation.listingAdjustment !== 0 ? ['📏 Size chart in cm'] : [])].map((tag) => (
                                <span key={tag} className="text-[8px] font-bold px-1 py-px rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-0.5">
                            <span className="text-xs font-black text-[#FE2C55]">₱{currentProduct.price.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-500">Qty: 1</span>
                          </div>
                        </div>
                      </div>

                      {/* Tier Dynamic Gate Banner */}
                      <div className="px-3 mt-2">
                        <div className={`p-2.5 rounded-xl border text-xs ${calculation.tier.theme.mobileBannerBg}`}>
                          <div className="font-extrabold text-[11px] uppercase flex items-center gap-1">
                            <span>{calculation.tier.emoji}</span>
                            <span>{calculation.tier.uiState}</span>
                          </div>
                          <p className="text-[10px] mt-0.5 font-medium leading-snug">{calculation.tier.copy}</p>
                        </div>
                      </div>

                      {/* Payment Methods: Tier 4 shows prepaid first, COD still selectable beneath.
                          Locked once placed; later changes happen post-checkout (Tabs 2 and 4). */}
                      <fieldset disabled={orderPlaced} className="px-3 mt-2 space-y-2">
                        {tierId === 4 ? (
                          <>
                            {prepaidOption}
                            {codOption}
                          </>
                        ) : (
                          <>
                            {codOption}
                            {prepaidOption}
                          </>
                        )}
                      </fieldset>
                    </div>

                    {/* Sticky Bottom Bill */}
                    <div className="bg-white border-t border-slate-200 p-3 space-y-2 sticky bottom-0 z-20">
                      <div className="space-y-0.5 text-[10px] text-slate-600">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="font-mono">₱{subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span className="font-mono">₱{shipping}</span>
                        </div>
                        {appliedVoucher > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>Free-shipping voucher</span>
                            <span className="font-mono">-₱{appliedVoucher}</span>
                          </div>
                        )}
                        {appliedIncentive > 0 && (
                          <div className="flex justify-between text-[#FE2C55]">
                            <span>Pay-now saving</span>
                            <span className="font-mono">-₱{appliedIncentive}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>Order total</span>
                          <span className="font-mono">₱{totalOrderAmount}</span>
                        </div>
                        {depositCredit > 0 && (
                          <div className="flex justify-between text-orange-700">
                            <span>Refundable deposit paid</span>
                            <span className="font-mono">-₱{depositCredit}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between text-xs font-black text-slate-900 pt-1 border-t border-slate-100">
                        <span>Amount to Collect at Door</span>
                        <span className="text-sm font-mono text-[#FE2C55]">₱{amountDueAtDoor}</span>
                      </div>

                      {!orderPlaced ? (
                        <button
                          disabled={!isCheckoutReady}
                          onClick={() => patchOrder({ status: 'confirmed', scoredListingAdjustment: liveListingAdjustment })}
                          className={`w-full py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                            isCheckoutReady ? calculation.tier.theme.buttonBg : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {payingNow
                            ? walletLinked
                              ? `Pay ₱${totalOrderAmount} Now with ${selectedPrepaidWallet.toUpperCase()}`
                              : 'Link a Wallet to Pay Now'
                            : codReady
                              ? tierId === 1
                                ? `Place 1-Click COD Order (₱${amountDueAtDoor})`
                                : `Place COD Order (₱${amountDueAtDoor} due at door)`
                              : codNextStep}
                        </button>
                      ) : (
                        <div className="p-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex justify-between items-center">
                          <span>✓ {payingNow ? 'Prepaid' : 'COD'} {SHARED_ORDER_NUMBER} placed. Track it in Tabs 2–4</span>
                          <button onClick={() => startNewOrder()} className="underline text-[10px] cursor-pointer">Retest</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------
                    PHONE CONTENT B: TAB 2 POST-CHECKOUT MITIGATION SCREENS
                    ------------------------------------------------------------ */}
                {activeTab === 'tab2_post' && (
                  <div className="flex flex-col h-full justify-between animate-in fade-in duration-200 relative">
                    
                    {/* B1. NATIVE TIKTOK PUSH NOTIFICATION SIMULATOR */}
                    {buyerScreenState === 'push_reminder' && (
                      <div className="flex flex-col h-full justify-between p-3 space-y-4">
                        
                        {/* Native Dropped Notification Card */}
                        <div className="p-3.5 rounded-2xl bg-white/95 border border-slate-300 shadow-xl space-y-2.5 animate-in slide-in-from-top-3 duration-300">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <span className="w-4 h-4 rounded-md bg-[#010101] text-white flex items-center justify-center text-[9px] font-black">
                                d
                              </span>
                              <span>TikTok Shop</span>
                            </div>
                            <span>Just now</span>
                          </div>

                          <div>
                            <div className="text-xs font-extrabold text-slate-900">
                              Packing Alert for {activeOrder.orderNumber}
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                              Your {isPrepaid ? 'prepaid' : 'COD'} order (<strong className="text-slate-800">{activeOrder.itemTitle}</strong> — ₱{activeOrder.itemPrice}) is about to be packed by the warehouse. Still want it?
                            </p>
                          </div>

                          {isCancelled ? (
                            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold text-center">
                              Order cancelled. No further action needed.
                            </div>
                          ) : (
                            <div className="space-y-2 pt-1">
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={handleBuyerConfirmPush}
                                  className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Confirm</span>
                                </button>
                                <button
                                  onClick={handleBuyerCancelPush}
                                  className="py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Cancel</span>
                                </button>
                              </div>
                              <button
                                onClick={() => handleConvertToPrepaid('push')}
                                disabled={isPrepaid}
                                className="w-full py-1.5 px-2 rounded-lg bg-[#FE2C55] hover:bg-[#e02449] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:bg-violet-600 disabled:cursor-default"
                              >
                                <Wallet className="w-3.5 h-3.5" />
                                <span>{isPrepaid ? '✓ Paid. ₱0 to collect at door' : `Pay now and save ₱${activePayNowSaving}`}</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Background App Feed Visual Context */}
                        <div className="flex-1 bg-white rounded-2xl p-4 border border-slate-200/80 flex flex-col items-center justify-center text-center space-y-2">
                          <PackageCheck className="w-10 h-10 text-slate-300" />
                          <div className="text-xs font-bold text-slate-700">Order #{activeOrder.orderNumber.replace('Order #', '')} Processing</div>
                          <p className="text-[11px] text-slate-500 max-w-[220px]">
                            24-hr Cooling-off buffer active. Buyer can self-cancel before parcel leaves warehouse.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* B2. TIKTOK SYSTEM INBOX (DELIVERY WINDOW PICKER) */}
                    {buyerScreenState === 'inbox_window' && (
                      <div className="flex flex-col h-full justify-between bg-white">
                        <div>
                          {/* Inbox Header */}
                          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">←</span>
                              <span className="font-extrabold text-sm text-slate-900">TikTok Shop Official Updates</span>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">System</span>
                          </div>

                          {/* Message Content */}
                          <div className="p-4 space-y-3">
                            <div className="p-3.5 rounded-2xl bg-slate-100 text-xs text-slate-800 space-y-2 leading-relaxed">
                              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                <Store className="w-3.5 h-3.5 text-[#FE2C55]" />
                                Logistics Handover Guarantee
                              </p>
                              <p className="text-[11px]">
                                Kumusta Juan! Your parcel for <strong className="text-slate-900">{activeOrder.orderNumber}</strong> is currently in transit.
                                {isPrepaid
                                  ? 'Your order is prepaid. When will you be home to receive your package?'
                                  : `When will you be home to receive your package and pay ₱${collectAtDoor(activeOrder).toLocaleString()} cash?`}
                              </p>
                              <p className="text-[10px] text-slate-500 font-semibold">
                                Select a delivery window to guarantee successful courier dispatch:
                              </p>
                            </div>

                            {/* Interactive Slot Pills */}
                            <div className="space-y-2 pt-1">
                              {[
                                '🌅 Weekday Mornings (8 AM - 12 PM)',
                                '☀️ Weekday Afternoons (1 PM - 5 PM)',
                                '📦 Weekends (Anytime Saturday/Sunday)',
                              ].map((slot) => {
                                const isPicked = activeOrder.windowSelected === slot;
                                return (
                                  <button
                                    key={slot}
                                    onClick={() => handleSelectDeliveryWindow(slot)}
                                    disabled={isCancelled}
                                    className={`w-full disabled:opacity-40 disabled:cursor-not-allowed p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                                      isPicked
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-400'
                                        : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                                    }`}
                                  >
                                    <span>{slot}</span>
                                    {isPicked && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                  </button>
                                );
                              })}
                              <button
                                onClick={() => handleConvertToPrepaid('inbox')}
                                disabled={isCancelled || isPrepaid}
                                className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between disabled:cursor-default ${
                                  isPrepaid
                                    ? 'bg-violet-50 border-violet-500 text-violet-900'
                                    : 'bg-rose-50 hover:bg-rose-100 border-[#FE2C55]/50 text-[#FE2C55] disabled:opacity-40'
                                }`}
                              >
                                <span>
                                  {isPrepaid
                                    ? '✓ Paid via GCash. Nothing to collect at door'
                                    : `💳 Pay now via GCash and save ₱${activePayNowSaving}`}
                                </span>
                                {isPrepaid && <CheckCircle2 className="w-4 h-4 text-violet-600" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {activeOrder.windowSelected && (
                          <div className="p-3 m-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-[11px] font-bold text-center">
                            ✓ Delivery Window Scheduled: {activeOrder.windowSelected}
                          </div>
                        )}
                      </div>
                    )}

                    {/* B3. COURIER AI WHATSAPP / VIBER SIMULATOR */}
                    {buyerScreenState === 'courier_chat' && (
                      <div className="flex flex-col h-full justify-between bg-[#EFEAE2]">
                        
                        {/* WhatsApp / Viber Style Header */}
                        <div className="bg-[#075E54] text-white px-3.5 py-2.5 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs">←</span>
                            <div className="w-7 h-7 rounded-full bg-white text-[#075E54] font-black text-xs flex items-center justify-center">
                              {activeOrder.courier.split(/[\s&]+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-bold leading-tight flex items-center gap-1">
                                <span>{activeOrder.courier} AI Rider</span>
                                <CheckCircle2 className="w-3 h-3 text-[#25F4EE]" />
                              </div>
                              <div className="text-[9px] text-teal-100">Automated Dispatch Assistant</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.2 rounded">
                            {isPrepaid ? 'PREPAID' : `COD ₱${collectAtDoor(activeOrder).toLocaleString()}`}
                          </span>
                        </div>

                        {/* Chat Messages Log */}
                        <div className="p-3 space-y-2.5 overflow-y-auto max-h-[380px]">
                          {chatMessages.map((msg, i) => (
                            <div
                              key={i}
                              className={`flex flex-col ${msg.sender === 'buyer' ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`max-w-[85%] p-2.5 rounded-xl text-xs shadow-xs leading-relaxed ${
                                  msg.sender === 'buyer'
                                    ? 'bg-[#E1FFC7] text-slate-900 rounded-tr-none'
                                    : 'bg-white text-slate-800 rounded-tl-none'
                                }`}
                              >
                                {msg.text}
                                <div className="text-[8px] text-slate-400 text-right mt-1 font-mono">{msg.time}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Interactive Quick Reply Pills */}
                        <div className="p-2.5 bg-white border-t border-slate-200 space-y-1.5">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 text-center">
                            Select Quick Action Reply:
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <button
                              onClick={() => handleCourierReply('yes')}
                              disabled={isCancelled}
                              className="disabled:opacity-40 disabled:cursor-not-allowed py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>{isPrepaid ? '👍 Yes, I am home' : '👍 Yes, Home with Cash'}</span>
                            </button>

                            <button
                              onClick={() => handleCourierReply('reschedule')}
                              disabled={isCancelled}
                              className="disabled:opacity-40 disabled:cursor-not-allowed py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Clock className="w-3 h-3" />
                              <span>📅 Reschedule to Tomorrow</span>
                            </button>

                            <button
                              onClick={() => handleConvertToPrepaid('chat')}
                              disabled={isCancelled || isPrepaid}
                              className="disabled:opacity-40 disabled:cursor-not-allowed py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Wallet className="w-3 h-3" />
                              <span>{isPrepaid ? '✓ Paid via GCash' : '💳 Pay now via GCash'}</span>
                            </button>

                            <button
                              onClick={() => handleCourierReply('cancel')}
                              disabled={isCancelled}
                              className="disabled:opacity-40 disabled:cursor-not-allowed py-1.5 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              <span>{isPrepaid ? '🚫 Cancel Order' : '🚫 Cancel COD Order'}</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Idle Default View */}
                    {buyerScreenState === 'idle' && (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-white">
                        <PackageCheck className="w-12 h-12 text-emerald-500" />
                        <div className="text-sm font-bold text-slate-900">Buyer Telemetry Synchronized</div>
                        <p className="text-xs text-slate-500 max-w-[240px]">
                          Select a dispatcher action on the left (Cooling Off, Window Picker, or Courier AI) to trigger real-time simulations.
                        </p>
                      </div>
                    )}

                  </div>
                )}

                {/* ------------------------------------------------------------
                    PHONE CONTENT C: TAB 3 SELLER APP — LISTING QUALITY GATE
                    ------------------------------------------------------------ */}
                {activeTab === 'tab3_seller' && (
                  <div className="flex flex-col h-full bg-white animate-in fade-in duration-200">
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">Seller Center · Edit Listing</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Quality Gate</span>
                    </div>
                    <div className="p-3 space-y-2.5 overflow-y-auto max-h-[540px]">
                      <div className="grid grid-cols-2 gap-1.5">
                        {(Object.keys(LISTING_CASE) as GatedCategory[]).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setListingCategory(cat)}
                            className={`py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ${
                              listingCategory === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300'
                            }`}
                          >
                            {LISTING_CASE[cat].label}
                          </button>
                        ))}
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-xs font-bold text-slate-900 truncate">{MOCK_PRODUCTS[listingCategory].title}</div>
                        <div className="text-[10px] text-slate-500">
                          {LISTING_CASE[listingCategory].share} of orders · {LISTING_CASE[listingCategory].failure} failure rate
                        </div>
                        <p className="text-[10px] text-slate-600 italic leading-snug">“{LISTING_CASE[listingCategory].driver}”</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-emerald-900">
                          <span>Predicted failure contribution</span>
                          <span className="font-mono">
                            {categoryModifier(listingCategory) >= 0 ? '+' : ''}{categoryModifier(listingCategory)} →{' '}
                            {projectedContribution(listingCategory) >= 0 ? '+' : ''}{projectedContribution(listingCategory).toFixed(1)} pts
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-emerald-200 overflow-hidden">
                          <div className="h-full bg-emerald-600 transition-all" style={{ width: `${listingDone[listingCategory] * 100}%` }} />
                        </div>
                        <div className="text-[9px] text-emerald-800">
                          {Math.round(listingDone[listingCategory] * 100)}% complete · reduction size is an assumption
                        </div>
                      </div>

                      {listingCategory === 'fashion_apparel' ? (
                        <div className="space-y-1">
                          <div className="text-[11px] font-bold text-slate-800">Size chart (cm), required for every size</div>
                          <div className="grid grid-cols-[2rem_1fr_1fr] gap-1 items-center text-[10px]">
                            <span />
                            <span className="font-bold text-slate-500">Chest</span>
                            <span className="font-bold text-slate-500">Length</span>
                            {LISTING_SIZES.map((size) => (
                              <React.Fragment key={size}>
                                <span className="font-bold text-slate-700">{size}</span>
                                {(['chest', 'length'] as const).map((field) => (
                                  <input
                                    key={field}
                                    inputMode="decimal"
                                    placeholder="cm"
                                    value={listing.apparelSizes[size][field]}
                                    onChange={(e) => setApparelField(size, field, e.target.value)}
                                    className={`w-full px-2 py-1 rounded border text-xs font-mono ${
                                      Number(listing.apparelSizes[size][field]) > 0 ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300'
                                    }`}
                                  />
                                ))}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button
                            onClick={() => setListing((prev) => ({ ...prev, refurbPhoto: !prev.refurbPhoto, refurbPublished: false }))}
                            className={`w-full p-2 rounded-xl border-2 border-dashed text-[11px] font-bold cursor-pointer ${
                              listing.refurbPhoto ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-300 text-slate-600'
                            }`}
                          >
                            {listing.refurbPhoto ? '✓ Photo of actual unit attached (IMG_2041.jpg)' : '📷 Add photo of the actual unit (required)'}
                          </button>
                          <div className="text-[11px] font-bold text-slate-800">Condition grade (required)</div>
                          {REFURB_GRADES.map((g) => (
                            <button
                              key={g.id}
                              onClick={() => setListing((prev) => ({ ...prev, refurbGrade: g.id, refurbPublished: false }))}
                              className={`w-full p-2 rounded-lg border text-left cursor-pointer ${
                                listing.refurbGrade === g.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-white'
                              }`}
                            >
                              <div className="text-[11px] font-bold text-slate-900">Grade {g.id}</div>
                              <div className="text-[9px] text-slate-500 leading-snug">{g.criteria}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-auto p-3 border-t border-slate-200">
                      <button
                        onClick={() => handlePublishListing(listingCategory)}
                        disabled={listingDone[listingCategory] < 1 || listingPublished[listingCategory]}
                        className="w-full py-2.5 rounded-xl text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
                      >
                        {listingPublished[listingCategory]
                          ? '✓ Published'
                          : listingDone[listingCategory] < 1
                            ? 'Complete required fields to publish'
                            : 'Publish Listing'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------
                    PHONE CONTENT D: TAB 4 RIDER APP — ACTIVE DELIVERY
                    No risk tier or score is shown to the rider.
                    ------------------------------------------------------------ */}
                {activeTab === 'tab4_courier' && (
                  <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-200">
                    <div className="bg-violet-700 text-white px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-extrabold">{sharedOrder.assignedCourier} · Rider App</div>
                        <div className="text-[9px] text-violet-200">Rider Juan · Plate #ND-8421</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[8px] uppercase text-violet-200 font-bold">Cash carried</div>
                        <div className="text-xs font-mono font-black">₱{cashCarried.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="p-3 space-y-2.5">
                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-slate-500">Next stop</span>
                          <span className="text-[10px] font-mono text-slate-500">{SHARED_ORDER_NUMBER}</span>
                        </div>
                        <div className="text-sm font-extrabold text-slate-900">{SHARED_BUYER_NAME}</div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-violet-600" /> 14 Mabini St., {currentRegionObj.label}
                        </div>
                        <div className="text-[11px] text-slate-600 truncate">{sharedOrder.product.title}</div>
                        <div className={`text-[11px] font-bold flex items-center gap-1 ${
                          orderState.windowSelected || orderState.pickupSelected ? 'text-emerald-700' : orderState.intentConfirmed ? 'text-amber-700' : 'text-rose-700'
                        }`}>
                          <UserCheck className="w-3 h-3" /> Buyer: {riderBuyerStatus}
                        </div>
                      </div>

                      <div className={`p-3 rounded-xl border-2 ${payingNow ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-violet-300'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-slate-500">Amount to collect</span>
                          {payingNow && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-600 text-white">PREPAID — no cash</span>
                          )}
                        </div>
                        <div className={`text-2xl font-black font-mono ${payingNow ? 'text-emerald-700' : 'text-slate-900'}`}>
                          ₱{sharedOrder.collectAtDoor.toLocaleString()}.00
                        </div>
                        {orderState.attemptCount > 0 && (
                          <div className="text-[10px] font-bold text-rose-700">Failed attempts: {orderState.attemptCount}</div>
                        )}
                      </div>

                      {orderState.status === 'awaiting_confirmation' || orderState.status === 'confirmed' || orderState.status === 'packed' ? (
                        <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 text-center">
                          {orderState.status === 'awaiting_confirmation'
                            ? 'Not ordered yet: place the order in Tab 1.'
                            : 'Waiting for the seller to Pack & Ship in Tab 3.'}
                        </div>
                      ) : orderState.status === 'in_transit' ? (
                        <button
                          onClick={handleStartRun}
                          className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-extrabold cursor-pointer"
                        >
                          🛵 Start delivery run
                        </button>
                      ) : orderState.status === 'out_for_delivery' ? (
                        <div className="space-y-1.5">
                          {!payingNow && (
                            qrOpen ? (
                              <div className="p-2.5 rounded-xl bg-white border border-slate-300 flex items-center gap-3">
                                <div className="grid grid-cols-7 gap-px w-16 h-16 shrink-0" aria-label="QR code placeholder">
                                  {Array.from({ length: 49 }, (_, i) => (
                                    <span key={i} className={(i * 7 + (i % 5) * 3) % 3 === 0 || [0, 6, 42, 48].includes(i) ? 'bg-slate-900' : 'bg-white'} />
                                  ))}
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="text-[10px] text-slate-600">Buyer scans to pay ₱{sharedOrder.collectAtDoor.toLocaleString()} via GCash/Maya</div>
                                  <button
                                    onClick={handleQrPaid}
                                    className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                                  >
                                    Payment received
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setQrOpen(true)}
                                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                              >
                                📱 Collect via QR
                              </button>
                            )
                          )}
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={handleMarkDelivered}
                              className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                            >
                              ✓ Mark delivered
                            </button>
                            <button
                              onClick={handleAttemptFailed}
                              className="py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                            >
                              ✗ Attempt failed
                            </button>
                          </div>
                          {orderState.attemptCount >= REROUTE_MIN_ATTEMPTS ? (
                            <button
                              onClick={handleReroute}
                              className="w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer"
                            >
                              📍 Re-route to pickup point (saves ₱{rerouteSaving} net)
                            </button>
                          ) : orderState.attemptCount === 1 ? (
                            <div className="text-[10px] text-slate-500 text-center">Re-attempt first. Pickup re-route unlocks after a 2nd failed attempt.</div>
                          ) : null}
                        </div>
                      ) : (
                        <div className={`p-2.5 rounded-xl text-[11px] font-bold text-center ${
                          orderState.status === 'cancelled' ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        }`}>
                          {orderState.status === 'delivered'
                            ? `✓ Delivered${payingNow ? '' : ` · ₱${sharedOrder.collectAtDoor.toLocaleString()} cash collected`}`
                            : orderState.status === 'at_pickup_point'
                              ? '📍 Parcel moved to pickup point. Buyer notified to collect.'
                              : 'Order cancelled. Return parcel to hub.'}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Persistent Right Panel Helper Note */}
            <div className="mt-3 text-[11px] text-slate-400 font-mono text-center">
              Active Simulator Mode: <strong className="text-white">{activeTab === 'tab1_pre' ? 'Buyer Checkout' : activeTab === 'tab2_post' ? `Buyer Post-Checkout (${buyerScreenState})` : activeTab === 'tab3_seller' ? 'Seller App: Listing Gate' : 'Rider App'}</strong>
            </div>

          </div>

        </div>
      </main>

      {/* Enterprise Executive Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
          <span className="font-bold text-white">TikTok Shop Philippines' Cash on Delivery (COD) Dilemma</span>
          <span className="text-white/20 hidden sm:inline">•</span>
          <span className="text-slate-300">Engineered by <strong className="text-white font-extrabold text-[#25F4EE]">Joes and the Mars</strong></span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span>Dual-Layer Risk Architecture</span>
          <span className="text-[#FE2C55] font-extrabold bg-[#FE2C55]/10 px-2 py-0.5 rounded border border-[#FE2C55]/30">Team: Joes and the Mars</span>
        </div>
      </footer>

    </div>
  );
}

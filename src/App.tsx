import React, { useState, useMemo, useEffect } from 'react';
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
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25',
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
      buttonBg: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-amber-500/25',
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
      buttonBg: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/25',
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
  status: 'Pending Warehouse Packing' | 'Dispatched & In Transit' | 'Out for Delivery' | 'Order Cancelled' | 'Confirmed for Delivery';
  activeMitigation: 'none' | 'reminder_sent' | 'window_locked' | 'ai_dispatched';
  windowSelected?: string;
}

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
    status: 'Pending Warehouse Packing',
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
    status: 'Dispatched & In Transit',
    activeMitigation: 'none',
  },
  {
    id: 'ord-743',
    orderNumber: 'Order #743',
    buyerName: 'Princess Mae D.',
    itemTitle: 'Refurbished Mini Projector',
    itemPrice: 1850,
    region: 'Mindanao (Davao)',
    riskScore: 68,
    riskTier: 4,
    riskReason: 'Critical Remote Route Anomaly',
    courier: 'Fast Express',
    status: 'Out for Delivery',
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
    riskReason: 'Short Video Video Link Impulse',
    courier: 'A&B Express',
    status: 'Pending Warehouse Packing',
    activeMitigation: 'none',
  },
];

/* ==========================================================================
   MAIN COMPONENT: COD OPTIMIZATION COMMAND CENTER
   ========================================================================== */

export default function App(): React.JSX.Element {
  // Navigation: Tab 1 vs Tab 2
  const [activeTab, setActiveTab] = useState<'tab1_pre' | 'tab2_post'>('tab1_pre');
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  /* --------------------------------------------------------------------------
     TAB 1 STATE: PRE-CHECKOUT ML ENGINE
     -------------------------------------------------------------------------- */
  const [selections, setSelections] = useState<Record<string, string>>(DEFAULT_SELECTIONS);
  const [otpInput, setOtpInput] = useState<string>('4829');
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [depositPaid, setDepositPaid] = useState<boolean>(false);
  const [selectedPrepaidWallet, setSelectedPrepaidWallet] = useState<'gcash' | 'maya'>('gcash');
  const [orderSubmitted, setOrderSubmitted] = useState<boolean>(false);
  const [abMode, setAbMode] = useState<'with_ml' | 'without_ml'>('with_ml');

  useEffect(() => {
    setOtpVerified(false);
    setDepositPaid(false);
    setOrderSubmitted(false);
  }, [selections]);

  const calculation = useMemo(() => {
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
    const rawScore = BASE_FAILURE_RATE + sumModifiers;
    const finalScore = Math.max(0, Math.min(100, rawScore));

    let tierId: 1 | 2 | 3 | 4 = 1;
    if (finalScore >= 56) tierId = 4;
    else if (finalScore >= 46) tierId = 3;
    else if (finalScore >= 35) tierId = 2;
    else tierId = 1;

    return {
      breakdown,
      sumModifiers,
      rawScore,
      finalScore,
      tier: TIER_CONFIGS[tierId],
    };
  }, [selections]);

  const currentProduct = MOCK_PRODUCTS[selections.category] ?? MOCK_PRODUCTS.elec_refurb;
  const currentRegionObj = DIMENSIONS.region.options.find((r) => r.id === selections.region) ?? DIMENSIONS.region.options[0];
  const currentSpeedObj = DIMENSIONS.speed.options.find((s) => s.id === selections.speed) ?? DIMENSIONS.speed.options[0];
  const currentCourierObj = DIMENSIONS.courier.options.find((c) => c.id === selections.courier) ?? DIMENSIONS.courier.options[0];

  const subtotal = currentProduct.price;
  const shipping = currentProduct.shipping;
  const tier4Discount = calculation.tier.id === 4 ? 20 : 0;
  const totalOrderAmount = subtotal + shipping - tier4Discount;
  const tier3Deposit = 50;
  const tier3CollectOnDelivery = totalOrderAmount - tier3Deposit;

  const isCheckoutReady =
    calculation.tier.id === 1 ||
    (calculation.tier.id === 2 && otpVerified) ||
    (calculation.tier.id === 3 && depositPaid) ||
    calculation.tier.id === 4;

  /* --------------------------------------------------------------------------
     TAB 2 STATE: POST-CHECKOUT MITIGATION (LOGISTICS COMMAND CENTER)
     -------------------------------------------------------------------------- */
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>(INITIAL_PENDING_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ord-882');
  const [buyerScreenState, setBuyerScreenState] = useState<'idle' | 'push_reminder' | 'inbox_window' | 'courier_chat'>('push_reminder');
  
  // Dynamic Impact Metrics
  const [logisticsSaved, setLogisticsSaved] = useState<number>(1430);
  const [rtsDeflectedCount, setRtsDeflectedCount] = useState<number>(9);
  const [windowsLockedCount, setWindowsLockedCount] = useState<number>(14);
  const [mitigationToast, setMitigationToast] = useState<string | null>(null);

  // Chat conversation state for the Courier AI WhatsApp simulator
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'buyer'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Magandang araw! 👋 This is Fast Express AI Dispatcher. Your COD parcel (₱800.00) is scheduled for delivery today between 1:00 PM – 3:00 PM. Will someone be home with the exact cash amount?',
      time: '12:45 PM',
    },
  ]);

  const activeOrder = useMemo(() => {
    return pendingOrders.find((o) => o.id === selectedOrderId) ?? pendingOrders[0];
  }, [pendingOrders, selectedOrderId]);

  // Dispatcher Actions
  const handleTriggerPushReminder = () => {
    setBuyerScreenState('push_reminder');
    setPendingOrders((prev) =>
      prev.map((o) => (o.id === selectedOrderId ? { ...o, activeMitigation: 'reminder_sent' } : o))
    );
    showToast('24-Hour Cooling Off Push Notification dispatched to buyer.');
  };

  const handleTriggerWindowPicker = () => {
    setBuyerScreenState('inbox_window');
    setPendingOrders((prev) =>
      prev.map((o) => (o.id === selectedOrderId ? { ...o, activeMitigation: 'window_locked' } : o))
    );
    showToast('Delivery Window Picker message sent to TikTok System Inbox.');
  };

  const handleTriggerCourierAI = () => {
    setBuyerScreenState('courier_chat');
    setPendingOrders((prev) =>
      prev.map((o) => (o.id === selectedOrderId ? { ...o, activeMitigation: 'ai_dispatched' } : o))
    );
    showToast('Courier AI WhatsApp/Viber outreach dispatched to buyer mobile.');
  };

  // Helper toast notification
  const showToast = (msg: string) => {
    setMitigationToast(msg);
    setTimeout(() => setMitigationToast(null), 3500);
  };

  // Buyer Interaction Handlers (Connected State Management)
  const handleBuyerConfirmPush = () => {
    setPendingOrders((prev) =>
      prev.map((o) => (o.id === selectedOrderId ? { ...o, status: 'Confirmed for Delivery' } : o))
    );
    showToast('Buyer Confirmed COD Order: Pack & dispatch authorized!');
    setBuyerScreenState('idle');
  };

  const handleBuyerCancelPush = () => {
    setPendingOrders((prev) =>
      prev.map((o) => (o.id === selectedOrderId ? { ...o, status: 'Order Cancelled' } : o))
    );
    setLogisticsSaved((prev) => prev + 130);
    setRtsDeflectedCount((prev) => prev + 1);
    showToast('🚨 Buyer cancelled COD order prior to packing! +₱130 Forward Freight Saved.');
    setBuyerScreenState('idle');
  };

  const handleSelectDeliveryWindow = (windowLabel: string) => {
    setPendingOrders((prev) =>
      prev.map((o) => (o.id === selectedOrderId ? { ...o, windowSelected: windowLabel } : o))
    );
    setWindowsLockedCount((prev) => prev + 1);
    showToast(`✓ Buyer selected window: ${windowLabel}. Handover guaranteed.`);
  };

  const handleCourierReply = (action: 'yes' | 'reschedule' | 'cancel') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (action === 'yes') {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'buyer', text: 'Yes, I am home with exact cash! 👍', time },
        { sender: 'bot', text: 'Maraming salamat! Rider Juan (Plate #ND-8421) is 15 mins away. See you!', time },
      ]);
      setPendingOrders((prev) =>
        prev.map((o) => (o.id === selectedOrderId ? { ...o, status: 'Confirmed for Delivery' } : o))
      );
      showToast('Doorstep delivery confirmed with exact cash.');
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
        { sender: 'buyer', text: 'Please cancel my COD order. I am no longer interested.', time },
        { sender: 'bot', text: 'Understood. Order #882 has been cancelled before rider arrival. RTS trip deflected.', time },
      ]);
      setPendingOrders((prev) =>
        prev.map((o) => (o.id === selectedOrderId ? { ...o, status: 'Order Cancelled' } : o))
      );
      setLogisticsSaved((prev) => prev + 180);
      setRtsDeflectedCount((prev) => prev + 1);
      showToast('🚨 Courier AI intercepted cancellation! +₱180 Two-Way Freight Saved.');
    }
  };

  return (
    <div className="min-h-screen bg-[#010101] text-slate-100 font-sans selection:bg-[#FE2C55] selection:text-white pb-16">
      
      {/* ====================================================================
          TOP EXECUTIVE COMMAND BAR WITH UNIFIED TAB SWITCHER
          ==================================================================== */}
      <header className="border-b border-white/10 bg-[#121212]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
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

          {/* Master Tab Switcher Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#1F1F23] border border-white/10 self-start md:self-auto shadow-inner">
            <button
              onClick={() => setActiveTab('tab1_pre')}
              className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'tab1_pre'
                  ? 'bg-[#FE2C55] text-white shadow-md shadow-[#FE2C55]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Tab 1: Pre-Checkout ML Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('tab2_post')}
              className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'tab2_post'
                  ? 'bg-[#25F4EE] text-slate-950 shadow-md shadow-[#25F4EE]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tab 2: Post-Checkout Mitigation</span>
            </button>
          </div>

          {/* Executive Context Badge & Modal */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="bg-[#1F1F23] border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#25F4EE] animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">
                  Active PH GMV
                </span>
                <span className="text-xs font-mono font-bold text-white">₱5.79B/mo</span>
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
                  Tab 1 applies an additive 6-dimension ML model on a 60,000+ PH order dataset to dynamically gate checkout.
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
                        onClick={() => setSelections(DEFAULT_SELECTIONS)}
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
                          setSelections(randomSelections);
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
                            onClick={() => setSelections(p.selections)}
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
                            onChange={(e) => setSelections((prev) => ({ ...prev, [dimKey]: e.target.value }))}
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
                      <span className="text-slate-400">=</span>
                      <span className={`px-2 py-0.5 rounded font-bold border ${calculation.tier.theme.badgeBg}`}>
                        {calculation.finalScore}% Final Score ({calculation.tier.name})
                      </span>
                    </div>
                  </div>
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
                        <div className="flex justify-between text-slate-400">
                          <span>Two-Way Courier Return Freight (RTS):</span>
                          <span className="text-[#FE2C55] font-bold">-₱180.00</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Forgone Marketplace Commission (5%):</span>
                          <span className="text-[#FE2C55] font-bold">-₱{Math.round(totalOrderAmount * 0.05)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Packaging & Inventory Delay Cost:</span>
                          <span className="text-[#FE2C55] font-bold">-₱25.00</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-rose-900/50 text-white font-sans">
                          <span>Net Platform Loss per Failed Order:</span>
                          <span className="text-[#FE2C55] text-sm font-black font-mono">
                            -₱{205 + Math.round(totalOrderAmount * 0.05)}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans italic">
                        Without proactive ML gating, this high-risk order enters standard dispatch, resulting in doorstep refusal and guaranteed negative P&L.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-3 rounded-xl bg-[#121216] border border-white/10 space-y-1.5">
                        {calculation.tier.id === 4 ? (
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
                              <span className="text-emerald-400 font-bold">+₱180.00</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-white/10 text-white font-sans">
                              <span>Net Preserved Profit per Converted Order:</span>
                              <span className="text-[#25F4EE] text-sm font-black font-mono">+₱160.00 (+800% ROI)</span>
                            </div>
                          </>
                        ) : calculation.tier.id === 3 ? (
                          <>
                            <div className="flex justify-between text-slate-400">
                              <span>Securing Earnest Deposit Collected:</span>
                              <span className="text-orange-400 font-bold">+₱50.00 (GCash/Maya)</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Impulse Refusal Reduction:</span>
                              <span className="text-emerald-400 font-bold">-85% Refusal Rate</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-white/10 text-white font-sans">
                              <span>Downpayment Offsets Reverse Logistics:</span>
                              <span className="text-orange-400 text-sm font-black font-mono">₱50 Sunk-Cost Locked In</span>
                            </div>
                          </>
                        ) : calculation.tier.id === 2 ? (
                          <>
                            <div className="flex justify-between text-slate-400">
                              <span>Avoided Courier RTS Trip:</span>
                              <span className="text-emerald-400 font-bold">+₱180.00</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>SMS OTP Network Verification Cost:</span>
                              <span className="text-amber-400 font-bold">-₱0.50</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-white/10 text-white font-sans">
                              <span>Net Savings per Deflected Bad Order:</span>
                              <span className="text-emerald-400 text-sm font-black font-mono">+₱179.50 (359x ROI)</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between text-slate-400">
                              <span>Logistics RTS Penalty:</span>
                              <span className="text-emerald-400 font-bold">₱0.00 (Safe Profile)</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Friction Cost:</span>
                              <span className="text-slate-300">₱0.00</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-white/10 text-white font-sans">
                              <span>Full GMV Velocity Captured:</span>
                              <span className="text-emerald-400 text-sm font-black font-mono">100% GMV Protected</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
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
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                      LIVE DISPATCH INTERCEPTION
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-[#0a0a0c] border border-white/10">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Logistics Cost Saved</div>
                      <div className="text-xl font-extrabold font-mono text-emerald-400 mt-1">
                        ₱{logisticsSaved.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Two-way freight preserved</div>
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
                      Trigger proactive customer interventions on the buyer's phone simulator on the right
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Action 1: Cooling-off push */}
                    <button
                      onClick={handleTriggerPushReminder}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
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
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
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
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
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
                      {pendingOrders.length} Pending Orders
                    </span>
                  </div>

                  <div className="space-y-2">
                    {pendingOrders.map((ord) => {
                      const isSelected = ord.id === selectedOrderId;
                      return (
                        <div
                          key={ord.id}
                          onClick={() => setSelectedOrderId(ord.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-[#1F1F23] border-[#25F4EE] ring-1 ring-[#25F4EE]/40'
                              : 'bg-[#0a0a0c] hover:bg-[#1F1F23]/60 border-white/10'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{ord.orderNumber}</span>
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
                              {ord.itemTitle} (₱{ord.itemPrice.toLocaleString()}) • {ord.region} via {ord.courier}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                              ord.status === 'Order Cancelled' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                              ord.status === 'Confirmed for Delivery' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              'bg-white/10 text-slate-300'
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
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
                        </div>
                      </div>

                      {/* Voucher Section: Single vs. Stacked (Tier 4) */}
                      <div className="mx-3 mt-2 space-y-1.5">
                        {calculation.tier.id === 4 ? (
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-rose-50 border border-emerald-300 space-y-1.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-slate-800 flex items-center gap-1">
                                <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                                <span>2 Vouchers Stacked & Applied</span>
                              </span>
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-700 text-white">
                                Non-Cannibalized
                              </span>
                            </div>
                            <div className="flex items-center justify-between bg-white/90 p-1.5 rounded-lg border border-emerald-200 text-xs">
                              <span className="font-bold text-[11px] text-emerald-900">1. Free Shipping Voucher</span>
                              <span className="text-[10px] font-black text-emerald-700">-₱45.00</span>
                            </div>
                            <div className="flex items-center justify-between bg-white/90 p-1.5 rounded-lg border border-rose-200 text-xs">
                              <span className="font-bold text-[11px] text-[#FE2C55]">2. Tier 4 Prepaid GCash Subsidy</span>
                              <span className="text-[10px] font-black text-[#FE2C55]">-₱20.00</span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-emerald-800">
                              <Ticket className="w-4 h-4 text-emerald-600" />
                              <span className="font-bold text-[11px]">Free Shipping Voucher Applied</span>
                            </div>
                            <span className="text-[10px] font-extrabold text-emerald-700">-₱45.00</span>
                          </div>
                        )}
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

                      {/* Payment Methods */}
                      <div className="px-3 mt-2 space-y-2">
                        {calculation.tier.id === 1 && (
                          <div className="p-2.5 rounded-xl bg-emerald-50 border-2 border-emerald-500 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-emerald-600" />
                              <div className="text-xs font-bold text-slate-900">Cash on Delivery (1-Click Ready)</div>
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                        )}

                        {calculation.tier.id === 2 && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border-2 border-amber-400 space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                              <span>Cash on Delivery (SMS OTP Gate)</span>
                              {otpVerified && <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1 rounded">Verified</span>}
                            </div>
                            {!otpVerified ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  maxLength={4}
                                  value={otpInput}
                                  onChange={(e) => setOtpInput(e.target.value)}
                                  className="w-full bg-white border border-amber-300 rounded px-2 py-1 text-xs font-mono font-bold text-center"
                                />
                                <button
                                  onClick={() => setOtpVerified(true)}
                                  className="px-2.5 py-1 rounded bg-slate-900 text-white text-xs font-bold shrink-0 cursor-pointer"
                                >
                                  Verify
                                </button>
                              </div>
                            ) : (
                              <div className="text-[10px] text-emerald-800 flex justify-between">
                                <span>Mobile verified. COD unlocked!</span>
                                <button onClick={() => setOtpVerified(false)} className="underline text-[9px] cursor-pointer">Undo</button>
                              </div>
                            )}
                          </div>
                        )}

                        {calculation.tier.id === 3 && (
                          <div className="p-2.5 rounded-xl bg-orange-50 border-2 border-orange-400 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                              <span className="flex items-center gap-1.5">
                                {depositPaid ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-orange-600" />}
                                <span>Cash on Delivery ({depositPaid ? 'Unlocked' : 'Locked'})</span>
                              </span>
                            </div>
                            {!depositPaid ? (
                              <button
                                onClick={() => setDepositPaid(true)}
                                className="w-full py-1.5 px-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Wallet className="w-3.5 h-3.5" />
                                Pay ₱50 Securing Deposit (GCash)
                              </button>
                            ) : (
                              <div className="text-[10px] text-emerald-900 bg-emerald-100 p-1.5 rounded flex justify-between font-bold">
                                <span>✓ ₱50 Deposit Confirmed</span>
                                <button onClick={() => setDepositPaid(false)} className="underline text-[9px] cursor-pointer">Reset</button>
                              </div>
                            )}
                          </div>
                        )}

                        {calculation.tier.id === 4 && (
                          <div className="space-y-1.5">
                            <div className="p-2 rounded-xl bg-slate-200 border border-slate-300 opacity-60 flex justify-between items-center text-xs">
                              <span className="line-through text-slate-500 font-bold">Cash on Delivery (Disabled)</span>
                              <ShieldOff className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setSelectedPrepaidWallet('gcash')}
                                className={`p-2 rounded-xl border text-left cursor-pointer ${
                                  selectedPrepaidWallet === 'gcash' ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-200'
                                }`}
                              >
                                <div className="text-xs font-extrabold text-blue-700 flex justify-between">
                                  <span>GCash</span>
                                  <span className="text-[8px] bg-[#FE2C55] text-white px-1 rounded">-₱20 OFF</span>
                                </div>
                              </button>
                              <button
                                onClick={() => setSelectedPrepaidWallet('maya')}
                                className={`p-2 rounded-xl border text-left cursor-pointer ${
                                  selectedPrepaidWallet === 'maya' ? 'bg-emerald-50 border-emerald-600' : 'bg-white border-slate-200'
                                }`}
                              >
                                <div className="text-xs font-extrabold text-emerald-800 flex justify-between">
                                  <span>Maya</span>
                                  <span className="text-[8px] bg-[#FE2C55] text-white px-1 rounded">-₱20 OFF</span>
                                </div>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sticky Bottom Bill with Micro-Deposit Math */}
                    <div className="bg-white border-t border-slate-200 p-3 space-y-2 sticky bottom-0 z-20">
                      {calculation.tier.id === 3 ? (
                        <div className="space-y-1 text-[10px]">
                          <div className="flex justify-between text-slate-600">
                            <span>Subtotal: ₱{subtotal} | Shipping: FREE</span>
                          </div>
                          {/* Required Micro-Deposit Deduction Invariant */}
                          <div className="p-1 rounded bg-orange-50 border border-orange-200 text-orange-950 font-mono font-bold text-center">
                            Total: ₱{totalOrderAmount} | Deposit Paid: -₱50 | Amount to Collect at Door: ₱{tier3CollectOnDelivery}
                          </div>
                          <div className="flex justify-between text-xs font-black text-slate-900 pt-1 border-t border-slate-100">
                            <span>Amount to Collect at Door</span>
                            <span className="text-sm font-mono text-[#FE2C55]">₱{tier3CollectOnDelivery}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 text-[11px] text-slate-600">
                          <div className="flex justify-between">
                            <span>Total Payment</span>
                            <span className="text-xs font-black font-mono text-[#FE2C55]">₱{totalOrderAmount}</span>
                          </div>
                        </div>
                      )}

                      {!orderSubmitted ? (
                        <button
                          disabled={!isCheckoutReady}
                          onClick={() => setOrderSubmitted(true)}
                          className={`w-full py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                            isCheckoutReady ? calculation.tier.theme.buttonBg : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {calculation.tier.id === 1 && `Place 1-Click COD Order (₱${totalOrderAmount})`}
                          {calculation.tier.id === 2 && (otpVerified ? `Place Verified COD Order (₱${totalOrderAmount})` : 'Verify OTP Above First')}
                          {calculation.tier.id === 3 && (depositPaid ? `Complete COD Order (₱${tier3CollectOnDelivery} due at door)` : 'Pay ₱50 Deposit Above to Unlock')}
                          {calculation.tier.id === 4 && `Pay Now with ${selectedPrepaidWallet.toUpperCase()} (₱${totalOrderAmount})`}
                        </button>
                      ) : (
                        <div className="p-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex justify-between items-center">
                          <span>✓ Order Confirmed ({calculation.tier.name})!</span>
                          <button onClick={() => setOrderSubmitted(false)} className="underline text-[10px] cursor-pointer">Retest</button>
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
                              Your COD order (<strong className="text-slate-800">{activeOrder.itemTitle}</strong> — ₱{activeOrder.itemPrice}) is about to be packed by the warehouse. Still want it?
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={handleBuyerConfirmPush}
                              className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Confirm Order</span>
                            </button>
                            <button
                              onClick={handleBuyerCancelPush}
                              className="py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cancel Order</span>
                            </button>
                          </div>
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
                                When will you be home to receive your package and pay cash?
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
                                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
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
                              FE
                            </div>
                            <div>
                              <div className="text-xs font-bold leading-tight flex items-center gap-1">
                                <span>Fast Express AI Rider</span>
                                <CheckCircle2 className="w-3 h-3 text-[#25F4EE]" />
                              </div>
                              <div className="text-[9px] text-teal-100">Automated Dispatch Assistant</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.2 rounded">PHP COD</span>
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
                              className="py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>👍 Yes, Home with Cash</span>
                            </button>

                            <button
                              onClick={() => handleCourierReply('reschedule')}
                              className="py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Clock className="w-3 h-3" />
                              <span>📅 Reschedule to Tomorrow</span>
                            </button>

                            <button
                              onClick={() => handleCourierReply('cancel')}
                              className="py-1.5 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              <span>🚫 Cancel COD Order</span>
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

              </div>
            </div>

            {/* Persistent Right Panel Helper Note */}
            <div className="mt-3 text-[11px] text-slate-400 font-mono text-center">
              Active Simulator Mode: <strong className="text-white">{activeTab === 'tab1_pre' ? 'Pre-Checkout Checkout View' : `Post-Checkout (${buyerScreenState})`}</strong>
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

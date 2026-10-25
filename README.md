# TikTok Shop Philippines' Cash on Delivery (COD) Dilemma

[![Team: Joes and the Mars](https://img.shields.io/badge/Team-Joes%20and%20the%20Mars-FE2C55?logo=tiktok&logoColor=white)](https://github.com/sigmund-baybay/Tiktok-ByteDance)
[![Netlify Deploy](https://img.shields.io/badge/Deploy-Netlify-00C7B7?logo=netlify&logoColor=white)](https://www.netlify.com/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x--Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

**COD Optimization Command Center • Engineered by Joes and the Mars**  
*Dual-Layer Architecture: Pre-Checkout Predictive ML Risk Gating & Post-Checkout Reactive Logistics Deflection*

---

## 📌 Executive Summary & Financial Context

In the Philippine e-commerce ecosystem, Cash on Delivery accounts for over 70% of consumer orders. However, high Return-to-Sender (RTS) rates, uncontactable buyers, and impulse remorse from creator livestreams cost marketplaces hundreds of millions in two-way reverse logistics freight:

* **Order Volume:** `5,000,000 orders/day` at `₱800` AOV → **Monthly GMV ≈ `₱120 Billion`**
* **COD Share:** `70%` of orders
* **Platform Baseline COD Failure Rate:** `29.0%`
* **Cost per failed COD order:** `₱70` forward delivery (seller) + `₱50` reverse logistics (platform) + `₱60` cash handling (platform)
  * Platform exposure: **₱110** per failed order (plus 10% forgone commission); seller exposure: **₱70**
* **Reconciliation:** `5,000,000 × 70% × 29% × 30 days × ₱110 ≈ ₱3.35B/month` platform logistics cost (case pack: ₱3.3B)

Risk modifiers are derived from the case pack's stated segment failure rates. Deflection, gate-effect and prepaid-uptake rates used in the in-app unit economics are planning assumptions, shown under a conservative / base / optimistic toggle rather than as a single headline figure.

---

## 📐 Mathematical Formulation

Every transaction begins at the empirical platform baseline failure rate of **29.0%**. As the buyer configures their basket and shipping preferences, 6 independent feature dimensions apply additive percentage modifiers:

$$\text{Final Risk Score} = \text{Clamp}\left(29\% + \sum_{i=1}^{6} M_i,\; 0\%,\; 100\%\right)$$

### Feature Vector Modifier Matrix

| Dimension | Feature Option | Modifier ($M_i$) | Historical Segment Failure Rate |
| :--- | :--- | :---: | :---: |
| **1. Buyer Region** | Metro Manila (NCR) | `-11%` | 18% |
| | Luzon (excl. NCR) | `-3%` | 26% |
| | Visayas | `+3%` | 32% |
| | Mindanao | `+6%` | 35% |
| **2. Buyer Tenure** | < 1 month | `+9%` | 38% |
| | 1–3 months | `+3%` | 32% |
| | 3–6 months | `-2%` | 27% |
| | 6–12 months | `-6%` | 23% |
| | > 12 months | `-11%` | 18% |
| **3. Delivery Speed** | Same-Day | `-17%` | 12% |
| | Next-Day | `-12%` | 17% |
| | Standard (3–5 Days) | `0%` | 29% |
| | Extended (> 5 Days) | `+9%` | 38% |
| **4. Product Category** | Fashion Apparel | `+4%` | 33% |
| | Electronics (New) | `+2%` | 31% |
| | Electronics (Refurb) | `0%` | 29% |
| | Fashion Non-Apparel | `-4%` | 25% |
| | FMCG (Beauty/Grocery) | `-7%` | 22% |
| | Lifestyle / Home | `-11%` | 18% |
| **5. Traffic Scenario** | Creator Livestream | `+3%` | 32% |
| | Seller Self-Livestream | `-5%` | 24% |
| | Short Video (Product Link) | `0%` | 29% |
| | ShopTab (Search & Browse) | `-9%` | 20% |
| **6. Assigned Courier** | A&B Express | `0%` | 29% |
| | Fast Express | `+2%` | 31% |
| | Quick Van | `+4%` | 33% |
| | XYZ Express | `-3%` | 26% |
| | Others (3PL Regional) | `+7%` | 36% |

---

## 🎯 Proactive Choice-Architecture Risk Tiers

Predicted risk is **priced, never used to exclude**. COD stays available at every tier, and every tier has a path that works without a financial account (roughly half of Filipino adults have none).

| | Tier 1 (0–34) | Tier 2 (35–45) | Tier 3 (46–55) | Tier 4 (56+) |
|---|---|---|---|---|
| Banner | Frictionless 1-Click COD | Confirm your order | Secure your order | Pay now, rest easy |
| COD available | Yes | Yes | Yes | Yes |
| Shown first | COD | COD | COD | Prepaid |
| Prepaid incentive | ₱5 | ₱10 | ₱15 | ₱20 |
| SMS OTP + intent confirmation | — | Required | Required | Required |
| Gate: wallet linked | — | — | ₱50 refundable deposit | ₱50 refundable deposit |
| Gate: no wallet | — | — | Delivery window **or** pickup point | Delivery window **and** pickup point |
| Courier routing | Default | Default | Prefer low-failure | Lowest-failure + speed upgrade |
| Free-shipping voucher | Normal | Normal | After deposit / pay-now | After deposit / pay-now |
| Post-checkout | Delivery-day reminder | + 24hr cooling-off | + courier AI outreach | All three, earliest |

* **Wallet status is a routing variable only.** It selects which gate is shown and is never a risk-score modifier.
* **No-wallet gates are hard gates.** The order cannot be placed until they are satisfied, so the no-wallet path is never the lighter option.
* **The ₱50 deposit is refundable.** It is refunded in full if the buyer cancels before dispatch, credited to the order on delivery, and forfeited only after a confirmed refusal to accept, never for buyer-not-at-home or address failures.
* **Tier 2 adds intent confirmation after the OTP.** OTP only proves the number is reachable; the confirmation step targets remorse and absence.

### Outside the ladder: repeat-refuser lock

The only place COD is ever removed. It is triggered by **order history** (two or more confirmed refusals to accept), not by predicted score. It is graduated (1 refusal = warning, 2 = 30-day COD pause, 3+ = 90-day pause) and appealable.

### Post-checkout conversion

The cooling-off push, delivery-window inbox and courier AI chat each offer a **pay-now** option. A conversion sets collect-at-door to ₱0 and saves the ₱60 cash-handling cost whether or not the order would have failed.

---

## 🏗️ Software Architecture & Design Patterns

The repository is built following **SOLID principles** and strict **Separation of Concerns (SoC)**:

```text
├── public/
│   └── favicon.svg                  # TikTok dual-tone vector icon
├── src/
│   ├── types/
│   │   └── riskModel.types.ts       # Strict TS interfaces for Dimensions, Options, Tiers, Presets
│   ├── constants/
│   │   └── riskModifiers.ts         # 29% base rate, 6 dimension dictionaries, stakeholder presets
│   ├── utils/
│   │   └── riskCalculator.ts        # Pure, testable functions for additive scoring, clamping, tier mapping
│   ├── hooks/
│   │   └── useRiskSimulation.ts     # Custom hook encapsulating profile state, presets, OTP & deposit states (not wired into the live app)
│   ├── components/
│   │   ├── layout/
│   │   │   └── TikTokHeader.tsx     # Top bar with TikTok Shop branding, GMV context & formula drawer
│   │   ├── controls/
│   │   │   ├── DimensionSelect.tsx  # Dark-mode dropdown with cyan/pink active indicators
│   │   │   ├── PresetSelector.tsx   # Quick-load buyer persona shortcuts
│   │   │   └── ControlPanel.tsx     # Left panel container with Reset/Randomize & live formula
│   │   └── simulation/
│   │       ├── RiskGauge.tsx        # Animated SVG semi-circular gauge & 4-tier matrix bar
│   │       ├── TierBadge.tsx        # Dynamic choice-architecture status card
│   │       ├── TikTokShopCheckout.tsx # Mobile checkout mockup rendering Tiers 1–4
│   │       ├── FeatureWaterfall.tsx # Normalized feature contribution bar chart
│   │       └── BusinessImpact.tsx   # Unit economics & GMV preservation breakdown
│   ├── App.tsx                      # Composition root combining controls and simulation views
│   ├── main.tsx                     # React application entry point
│   └── index.css                    # Tailwind directives & TikTok glitch utility classes
├── netlify.toml                     # Netlify production build & SPA redirect configuration
├── .gitignore                       # Node, Vite, Netlify, OS ignores
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🎨 TikTok & TikTok Shop PH Design System

* **TikTok Obsidian Dark:** `#010101` (canvas background), `#121212` (sub-surface), `#1F1F23` (elevated cards), with subtle `border-white/10`.
* **TikTok Razzmatazz Pink:** `#FE2C55` (Primary CTA, Flash Deal badges).
* **TikTok Splash Cyan:** `#25F4EE` (Active accents, LIVE pulses, secondary telemetry).
* **Signature Glitch Shadow:** Dual-tone offset shadows (`-1.5px -1.5px #25F4EE, 1.5px 1.5px #FE2C55`) on badges and headers.
* **Authentic Mobile Checkout Viewport:** `#F8F8F8` light canvas, TikTok Shop Mall verified badge, Free Shipping voucher banner, Flash Deal tag, and GCash / Maya e-wallet pills.

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18+ (tested on Node v26)
* npm 9+

### Installation & Local Development

```bash
# Clone the repository
git clone https://github.com/sigmund-baybay/Tiktok-ByteDance.git
cd Tiktok-ByteDance

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build & Type Verification

```bash
# Type check with strict flags & build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Netlify Deployment Guide

This project is configured for **zero-friction Netlify CI/CD** deployment via `netlify.toml`:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "feat: complete TikTok Shop PH Dynamic COD Risk Model"
   git push origin main
   ```
2. **Connect to Netlify:**
   * Go to [Netlify App](https://app.netlify.com/)
   * Click **Add new site** > **Import an existing project** > **GitHub**
   * Select `sigmund-baybay/Tiktok-ByteDance`
   * Build settings are automatically detected from `netlify.toml`:
     * **Build Command:** `npm run build`
     * **Publish Directory:** `dist`
3. **Deploy:** Click **Deploy site**. Build will complete with zero errors.

---

## 👥 Engineering & Design Team
**Joes and the Mars**  
*TikTok Shop Philippines E-Commerce Operations, Applied ML, and Frontend Architecture*

---

## 📄 License
Internal Prototype for TikTok / ByteDance E-Commerce Engineering & Data Science teams. Presented by **Joes and the Mars**.

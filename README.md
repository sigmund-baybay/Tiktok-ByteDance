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

* **Monthly Philippine GMV:** `₱5.79 Billion`
* **Monthly Order Volume:** `12.4 Million Orders`
* **Platform Baseline COD Failure Rate:** `29.0%`
* **Capital at Risk:** `₱1.68 Billion monthly GMV exposed to RTS`
* **Target Recovery:** `₱420 Million+ preserved` through proactive dynamic checkout gates

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

Rather than treating COD as a binary yes/no gate, the engine categorizes scores into 4 graduated behavioral tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│  Tier 1: 0% – 34%   │ 🟢 Low Risk      │ Frictionless 1-Click COD       │
│  Tier 2: 35% – 45%  │ 🟡 Medium Risk   │ SMS OTP Intent Verification    │
│  Tier 3: 46% – 55%  │ 🟠 High Risk     │ ₱50 Earnest Deposit (GCash)    │
│  Tier 4: 56%+       │ 🔴 Critical Risk │ COD Disabled + ₱20 Prepaid Off │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Tier 1: Low Risk (0% – 34%) — Frictionless 1-Click COD**
   * *Mechanism:* High-trust buyers with low risk receive zero friction. 1-click checkout maximizes GMV velocity while keeping failure rate at ~18%.
2. **Tier 2: Medium Risk (35% – 45%) — Intent Confirmation (SMS OTP)**
   * *Mechanism:* Sends a 4-digit verification code to the registered mobile number. Weeds out bots, burner numbers, and typo-ridden contact details before parcel dispatch.
3. **Tier 3: High Risk (46% – 55%) — Quick Downpayment (Earnest Money)**
   * *Mechanism:* Padlocks the COD option until a non-refundable **₱50 micro-deposit** is paid via GCash or Maya. Breaks the impulsive livestream purchase loop and offsets return freight costs if refused.
4. **Tier 4: Critical Risk (56%+) — Pay Now, Rest Easy (COD Disabled)**
   * *Mechanism:* COD is completely disabled for extreme-risk route/buyer combinations. Rather than losing the customer, a **₱20 discount incentive** is offered to convert them to prepaid GCash or Maya.

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
│   │   └── useRiskSimulation.ts     # Custom hook encapsulating profile state, presets, OTP & deposit states
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

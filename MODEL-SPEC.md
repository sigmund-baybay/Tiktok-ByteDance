# MODEL-SPEC — What the Code Actually Does

Extracted from source at commit `af25765`. The README was **not** used as a source; where it disagrees with the code, the code is documented and the disagreement is noted.

**Citation convention.** Paths are relative to `src/` unless they start with `test/` or are root files (`README.md`, `index.html`). `App.tsx:457` means `src/App.tsx` line 457.

---

## 0. Read This First: Two Copies of the Model, Only One Is Live

The repo contains **two independent implementations** of the same model:

| | **Live (rendered)** | **Unwired (not rendered)** |
|---|---|---|
| Entry | `main.tsx:4` imports only `App.tsx` | — |
| Model constants | Declared inline: `App.tsx:41–316` | `constants/riskModifiers.ts` |
| Score calculation | Inline `useMemo`: `App.tsx:419–448` | `utils/riskCalculator.ts:48–77` |
| State / pricing | Inline: `App.tsx:405–466` | `hooks/useRiskSimulation.ts` |
| UI | Inline JSX in `App.tsx` | `components/**` (9 files) |
| Tested by `npm test` | **No** | Yes (`test/verifyRiskModel.ts:1–11`) |

`App.tsx` has no relative imports. Its only imports are `react` and `lucide-react` (`App.tsx:1–35`). Nothing under `components/`, `hooks/`, `constants/` or `utils/` is reachable from `main.tsx`. They are imported only by each other and by the test.

The two copies have **numerically identical** modifiers, failure rates, thresholds and product prices (checked with a diff of the option literals). They differ in some **labels** (§2.2), in tier `buttonBg` class strings (`App.tsx:211` vs `constants/riskModifiers.ts:189`), and the unwired UI shows different financial figures from the live UI (§3, §7).

Unless a section says otherwise, everything below describes the **live** `App.tsx`.

---

## 1. FEATURE INVENTORY

The app has two tabs, chosen by a header toggle (`App.tsx:399`, `625–649`). The default tab is Tab 1 (`App.tsx:399`). A phone simulator on the right shows different content depending on the tab (`App.tsx:1236`, `1492`).

### 1A. Global (both tabs)

| Feature | What it does | Implemented in | Logic |
|---|---|---|---|
| Tab switcher | Switches between `tab1_pre` and `tab2_post`. Both tabs' state lives on `App`, so it survives switching. | `App` | `App.tsx:399`, `626–648` |
| GMV badge | Shows the static text "Active PH GMV ₱5.79B/mo". Visible only at `lg` width and up (`hidden lg:flex`). | `App` | `App.tsx:652–661` |
| Spec drawer | "Spec" button toggles a drawer with static architecture text, including the claim "60,000+ PH order dataset". Shown only at `lg` width and up. | `App` | `App.tsx:663–697` |
| Toast | One toast slot. Clears 3.5 s after it's set. | `App` | `App.tsx:479`, `520–523`, `701–708` |
| Simulator mode caption | "Active Simulator Mode: …" below the phone | `App` | `App.tsx:1709–1711` |

### 1B. Pre-checkout (Tab 1: "Pre-Checkout ML Engine")

| Feature | What it does | Implemented in | Logic |
|---|---|---|---|
| 6 dimension selects | One `<select>` per dimension. Each shows the selected option's modifier badge and its "Fail: X%" segment rate. | `App` | `App.tsx:799–840`; state update `823` |
| Reset | Restores `DEFAULT_SELECTIONS` (all-zero modifiers → score 29) | `App` | `App.tsx:742`; defaults `130–137` |
| Randomize | Picks a uniformly random option in each dimension independently | `App` | `App.tsx:749–756` |
| Quick Personas (4 presets) | Applies a preset's selections. The card whose selections all match the current state is highlighted. | `App` | `App.tsx:772–794`; presets `139–192`; match test `773` |
| Formula bar | Shows "29% Base" chip + 6 modifier chips + "= N% Final Score (Tier name)" | `App` | `App.tsx:843–863` |
| Risk score + tier | Additive score, clamp, tier lookup (§2) | `App` | `App.tsx:419–448` |
| Unit Economics A/B card | Toggle between "Without ML" (partly computed loss ledger) and "With ML Intervention" (static per-tier ledger). Defaults to `with_ml`. | `App` | `App.tsx:411`, `867–998` |
| Phone: order summary header | "COD RISK: N%" pill | `App` | `App.tsx:1246–1248` |
| Phone: address line | Static name and phone. Region • speed • courier labels follow the current selections. | `App` | `App.tsx:1262–1273` |
| Phone: vouchers | Tiers 1–3: one "Free Shipping Voucher −₱45.00". Tier 4: two stacked rows, −₱45.00 and −₱20.00. **Display only** (§4, §7). | `App` | `App.tsx:1276–1306` |
| Phone: product card | Product looked up by the selected category | `App` | `App.tsx:1309–1325`; lookup `450` |
| Phone: tier banner | Tier emoji, `uiState`, `copy` from the tier config | `App` | `App.tsx:1328–1336` |
| Phone: payment gate | Per-tier COD / OTP / deposit / prepaid UI (§5) | `App` | `App.tsx:1339–1438` |
| Phone: bill + CTA | Total or Tier 3 deposit math, plus the place-order button gated by `isCheckoutReady` | `App` | `App.tsx:1442–1485`; gate `462–466` |
| Micro-state reset | Any change to `selections` resets OTP-verified, deposit-paid and order-submitted | `App` | `App.tsx:413–417` |

### 1C. Post-checkout (Tab 2: "Post-Checkout Mitigation")

| Feature | What it does | Implemented in | Logic |
|---|---|---|---|
| Cumulative Impact Dashboard | 4 tiles: Logistics Cost Saved (state), RTS Parcels Deflected (state), Windows Locked (state), Capital Protected (static ₱8,450) | `App` | `App.tsx:1010–1059`; state `476–478` |
| Dispatcher action 1: "24-hr Cooling Off Reminder" | Sets the phone to `push_reminder` and the selected order's `activeMitigation='reminder_sent'`, then toasts | `App` | `App.tsx:495–501`, button `1076–1098` |
| Dispatcher action 2: "Send Delivery Window Picker" | Sets the phone to `inbox_window` and `activeMitigation='window_locked'`, then toasts | `App` | `App.tsx:503–509`, button `1101–1123` |
| Dispatcher action 3: "Initiate Courier AI Dispatch" | Sets the phone to `courier_chat` and `activeMitigation='ai_dispatched'`, then toasts | `App` | `App.tsx:511–517`, button `1126–1148` |
| Live Pending Orders Feed | 4 seeded orders. Click one to target it. Shows the static tier/score, price, region, courier and live status. | `App` | `App.tsx:1154–1210`; seed `334–391`; select `1171` |
| Phone B1: push notification | Confirm → status "Confirmed for Delivery", phone goes idle. Cancel → status "Order Cancelled", **+₱130** saved, **+1** deflected, phone goes idle. | `App` | `App.tsx:1496–1547`; handlers `526–542` |
| Phone B2: delivery window inbox | 3 slot buttons. Each click stores `windowSelected` and adds **+1** to Windows Locked. | `App` | `App.tsx:1550–1611`; handler `544–550` |
| Phone B3: courier AI chat | 3 quick replies. "Yes" → Confirmed. "Reschedule" → chat messages only. "Cancel" → Cancelled, **+₱180** saved, **+1** deflected. | `App` | `App.tsx:1614–1689`; handler `552–584` |
| Phone idle screen | Placeholder text | `App` | `App.tsx:1692–1700` |

**Initial Tab 2 state:** order `ord-882` is selected (`App.tsx:472`) and the phone is already on `push_reminder` (`App.tsx:473`), even though no order's `activeMitigation` is set.

### 1D. Unwired features (exist in source, never rendered)

Listed so nobody edits them expecting a visible change: `RiskGauge` (SVG gauge + 4-tier strip, `components/simulation/RiskGauge.tsx`), `FeatureWaterfall` (contribution bars normalized to |17|, `FeatureWaterfall.tsx:24`), `TierBadge` (`TierBadge.tsx`), `TikTokHeader` (`layout/TikTokHeader.tsx`), `ControlPanel`/`DimensionSelect`/`PresetSelector` (`components/controls/*`), `TikTokShopCheckout` (`TikTokShopCheckout.tsx`), `BusinessImpact` (`BusinessImpact.tsx`), and the `useRiskSimulation` hook. **None of them contains any post-checkout (Tab 2) feature.**

---

## 2. RISK SCORING MODEL

### 2.1 Formula as implemented (`App.tsx:419–448`)

```
breakdown[d] = option in DIMENSIONS[d] whose id === selections[d]   (fallback: options[0])   App.tsx:421
sumModifiers = Σ breakdown[d].modifier   over the 6 dimensions                               App.tsx:431
rawScore     = BASE_FAILURE_RATE + sumModifiers        BASE_FAILURE_RATE = 29                 App.tsx:432, 41
finalScore   = max(0, min(100, rawScore))                                                     App.tsx:433
tier         = 4 if finalScore ≥ 56
               3 if finalScore ≥ 46
               2 if finalScore ≥ 35
               1 otherwise                                                                    App.tsx:435–439
```

The unwired copy is the same: `utils/riskCalculator.ts:48–77` with `clamp()` at `18–20` and `getTierByScore()` at `30–42`.

### 2.2 Modifier matrix (`App.tsx:57–128`; duplicate at `constants/riskModifiers.ts:27–98`)

"Segment failure rate" is the `actualRate` string shown in the UI as "Fail: X%" (`App.tsx:835`). It is **display-only** and never enters a calculation. For every one of the 28 options, `actualRate = 29 + modifier` exactly (checked by script).

| # | Dimension (key) | Option id | Label in App.tsx | Modifier | Stated segment failure rate |
|---|---|---|---|---:|---:|
| 1 | Buyer Region (`region`) | `ncr` | Metro Manila (NCR) | −11 | 18% |
| | | `luzon` | Luzon (excl. NCR) | −3 | 26% |
| | | `visayas` | Visayas | +3 | 32% |
| | | `mindanao` | Mindanao | +6 | 35% |
| 2 | Buyer Tenure (`tenure`) | `lt_1m` | < 1 month | +9 | 38% |
| | | `1_3m` | 1-3 months | +3 | 32% |
| | | `3_6m` | 3-6 months | −2 | 27% |
| | | `6_12m` | 6-12 months | −6 | 23% |
| | | `gt_12m` | > 12 months | −11 | 18% |
| 3 | Delivery Speed (`speed`) | `sameday` | Same-Day | −17 | 12% |
| | | `nextday` | Next-Day | −12 | 17% |
| | | `standard` | Standard | 0 | 29% |
| | | `extended` | Extended | +9 | 38% |
| 4 | Product Category (`category`) | `fashion_apparel` | Fashion Apparel | +4 | 33% |
| | | `elec_new` | Electronics (New) | +2 | 31% |
| | | `elec_refurb` | Electronics (Refurb) | 0 | 29% |
| | | `fashion_non_apparel` | Fashion Non-Apparel | −4 | 25% |
| | | `fmcg` | FMCG (Beauty/Grocery) | −7 | 22% |
| | | `lifestyle` | Lifestyle | −11 | 18% |
| 5 | Scenario / Traffic Source (`scenario`) | `creator_live` | Creator livestream | +3 | 32% |
| | | `seller_live` | Seller self-livestream | −5 | 24% |
| | | `short_video` | Short video link | 0 | 29% |
| | | `shoptab` | ShopTab (search) | −9 | 20% |
| 6 | Assigned Courier (`courier`) | `ab_express` | A&B Express | 0 | 29% |
| | | `fast_express` | Fast Express | +2 | 31% |
| | | `quick_van` | Quick Van | +4 | 33% |
| | | `xyz_express` | XYZ Express | −3 | 26% |
| | | `others` | Others (Regional) | +7 | 36% |

**Label differences between the two copies.** The values are identical; only these labels differ:
- `short_video`: "Short video link" (`App.tsx:112`) vs "Short video (product link)" (`constants/riskModifiers.ts:82`)
- `shoptab`: "ShopTab (search)" (`App.tsx:113`) vs "ShopTab (search & browse)" (`constants/riskModifiers.ts:83`)
- `others`: "Others (Regional)" (`App.tsx:125`) vs "Others" (`constants/riskModifiers.ts:95`)
- Speed and category descriptions also differ (`App.tsx:84`, `96` vs `constants/riskModifiers.ts:54`, `65`).

**Disagreements between the README and the code** (labels only, `README.md:48–64`): the README says "Standard (3–5 Days)", "Extended (> 5 Days)", "Lifestyle / Home" and "Others (3PL Regional)". The code has no day ranges for speed options anywhere.

### 2.3 Tier thresholds and boundaries

| Tier | Condition (`App.tsx:436–439`) | Integer range | Label string (`App.tsx`) |
|---|---|---|---|
| 1 | `finalScore < 35` | 0–34 | `'0% – 34%'` (198) |
| 2 | `35 ≤ finalScore < 46` | 35–45 | `'35% – 45%'` (217) |
| 3 | `46 ≤ finalScore < 56` | 46–55 | `'46% – 55%'` (236) |
| 4 | `finalScore ≥ 56` | 56–67 reachable | `'56%+'` (255) |

- **34 → Tier 1. 35 → Tier 2. 45 → Tier 2. 46 → Tier 3. 55 → Tier 3. 56 → Tier 4.** Comparisons are `>=` on the lower bound. `test/verifyRiskModel.ts:30–37` asserts these boundaries, but against the unwired `getTierByScore`.
- All modifiers and the base are integers, so scores are always integers. No fractional score can fall between two tiers.
- The tier `range` strings are separate literals. Nothing derives them from the thresholds.

### 2.4 Clamping, rounding, edge cases

- **Clamp:** `Math.max(0, Math.min(100, rawScore))` (`App.tsx:433`). There is no rounding, and none is needed.
- **The lower clamp is active.** 1,238 of the 9,600 combinations (12.9%) have `rawScore < 0` and display 0%. The formula bar still shows the six raw chips, so a visible sum of −53 next to "29% Base" is followed by "= 0% Final Score" (`App.tsx:849–861`).
- **The upper clamp never fires.** The maximum raw score is 67 (§2.5).
- **The clamp doesn't change any tier.** A negative raw score is Tier 1 either way, and nothing reaches 100.
- **Unknown option id:** falls back to the dimension's first option (`App.tsx:421`). The UI can't produce one, because selects only offer valid ids.
- **Unknown category for product lookup:** falls back to `elec_refurb` (`App.tsx:450`). Also unreachable from the UI.
- **Zero-modifier display:** the formula chip renders `+0%` (`App.tsx:855` uses `>= 0`), but the dimension badge renders `0%` (`App.tsx:817` uses `> 0`).

### 2.5 Theoretical min/max (verified by enumerating all 4×5×4×6×4×5 = 9,600 combinations)

| | Selections | Σ modifiers | rawScore | finalScore | Tier |
|---|---|---:|---:|---:|---|
| **Min** | ncr, gt_12m, sameday, lifestyle, shoptab, xyz_express | −62 | −33 | **0** | 1 |
| **Max** | mindanao, lt_1m, extended, fashion_apparel, creator_live, others | +38 | 67 | **67** | 4 |

- Every integer from 0 to 67 is reachable **except 66**.
- Tier distribution if all 9,600 combinations are equally likely: Tier 1 **8,072 (84.1%)**, Tier 2 **1,120 (11.7%)**, Tier 3 **347 (3.6%)**, Tier 4 **61 (0.6%)**.

### 2.6 Presets (`App.tsx:139–192`)

| Preset | Badge text | Σ | raw | final | **Actual tier** |
|---|---|---:|---:|---:|---|
| Loyal NCR Shopper | "Tier 1 (Low)" | −53 | −24 | 0 | 1 ✓ |
| Casual Video Scroller | "Tier 2 (Medium)" | +10 | 39 | 39 | 2 ✓ |
| **Impulse Live Buyer** | **"Tier 3 (High)"** | +28 | 57 | 57 | **4 ✗** |
| Critical Anomaly Profile | "Tier 4 (Critical)" | +38 | 67 | 67 | 4 ✓ |

The badge is a static string (`App.tsx:168`). **No preset demonstrates Tier 3** (§7).

---

## 3. ECONOMIC CONSTANTS

**Live** = in `App.tsx`, which is rendered. **Unwired** = in source but never rendered. **Test** = `test/verifyRiskModel.ts`. "Used in math" means the literal feeds an arithmetic expression. "Text" means it is typed into a string or JSX.

To change a cost **in the running app**, edit every **Live** site. Edit the Unwired and Test sites too if those copies must stay in sync.

| # | Value | Represents | Live sites (`App.tsx`) | Unwired / Test / Docs sites | Duplicated? |
|---|---|---|---|---|---|
| C1 | **29** | Base COD failure rate | `41` (math, `432`); `849` text "29% Base" (doesn't read the constant) | `constants/riskModifiers.ts:18`; text: `RiskGauge.tsx:64,65,84,86,87,95`, `FeatureWaterfall.tsx:17`, `TikTokHeader.tsx:99,131,137`, `ControlPanel.tsx:100,107`, `BusinessImpact.tsx:24` (default prop); `test:41,42`; comment `utils/riskCalculator.ts:46` | **YES. Also embedded in all 28 `actualRate` strings** (`= 29 + modifier`), which would go stale if the base changed. |
| C2 | 28 modifiers | Per-option score modifiers | `63–125` (math) | `constants/riskModifiers.ts:33–95`; `README.md:37–64` | **YES (2 code copies)** |
| C3 | **35 / 46 / 56** | Tier lower bounds | `436–438` (math); range text `198, 217, 236, 255` | `utils/riskCalculator.ts:32–36`; `constants/riskModifiers.ts:176,195,214,233`; `test:30–37`; comments `TikTokShopCheckout.tsx:259,292,355,433` | **YES** |
| C4 | **649 / 1299 / 1850 / 420 / 549 / 599** | Product prices by category | `277, 284, 291, 298, 305, 312` (math) | `constants/riskModifiers.ts:255,262,269,276,283,290` | **YES.** Tab 2 seed orders hand-retype 649, 1299, 1850, 599 at `App.tsx:340, 354, 368, 382`. |
| C5 | **45 / 38 / 60 / 38 / 0 / 45** | Shipping fee by category | `278, 285, 292, 299, 306, 313` (math) | `constants/riskModifiers.ts:256,263,270,277,284,291` | **YES** |
| C6 | **20** | Tier 4 prepaid subsidy (₱) | `457` (math); text `258, 938, 1294, 1421, 1432` | `constants/riskModifiers.ts:236`; `hooks/useRiskSimulation.ts:85` (math); `TikTokShopCheckout.tsx:170,470,490,555,560`; `BusinessImpact.tsx:74,76` (math), `79,81,254`; `test:74` | **YES (6 live sites, 1 of them math)** |
| C7 | **50** | Tier 3 securing deposit (₱) | `459` (math, `tier3Deposit`); text `239, 953, 961, 1395, 1399, 1450, 1476` | `constants/riskModifiers.ts:217`; `hooks/useRiskSimulation.ts:87`; `TikTokShopCheckout.tsx:392,393,407,416,420,528,533,611`; `BusinessImpact.tsx:63`, `240` (math `orderTotal - 50`), `68,70,232,280`; `test:68` | **YES (8 live sites).** `1450` shows a literal "−₱50" next to a total computed from `tier3Deposit`. |
| C8 | **45** | Free-shipping voucher (₱) | text `1290, 1303`. **Not used in any math.** | `TikTokShopCheckout.tsx:152,156,190,551,560`; `test:73` | **YES** (and `TikTokShopCheckout.tsx:186` says "Capped at ₱50") |
| C9 | **65** | Stacked voucher total (45+20) | — (not shown live) | `TikTokShopCheckout.tsx:176,560`; `test:76` | YES (unwired + test) |
| C10 | **180** | Two-way RTS courier freight (₱) | text `906, 942, 968`; math `580` (+180 to `logisticsSaved`); toast `582`; **folded into** `205` (`919`), `160` (`946`), `179.50` (`976`) | `BusinessImpact.tsx:30` (math; comment "₱80 forward + ₱100 return"), `58, 61, 81` | **YES (7 live sites, 4 of them baked into other literals)** |
| C11 | **25** | Packaging & inventory delay cost (₱) | text `914`; folded into `205` at `919` | `BusinessImpact.tsx:33` (math) | **YES** |
| C12 | **0.05** | Marketplace commission rate | math `910, 919`; label "(5%)" `909` | `BusinessImpact.tsx:31` (math), label `151` | **YES (3 live sites)** |
| C13 | **205** | 180 + 25, pre-summed | math `919` | `BusinessImpact.tsx:297` (text) | **YES.** Changing C10 or C11 also requires editing this. |
| C14 | **0.50** | SMS OTP cost (₱) | text `972`; folded into `976` | `BusinessImpact.tsx:51,53` (math), `58,218` | YES |
| C15 | **179.50 / 359×** | Tier 2 net saving and ROI | text `976` | `BusinessImpact.tsx:54,278` | YES |
| C16 | **160 / +800%** | Tier 4 net saving and ROI | text `946` | `BusinessImpact.tsx:76–78` (76 math), `276, 297` | YES |
| C17 | **85%** | Tier 3 "refusal reduction" | text `957` | `BusinessImpact.tsx:66,236` | YES |
| C18 | **130** | Saving credited per push-notification cancel (₱) | math `538`; toast `540` | — | Twice in App |
| C19 | **1430** | Seed value of "Logistics Cost Saved" | `476` | — | No |
| C20 | **9** / **14** | Seed counts: RTS deflected / windows locked | `477` / `478` | — | No |
| C21 | **8,450** | "Capital Protected" tile (₱) | text `1054` | — | No |
| C22 | **800.00** | COD amount in the courier chat opener (₱) | text `485` | — | No |
| C23 | **₱5.79B/mo** | Monthly PH GMV | text `659` | `constants/riskModifiers.ts:21` (`MONTHLY_GMV_CONTEXT.gmv`, used only by unwired `TikTokHeader.tsx:86`); `README.md:19` | **YES** (App doesn't read the constant) |
| C24 | 12.4M / ₱1.68B / ₱420M+ | Volume, baseline loss, target recovery | — (not displayed live) | `constants/riskModifiers.ts:22–24` (only `targetRecovery` is used, at unwired `TikTokHeader.tsx:140`); `README.md:20–23` | Code + README |
| C25 | **1.35** | Strikethrough "original price" multiplier | — | `TikTokShopCheckout.tsx:227` (math) | No |

---

## 4. FINANCIAL FORMULAS (live UI)

All inputs come from `selections` (state, `App.tsx:405`), `MOCK_PRODUCTS` (`App.tsx:273–316`) and the tier (`App.tsx:446`).

### 4.1 Checkout pricing (`App.tsx:450–460`)

```
currentProduct          = MOCK_PRODUCTS[selections.category] ?? MOCK_PRODUCTS.elec_refurb   // 450
subtotal                = currentProduct.price                                              // 455
shipping                = currentProduct.shipping                                           // 456
tier4Discount           = (tier.id === 4) ? 20 : 0                                          // 457
totalOrderAmount        = subtotal + shipping − tier4Discount                               // 458
tier3Deposit            = 50                                                                // 459
tier3CollectOnDelivery  = totalOrderAmount − tier3Deposit                                   // 460
```

**The ₱45 free-shipping voucher is not part of `totalOrderAmount`.** Shipping is always added in full.

Where each figure appears:

| UI figure | Expression | Site |
|---|---|---|
| Product price | `currentProduct.price.toLocaleString()` | `App.tsx:1321` |
| Tiers 1/2/4 "Total Payment" | `totalOrderAmount` (no thousands separator) | `App.tsx:1461` |
| CTA, Tier 1/2/4 | `₱${totalOrderAmount}` | `App.tsx:1474, 1475, 1477` |
| Tier 3 "Subtotal" | `subtotal` (next to the literal "Shipping: FREE") | `App.tsx:1446` |
| Tier 3 strip | `Total: ₱{totalOrderAmount} \| Deposit Paid: -₱50 \| … ₱{tier3CollectOnDelivery}` | `App.tsx:1450` |
| Tier 3 "Amount to Collect at Door" | `tier3CollectOnDelivery` | `App.tsx:1454, 1476` |

Resulting values (computed):

| Category | price + ship | Tier 1–3 total | Tier 3 collect | Tier 4 total |
|---|---|---:|---:|---:|
| fashion_apparel | 649 + 45 | 694 | 644 | 674 |
| elec_new | 1299 + 38 | 1337 | 1287 | 1317 |
| elec_refurb | 1850 + 60 | 1910 | 1860 | 1890 |
| fashion_non_apparel | 420 + 38 | 458 | 408 | 438 |
| fmcg | 549 + 0 | 549 | 499 | 529 |
| lifestyle | 599 + 45 | 644 | 594 | 624 |

### 4.2 Unit Economics: "Without ML" (`App.tsx:901–926`)

```
forgoneCommission (shown) = Math.round(totalOrderAmount × 0.05)          // 910
netLoss (shown)           = 205 + Math.round(totalOrderAmount × 0.05)    // 919
```

The other rows are static text: −₱180.00 (`906`) and −₱25.00 (`914`). `205` is the hand-summed `180 + 25`. `Math.round` uses JavaScript's round-half-up.

Because `totalOrderAmount` already includes the Tier 4 −₱20 (`458`), the "without ML" commission for a Tier 4 profile is computed on the **with-ML** discounted price. Example: fashion apparel shows −₱34 / −₱239 instead of −₱35 / −₱240.

### 4.3 Unit Economics: "With ML" (`App.tsx:928–996`)

**There is no arithmetic in this branch.** Every figure is a literal; see §6.

### 4.4 Tab 2 counters (`App.tsx:476–478`, handlers `526–584`)

```
logisticsSaved     : init 1430;  += 130 on push Cancel (538);  += 180 on courier Cancel (580)
rtsDeflectedCount  : init 9;     += 1 on push Cancel (539);    += 1 on courier Cancel (581)
windowsLockedCount : init 14;    += 1 on every window-slot click (548)
pending count      : pendingOrders.length (1161), always 4
```

Displayed with `logisticsSaved.toLocaleString()` (`1030`). There are no other financial formulas in Tab 2.

### 4.5 Percentages shown in the UI

| Percentage | Source | Site |
|---|---|---|
| Final score "N%" | `calculation.finalScore` | `App.tsx:860, 1247` |
| Modifier badges / chips / option text | `opt.modifier` formatted with a sign | `App.tsx:817, 828, 855` |
| "Fail: X%" | `selectedOpt.actualRate` (string lookup) | `App.tsx:835` |
| "29% Base" | literal | `App.tsx:849` |
| Order feed "Tier N (S%)" | seed data `riskTier`, `riskScore` | `App.tsx:1189` |
| "(5%)", "−85%", "+800%", "359x", "100%" | literals | `App.tsx:909, 957, 946, 976, 991` |

---

## 5. TIER GATE BEHAVIOR (live phone checkout, Tab 1)

Common to all tiers:
- The header pill shows the score (`1247`).
- The tier banner shows `uiState` + `copy` (`1328–1336`).
- `orderSubmitted` replaces the CTA with "✓ Order Confirmed (Tier name)!" and a "Retest" link (`1480–1483`).
- Changing any dimension resets OTP, deposit and submitted (`413–417`).
- **No tier performs real verification or payment.** Every unlock is a single button click that sets a boolean.

| | **Tier 1 (0–34)** | **Tier 2 (35–45)** | **Tier 3 (46–55)** | **Tier 4 (56+)** |
|---|---|---|---|---|
| Banner `uiState` | Frictionless 1-Click COD (`200`) | Intent Confirmation Required (`219`) | Quick Downpayment (Earnest Money) (`238`) | Pay Now, Rest Easy (COD Disabled) (`257`) |
| Voucher area | Single −₱45 (`1298–1304`) | Single −₱45 | Single −₱45 | Two stacked: −₱45, −₱20 "Non-Cannibalized" (`1278–1296`) |
| Payment options shown | One COD card, pre-checked (`1340–1348`). No other method. | One "COD (SMS OTP Gate)" card with a 4-char input prefilled `4829` (`406`, `1358–1364`) and a Verify button. No other method. | One "COD (Locked)" card with a padlock and a "Pay ₱50 Securing Deposit (GCash)" button (`1381–1404`). No other method. Maya isn't selectable, though the copy says "GCash/Maya". | Greyed, struck-through "COD (Disabled)" row (a div, not clickable) and GCash / Maya toggle buttons, both "−₱20 OFF". Default `gcash` (`409`, `1406–1437`). |
| What is locked | Nothing | CTA (until `otpVerified`) | COD + CTA (until `depositPaid`) | COD permanently. No unlock path. |
| What unlocks it | — | Clicking **Verify** (`1366`). **The input value is never checked.** Any or empty input passes. | Clicking the deposit button (`1391`) | — |
| Undo | — | "Undo" → `otpVerified=false` (`1375`) | "Reset" → `depositPaid=false` (`1400`) | — |
| Bill | "Total Payment ₱{total}" (`1458–1463`) | same | "Subtotal: ₱{subtotal} \| Shipping: FREE", the Total/Deposit/Collect strip, then "Amount to Collect at Door ₱{collect}" (`1443–1456`) | "Total Payment ₱{total}" with total = price + ship − 20 |
| CTA enabled? (`462–466`) | Always | Only if `otpVerified` | Only if `depositPaid` | Always |
| CTA label (`1474–1477`) | "Place 1-Click COD Order (₱X)" | Locked: "Verify OTP Above First". Unlocked: "Place Verified COD Order (₱X)" | Locked: "Pay ₱50 Deposit Above to Unlock". Unlocked: "Complete COD Order (₱collect due at door)" | "Pay Now with GCASH (₱X)" / "MAYA" (`toUpperCase`) |
| Can proceed with COD? | Yes | Yes, after Verify | Yes, after the deposit click | **No.** The only path is prepaid. |
| Can proceed with prepaid? | No option shown | No option shown | No option shown | Yes (wallet choice doesn't change the price) |

The disabled CTA gets grey styling (`1471`) and the HTML `disabled` attribute (`1468`).

---

## 6. HARDCODED vs DERIVED

**Derived** = computed at runtime from state or constants. **Hardcoded** = a literal typed into the JSX or a string. **Seeded** = a hardcoded initial value that runtime actions then change.

### 6.1 Tab 1

| Displayed item | Status | Site |
|---|---|---|
| Final score % (formula bar, phone pill) | **Derived** | `860, 1247` |
| Tier name / banner / colors | **Derived** (lookup by tier) | `860, 1329–1334` |
| Per-dimension modifier badges and chips | **Derived** (lookup) | `817, 828, 850–857` |
| "Fail: X%" segment rate | **Derived lookup of a static string**. Not computed from data. | `835` |
| "29% Base" chip | **Hardcoded.** Doesn't read `BASE_FAILURE_RATE`. | `849` |
| Product title / price | **Derived** (lookup) | `1319, 1321` |
| Region / speed / courier labels in the address line | **Derived** (lookup) | `1270` |
| Buyer name "Juan Dela Cruz", phone "+63 917 ••• 8421" | **Hardcoded** | `1266–1267` |
| Free-shipping voucher −₱45.00 | **Hardcoded**, not used in math, shown even when shipping is ₱0 (fmcg) | `1290, 1303` |
| Tier 4 subsidy row −₱20.00, wallet "−₱20 OFF" | **Hardcoded** text. The math uses a separate literal at `457`. | `1294, 1421, 1432` |
| Total Payment / CTA amounts | **Derived** | `1461, 1474–1477` |
| Tier 3 subtotal, total, collect amount | **Derived** | `1446, 1450, 1454, 1476` |
| Tier 3 "Deposit Paid: −₱50", "Shipping: FREE" | **Hardcoded** | `1450, 1446` |
| ₱50 on the deposit button / confirmation | **Hardcoded** | `1395, 1399` |
| Without ML: −₱180.00, −₱25.00 | **Hardcoded** | `906, 914` |
| Without ML: commission | **Derived** (`round(total × 0.05)`) | `910` |
| Without ML: net loss | **Partly derived:** `205` literal + derived commission | `919` |
| **With ML: every figure in all 4 tiers** (₱0.00, −₱20.00, +₱180.00, +₱160.00 (+800% ROI), +₱50.00, −85%, ₱50 Sunk-Cost, −₱0.50, +₱179.50 (359x ROI), 100% GMV Protected) | **Hardcoded.** Doesn't vary with product, price or score; only the tier selects which block shows. | `930–994` |
| Preset badges ("Tier 3 (High)" etc.) | **Hardcoded** (and one is wrong, §2.6) | `142, 155, 168, 181` |
| GMV ₱5.79B/mo, "60,000+ PH order dataset" | **Hardcoded** | `659, 684` |

### 6.2 Tab 2

| Displayed item | Status | Site |
|---|---|---|
| Logistics Cost Saved | **Seeded** (1430), then incremented by hardcoded 130 / 180 | `476, 538, 580, 1030` |
| RTS Parcels Deflected | **Seeded** (9), +1 per cancel | `477, 539, 581, 1038` |
| Windows Locked | **Seeded** (14), +1 per slot click | `478, 548, 1046` |
| Capital Protected ₱8,450 | **Hardcoded.** Never changes. | `1054` |
| "N Pending Orders" | **Derived** (`pendingOrders.length`, always 4) | `1161` |
| Order risk score and tier | **Hardcoded seed data. Not produced by the scoring model.** | `342–343, 356–357, 370–371, 384–385` |
| Order item price | **Hardcoded seed** (hand-copied from product prices) | `340, 354, 368, 382` |
| Order status / selected window | **Derived** from handler state | `1203, 1607` |
| Push notification order number / item / price | **Derived** from `activeOrder` | `1513, 1516` |
| Courier chat "₱800.00", "Fast Express", rider "Juan (Plate #ND-8421)", "Order #882" in the cancel reply | **Hardcoded.** Doesn't follow the selected order. | `485, 558, 575, 1626` |
| Toast amounts "+₱130", "+₱180" | **Hardcoded** | `540, 582` |

---

## 7. OPEN QUESTIONS (ambiguous, inconsistent, or likely bugs)

### Model / scoring
1. **The "Impulse Live Buyer" preset is labeled Tier 3 but scores 57 → Tier 4** (`App.tsx:166–178`; same in `constants/riskModifiers.ts:140–154`). No preset produces Tier 3.
2. **The upper clamp at 100 is dead code** for the current matrix. The maximum is 67 (§2.5).
3. **Score 66 is unreachable**, and Tier 4 covers only 61 of 9,600 combinations (0.6%).
4. **The seeded Tab 2 order `ord-743` has `riskScore: 68`** (`App.tsx:370`). The model's maximum is 67, so the model can't produce that score.
5. **The `actualRate` strings are exactly `29 + modifier`** for all 28 options. They are labeled "historical"/"Fail" but are arithmetically tied to the base. It is unclear whether they are measured or derived; if `BASE_FAILURE_RATE` changes they will silently disagree.
6. The spec drawer claims "additive 6-dimension ML model on a 60,000+ PH order dataset" (`App.tsx:684`). **No dataset, training code or fitted parameters exist in the repo**; the modifiers are literals.

### Pricing / economics
7. **The free-shipping voucher (−₱45) is displayed but never subtracted** (`App.tsx:1290, 1303` vs `458`). The Tier 4 panel shows "2 Vouchers Stacked" (−₱45, −₱20), but only −₱20 affects the total.
8. **Tier 3 bill says "Shipping: FREE"** (`1446`), yet `totalOrderAmount` includes shipping. Example: apparel shows Subtotal ₱649, then Total ₱694.
9. **The voucher shows −₱45 for FMCG, whose shipping is ₱0** (`306`).
10. **"Without ML" commission for Tier 4 uses the post-subsidy price** (`910, 919` via `458`). The counterfactual depends on the treatment.
11. **"Without ML" text says "this high-risk order"** (`924`) and shows a loss for every tier, including Tier 1.
12. **The "With ML" figures are fully static** (`930–994`). They don't use the product price, commission, packaging or score. The Tier 4 "+₱160" is `180 − 20` and ignores the ₱25 and the 5% that the "Without ML" side includes.
13. **₱130 "Forward Freight Saved"** (`538, 540`) has no derivation in code. The unwired `BusinessImpact.tsx:30` comment splits ₱180 as "₱80 forward + ₱100 return", which conflicts with ₱130 forward.
14. **The seeds 1430 / 9 / 14 and "Capital Protected ₱8,450" can't be traced to any computation.** They don't reconcile with the per-event amounts (9 × 130 = 1170 and 9 × 180 = 1620, neither is 1430) or with the seeded order values (649 + 1299 + 1850 + 599 = 4,397).
15. **"−85% Refusal Rate"** (`957`), **"+800% ROI"** (`946`) and **"359x ROI"** (`976`) are literals. 800% = 160/20 and 359 = 179.5/0.5 are internally consistent, but no code computes them. 85% has no stated source.
16. **The Tier 3 strip's "−₱50" is a literal** (`1450`), while the collect amount uses `tier3Deposit` (`459`). Changing `459` alone would make the strip wrong.
17. Number formatting is inconsistent. Product price uses `toLocaleString` (`₱1,850`, `1321`), but totals don't (`₱1910`, `1461`). Static figures use two decimals (`₱180.00`), while computed ones don't (`₱96`, `910`).

### Gate behavior
18. **The OTP is never validated.** Verify sets `otpVerified=true` whatever the input (`1366`).
19. After an order is submitted, "Undo"/"Reset" on the OTP or deposit is still clickable. It flips the unlock state but leaves "Order Confirmed" showing (`1375, 1400` vs `1466`).
20. The Tier 3 deposit button says "(GCash)" only (`1395`). The copy offers "GCash/Maya" (`239`).

### Post-checkout
21. **Any dispatcher action can target any order regardless of status.** For example, a "Pre-Packing" push can be sent to `ord-743` "Out for Delivery". Statuses can go from Cancelled to Confirmed and back.
22. **Savings can be double-counted.** The courier chat stays open after "Cancel", so each further click adds ₱180 and one deflection (`572–583`). The push screen can be re-opened and cancelled again for an already-cancelled order (+₱130 each time).
23. **Windows Locked increments on every slot click**, including re-clicking the same slot or changing slots (`548`).
24. **`activeMitigation` is written** (`498, 506, 514`) **but never read or displayed.**
25. **Chat history is global**, not per order (`482`). The opener (₱800.00, Fast Express) and the cancel reply ("Order #882") are fixed whichever order is selected (`485, 575, 1626`).
26. "N Pending Orders" counts every order, including Dispatched, Cancelled and Confirmed ones (`1161`).
27. Toast timers aren't cleared. If a second toast fires within 3.5 s, the first timer hides it early (`520–523`).
28. Seed typo: "Short Video Video Link Impulse" (`386`).

### Architecture, tests, docs
29. **`npm test` doesn't test the running app.** It imports `utils/riskCalculator.ts` and `constants/riskModifiers.ts` (`test/verifyRiskModel.ts:1–11`), not `App.tsx`'s inline copy.
30. **The test reports "ALL 16 … ASSERTIONS PASSED"** (`test/verifyRiskModel.ts:78`) **but runs 27 assertions.** Assertions 7 and 8 (`66–76`) check arithmetic on local literals (350 − 50, 45 + 20), not production code.
31. **`npm test` and `npm run build` fail in this checkout without `npm install`.** `constants/riskModifiers.ts:1–8` imports `lucide-react` for icons. For this spec, the test and an exhaustive enumeration were run on copies with that import stubbed. All 27 assertions passed. The TypeScript build was **not** verified.
32. The README's "Software Architecture" section (`README.md:92–129`) describes `App.tsx` as a "Composition root combining controls and simulation views". **In the code, `App.tsx` is monolithic and the component tree is unused.** The README also says TypeScript 5.x and Vite 6.x; `package.json` pins `typescript ~6.0.3` and `vite ^8.3.4`.
33. README claims with **no counterpart in code**: "COD accounts for over 70%" (`README.md:17`), Tier 1 "keeping failure rate at ~18%" (`82`), Tier 3 deposit is "non-refundable" (`86`).
34. The unwired `TikTokShopCheckout` differs from the live checkout and would show different numbers if wired in: voucher amount logic is inverted (`-₱{shipping === 0 ? '45' : '0'}`, `TikTokShopCheckout.tsx:190`), "Capped at ₱50" vs ₱45 (`186` vs `152`), and a ×1.35 strikethrough price (`227`).
35. The Spec drawer and GMV badge are hidden below the `lg` breakpoint (`App.tsx:652`), so the formula explanation isn't reachable on narrow screens.

---

## 8. Does This Version Have the Post-Checkout Features?

**Yes, in the rendered app. No, in the modular architecture.**

- **Rendered `App.tsx`: present.** Tab 2 "Post-Checkout Mitigation" (`App.tsx:638–648`, `1006–1213`, `1492–1703`) has the impact dashboard, three dispatcher actions (cooling-off push, delivery-window picker, courier AI chat), the pending-orders feed, and three interactive buyer phone screens plus an idle screen, with handlers at `App.tsx:495–584`. Git history shows Tab 2 was added in commit `4c78cb4` ("complete COD Optimization Command Center with unified tabs, Tab 2 logistics feed…"), which rewrote `App.tsx` (+1,817 lines) and touched no file under `components/`.
- **`components/`, `hooks/`, `constants/`, `utils/`: absent.** None contains Tab 2 state, order data, dispatcher actions or the buyer-side screens. The only post-checkout references there are tagline text (`TikTokHeader.tsx:70`).
- **README: tagline only.** "Post-Checkout Reactive Logistics Deflection" appears in the subtitle (`README.md:11`), but no section documents the Tab 2 features, and the architecture tree (`README.md:96–129`) lists only pre-checkout components.
- **Tests: none** cover post-checkout behavior.

So any build that renders `App.tsx` (the current `main.tsx:4`) has the post-checkout features. A build that composed the documented components instead would not.

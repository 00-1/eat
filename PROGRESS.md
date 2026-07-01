# Worker PROGRESS

The worker's disposition of every PLAN.md item it takes on. Format per item:
`- <id>: done+verdict / member-of / long-tail / holding+reason (+ PMID/DOI).`

## Phase 0
- signalTier field + long-tail "eat to taste" UI + tests: **DONE**. Scoring.signalTier
  exported (pure, derived). Grid + summary panels filter to notable; long-tail
  renders as a compact category-grouped section below the grid. 79 tests, all green.
  Anchors held: trans-fat/artificial-sweeteners/red-meat notable; poultry long-tail.
  Merged v0.63.

## Tranche 1
- **oats / oatmeal**: DONE — own card, positive · moderate (Hu 2020 BMJ,
  PMID:32641435: oatmeal HR 0.79 for T2D in ~195k; Yu 2022 Nutrients,
  PMID:35631184: β-glucan LDL-C −0.27 mmol/L in 13 RCTs). Cross-linked as
  Whole grains member.
- **seed oils (canola/sunflower/soybean/vegetable oil)**: DONE — own card,
  positive · low (**contested**). Marklund 2019 CHARGE, PMID:30971107:
  30-cohort biomarker meta (~68,700), higher LA → CV mortality HR 0.78
  (0.70-0.85), total CVD 0.93 (0.88-0.99). Farvid 2014, PMID:25161045.
  Contested flag captures the "seed oils are poison" contrarian narrative.
  Scope: group (class of oils). Uniformity: mixed.
- **peanuts + peanut butter**: DONE — own card, positive · moderate. Luu 2015
  JAMA Intern Med, PMID:25730101: 3 cohorts ~206k / 14,440 deaths, total
  mortality HR 0.79 US, 0.83 Shanghai; IHD 0.60-0.70. Cross-linked as
  Legumes member (peanuts are botanically legumes but cohort-eaten as nuts).
- **brown rice**: DONE — own card, positive · moderate. Sun 2010 Arch Intern
  Med, PMID:20548009: NHS/NHSII/HPFS ~197k, T2D HR 0.89 (0.81-0.97) at ≥2
  servings/week; 50 g/day white→brown swap ↓16% T2D. Corroborated by Hu 2020.
  Cross-linked as Whole grains member.
- **pasta (incl. whole-wheat)**: DONE — own card as **long-tail**, neutral ·
  very-low (verified:false). No pasta-specific hard-outcome pooled RR; low-GI
  RCT context (Chiavaroli 2021 BMJ, PMID:34348965) shows no harm signal.
  Recorded honestly.
- **energy drinks**: HOLDING (thin) — only acute-marker RCTs exist (Gualberto
  2024, 17 RCTs: caffeinated energy drinks raise SBP/DBP/CO/QTc acutely). No
  hard-outcome cohort data; case reports of arrhythmia but no epidemiologic
  signal we can pin to a PMID.
- **mushrooms**: DONE — graduated from HOLDING to own card, positive · low.
  Ba 2021 Nutr J, PMID:34548082: 5-cohort meta (~601,893), all-cause
  mortality RR 0.94 (0.91-0.98). Small but graded protective signal.
- **garlic / onions / alliums**: HOLDING (thin). Zhu 2014 CGH, PMID:24681077:
  8-cohort meta, allium NULL for colorectal cancer (RR 1.06, 0.96-1.17);
  garlic SUPPLEMENTS actually raised CRC (1.18, 1.02-1.36). Zhang 2022 breast
  cancer signal is case-control-weighted. No clean hard-outcome cohort meta
  for alliums → stays honest holding.

## Signal-tier count after Tranche 1
- **Notable: 35** (added oats, seed-oils, brown-rice, peanuts, mushrooms)
- **Long-tail: 9** (added pasta)
- **Total FOODS: 44**

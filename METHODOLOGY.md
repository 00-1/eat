# Methodology

**Version 0.26 — living document.** This file is the canonical description of how
this project turns evidence into a *positive / negative / neutral* verdict for a
food, with an explicit certainty rating. It is meant to be revised. When the
method changes, bump `METHODOLOGY_VERSION` in `data.js` and record the change in
the [Changelog](#changelog).

The same content is summarized in the app's **“The approach”** tab. The source
research behind this method — multi-source and fact-checked — is in
[`research/methodology-research.md`](./research/methodology-research.md).

---

## 1. The question

For each food we answer one specific question:

> **When this food is regularly _added_ to a typical free-living diet, what tends
> to happen to long-term health outcomes** — primarily all-cause mortality,
> cardiovascular disease, and type 2 diabetes (plus outcome-specific evidence such
> as colorectal cancer where it is strong)?

- **Added** — eating more than you do now. Because diets are roughly
  calorie-bounded, adding one food usually displaces another, so the honest answer
  often depends on **what it replaces** (a substitution question — see §6).
- **Free-living** — real people eating normally over years, not a metabolic-ward
  study of a biomarker for six weeks.

## 2. Why we grade confidence instead of asserting facts

We usually cannot randomize diets for decades, so most evidence is
**observational**: we compare people who already eat differently, which is prone
to bias (§6). The honest response is to weight the strongest designs, attach an
explicit **certainty tier** to every verdict, and **revise** as evidence changes
(§7). RCTs remain the higher-certainty standard; where they exist, labels defer
to them.

## 3. Evidence hierarchy

1. **RCTs on real health outcomes** — strongest, rare in nutrition (e.g. PREDIMED).
2. **Meta-analyses of prospective cohorts** — the workhorse: pooled long-term
   follow-up, ideally with dose-response.
3. **Individual large cohorts** — especially with dose-response and **substitution**
   modeling.
4. **RCTs on risk markers** (LDL, BP, glucose) and mechanism — *supporting* only.

## 4. The certainty tier (NutriGrade-aligned)

We rate certainty on the **NutriGrade** scale, which was built specifically to
grade meta-analyses of cohort studies. NutriGrade scores nine items out of 10 —
risk of bias, precision, heterogeneity, directness, publication bias, funding
bias, study design, effect size, and dose-response — and maps the total to four
tiers:

| Our tier | NutriGrade score | Meaning |
|----------|------------------|---------|
| **High** | 8–10 | Consistent across many good-quality studies; dose-response; plausible mechanism; ideally trial support. Unlikely to reverse. |
| **Moderate** | 6–7.99 | Generally consistent good-quality evidence, with gaps or some unexplained heterogeneity. |
| **Low** | 4–5.99 | Suggestive but sparse, inconsistent, or short follow-up. |
| **Very low** | 0–3.99 | Genuinely conflicting or too weak to take a side. |

### 4a. The reproducible scoring engine

Certainty is **computed, not assigned.** We do not hand-pick a tier or even the
sub-scores. Instead, for each food we record a set of **evidence facts** (some
objective like sample size, some recorded judgements like heterogeneity),
and a deterministic function (`scoring.js`) turns those facts into eight 0–2
sub-scores, a total (max 16), and the tier. Human judgement lives only in the
*rules* (which facts matter, where the thresholds sit) — applied identically to
every food — and in *recording each fact*. Change a fact and the score recomputes;
change a rule and every food re-scores. The engine is covered by unit tests, and a
data test asserts that each food's stored certainty equals the tier the engine
computes from its facts (`npm test`).

The recorded facts per food (`ASSESSMENTS[id].evidence` in `data.js`):

| Fact | Drives | Values |
|------|--------|--------|
| `pooledRR` (+ `ciExcludesNull`) | effect size & direction | number; boolean |
| `participants` | precision | number (CI width tracks N) |
| `heterogeneity` | consistency | low / moderate / high / unknown |
| `outcomeType` | directness | hard / surrogate / indirect |
| `doseResponse` | dose-response | graded / some / none |
| `rctLevel` | experimental corroboration | outcomes / pattern / markers / mechanism / none |
| `funding` + `pubBias` | freedom from bias | independent…; tested-clean… |
| `confoundingRisk` | study quality | low / moderate / high |

Numeric facts (`pooledRR`, `participants`) come from the cited studies; ordinal
facts are recorded, individually inspectable judgements about the evidence base —
each one is challengeable on its own, and correcting it recomputes the score.

| Dimension | 2 (strong) | 1 (adequate) | 0 (concern) |
|-----------|-----------|--------------|-------------|
| Study quality / confounding control | large, well-adjusted, consistent across designs | typical good cohorts; residual confounding | high bias / heavy confounding |
| Consistency (low heterogeneity) | results agree across studies | some inconsistency | studies conflict |
| Precision | tight pooled interval | moderate | wide |
| Directness | hard outcomes, relevant population | partial (surrogate markers) | indirect |
| Effect size | strong (≈ RR ≤ 0.8 or ≥ 1.25) | modest | trivial / null | — *RR taken at realistic habitual intake (see below), not per arbitrary small unit* |
| Dose-response | clear gradient | some | none |
| Freedom from publication / funding bias | tested / independent | possible / mixed | likely / industry-driven |
| Experimental / mechanistic corroboration | RCT on hard outcomes, **or a validated causal pathway** (a robust surrogate→outcome link with an unambiguous, un-offset food effect) | pattern-level RCT, or a weaker/offset surrogate, or mechanism only | none |

Total → tier (mirrors NutriGrade's 80 / 60 / 40% cut-points):

| Tier | Total (of 16) |
|------|---------------|
| **High** | 13–16 (≥ 80%) |
| **Moderate** | 10–12 (≥ 60%) |
| **Low** | 7–9 (≥ 40%) |
| **Very low** | 0–6 (< 40%) |

The exact machine cut-points live in `scoring.js` (e.g. effect size uses
\|ln(RR)\| ≥ 0.223 → 2 and ≥ 0.105 → 1, i.e. RR ≈ 0.80/1.25 and 0.90/1.11;
precision uses ≥ 500k participants → 2 and ≥ 100k → 1).

> **Honest note.** This is our **adaptation** of NutriGrade applied as a rubric,
> *not* a recomputation of an official published score. Where an official
> NutriGrade score or a GBD Burden-of-Proof star rating exists for a food–outcome
> pair, we defer to it.
> _(Source: Schwingshackl et al., NutriGrade, Adv Nutr 2016.)_

**Neutral verdicts are scored differently — on the strength of the null.** Effect
size and dose-response measure the *strength of an effect*, which a null doesn't
have; counting them would structurally cap even a perfectly-studied neutral below
High. So a **neutral** verdict (interval crosses the null) is scored over the
**six evidence-quality dimensions** — study quality, consistency, precision,
directness, freedom-from-bias, experimental corroboration — out of **12** (same
80/60/40% cut-points). This decouples *certainty* (how sure) from *magnitude* (how
big), matching the rest of the model: a large, consistent, precise null can now be
**High certainty neutral**, while a thin or contested one (coconut oil, with no
outcome data) stays Very-low. A null isn't *rewarded* for being null — it just
isn't penalised for it. The card shows the neutral dimensions as `n/a` and the
total out of 12.

> **Caveat — the two scales aren't directly comparable.** Because directional
> verdicts use /16 and neutral verdicts use /12 (same 80/60/40% cut-points), a
> "Moderate-certainty neutral" and a "Moderate-certainty positive" are *not*
> measuring the same thing on the same yardstick: the neutral can't earn (or lose)
> effect-size/dose points at all. A visible consequence is that butter reads
> **Moderate-certainty neutral** while olive oil reads **Low-certainty positive** —
> we look more sure butter does nothing than that olive oil helps. Part of that is
> real (butter's null rests on a far larger meta-analysis), but part is the
> two-denominator artefact. Read the certainty tier as "how solid is the evidence
> for *this kind of verdict*," not as a cross-verdict ranking.

### 4b. Evidence basis — which evidence carries the verdict

Two foods can share a tier for very different reasons. So we also derive, from the
same scores, **what the certainty rests on** (shown as a chip on each card):

- **Convergent** — strong cohort data *and* causal/trial evidence agree (e.g. trans fat).
- **Observation-led** — carried by direct cohort outcome data (e.g. nuts, coffee).
- **Mechanism/trial-led** — thin cohort data, but a validated causal pathway or
  hard-outcome trial carries it. This is how a demonstrable poison with little
  observational data can still earn a confident verdict.
- **Limited / contested** — neither route is strong; held cautiously (e.g. coconut oil).

#### The guardrail: mechanism corroborates, it never overrides

This is the principle that keeps the model honest in both directions:

> **Direction comes from what is *observed to happen* when the food is added to
> real diets. Mechanism can fill a vacuum (when outcome data is sparse) or
> corroborate — but it can never overturn good observational outcome data, and a
> biomarker movement alone never convicts a food.**

Two worked cases:

- *"Carbs spike blood sugar, so carbs are bad."* A glucose spike is a surrogate.
  Whole grains, fruit, and legumes are carb-heavy and show **observed** benefit in
  large cohorts, so they score positive. The biomarker does not override the
  outcome data. (Carry only ≤ 1 experimental point for such a surrogate.)
- *Coconut oil raises LDL.* True, but LDL here is partly offset (HDL also rises)
  and there is essentially **no** outcome data — so it stays neutral / *limited*,
  not "bad." We decline to convict on a biomarker.

Contrast trans fat, where the surrogate link **is** validated (LDL↑ *and* HDL↓,
with a robust LDL→CVD link) and cohorts agree — so mechanism legitimately lifts it.

### 4c. Impact magnitude — how much it moves the needle

Direction and certainty don't say how *big* the effect is. A verdict can be
high-certainty but small (whole fruit: fairly sure, modest per-serving effect) or
high-certainty and large (sugary drinks). So we also derive a **magnitude** tier —
**large / moderate / small / minimal** — from the recorded relative effect
(`pooledRR`), bumped one tier when the food acts on **all-cause mortality** (the
broadest outcome). A true null moves nothing → minimal.

> **Intake convention.** The `pooledRR` behind both effect size and magnitude is
> the relative risk at a **realistic habitual high-vs-low intake** — what the food
> does in the amounts people actually eat — not per arbitrary small unit. A
> per-tiny-unit figure (e.g. trans fat "per 2% of energy") understates calorie-dense
> foods eaten in quantity and would make junk look benign; this convention is why
> trans fat lands at *large* magnitude (and in Bin fodder) rather than moderate.
>
> **Limitation.** Even on the realistic-intake basis, this is still a
> *relative-effect* proxy, not absolute population burden. Capturing absolute
> burden (which weights how common/severe the outcome is, not just the relative
> risk) would need GBD-style attributable fractions — a candidate future input.

**Standout shortlists** combine certainty and magnitude:

- **★ Gold standard** — `effect: positive`, `certainty: high`, `magnitude: large`.
  The surest, highest-impact things to add (currently nuts, whole grains, fibre).
- **✕ Bin fodder** — `effect: negative`, `certainty: high`, `magnitude: large`.
  The surest, highest-impact things to drop (currently processed meat, sugary
  drinks, trans fat).

Each list also shows an **"on the cusp"** tier: foods one notch short on a single
axis (certainty-rank + magnitude-rank = 5), so you can see what would join if a
threshold eased — e.g. trans fat sits just below Bin fodder on magnitude, and
coffee/fish just below Gold standard on certainty. Both lists are *computed*, so
they update automatically as facts/rules change.

### 4d. Conclusions are derived live — and you can re-run the rule

Nothing in the app reads a stored conclusion. The certainty tier shown on a card,
used to sort, and used to compute the shortlists is **recomputed from the recorded
`evidence` facts at render time** by the same `Scoring.assess()` engine the tests
exercise. (`data.js` still carries a `certainty` field, but only as a regression
snapshot a test asserts equals the computed value — it is never displayed.) This
enforces the core policy: every conclusion is reproducibly generated from one
dataset, so a fact can't drift out of sync with the verdict it implies.

Because the rule is a function of the data, we can also run it under a **different
rule** and show what moves. The **Explore** panel applies a named criteria preset
and renders a **diff** — the foods whose certainty tier shifts — while leaving the
published verdicts untouched:

| Preset | Rule | What it reveals |
|--------|------|-----------------|
| Default | All recorded evidence | The published verdicts. |
| Observational only | Zero out the experimental/validated-pathway dimension (keep it in the denominator) | What the cohort data alone supports — e.g. **trans fat drops High → Moderate**, because its high certainty leans on the validated LDL pathway. |
| Trials & mechanism only | Judge *only* on the experimental dimension | Which verdicts have any causal/trial backing at all vs. rest purely on observation. |

The presets live in `Scoring.PRESETS` and are covered by unit tests, so the diff is
itself reproducible. This is a transparency tool, not a second set of conclusions:
the canonical verdict is always the all-evidence one.

## 5. The direction label (Burden-of-Proof logic)

Direction comes from the **sign of the conservatively-estimated association**, the
way the IHME/GBD **Burden of Proof Risk Function** does it: take the
closest-to-null effect compatible with the evidence (accounting for between-study
heterogeneity), and only call a direction if its **uncertainty interval excludes
the null** across the data-dense exposure range.

| Label | Rule |
|-------|------|
| 🟢 **Positive** | Conservative pooled estimate shows **lower** risk with the interval excluding the null, consistently. |
| 🔴 **Negative** | Conservative pooled estimate shows **higher** risk with the interval excluding the null, consistently. |
| 🟡 **Neutral / mixed** | The conservative interval **crosses the null**, the effect is trivially small, or high-quality studies genuinely disagree. |

This deliberately makes **neutral the default** until the evidence clears a bar —
it is harder to earn a directional label than to stay neutral.

> The Burden-of-Proof method is itself **contested** (a 2023 *Nat Med* critique
> argues its conservatism can overstate uncertainty). We adopt its *logic* — be
> conservative, require the interval to exclude the null — without claiming its
> exact star thresholds are settled. Note too that its Risk-Outcome Score
> **conflates effect size with evidence strength**, so a small-but-certain effect
> scores low; we treat magnitude and certainty as separate axes.

### Our combined decision rule (this project's synthesis)

No published source prescribes the *final* combined rule; this is **ours**, stated
so it can be challenged:

1. **Default = Neutral.**
2. Assign **Positive/Negative** when the conservative pooled estimate excludes the
   null in a consistent direction. We do **not** require a minimum certainty for the
   direction — the **certainty tier carries how much to trust it**, so "Positive ·
   Low certainty" stands as an honest, information-preserving verdict rather than
   being laundered into "neutral."
3. **Exception — Very-low certainty falls back to Neutral (leaning …).** Asserting a
   direction on near-nothing overclaims, so at Very-low we state the lean in the
   rationale instead of a hard directional label.
4. **Multi-outcome foods:** the overall "add-to-diet" verdict follows the net
   direction across the priority outcomes (all-cause mortality weighted first); the
   reported certainty is the **lowest** tier among the outcomes that drive the
   verdict.
5. **When grades disagree** (e.g. NutriGrade vs a BoP star rating), take the **more
   conservative** (lower) certainty.

## 6. The biases we explicitly account for

Each food card names the ones that matter most for it.

- **Confounding / healthy-user effect.** "Healthy" eaters differ in many ways;
  studies adjust for measured confounders but **residual** confounding remains. We
  discount effects that plausibly ride on lifestyle and lean on dose-response and
  trials.
- **Reverse causation.** Early disease can change diet. We favor studies that
  exclude early follow-up.
- **The substitution problem.** "Adding" displaces something; the same food can
  look good or bad depending on the comparator. We prefer **substitution /
  isocaloric** analyses and state the relevant swap — **but** we treat their
  conclusions cautiously: a 2026 review found 53% of substitution-modeling studies
  used **unvalidated** food-frequency-questionnaire inputs (FFQ-vs-reference
  correlations median ~0.43). Substitution ambiguity is a **confidence-lowering**
  factor, not a solved problem.
- **Measurement error.** FFQs are noisy; this usually biases associations **toward
  the null** and widens uncertainty.
- **Publication / analytic flexibility.** Single striking studies are discounted in
  favor of comprehensive meta-analyses.

### Causal judgement: Bradford Hill

To judge how *causal* an association looks we informally apply the **Bradford
Hill** considerations — especially **consistency**, **strength**, **dose-response**,
**plausibility/coherence**, and **experiment** (any RCT). None is required or
sufficient alone; together they raise or lower the certainty tier.

> _Attribution: WCRF/AICR, GRADE, and Bradford Hill are standard frameworks used
> here from general knowledge; the verified research run behind this method
> specifically substantiated the **NutriGrade** and **Burden-of-Proof** components
> (see the research file). We flag this so the provenance of each piece is clear._

## 7. How verdicts change — and how to challenge one

This is the core commitment: **conclusions are provisional, dated, and revisable.**

- Every verdict has a `lastReviewed` date and a `certainty` tier.
- Challenges are handled by the maintainer directly: verdicts are reviewed —
  with AI-assisted research — and updated when a challenge holds up. There is no
  public submission form; cards show a note pointing readers to this method.
- A challenge is acted on when it demonstrates at least one of:
  1. **Missed evidence** that shifts the pooled picture;
  2. **A methodological flaw** in how we weighed the evidence (e.g. ignored
     substitution, over-trusted a confounded cohort);
  3. **Superseding evidence** (e.g. a trial, or a re-issued GBD grade) that
     outranks older cohorts.
- When a verdict or its certainty changes, the change is appended to that food's
  **`revisions`** log and shown on the card. If the *method itself* changes, bump
  `METHODOLOGY_VERSION`.

We try to state what *would* change our mind, so verdicts are falsifiable.

## 8. Honest limitations

- The food list is **curated, not exhaustive.**
- Selecting/weighting studies still involves judgement; we cite sources so you can
  check us.
- Verdicts are **population averages**; individuals can differ substantially.
- We grade certainty as a rubric, not by recomputing every published score.
- **Outcome-selection bias (D1).** Most verdicts lean on **all-cause mortality,
  cardiovascular disease, and type-2 diabetes** — the outcomes with the richest
  cohort data. **Cancer outcomes are under-represented**, which can *under-call*
  carcinogens whose main harm is cancer (e.g. alcohol, an IARC Group 1 carcinogen,
  looks near-neutral on the mortality curve). We add cancer outcomes where the
  WCRF/CUP or IARC grade is strong (processed meat → colorectal cancer; soy →
  cancer mortality) and flag the bias where it bites. The forthcoming per-outcome
  model will let a food read "neutral on mortality, negative on cancer" directly.
- **This is not medical or dietary advice.**

---

## Reference frameworks

- **NutriGrade** — Schwingshackl et al., *Adv Nutr* 2016 (certainty scoring for
  cohort/RCT meta-analyses). *[verified in research run]*
- **IHME / GBD Burden of Proof Risk Function** — Zheng et al., *Nat Med* 2022;
  GBD 2021, *Lancet* 2024 (conservative effect + star ratings). *[verified]*
- **World Cancer Research Fund / AICR** — CUP grading criteria & evidence matrix.
- **GRADE** — certainty-of-evidence grading.
- **Bradford Hill (1965)** — viewpoints on association vs causation.
- **Cochrane risk-of-bias** — appraising individual studies.

Full source list and verification notes:
[`research/methodology-research.md`](./research/methodology-research.md).

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 0.26 | 2026-06-29 | **Groups/splits grounding.** Added two food groups: **Fermented dairy** and **Dairy** (Guo 2017, PURE) — both compute to **neutral** (fermented dairy's RR 0.98 is below the directionality floor; total dairy is genuinely population-dependent, protective in PURE / null in Western cohorts). Yogurt/cheese/milk/butter now show their dairy-group conclusions. **Split out French fries** from potatoes: Mousavi 2025 (BMJ, ~205k) shows fries raise T2D (HR 1.20) while baked/boiled/mashed are null (1.01) — a clean preparation-matters split; both now source-verified. 32 foods, **13 source-verified.** |
| 0.25 | 2026-06-29 | **Grounding batch 2.** **Fatty fish** corrected: the old RR 0.64 (~36%, Mozaffarian 2006) was materially optimistic — modern meta-analyses give RR ~0.85 (Zhang 2020 CHD-mortality) to 0.93 (Ricci 2023 CVD); pooledRR 0.64→0.85, N 250k→1.14M, magnitude Large→Moderate, certainty stays Moderate. Noted the Asian-vs-Western gap and that omega-3 *supplement* RCTs are null (Cochrane) — the signal is the food, not pills. **Olive oil** verified (Guasch-Ferré 2022 JACC, HR 0.81) and the open (a4) question settled: PREDIMED tested the whole Mediterranean *pattern*, not the oil alone, so `rctLevel: pattern` is correct and certainty stays Low. **11 of 31 source-verified.** |
| 0.24 | 2026-06-29 | Collapsed-row **group chip** (a food's group verdict shows at a glance — tomatoes reads "⊕ Vegetables: Positive" without expanding). Added the **outcome-selection bias** limitation (D1): verdicts lean on mortality/CVD/T2D, cancer is under-represented (can under-call carcinogens like alcohol); cancer outcomes added where the grade is strong. |
| 0.23 | 2026-06-29 | **Component-context layer** (multi-conclusion model). Foods can carry a "What's in it" block: each constituent worry (saturated fat, sugar) is shown with how the food's *own outcomes* adjudicate it — a component **never sets the verdict**. Cocoa: its saturated fat is largely stearic acid (≈LDL-neutral); sugar caveat noted but outcomes are neutral. The **matrix-not-molecule** contrast is now an explicit feature: the *same* sugar reads Positive in whole fruit and Negative in soda, because the outcomes — not the molecule — decide. |
| 0.22 | 2026-06-29 | **Grounding batch 3.** Verified the last two batch-1 holdouts. **Coffee**: RR 0.83 (0.79–0.88) all-cause mortality at 3–4 cups/day (Poole 2017 BMJ umbrella, corrected; corroborated Crippa 2014, Kim 2019) — added a U-shaped "sweet spot" dose curve. **Processed meat / colorectal cancer**: RR 1.18 (1.10–1.28) per 50 g/day (Chan 2011 PLoS ONE; IARC 2015; WCRF/CUP 2017) — its dose curve is now the first **source-verified** curve. **9 of 31 foods source-verified.** |
| 0.21 | 2026-06-29 | Rule cleanups. **(b2) Directionality floor:** a verdict is directional only if its CI excludes null AND the effect clears a trivially-small floor (\|ln RR\| > 0.03) — `Scoring.isDirectional()`. Butter (RR 1.0134, CI excludes null but ~1% effect) now records `ciExcludesNull: true` honestly and stays neutral *by rule*, not by a hand-set flag. **E2:** severity label "Manageable" → "Minor". **B3 resolved:** dose-response gradient for null associations is moot — neutral verdicts are scored on the six quality dims, which exclude dose-response, so it can't affect a neutral's certainty. |
| 0.20 | 2026-06-29 | **Multi-conclusion model — phase 1.** A food now carries its own verdict PLUS the verdict(s) of the food **group(s)** it belongs to. Groups (`groups.js`) are evidence-bearing classes of *whole foods* (vegetables, …), each scored by the same engine from its own `evidence` — so tomatoes reads "Neutral on its own, but part of **Vegetables → Positive**" without either claim swallowing the other. Direction of inference is whole-food/group → verdict, never component → food (nutrient abstractions like fibre stay context-only). Shipped the **Vegetables** group (Aune 2017) with members tomatoes/leafy-greens/cruciferous. Also **removed `fiber` as a standalone item** (a nutrient, not a food you eat; its message lives in whole grains/legumes/fruit). 31 foods. More groups (fermented dairy, legumes, whole grains) and the per-food self-verdict walk-backs are queued. |
| 0.19 | 2026-06-29 | **Cheese resolved BY THE RULE, neutral → Positive (Low).** Rather than a maintainer judgement, the verified Chen 2017 figure (total CVD RR 0.90, 0.82–0.99) excludes null, so the standing direction rule (label directional when the CI excludes null; certainty carries the doubt) + the multi-outcome rule (net direction; lowest-tier certainty) produce **Positive · Low** automatically — the honest reading of a marginal, confounding-prone protective signal (stroke is null). This is the reproducibility principle in action: borderline cases are settled by the rule applied identically to all foods, not by discretion. 7 foods now source-verified. |
| 0.18 | 2026-06-29 | **Grounding pass — batch 1b.** Source-verified 3 more foods (6 total now). **Tree nuts**: RR 0.78 (0.72–0.84) per 28 g/day confirmed (Aune 2016); heterogeneity low → moderate (I²=66%); stays High. **Trans fat**: industrial CHD RR 1.42 (1.05–1.92) highest vs lowest (de Souza 2015) + per-2%-energy 1.23 (Mozaffarian 2006); pooledRR 1.35 → 1.42; ruminant trans fat confirmed null; stays High. **Butter**: RR 1.0134 (1.0003–1.0266, P=0.045) per 14 g/day, I²=0% (Pimpin 2016); heterogeneity moderate → low; the CI marginally excludes null but the ~1% effect is trivially small so it stays neutral — *not* "butter is back" (also slightly protective for diabetes). **Cheese**: citations corrected to Chen 2017 (CVD RR 0.90, 0.82–0.99, protective) + de Goede 2016 (stroke null) — raises an open verdict question (flip neutral → positive?). **Coffee** and the **processed-meat colorectal** figure were proxy-blocked again — still unverified (batch 3). |
| 0.17 | 2026-06-29 | Added **threshold** dose-response shapes ("Safe up to a point" / "Kicks in past a point") and charted **white rice**'s verified non-linear curve (≈neutral to ~300 g/day, then rising) — which is *why* its diabetes harm is large in rice-staple populations and small in Western diets. The classifier now distinguishes a leading flat run (threshold) from a trailing flat run (plateau); unit-tested. Also added cross-field coherence tests and the cross-scale comparability caveat. |
| 0.16 | 2026-06-29 | Queue work. **Consistency rubric fix (c2):** high heterogeneity (I²) now earns *partial* credit (1, not 0) when the cohorts disagree on magnitude but agree on **direction** (`directionallyConsistent`) — so a robust-but-heterogeneous finding isn't penalised like a genuinely conflicting one. Whole grains gains the credit (11→12) but stays Moderate; no tier flips. **Steelmanning:** added the **WHO 2023 non-sugar-sweetener** guidance to the artificial-sweeteners counter-arguments, evaluated honestly (conditional, low-certainty, reverse-causation-prone → reinforces neutral, not harm). |
| 0.15 | 2026-06-29 | **Grounding pass — batch 1.** Citation-verified the score-driving figures for the first foods against primary meta-analyses and recorded `verified: true` + per-fact `sources` (PMID/DOI). **Whole grains High → Moderate**: the verified Aune 2016 BMJ figure (RR 0.83, 0.77–0.90 per 90 g/day) carries I²=83%, so the consistency sub-score drops — a real grounding-driven tier change (direction unchanged). It also surfaced a rubric tension: high I² with *directional agreement* arguably shouldn't be penalised like genuine disagreement (queued). **Sugary drinks** verified (Malik 2010, RR 1.26, 310,819). **White rice** re-grounded on Yu/Balaji 2022 BMJ Open (RR 1.18 → 1.16; non-linear, harm above ~300 g/day). **Red meat**: added Shi 2023 (Eur Heart J) confirming the diabetes association is stronger/more consistent than mortality — backing the queued per-outcome split. Five items (nuts, trans fat, butter, cheese, coffee) plus the processed-meat colorectal figure were proxy-blocked and remain unverified (batch 1b). |
| 0.14 | 2026-06-29 | Added **dose-response curves** as a prominent per-food feature. A single RR is one point on a curve; where a published dose-response exists we now record its points (`ASSESSMENTS[id].doseCurve`) and render a small zero-dependency SVG plus a plain-language **shape label** — *Dose makes the poison* (monotonic harm), *Diminishing returns* (plateau benefit), *J/U-shaped*, *No dose-response*, etc. The shape is **derived from the points** by `Scoring.classifyDoseShape()` (reproducible, tested), not hand-assigned. Seeded five sourced curves (nuts, whole grains, processed meat, sugary drinks, alcohol-cancer), flagged estimated pending the grounding pass. Display-only — the scored `pooledRR` and all tiers are unchanged. Renaming context: "Yogurt & fermented dairy" → "Yogurt" (cheese, also fermented dairy, is a separate item — the old name double-counted it). |
| 0.13 | 2026-06-29 | **Conclusions are now derived live from the data, not stored.** The certainty tier on every card/highlight/sort is recomputed from the recorded `evidence` facts at render time via `Scoring.assess()` (`data.js`'s `certainty` is kept only as a tested regression snapshot). Added an **Explore** panel: pick an alternate evidence rule (e.g. *Observational only* — ignore trial/mechanism corroboration; *Trials & mechanism only*) and see a **diff** of exactly which verdicts shift, leaving the published verdicts unchanged. This makes concrete that everything is reproducibly generated from one dataset — e.g. observational-only weakens trans fat from High. Rules live in `Scoring.PRESETS`; covered by tests. |
| 0.12 | 2026-06-29 | Added 6 research-grounded foods (26 → 32): green tea (+), white rice (− for diabetes), soy (+), cruciferous veg (+), tomatoes (neutral — biomarker-weak), dark chocolate/cocoa (neutral — COSMOS RCT). Scored under the current rules; category steelman claims auto-attach via tags. Foods the research couldn't ground (berries-specific, garlic, shellfish, fried food, salty snacks, sweets) deliberately not added. All facts carry the "estimated, not source-verified" provenance flag. |
| 0.11 | 2026-06-29 | Fixed a structural conflation (audit follow-up): **neutral verdicts are now scored on the six evidence-quality dimensions (/12)**, not penalised by effect-size/dose-response (which a null can't have) — so a well-established neutral can reach High, while thin/contested ones stay Very-low. Rescored neutrals: butter Low→Moderate; red meat, potatoes, artificial sweeteners Very-low→Low (verdicts unchanged; coconut oil correctly stays Very-low). |
| 0.10 | 2026-06-29 | Honest default (audit C1): unknown/unreported `heterogeneity` now scores **0** for consistency (was 1) — absence of evidence isn't scored as adequate. No tier changes (avocado/coconut-oil stay put). Also adopted the "highlight inadequacies" policy: an honest data-status banner + per-food source-verification chip, and softened over-claiming language. |
| 0.9 | 2026-06-29 | Relaxed the directional-verdict rule: a positive/negative label needs only the conservative interval to exclude the null; the **certainty tier carries the confidence** (so "Positive · Low" stands), with a Very-low → Neutral(leaning) fallback — more transparent than collapsing low-certainty reads to "neutral." Added a test enforcing it. Also: ran an independent gap audit (`AUDIT.md`); fixed a live highlights-chip crash, made magnitude `minimal` when the interval crosses the null, and reconciled version numbers (with a test). Added the "Criticisms of this approach" section and integrated the counter-arguments research. |
| 0.8 | 2026-06-29 | Input-verification sweep of the effect-size basis: recorded an `intakeBasis` for every food (the realistic high-vs-low intake its `pooledRR` refers to), enforced by a test. Re-based whole fruit from per-serving to 2–3 servings/day (RR ≈ 0.90) → Low → Moderate certainty, now on the cusp of Gold standard. |
| 0.7 | 2026-06-29 | Standardised the **effect-size / magnitude intake basis**: `pooledRR` is now the relative risk at realistic habitual high-vs-low intake (what people actually eat), not per arbitrary small unit — so calorie-dense foods eaten in quantity aren't understated. Re-based trans fat off "per 2% energy" → Large magnitude, moving it into Bin fodder. |
| 0.6 | 2026-06-29 | Added a computed **impact-magnitude** axis (large/moderate/small/minimal) separate from certainty, derived from the relative effect with an all-cause-mortality bump; surfaced as a chip and used to compute the **Gold standard** and **Bin fodder** shortlists. Documented its relative-vs-absolute limitation. Renamed per-food counter-arguments to **Steelmanning attempts**. |
| 0.5 | 2026-06-29 | Added a **validated causal pathway** tier to experimental evidence (scores 2), so mechanism-and-trial-led harms aren't undersold — trans fat → High (basis: convergent). Added a derived **evidence-basis** label (convergent / observation-led / mechanism-led / limited) surfaced on each card, and codified the **guardrail** that mechanism corroborates but never overrides observed outcomes (with tests). |
| 0.4 | 2026-06-29 | Made scoring **deterministic and reproducible**: scores are now COMPUTED from recorded objective evidence facts by a pure engine (`scoring.js`), not hand-assigned. Added unit tests for every scoring rule and a data test asserting computed tier == stored certainty. Recomputation shifted eight certainty tiers (verdict directions unchanged): tree-nuts → High; legumes, whole-fruit, olive-oil, milk → Low; trans-fat → Moderate; potatoes, coconut-oil → Very low. |
| 0.3 | 2026-06-28 | Made certainty **reproducible**: added the explicit 8-dimension, 0–2 scoring rubric (max 16) with documented tier cut-points, and a per-food `ASSESSMENTS` record (sub-scores + conservative effect estimate) surfaced on each card. Re-derived certainty from the scores (poultry and cheese moved Moderate → Low; verdict directions unchanged). Challenges are handled by the maintainer directly (no public submission form). |
| 0.2 | 2026-06-28 | Adopted NutriGrade-aligned certainty tiers (High/Moderate/Low/Very low) and Burden-of-Proof direction logic (label only when the conservative interval excludes the null; neutral by default). Added the explicit combined decision rule, multi-outcome and grade-disagreement rules, the substitution/FFQ confidence-lowering caveat, and provenance attribution. Grounded in the verified research write-up. |
| 0.1 | 2026-06-28 | Initial methodology: question framing, evidence hierarchy, WCRF-style tiers, bias handling, Bradford Hill, challenge/revision process. |

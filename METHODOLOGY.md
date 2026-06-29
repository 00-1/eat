# Methodology

**Version 0.3 — living document.** This file is the canonical description of how
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

### 4a. The reproducible scoring rubric

To make certainty reproducible rather than a vibe, every food is scored **0–2 on
eight dimensions** (max 16); the total sets the tier. Each food's scores and the
conservative effect estimate are stored in `data.js` (`ASSESSMENTS`) and shown on
its card.

| Dimension | 2 (strong) | 1 (adequate) | 0 (concern) |
|-----------|-----------|--------------|-------------|
| Study quality / confounding control | large, well-adjusted, consistent across designs | typical good cohorts; residual confounding | high bias / heavy confounding |
| Consistency (low heterogeneity) | results agree across studies | some inconsistency | studies conflict |
| Precision | tight pooled interval | moderate | wide |
| Directness | hard outcomes, relevant population | partial (surrogate markers) | indirect |
| Effect size | strong (≈ RR ≤ 0.8 or ≥ 1.25) | modest | trivial / null |
| Dose-response | clear gradient | some | none |
| Freedom from publication / funding bias | tested / independent | possible / mixed | likely / industry-driven |
| Experimental / mechanistic corroboration | direct RCT on the food–outcome | pattern-level RCT or mechanistic/marker RCTs | none |

Total → tier (mirrors NutriGrade's 80 / 60 / 40% cut-points):

| Tier | Total (of 16) |
|------|---------------|
| **High** | 13–16 (≥ 80%) |
| **Moderate** | 10–12 (≥ 60%) |
| **Low** | 7–9 (≥ 40%) |
| **Very low** | 0–6 (< 40%) |

> **Honest note.** This is our **adaptation** of NutriGrade applied as a rubric,
> *not* a recomputation of an official published score. Where an official
> NutriGrade score or a GBD Burden-of-Proof star rating exists for a food–outcome
> pair, we defer to it.
> _(Source: Schwingshackl et al., NutriGrade, Adv Nutr 2016.)_

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
2. Assign **Positive/Negative** only if the conservative pooled estimate excludes
   the null in a consistent direction **and** certainty is at least **Moderate**.
3. A null-excluding effect with only **Low/Very-low** certainty → still **Neutral
   (leaning …)**, noted in the rationale, not a hard directional verdict.
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
| 0.3 | 2026-06-28 | Made certainty **reproducible**: added the explicit 8-dimension, 0–2 scoring rubric (max 16) with documented tier cut-points, and a per-food `ASSESSMENTS` record (sub-scores + conservative effect estimate) surfaced on each card. Re-derived certainty from the scores (poultry and cheese moved Moderate → Low; verdict directions unchanged). Challenges are handled by the maintainer directly (no public submission form). |
| 0.2 | 2026-06-28 | Adopted NutriGrade-aligned certainty tiers (High/Moderate/Low/Very low) and Burden-of-Proof direction logic (label only when the conservative interval excludes the null; neutral by default). Added the explicit combined decision rule, multi-outcome and grade-disagreement rules, the substitution/FFQ confidence-lowering caveat, and provenance attribution. Grounded in the verified research write-up. |
| 0.1 | 2026-06-28 | Initial methodology: question framing, evidence hierarchy, WCRF-style tiers, bias handling, Bradford Hill, challenge/revision process. |

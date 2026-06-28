# Methodology

**Version 0.1 — living document.** This file is the canonical description of how
this project turns evidence into a *positive / negative / neutral* verdict for a
food. It is meant to be revised. When the method changes, bump the version in
`data.js` (`METHODOLOGY_VERSION`) and record what changed in the
[Changelog](#changelog).

The same content is summarized in the app's **“The approach”** tab; this file is
the fuller reference with sources.

---

## 1. The question

For each food we answer one specific question:

> **When this food is regularly _added_ to a typical free-living diet, what tends
> to happen to long-term health outcomes** — primarily all-cause mortality,
> cardiovascular disease, and type 2 diabetes (plus outcome-specific evidence
> such as colorectal cancer where it is strong)?

Two words matter:

- **Added** — eating more of the food than you do now. Because diets are roughly
  calorie-bounded, adding one food usually means displacing another, so the
  honest answer often depends on **what it replaces** (see §5).
- **Free-living** — real people eating normally over years, not a tightly
  controlled metabolic-ward study of a biomarker for six weeks.

We are deliberately answering a *population-average, real-world* question, not
"is this molecule good for you in a dish."

---

## 2. Why this is hard (and why we grade our confidence)

We usually cannot randomize what people eat for decades, so most diet evidence is
**observational**: we compare people who already eat differently. That is prone
to bias (§5). The honest response is not to pretend we have proof, nor to dismiss
all of it, but to:

1. weight the strongest study designs most,
2. attach an explicit **certainty tier** to every verdict, and
3. **change the verdict when the evidence changes** (§6).

## 3. Evidence hierarchy

In rough priority order:

1. **RCTs on real health outcomes** — strongest, but rare in nutrition
   (e.g. PREDIMED for a Mediterranean pattern).
2. **Meta-analyses of prospective cohort studies** — the main workhorse: pooled,
   long-term follow-up of large populations, ideally with dose-response.
3. **Individual large cohorts** — especially those with dose-response and
   **substitution** analysis.
4. **RCTs on risk markers** (LDL, blood pressure, glucose) and mechanistic data —
   *supporting* evidence that raises or lowers our confidence, not decisive on
   its own.

We prefer evidence that pools many populations and reports **dose-response**
(risk per serving/day), because a consistent dose-response gradient is one of the
stronger hints of a real effect.

## 4. Assigning the label and the certainty tier

### 4a. Direction (the label)

From the pooled effect on the outcomes in §1:

| Label | Meaning |
|-------|---------|
| 🟢 **Positive** | Adding the food is consistently associated with **lower** risk. |
| 🔴 **Negative** | Consistently associated with **higher** risk. |
| 🟡 **Neutral / mixed** | Associations cluster near no effect, are very small, or high-quality studies genuinely disagree. |

As a rough quantitative anchor (not a hard rule), we treat pooled relative risks
within roughly **0.95–1.05 per typical serving** as "neutral" territory unless a
clear dose-response or trial says otherwise. Larger consistent deviations move
the label, scaled by certainty.

### 4b. Certainty tier

Adapted from the **World Cancer Research Fund / AICR** evidence-grading criteria
and the **GRADE** approach. It describes how much we trust the **direction**, not
how big the effect is.

| Tier | Bar |
|------|-----|
| **Convincing** | Consistent across many large, good-quality studies; dose-response; plausible mechanism; ideally trial support. Unlikely to reverse. |
| **Probable** | Generally consistent good-quality evidence, but with gaps or unexplained heterogeneity. |
| **Limited** | Suggestive but sparse, inconsistent, or short follow-up. |
| **Inconclusive** | Genuinely conflicting or too weak to take a side — we say so rather than force a verdict. |

A "neutral" at *probable* (strong studies that converge on no effect) is a very
different claim from a "neutral" at *inconclusive* (we don't yet know).

## 5. The biases we explicitly account for

Each food card names the ones that matter most for that food.

- **Confounding / healthy-user effect.** People who eat "healthy" foods differ in
  many ways (exercise, smoking, income, screening). Studies adjust for measured
  confounders, but **residual confounding** always remains — so we discount
  effects that plausibly ride on overall lifestyle, and lean on dose-response and
  trials to cut through it.
- **Reverse causation.** Early disease can change diet (e.g. at-risk people switch
  to diet drinks; people losing weight from illness eat less of something). We
  favor studies that exclude early follow-up and watch for this pattern.
- **The substitution problem.** "Adding" a food displaces something. The same
  food can look good or bad depending on the comparator (nuts *instead of* chips
  vs. on top of everything). We prefer **substitution / isocaloric** analyses and
  state the relevant swap.
- **Measurement error.** Diet is usually self-reported via food-frequency
  questionnaires, which are noisy. This typically biases associations **toward the
  null** and widens uncertainty.
- **Publication and analytic flexibility.** Single striking studies are discounted
  in favor of pre-registered analyses and comprehensive meta-analyses.

### Causal judgement: Bradford Hill

To decide how *causal* an association looks (not just how statistically clear), we
informally apply the **Bradford Hill** considerations — especially **consistency**
across studies, **strength** of association, **dose-response** (biological
gradient), **plausibility/coherence** with mechanism, and **experiment** (any RCT
evidence). No single criterion is required or sufficient; together they raise or
lower the certainty tier.

## 6. How verdicts change — and how to challenge one

This is the core commitment: **conclusions are provisional, dated, and revisable.**

- Every verdict has a `lastReviewed` date and a `certainty` tier.
- Every food card has a **“Challenge this conclusion”** button that opens a
  structured GitHub issue.
- A challenge is acted on when it demonstrates at least one of:
  1. **Missed evidence** — study/studies we didn't account for that shift the
     pooled picture;
  2. **A methodological flaw** — we weighed the existing evidence wrongly
     (e.g. ignored substitution, over-trusted a confounded cohort);
  3. **Superseding evidence** — new higher-tier evidence (e.g. a trial) that
     outranks the older cohorts.
- When a verdict (or its certainty) changes, the change is appended to that
  food's **`revisions`** log and shown on the card, and `METHODOLOGY_VERSION` is
  bumped if the *method itself* changed.

We try to state what *would* change our mind for each contested food, so the
verdict is falsifiable rather than just an opinion.

## 7. Honest limitations

- The food list is **curated, not exhaustive.**
- Selecting and weighting studies still involves judgement; we cite sources so you
  can check and contest us.
- Verdicts are **population averages.** Individuals (age, genetics, conditions,
  baseline diet) can differ substantially.
- Outcomes considered are mostly mortality/CVD/diabetes; a food can be neutral for
  these and still matter for other outcomes.
- **This is not medical or dietary advice.**

---

## Reference frameworks

- **World Cancer Research Fund / AICR** — Continuous Update Project evidence-grading
  criteria (convincing / probable / limited–suggestive / limited–no conclusion /
  substantial effect unlikely) and the evidence "matrix."
- **GRADE** — Grading of Recommendations, Assessment, Development and Evaluations,
  for rating certainty of evidence.
- **Bradford Hill (1965)** — viewpoints for distinguishing association from
  causation.
- **IHME / Global Burden of Disease "Burden of Proof"** — risk-function and star
  ratings approach to conservative effect estimation.
- **Cochrane risk-of-bias** tooling for appraising individual studies.

> A fuller, source-by-source research write-up of these frameworks lives in
> `research/methodology-research.md`.

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 0.1 | 2026-06-28 | Initial methodology: question framing, evidence hierarchy, label + WCRF/GRADE-style certainty tiers, bias handling, Bradford Hill, and the challenge/revision process. |

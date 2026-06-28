# Research: how to grade observational nutrition evidence into a verdict

This is the source research behind `METHODOLOGY.md`. It was produced by a
multi-source, fact-checked review (fan-out web search → source fetch →
adversarial 3-vote verification → synthesis). Every claim below survived
verification (25/25 verified claims confirmed, 0 refuted). Where the question
asked about frameworks that produced **no surviving verified claim** in this run,
that is stated explicitly as a gap rather than presented as established here.

_Last run: 2026-06-28._

---

## Bottom line

A defensible way to label a food **positive / negative / neutral** when it is
*added* to a free-living diet should combine three things:

1. an explicit **evidence-grading framework** (certainty),
2. a transparent **rule mapping graded evidence to direction + confidence**, and
3. honest handling of the **pitfalls** of nutritional epidemiology.

The verified evidence most strongly supports two complementary, fully specified,
citable systems that operate directly on observational/cohort meta-analyses:
**NutriGrade** (certainty) and the **IHME/GBD Burden of Proof Risk Function**
(conservative direction + strength).

---

## Verified findings

### 1. NutriGrade — a citable certainty score for cohort meta-analyses · _high confidence (3–0)_

NutriGrade is a 9-item, 10-point score mapped to four certainty tiers:

| Score | Certainty tier |
|-------|----------------|
| 8–10 | **High** |
| 6–7.99 | **Moderate** |
| 4–5.99 | **Low** |
| 0–3.99 | **Very low** |

The nine items: (1) risk of bias / study quality, (2) precision, (3)
heterogeneity, (4) directness, (5) publication bias, (6) funding bias, (7) study
design, (8) effect size, (9) dose-response. Designed and validated for **both
RCTs and cohort studies**; in application cohort meta-analyses scored 3.1–8.8,
with decent inter-rater reliability (mean κ 0.66; ICC 0.81).

> Schwingshackl L, et al. "Perspective: NutriGrade." *Advances in Nutrition*, 2016. PMC5105044.

### 2. Burden of Proof Risk Function (BPRF) — conservative strength-of-evidence · _high confidence (3–0)_

The BPRF is the **most conservative (closest-to-null)** interpretation compatible
with the evidence: a Bayesian meta-regression (MR-BRT) that combines the mean
exposure–risk relationship with unexplained between-study heterogeneity, adjusted
for the number of studies.

- For a **harmful** factor, the BPRF is the 5th-percentile (lower-bound) log-RR curve.
- For a **protective** factor, it is the 95th-percentile (upper-bound) curve.

The **Risk-Outcome Score (ROS)** is the signed average of log(BPRF) across the
**data-dense 15th–85th percentiles** of observed exposure — so it jointly encodes
effect magnitude *and* consistency (narrower intervals / less heterogeneity raise
the score). Fixed **star thresholds** (same for harmful and protective):

| ROS | Stars |
|-----|-------|
| ≤ 0 | ★ (1) |
| > 0 – 0.14 | ★★ (2) |
| > 0.14 – 0.41 | ★★★ (3) |
| > 0.41 – 0.62 | ★★★★ (4) |
| > 0.62 | ★★★★★ (5) |

> Zheng P, et al. *Nature Medicine*, 2022 (PMC9556298); GBD 2021, *Lancet*, 2024.

### 3. Star → qualitative tier (with a documented wrinkle) · _medium confidence (2–1)_

GBD 2021 reads stars as: 1–2 = weak, 3 = moderate, 4 = strong, 5 = very strong.
The original 2022 methods paper treats **1 star (ROS ≤ 0)** as a distinct
"conservative interpretation suggests no effect" tier. **Practical implication:** a
1-star pair is the strongest signal to label a food **neutral / insufficient**
(the conservative interval crosses the null); 2-star is weak-but-directional.

### 4. How direction is derived · _high confidence (3–0)_

Direction is read from the **sign of the conservative effect**, expressed as a
percent risk change with a **95% uncertainty interval that excludes the null**,
anchored at a theoretical minimum-risk exposure level (TMREL), and reported over a
relevant exposure range — **not** a single serving extrapolated to extremes.

Worked example (whole grains, *Nutrition Journal* 2024): all four grain–disease
pairs were 2-star but directionally protective at the TMREL (118–148 g/day): type 2
diabetes −37%, colorectal cancer −17%, stroke −22%, ischemic heart disease −37%,
each with 95% intervals excluding the null.

> **Rule a project can adopt:** a positive/negative label requires a conservative
> (BPRF-style) interval that *excludes the null* in a consistent direction;
> otherwise default to **neutral**.

### 5. The substitution problem rests on shaky inputs · _high confidence (3–0)_

Substitution / isocaloric analysis is the formal technique for "what does the food
replace," but its conclusions are often unreliable because they rest on
error-prone FFQ inputs. A 2026 systematic review of 100 substitution-modelling
studies (21 countries) found **53% used unvalidated FFQ-derived variables**; where
validation was reported, FFQ-vs-reference correlations were weak-to-moderate and
highly variable (0.12–0.77, median 0.43); 62% had minimal documentation.

> Song M, Giovannucci E. *Eur J Epidemiol*, 2018 (10.1007/s10654-018-0371-2);
> systematic review, *Eur J Clin Nutr*, 2026 (s41430-026-01712-7).

**Implication:** because "add to diet" *is* a substitution question, measurement
error and substitution ambiguity must be treated as **confidence-lowering**, not
as something isocaloric models fully resolve.

---

## Caveats & contested points

- **Frameworks not verified in this run.** The WCRF/AICR grading matrix
  (convincing / probable / limited–suggestive / limited–no conclusion /
  substantial-effect-unlikely), the Bradford Hill criteria as applied to diet, and
  Cochrane risk-of-bias / GRADE *per se* were requested but produced no surviving
  verified claims here. They are real, standard frameworks (and are used in
  `METHODOLOGY.md` from general knowledge), but their specifics are **not**
  evidence-verified by this particular run.
- **Burden of Proof is contested.** A peer-reviewed critique (*Nat Med* 2023,
  PMC10129864) argues its conservatism inflates uncertainty and that its
  study-design bias correction fails when most input studies are themselves biased.
- **ROS conflates magnitude with strength.** A small-but-certain effect scores low.
  A grading number is not the whole story.
- **Versioning matters.** GBD is re-issued (GBD 2021 published 2024); star ratings
  and thresholds can change, so labels should be tied to a **dated methodology
  version**.
- **All observational.** Residual confounding, reverse causation, and healthy-user
  bias are not fully removed by any grading score; **RCTs remain the
  higher-certainty standard** that labels should defer to when available.
- **Source access:** several primary pages returned HTTP 403 to direct fetch;
  verification used search-engine extraction of abstracts/quotes, but exact decimal
  thresholds were independently reproduced across queries, making misattribution
  unlikely.

## Open questions (project design decisions)

These had no single prescriptive source — they are **our** synthesis choices,
documented in `METHODOLOGY.md`:

1. How to cross-walk WCRF ↔ NutriGrade ↔ BPRF tiers.
2. How to operationalize Bradford Hill beyond what ROS already captures
   (dose-response, consistency).
3. The exact combined decision rule (e.g. require a null-excluding conservative
   interval **and** ≥ Moderate certainty for a directional label, else neutral).
4. When certainty grades disagree, or a food is protective for one outcome and
   harmful for another, how to resolve into one "add-to-diet" verdict.

---

## Sources

1. WCRF/AICR — CUP Global Grading Criteria (Nov 2023). https://www.wcrf.org/wp-content/uploads/2024/11/CUP-Global-Grading-Criteria_November-2023.pdf
2. Schwingshackl L, et al. NutriGrade. *Adv Nutr* 2016. https://pmc.ncbi.nlm.nih.gov/articles/PMC5105044/
3. CDC ACIP — GRADE criteria for certainty of evidence. https://www.cdc.gov/acip-grade-handbook/hcp/chapter-7-grade-criteria-determining-certainty-of-evidence/index.html
4. Schwingshackl L, et al. Methodological quality (cohorts). *Eur J Epidemiol* 2020. https://link.springer.com/article/10.1007/s10654-020-00703-7
5. Substitution-modelling systematic review. *Eur J Clin Nutr* 2026. https://www.nature.com/articles/s41430-026-01712-7
6. Zheng P, et al. Burden of Proof methods. *Nat Med* 2022. https://www.nature.com/articles/s41591-022-01973-2
7. Burden of Proof (open copy). https://pmc.ncbi.nlm.nih.gov/articles/PMC9556298/
8. GBD Burden of Proof — companion. *Nat Med* 2022. https://www.nature.com/articles/s41591-022-01970-5
9. Whole-grain Burden of Proof study. *Nutr J* 2024. https://link.springer.com/article/10.1186/s12937-024-00957-x
10. GBD 2021 risk factors. *Lancet* 2024. https://www.sciencedirect.com/science/article/pii/S0140673624009334
11. IHME — GBD Risk-Outcome Scores (data). https://ghdx.healthdata.org/record/ihme-data/gbd-risk-outcome-scores
12. Song M, Giovannucci E. Substitution analysis — "proceed with caution." *Eur J Epidemiol* 2018. https://link.springer.com/article/10.1007/s10654-018-0371-2
13. Additional sources (dietary assessment, FFQ validation, critiques): see
    PMC8441535, PMC8856007, PMC9630885, PMC8168365, PMC8206235; Ioannidis,
    *JAMA* 2018 (disagreement in nutritional epidemiology); WCRF all-cancers matrix.

_Verification stats: 5 search angles · 23 sources fetched · 59 claims extracted ·
25 verified · 25 confirmed · 0 refuted._

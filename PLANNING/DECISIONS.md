# Decisions Log

Calls we've made, so we don't relitigate them. Newest first.

## Process / architecture
- **Work on `main`.** The designated feature branch is stale; ignore it.
- **Certainty is COMPUTED, never hand-assigned.** A verdict's tier comes from the
  8-dimension NutriGrade-adapted score over the recorded `evidence`. We change a tier
  only by correcting an evidence INPUT to match what a paper reports — never by
  hand-tuning inputs to hit a desired tier. (This is why the audit *held* several
  reviewer tier suggestions.)
- **`verified:true` requires** `sources.pooledRR` + `sources.participants`, each with a
  real PMID/DOI. Enforced by `test/data.test.js`.
- **All-cause "bump" retired (v0.41):** magnitude = pure relative effect (|ln RR|).
  Population importance lives on a separate GBD "Population impact" axis.

## Verdict calls (from the v0.61 audit + earlier)
- **Avocado → positive · Low, HELD.** A reviewer argued very-low/neutral; scored on
  conservative inputs the engine still computes Low, so it stays positive. Mechanism
  (fibre/MUFA→LDL) is *support*, not the verdict; Low reflects a single cohort-pair.
- **Alcohol → negative · Low, HELD.** Tier reflects honestly high heterogeneity/
  confounding. Direction-certainty ≠ evidence-grade; not bumped to Moderate.
- **UPF → negative · Moderate, HELD.** Engine already docks it for high het/confounding;
  further downgrade would be GRADE-philosophy, not an input error.
- **Olive oil → positive · Low, HELD.** Reaching Moderate would need an un-sourced
  larger N / clean pub-bias test. PREDIMED is pattern-level, correctly credited.
- **Soy → positive · Low (was Moderate).** Benefit is Asian-cohort-driven, ~null in
  Western populations; confounding raised to high → computes Low.
- **Trans fat → 1.42 re-anchored to 1.34** (de Souza 2015 all-cause mortality; the
  1.42 was mis-attributed). Still the biggest-harm champion; High unchanged.
- **Shellfish → neutral, no lean** (headline moved to ARIC CHD 0.98; the faint
  positive lean was below the floor once anchored to the verified figure).
- **Red meat → neutral overall, negative for T2D** (Li 2024 HR 1.10 significant,
  already recorded). Mortality signal genuinely contested (GBD vs Burden-of-Proof).
- **Fried foods** = method-level verdict, kept ALONGSIDE French fries; note their
  effects overlap and must not be summed.

## Presentation / naming
- Group-vs-item **scope** tag ("◎ food group") + member↔group cross-links.
- "Population impact" (not "impact: High") to avoid confusion with effect.
- Example members lifted out of names into an `examples` subtitle (names ending "etc.").
- Pills vertically centered (inline-flex).

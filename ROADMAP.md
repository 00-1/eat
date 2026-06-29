# Roadmap

Queued work, roughly in priority order. The model and app architecture are in
place (see `METHODOLOGY.md`); these are the things that make it trustworthy and
comprehensive.

## 1. Verify and tighten the inputs  ⟶ *queued*

The scoring engine is sound, but several recorded facts are well-established
estimates entered from knowledge, not yet citation-verified. The machinery can
make a shaky input look authoritative, so this is the top priority.

- [ ] **Evidence facts** (`data.js` → `ASSESSMENTS[id].evidence`): verify
      `pooledRR`, `participants`, and the ordinal calls (`heterogeneity`,
      `confoundingRisk`, `pubBias`, …) against the cited studies; attach a source
      to each non-obvious one.
- [ ] **Exception prevalence** (`exceptions.js`): replace estimate-with-basis
      figures with sourced numbers (allergy %, lactose malabsorption, celiac,
      IBS, G6PD, PKU, etc.).
- [ ] **Counter-argument attributions** (`counter-arguments.js`): confirm each
      proponent attribution against a real source; expand coverage to the foods
      not yet covered (eggs/cholesterol, dairy/raw-milk/A1-A2, coffee, nuts,
      leafy greens/oxalates, artificial sweeteners both directions, …).
- [ ] Pull the model-level critiques of nutritional epidemiology (Ioannidis,
      healthy-user bias, FFQ unreliability) into a **"Criticisms of this approach"**
      block in the Approach tab.

A dedicated deep-research pass is the intended mechanism (one is already running
for the counter-arguments).

## 2. A reproducible pipeline to expand the food list  ⟶ *queued*

The list is 26 foods; the framework should scale to hundreds. Needed:

- [ ] A written, repeatable **"add a food"** procedure: the exact evidence facts
      to gather, where to source them, how to write the rationale/studies/
      exceptions/steelmanning — so anyone (or a research agent) can add a food and
      get a consistent result. (Partly in README "Adding or editing foods".)
- [ ] Consider a batch research workflow that, given a food name, returns the
      structured `evidence` + `exceptions` + draft studies for human review.
- [ ] Decide list scope/priorities (most-eaten foods first? most-asked-about?).

## 3. Absolute impact (beyond relative effect)  ⟶ *idea*

Magnitude is currently a *relative*-effect proxy (it under-rates trans fat). A
future input could record absolute/attributable burden (GBD-style) so "moves the
needle" reflects real population impact, not just relative risk.

## Done

- Deterministic scoring engine; certainty computed from recorded facts (v0.4).
- Validated-causal-pathway tier, evidence-basis labels, observation-over-mechanism
  guardrail (v0.5).
- Impact magnitude + Gold standard / Bin fodder shortlists; steelmanning (v0.6).
- Per-food subgroup exceptions ("who should be careful").
- Unit + data-integrity tests (`npm test`).

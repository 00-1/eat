# Roadmap

Queued work, roughly in priority order. The model and app architecture are in
place (see `METHODOLOGY.md`); these are the things that make it trustworthy and
comprehensive.

## 0. Audit-driven fixes (from `AUDIT.md`, 2026-06-29) ⟶ *top of queue*

Ordered: live bug → consistency/honesty → grounding → coverage. IDs map to `AUDIT.md`.

**Now (small, verified, low-judgement):** — DONE (v0.8.1)
- [x] **F1** — fixed the live crash: renamed the local `chips` → `chipsHtml` in
      `renderHighlights`. (jsdom click test still queued under F2; covered by the
      Playwright smoke for now.)
- [x] **G1** — reconciled version numbers; added a test that the `METHODOLOGY.md`
      header matches `METHODOLOGY_VERSION`.
- [x] **B1** — magnitude is now `minimal` when `ciExcludesNull === false`; added
      unit + per-food coherence tests (no neutral food advertises an effect).

**Consistency & honest defaults:**
- [ ] **B2** — gate the all-cause magnitude bump on `ciExcludesNull`; stop
      inflating borderline RRs; correct the trans-fat narrative in README/METHODOLOGY.
- [x] **C1** — `heterogeneity: unknown → 0` (conservative); test updated. No tier
      changes. (v0.10)
- [ ] **B3** — `doseResponse` for null associations: open question — naive
      "set none for RR≈1" wrongly catches alcohol (real harm gradient). Needs
      per-food judgement (eggs/milk/cheese yes; alcohol/potatoes no), and it
      interacts with how neutral-verdict certainty should treat absence-of-gradient.
      *Pending decision.*
- [x] **C3** — resolved by **relaxing** the rule (v0.9): directional labels need
      only a null-excluding interval; the certainty chip carries confidence;
      Very-low falls back to neutral. No verdicts changed (none were directional at
      very-low). Test added enforcing it.
- [ ] **B3** — set `doseResponse: none` for null associations (eggs, milk, cheese)
      or justify the gradient.
- [ ] **G2** — soften "objective/pure/we didn't type these" language to
      "deterministic given the recorded judgements."

**Provenance (the central concern) — make data as inspectable as the method:**
- [ ] **A1/A3** — add a `source` (PMID/DOI/figure) per score-driving fact incl.
      ordinal calls; test that score-driving facts are sourced.
- [x] **A2/E1** — provenance is now surfaced: a persistent honest "Data status"
      banner ("N of 26 source-verified … treat verdicts as provisional") + a
      per-food `verified` flag rendered as a "facts estimated / ✓ source-verified"
      chip. The flags flip to true as the verification pass (A1/A3) lands.
- [x] **G2** — softened "objective/pure/we didn't type these" language to
      "deterministic given the recorded judgements" across scoring.js/METHODOLOGY/
      ADDING-FOODS/the Approach tab.
- [ ] **B5/B6/G3** — record RRs that match a real reported figure for the stated
      outcome (flag extrapolations like trans-fat 1.35); replace placeholder
      citations; store PMIDs/DOIs.

**Coverage:**
- [ ] **D1** — add cancer outcomes where WCRF/CUP grades are strong; state the
      CVD/mortality bias as a limitation.
- [ ] **D2** — record per-food per-category exception status (checked-clear vs n/a).
- [ ] **D3** — render "no counter-arguments assessed yet" placeholder; finish the
      steelman backlog (second research pass — see §1).
- [ ] **F2/F3** — add jsdom UI tests + cross-field data-coherence tests.
- [ ] **E2** — reconsider the "Manageable" severity label.

The grounding items (A1/A2/A3, B5, D1) overlap with §1 below and should be done
together.

## 1. Verify and tighten the inputs  ⟶ *in progress*

The scoring engine is sound, but several recorded facts are well-established
estimates entered from knowledge, not yet citation-verified. The machinery can
make a shaky input look authoritative, so this is the top priority.

- [x] **Effect-size intake basis**: ensure every `pooledRR` is at realistic
      habitual intake (not per arbitrary small unit), and record the intake each
      RR refers to (`intakeBasis`). *(v0.7–v0.8)*
- [ ] **Evidence facts** (`data.js` → `ASSESSMENTS[id].evidence`): verify
      `pooledRR`, `participants`, and the ordinal calls (`heterogeneity`,
      `confoundingRisk`, `pubBias`, …) against the cited studies; attach a source
      to each non-obvious one.
- [ ] **Exception prevalence** (`exceptions.js`): replace estimate-with-basis
      figures with sourced numbers (allergy %, lactose malabsorption, celiac,
      IBS, G6PD, PKU, etc.).
- [~] **Counter-argument attributions** (`counter-arguments.js`): verified and
      source-strengthened from the deep-research pass for fruit, red meat (+ the
      industry-funding nuance), butter/milk/cheese (food-matrix), coconut oil,
      alcohol, sugary drinks, and artificial sweeteners (microbiome). **Still to
      cover** (research returned no verified claims — unresearched, not refuted):
      grains/gluten/lectins, legumes anti-nutrients, nuts (omega-6/oxalates),
      leafy-green oxalates, fish/mercury depth, olive-oil adulteration,
      eggs/cholesterol/TMAO, processed-meat nitrite defenses, raw-milk/A1-A2,
      coffee (cortisol/acrylamide), the NOVA/UPF critique depth, potatoes/yogurt/avocado.
- [x] Model-level critiques (Ioannidis, healthy-user/selection bias, FFQ
      unreliability, industry funding) added as **"Criticisms of this approach"**
      in the Approach tab, answered with symmetric skepticism. *(v0.9)*

The first deep-research pass (v0.9) is integrated; a second, targeted pass is
needed for the unresearched foods above.

## 2. A reproducible pipeline to expand the food list  ⟶ *queued*

The list is 26 foods; the framework should scale to hundreds. Needed:

- [ ] A written, repeatable **"add a food"** procedure: the exact evidence facts
      to gather, where to source them, how to write the rationale/studies/
      exceptions/steelmanning — so anyone (or a research agent) can add a food and
      get a consistent result. (Partly in README "Adding or editing foods".)
- [ ] Consider a batch research workflow that, given a food name, returns the
      structured `evidence` + `exceptions` + draft studies for human review.
- [ ] Decide list scope/priorities (most-eaten foods first? most-asked-about?).

## Policy

**Highlight inadequacies, don't hide them.** Going forward, any known weakness —
unverified inputs, coverage gaps, contested verdicts, method limitations — is
surfaced in the app/docs by default rather than left implicit. Transparency about
what we *don't* know is a feature, not an embarrassment.

## Publishing  ⟶ *backlog*

- [ ] Deploy as a GitHub Pages site (static, no build step — should be trivial).
      Not yet published; no viewer yet.

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

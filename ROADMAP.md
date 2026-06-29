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

## Live-derived conclusions + Explore diff  ⟶ *done (v0.13)*

- [x] Conclusions are no longer stored: the certainty tier on every card, sort, and
      shortlist is recomputed from the recorded `evidence` facts at render time via
      `Scoring.assess()`. `data.js`'s `certainty` is retained only as a tested
      regression snapshot.
- [x] **Explore** panel: a criteria preset (`Scoring.PRESETS`) re-runs the rule and
      shows a diff of which verdicts shift, leaving the published verdicts unchanged.
      "Observational only" weakens trans fat High → Moderate (the worked example);
      "Trials & mechanism only" isolates causal backing. Covered by unit + data
      tests and a browser smoke check.

## Dose-response curves  ⟶ *display layer done (v0.14); data + per-outcome to extend*

A single RR is one point on a curve; the shape is the rest of the story. Done:
- [x] `doseCurve` data (points + unit + normalRange + source) on assessments;
      zero-dependency inline-SVG renderer + collapsed-row shape chip; placed
      prominently (right under the verdict rationale).
- [x] Shape label **derived** from the points by `Scoring.classifyDoseShape()`
      (monotonic-harm "dose makes the poison" / plateau-benefit "diminishing
      returns" / j-u-curve / flat / …), unit-tested + a data test that the recorded
      shape matches the derived one. Display-only — `pooledRR` and tiers unchanged.
- [x] Seeded 5 sourced curves (nuts, whole grains, processed meat, sugary drinks,
      alcohol-cancer), flagged `verified: false`.
- [ ] **Populate more curves during the grounding pass** — grab dose-response
      points whenever verifying a figure (cheap once the paper is open).
- [ ] **Per-outcome curves**: alcohol's cancer curve (monotonic harm) and mortality
      curve (contested J) are different shapes — needs the per-outcome model so each
      gets its own line instead of one curve + a caveat note.
- [ ] Mark a curve `verified: true` once its points are source-checked.

## Multi-conclusion model (self-verdict + food-group verdicts; components as context)  ⟶ *queued (next major design)*

From the food-by-food walkthrough (tomatoes/cocoa). A single verdict per row is
sometimes dishonest in two opposite ways: it over-credits a specific food with its
group's evidence (we quietly gave cruciferous/leafy-greens the vegetable-group RR),
or it buries a real group signal under a thin food-specific one (tomatoes). Fix:
let an item carry **its own outcome verdict plus the verdict(s) of the food
group(s) it belongs to**, all computed by the same engine.

**Settled design decisions:**
- **Items = things you can actually eat/add** (whole foods + addable supplements
  like fish-oil capsules) are the only verdict-bearing rows.
- **Food groups** (vegetables, fruit, legumes, nuts, whole grains…) are sets of
  whole foods with their *own* observed outcomes; each is a scored entity and shows
  on a member's card as a secondary **"as part of …"** conclusion (propagates down
  because it's a collection of edible whole foods). Primary card view stays
  food-centric, not a separate group list.
- **Components/nutrients** (fibre, omega-3, sugar, saturated fat, polyphenols) are
  **never items and never verdicts** — only a context layer the food's own outcome
  *adjudicates*. **Direction of inference is whole-food/group → verdict, never
  component → food** (codifies/strengthens the existing "mechanism corroborates,
  never overrides" guardrail; the engine already starves mechanism-only entities of
  certainty — see coconut oil).

**Concrete tasks:**
- [ ] **Remove `fiber` as a standalone item** (a nutrient, not a food); its message
      already lives in whole grains / legumes / fruit / veg. Reframe fibre as
      component context. (Drops one High-positive row — the honest move.)
- [ ] Add a `GROUPS` entity set (own `evidence` → engine → verdict) + a food→groups
      membership map; reuse/merge with the existing `FOOD_TAGS`/`SHARED_CLAIMS`
      machinery in `counter-arguments.js`.
- [ ] Re-ground items that were riding a group's evidence: walk **cruciferous** and
      **leafy greens** self-verdicts back to their honest (thinner) food-specific
      level, with strength now living in the Vegetables / Cruciferous group rows.
- [ ] **Processing classes as groups, not items.** Ultra-processed foods and
      refined grains are *classes*, not things you eat directly (same problem as
      fibre) — but they have real outcome evidence (Hall RCT for UPF), so they
      survive as **groups** with member items (soda, white bread, white rice…), not
      standalone rows.
- [ ] **Item-splitting where one row hides two foods.** Potatoes bundles
      boiled/baked (≈neutral) with fries (worse); cocoa bundles the flavanol extract
      (trialled) with the chocolate bar (sugar+fat). Split into distinct items where
      the outcome genuinely differs by form/preparation.
- [ ] **Fermented dairy** as a group: yogurt + cheese (+ kefir, quark…) are all
      fermented dairy but currently scattered as separate items with different
      outcomes/verdicts. The old "Yogurt & fermented dairy" name double-counted
      cheese (fixed by renaming to "Yogurt", v0.13). Model "fermented dairy" as a
      group both belong to, with its own group-level evidence if it exists. Likewise
      audit the broader **Dairy** category for the same scatter (milk/cheese/butter/
      yogurt each carry a slice).
- [ ] **Tomatoes**: self neutral/low + Vegetables (positive) group conclusion.
- [ ] **Cocoa/dark chocolate**: keep neutral (adjudicated by COSMOS + cohorts);
      render sugar/sat-fat as component context that does NOT set the verdict, noting
      cocoa-butter sat fat is largely stearic (≈LDL-neutral).
- [ ] Surface the matrix-not-molecule contrast as a feature (sugar in whole fruit =
      positive vs sugar in soda = negative).
- [ ] UI: card shows primary food verdict + "as part of" group chips (each with its
      own live-derived tier) + a component-context block; explore/shortlists/tests
      updated. Engine untouched.

## Walkthrough-surfaced calibration items  ⟶ *queued*

Three issues the food-by-food review exposed where the engine is behaving but the
*calibration* is questionable. None is a bug; all are "highlight inadequacies."

- [ ] **(a) Red-meat vs white-rice diabetes inconsistency.** White rice is
      Negative/Moderate for type-2 diabetes (RR 1.18, CI excludes null) while
      unprocessed red meat lands Neutral (RR 1.10, CI crosses null) — yet red
      meat's T2D association (heme iron, repeated cohorts) is at least as
      consistent. The whole flip rides one `ciExcludesNull` call. Actions: (1) let
      the grounding pass pin red meat's T2D figure to a real meta-analysis; (2) this
      is the first concrete case for **per-outcome** verdicts — red meat may be
      "neutral overall, negative-for-diabetes." Fold into the multi-conclusion work
      (per-outcome, not just per-group). Audit that foods sharing an outcome get
      `ciExcludesNull` set by a consistent rule, not case-by-case.
- [ ] **(a2) Alcohol may be under-called as neutral.** "Neutral" rests on
      bias-adjusted all-cause mortality at *moderate* intake; but alcohol is an
      IARC Group 1 carcinogen with cancer risk rising from low intake. On the cancer
      outcome it's clearly negative. Another per-outcome case (neutral-on-mortality,
      negative-on-cancer); for a tool about *adding* a food from zero, the headline
      arguably should lean negative. Revisit once cancer outcomes land (D1) and the
      per-outcome model exists.
- [ ] **(a3) Surface WHO 2023 non-sugar-sweetener guidance** in the artificial-
      sweeteners steelmanning — the conditional recommendation against NSS for weight
      control is a notable authoritative lean we don't currently show. Evaluate it
      honestly (it's conditional/low-certainty; reverse-causation critique applies).
- [ ] **(a4) Olive oil PREDIMED `rctLevel` call.** Currently `pattern` (1 pt) →
      Low certainty. The EVOO arm arguably tests the oil closer to `outcomes` (2 pts)
      → would lift to Moderate. Settle during the grounding pass (note PREDIMED's
      2018 retraction/republication).
- [ ] **(b) All-cause-mortality magnitude bump over-fires.** The one-tier bump for
      acting on all-cause mortality pushes moderate-RR foods (coffee RR 0.83,
      |ln|≈0.19 → moderate) up to "large," the same tier as trans fat. Recalibrate:
      e.g. only bump when the all-cause effect itself excludes null and is already
      ≥ small, or make the bump a half-step, or gate it on absolute burden once
      §3 lands. Several foods currently inherit "large" this way — list them and
      decide per case.
- [ ] **(c) Neutral-/12 vs directional-/16 cross-scale optics.** Butter reads
      Moderate-certainty *neutral* (8/12) while olive oil reads Low-certainty
      *positive* (8/16) — i.e. we look more sure butter does nothing than that olive
      oil helps. Partly real (butter's null rests on a far larger meta-analysis),
      partly an artifact of the two denominators. Action: check whether the /12 and
      /16 tier cut-points are fairly comparable across a matched evidence base, and
      either adjust or add an explicit note in METHODOLOGY that the two scales
      aren't directly comparable.

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
      to each non-obvious one. **Batch 2 candidates flagged by the walkthrough:**
      fatty fish (RR 0.64 likely optimistic vs modern analyses & null supplement
      RCTs); trans fat (1.35 extrapolation); olive oil (PREDIMED rctLevel, item a4).
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

## 2. Scale food coverage toward hundreds  ⟶ *next major thrust*

The list is 26 foods; the aim is hundreds. It's practical, but the bottleneck is
rigorous per-food evidence (≈ one research run yields 6–12 well-grounded foods),
so this is a sustained pipeline, not a one-shot. Plan:

- [ ] **Taxonomy-first.** Most of the long tail should INHERIT a food-group verdict
      (the category/shared-claim machinery already exists) rather than be an
      independent entry. Add specific foods only where they genuinely diverge from
      their group. Define the food-group taxonomy.
- [ ] **Batch research pipeline.** Repeatable deep-research runs of ~10 foods →
      structured `evidence`/`studies`/`exceptions` drafts → checked against
      `ADDING-FOODS.md` before commit. (Resume-on-stall; the runs have been flaky.)
- [ ] **Accept (and surface) the long tail is uncertain.** Most less-studied foods
      will be Low/Very-low certainty or Neutral — honest, not a failure. The
      data-status banner already frames this.
- [x] **Integrate the foods the completed research already grounds:** green tea,
      white rice, soy, cruciferous veg, tomatoes (biomarker-weak), cocoa (COSMOS
      RCT → neutral). Done in v0.12 (26 → 32 foods). NOT grounded by research yet
      (do not invent): berries-specific, garlic/allium, shellfish, fried food,
      salty snacks, sweets — need a targeted research pass.

Original sub-tasks:

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

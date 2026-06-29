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
- [x] **B3** — RESOLVED (v0.21): moot. Neutral verdicts are scored on the six
      quality dims, which exclude dose-response, so `doseResponse` cannot affect a
      neutral food's certainty. (Cheese is now directional and its "some" gradient is
      justified by Chen 2017's non-linear dose-response.)
- [x] **C3** — resolved by **relaxing** the rule (v0.9): directional labels need
      only a null-excluding interval; the certainty chip carries confidence;
      Very-low falls back to neutral. No verdicts changed (none were directional at
      very-low). Test added enforcing it.
- [x] **B3** (dup) — resolved above.
- [x] **G2** (dup) — done (line 46).

**Provenance (the central concern) — make data as inspectable as the method:**
- [~] **A1/A3** — framework DONE: per-food `verified` flag + `sources` map (figure +
      PMID/DOI per score-driving fact), enforced by a test; surfaced via the chip and
      banner. 9/31 foods sourced so far — the rest fill in as grounding proceeds.
- [x] **A2/E1** — provenance is now surfaced: a persistent honest "Data status"
      banner ("N of 26 source-verified … treat verdicts as provisional") + a
      per-food `verified` flag rendered as a "facts estimated / ✓ source-verified"
      chip. The flags flip to true as the verification pass (A1/A3) lands.
- [x] **G2** — softened "objective/pure/we didn't type these" language to
      "deterministic given the recorded judgements" across scoring.js/METHODOLOGY/
      ADDING-FOODS/the Approach tab.
- [~] **B5/B6/G3** — done for the 9 verified foods (RRs matched to real reported
      figures, PMIDs/DOIs stored, extrapolations corrected — e.g. trans-fat 1.35→1.42).
      Remaining foods fill in as grounding proceeds.

**Coverage:**
- [~] **D1** — limitation note DONE (v0.24): outcome-selection bias stated in
      METHODOLOGY (mortality/CVD/T2D-heavy; cancer under-represented → under-calls
      carcinogens like alcohol). Cancer outcomes present where grade is strong
      (processed meat→colorectal, soy→cancer mortality). Broader cancer-outcome
      coverage waits on the per-outcome model + grounding.
- [ ] **D2** (deferred — deliberate data task, lower value): record per-food
      per-exception-type status (checked-clear vs n/a) so the fixed checklist's
      coverage is visible. Verbose (31 foods × ~7 types); do as its own pass.
- [~] **D3** — placeholder DONE (v0.17): foods with no steelman now show an honest
      "no counter-argument assessed yet — known gap" note (8 foods: fiber, olive-oil,
      coffee, avocado, trans-fat, poultry, green-tea, tomatoes). Finishing the
      steelman backlog (second research pass) still pending — see §1.
- [~] **F2/F3** — cross-field data-coherence tests added (pooledRR-direction match,
      outcomes non-empty, dose-curve schema/shape; v0.16). jsdom UI tests (F2) still
      pending — the Playwright smoke covers the live path for now.
- [x] **E2** — DONE (v0.21): "Manageable" → "Minor".

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
- [x] **Remove `fiber` as a standalone item** (v0.20) — a nutrient, not a food; its
      message lives in whole grains / legumes / fruit. 31 foods now.
- [x] Add a `GROUPS` entity set (own `evidence` → engine → verdict) + a food→groups
      membership map (`groups.js`); rendered as an "as part of a food group" block on
      member cards, scored live. **Phase 1 shipped the Vegetables group** (members
      tomatoes/leafy-greens/cruciferous) — tomatoes now shows neutral-self +
      Vegetables-positive. Tested.
- [~] **More groups** with real evidence. DONE (v0.26): **Fermented dairy** + **Dairy**
      groups added (Guo 2017 / PURE; both neutral — fermented dairy below the floor,
      total dairy population-dependent). Fruit/legumes/whole-grains groups NOT added —
      they'd overlap the existing same-name *items*; resolving that needs an item
      rename (e.g. "legumes" item → "beans & lentils" + a legumes group). Queued.
- [ ] Re-ground items that were riding a group's evidence: walk **cruciferous** and
      **leafy greens** self-verdicts back to their honest (thinner) food-specific
      level (needs per-food evidence work — their current self RR is borrowed from
      the F&V umbrella). Now lower-stakes since the group conclusion carries the
      strength.
- [x] Compact group chip on the collapsed card (v0.24) — tomatoes shows
      "⊕ Vegetables: Positive" at a glance.
- [x] **Processing classes — DECIDED: keep as items.** Unlike fibre (a molecule you
      can't eat), ultra-processed food and refined grains are *consumable dietary
      patterns* you can meaningfully shift toward/away from, with direct outcome
      evidence (the Hall RCT literally fed "an ultra-processed diet"). So they stay
      as verdict-bearing items; specific members (soda→sugary-drinks, white rice) are
      also their own items. No disruptive refactor.
- [x] **Item-splitting.** Cocoa: resolved via component-context (v0.23). Potatoes→fries:
      DONE (v0.26) — **French fries** split into its own item (Mousavi 2025 BMJ, T2D
      HR 1.20 vs null for baked/boiled); both source-verified.
- [ ] **Fermented dairy / dairy scatter** — the broad **Dairy** audit is now partly
      addressed by the Dairy group; the legumes/fruit/whole-grains item-vs-group rename
      is the remaining structural cleanup.
- [x] **Fermented dairy** as a group — DONE (v0.26): yogurt + cheese map to a
      Fermented-dairy group (Guo 2017, neutral); milk/cheese/butter/yogurt map to a
      broader Dairy group (PURE/Guo, neutral). Both scored live.
- [x] **Tomatoes**: self neutral/low + Vegetables (positive) group conclusion. DONE (v0.20).
- [x] **Cocoa/dark chocolate**: DONE (v0.23). Stays neutral; sugar/sat-fat rendered
      as component context that does NOT set the verdict, noting cocoa-butter sat fat
      is largely stearic (≈LDL-neutral).
- [x] **Matrix-not-molecule** contrast surfaced as a feature (v0.23): same sugar reads
      Positive in whole fruit, Negative in soda — component-context blocks on both.
- [ ] UI: card shows primary food verdict + "as part of" group chips (each with its
      own live-derived tier) + a component-context block; explore/shortlists/tests
      updated. Engine untouched.

## Walkthrough-surfaced calibration items  ⟶ *queued*

Three issues the food-by-food review exposed where the engine is behaving but the
*calibration* is questionable. None is a bug; all are "highlight inadequacies."

- [~] **PER-OUTCOME MODEL.** FRAMEWORK DONE (v0.27, in parallel with the running
      research): additive `outcomeVerdicts` (each own evidence + optional dose curve,
      scored live) rendered as a "By individual outcome" block; tested. Just needs
      POPULATING with the sourced figures (red-meat→T2D, alcohol→cancer) from the
      running batch — then (a), (a2), and per-outcome curves all close.
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
- [x] **(a3) Surface WHO 2023 non-sugar-sweetener guidance** in the artificial-
      sweeteners steelmanning. DONE (v0.16): added as an attributed counter-argument,
      evaluated honestly (conditional, low-certainty, reverse-causation-prone →
      reinforces neutral, not harm).
- [x] **(a4) Olive oil PREDIMED `rctLevel` — RESOLVED (v0.25).** Grounding confirmed
      PREDIMED tested the whole Mediterranean *pattern* (EVOO supplied to the MedDiet
      arm), not the oil in isolation → `rctLevel: pattern` is correct; olive oil stays
      Low. Verified on Guasch-Ferré 2022 (HR 0.81).
- [ ] **(b) All-cause-mortality magnitude bump over-fires.** The one-tier bump for
      acting on all-cause mortality pushes moderate-RR foods (coffee RR 0.83,
      |ln|≈0.19 → moderate) up to "large," the same tier as trans fat. Recalibrate:
      e.g. only bump when the all-cause effect itself excludes null and is already
      ≥ small, or make the bump a half-step, or gate it on absolute burden once
      §3 lands. Several foods currently inherit "large" this way — list them and
      decide per case.
- [x] **(c) Neutral-/12 vs directional-/16 cross-scale optics.** DONE (note option,
      v0.16): added an explicit METHODOLOGY caveat that the two scales aren't directly
      comparable (the butter-vs-olive-oil case spelled out), so the certainty tier is
      read as "how solid for *this kind* of verdict," not a cross-verdict ranking. A
      deeper recalibration of the cut-points remains optional/open.

## 1. Verify and tighten the inputs  ⟶ *in progress*

The scoring engine is sound, but several recorded facts are well-established
estimates entered from knowledge, not yet citation-verified. The machinery can
make a shaky input look authoritative, so this is the top priority.

- [x] **Effect-size intake basis**: ensure every `pooledRR` is at realistic
      habitual intake (not per arbitrary small unit), and record the intake each
      RR refers to (`intakeBasis`). *(v0.7–v0.8)*
- [~] **Evidence facts** (`data.js` → `ASSESSMENTS[id].evidence`): verify
      `pooledRR`, `participants`, and the ordinal calls (`heterogeneity`,
      `confoundingRisk`, `pubBias`, …) against the cited studies; attach a source
      to each non-obvious one.
      - **Batch 1 done (v0.15):** whole grains (→ Moderate, I²=83%), sugary drinks,
        white rice verified with PMID/DOI sources; red meat strengthened (Shi 2023).
      - **Batch 1b done (v0.18):** tree nuts (0.78, I²=66% → het moderate, stays
        High), trans fat (de Souza 2015 industrial CHD 1.42 + Mozaffarian 1.23;
        1.35→1.42, stays High), butter (Pimpin 2016, 1.0134, I²=0%; stays neutral,
        "not butter-is-back"). Cheese citations corrected (Chen 2017 + de Goede) —
        verdict question open (below). **6 foods now source-verified.**
      - **Batch 3 done (v0.22):** coffee (Poole 2017, RR 0.83, 0.79–0.88; + U-shaped
        dose curve) and processed-meat colorectal cancer (Chan 2011/IARC, RR 1.18,
        1.10–1.28; dose curve now source-verified). **9 of 31 source-verified.**
      - **Batch 2 done (v0.25):** fatty fish corrected (0.64→0.85, Zhang 2020/Ricci
        2023; magnitude Large→Moderate, stays Moderate; Asian-vs-Western noted;
        supplement RCTs null). Olive oil verified (Guasch-Ferré 2022, 0.81) and (a4)
        settled — PREDIMED is pattern-level, stays Low. **11 of 31 source-verified.**
- [x] **Cheese verdict — resolved BY THE RULE (v0.19), neutral → Positive (Low).**
      Not a maintainer call: Chen 2017's verified CVD RR 0.90 (0.82–0.99) excludes
      null, so the direction rule + multi-outcome rule produce Positive · Low
      automatically; the borderline/confounding-prone evidence is carried by the Low
      tier. Confirms the reproducibility principle — borderline cases settle by rule,
      not discretion.
- [x] **(b2) Magnitude floor for directionality.** DONE (v0.21): `Scoring.isDirectional()`
      requires CI-excludes-null AND \|ln RR\| > 0.03. Butter now records
      `ciExcludesNull: true` honestly and stays neutral by rule. Tested.
- [ ] **Audit all `heterogeneity` inputs.** Whole grains was recorded `low` but the
      verified I² is 83% (`high`). Other foods' heterogeneity may be similarly
      optimistic — re-check each against its source during grounding.
- [x] **(c2) Consistency rubric: I² vs directional agreement.** DONE (v0.16): high
      I² now earns partial credit (1, not 0) when cohorts agree on direction
      (`directionallyConsistent`). Whole grains gained the credit (11→12) but stays
      Moderate — to reach High it would also need stronger experimental/precision
      support, which is the honest result. No tier flips.
- [x] **White-rice threshold curve.** DONE (v0.17): added `threshold-harm` /
      `threshold-benefit` shapes (classifier distinguishes leading-flat threshold
      from trailing-flat plateau) and charted white rice's verified non-linear curve.
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

- [x] A written, repeatable **"add a food"** procedure — `ADDING-FOODS.md`, updated
      (v0.24) to the full current schema: evidence facts, directionality floor,
      provenance (`verified`/`sources`), `doseCurve`, `components`, group membership,
      and the test contract.
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

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

## Explore lens re-derives the VERDICT (not just certainty)  ⟶ *done (v0.29)*

- [x] Each preset maps to an evidence **lens** (`Scoring.verdictUnderLens`) that
      re-derives **direction + certainty**. "Trials & mechanism only" ignores cohorts
      and lets `experimentalDirection` set the verdict ("none" → Insufficient). 28/32
      shift, 18 flip direction — sat-fat foods get re-condemned by LDL, cohort-only
      winners go Insufficient, fatty fish goes neutral (null supplement RCTs). The
      diff shows full before→after verdict chips. Tested.

### Mechanistic-lens follow-ups  ⟶ *queued*

- [x] **Mechanistic research pass — DONE (v0.36).** Recorded per-food trial/mechanism
      evidence + sources in a `MECHANISM` record; **(a)** actual RCT/marker/pathway facts
      captured; **(b)** `experimentalDirection` now *derived* from it, not asserted;
      **(c)** the `none` foods re-examined — leafy-green nitrate→BP (Siervo 2013),
      green-tea catechin LDL/BP, avocado lipid RCT (Wang 2015), tomato/lycopene markers,
      etc. **All 12 hand-guesses that were wrong got corrected and zero `none` remain.**
      Caveat: figures are snippet-cross-verified (WebFetch to journals is proxy-blocked),
      not page-rendered — a notch below "opened the PDF."
- [x] **Per-food "Under a different lens" section — DONE (v0.36).** Detail-view block
      shows the verdict under **All evidence / Observational only / Trials & mechanism
      only** (via `verdictUnderLens`), flagged **converge / in tension / contradict**,
      with the grounded mechanism evidence + a per-food reconciliation note. Cheese
      *contradicts* (matrix/outcomes overrule the LDL marker); eggs, coffee, red meat,
      french fries are *in tension*; the strong positives/negatives *converge*. The
      original spec is below (now implemented).
- [~] **Original spec (implemented above):** a detail-view block showing the food's
      verdict under **Default / Observational only / Trials & mechanism only** (via
      `verdictUnderLens`), flagged **AGREE** or **CONTRADICT**. Where they contradict
      (cheese +obs/−mech, butter & coconut & eggs neutral-obs/−mech, fruit
      +obs/insufficient-mech, fatty fish +obs/neutral-mech…), don't just display it —
      **argue it out for that specific food**: does our blanket "prefer observation"
      stance actually hold *here*, given the weight of the mechanistic evidence? The
      honest outcomes differ per food:
        - *observation rightly wins* — mechanism is a surrogate the outcomes overrule
          (cheese: LDL up, but cohorts show lower CVD → the matrix wins);
        - *be more humble* — mechanism is strong but observation is thin/absent, so we
          should hold low/neutral, not "fine" (coconut oil — we already do);
        - *genuine tension* — the mechanistic case is strong enough that our
          confidence should drop a notch, and we say so.
      This operationalizes the central "mechanism corroborates, never overrides"
      guardrail **per food and challengeably**, instead of as a blanket assertion.
      **Depends on the mechanistic research pass above** — we can't honestly weigh
      mechanistic evidence we haven't yet collected and sourced. Record a short
      per-food reconciliation note (the wrestle), shown in this section.

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
- [x] **Every food now shows a dose-response section** (v0.30) — foods without a
      recorded curve display an honest "no curve recorded yet — known gap, not a
      finding of 'no relationship'" placeholder (only ~6 foods have curves so far).
- [~] **Dedicated dose-response research pass — largely DONE (v0.37).** Added 12 curves
      (olive oil, yogurt, soy, green tea, whole fruit, legumes, fatty fish, trans fat,
      refined grains, ultra-processed, cheese J-curve, red-meat→T2D) → **17 of 32 foods
      charted.** Shapes derived from points (`classifyDoseShape`). Still to do: the
      remaining ~15 foods; mark genuinely-unavailable vs not-fetched (`doseCurveStatus`);
      point-level source-checking to flip curves to `verified:true` (intermediate points
      are currently approximated from reported per-unit slopes).
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
- [ ] Re-ground **cruciferous** and **leafy greens** self-verdicts (their current RR
      is borrowed from the F&V umbrella). Cruciferous/leafy-green-SPECIFIC outcome
      figures **could not be verified** in the last research round — still gated on a
      targeted source. Low-stakes now that the Vegetables group carries the strength.
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
- [x] **Surface effects-by-outcome (v0.33).** A good/bad summary hides that a food acts
      on specific outcomes. Done: collapsed verdict reads "for [outcome(s)]"; expanded
      card leads with an **"Effects by outcome" ledger** (per-outcome direction +
      certainty, ◆ where a dedicated per-outcome verdict exists, else the overall verdict
      applied to its outcomes — unmarked rows honestly flagged, never invented); food
      groups can carry a **reconciliation note** (fermented dairy: neutral class vs
      positive members = different outcomes/intake basis).
- [ ] **Complete the per-outcome ledger (research-gated).** The ledger is only fully
      honest once every food has *dedicated* per-outcome evidence rather than the overall
      verdict stamped across its outcomes. Populate `outcomeVerdicts` (direction +
      certainty + ideally a dose curve) per food-outcome pair in the per-outcome grounding
      pass — turns the ledger's unmarked rows into ◆ dedicated rows. Folds into the big
      combined research pass.
- [x] **Item-vs-group tension surfaced as a pattern (v0.33).** Fermented dairy (neutral)
      vs cheese/yogurt (positive) is the first case; handled with the reconciliation note
      above. If more groups develop the same split, reuse the `reconcile` field. (Distinct
      from the obs-vs-mechanism "wrestle" section, which stays research-gated.)

## Walkthrough-surfaced calibration items  ⟶ *queued*

Three issues the food-by-food review exposed where the engine is behaving but the
*calibration* is questionable. None is a bug; all are "highlight inadequacies."

- [x] **PER-OUTCOME MODEL — DONE (v0.27 framework, v0.28 populated).** Red meat
      (negative-on-diabetes, Li 2024 Lancet IPD) and alcohol (negative-on-cancer,
      Collaborative 2002, with the monotonic-harm curve) now carry per-outcome
      verdicts. Closes (a), (a2), and per-outcome dose curves.
- [x] **(a) Red-meat vs white-rice diabetes inconsistency — RESOLVED (v0.28)** via
      the per-outcome model: red meat now carries an explicit negative-on-diabetes
      verdict (Li 2024 Lancet IPD HR 1.10/100 g/day), like white rice.
- [x] **(a2) Alcohol under-called — RESOLVED (v0.28):** alcohol now carries a
      negative-on-cancer per-outcome verdict (Collaborative 2002, rises from the first
      drink) alongside the neutral mortality headline.
- [ ] (orig a) White rice is
      Negative/Moderate for type-2 diabetes (RR 1.18, CI excludes null) while
      unprocessed red meat lands Neutral (RR 1.10, CI crosses null) — yet red
      meat's T2D association (heme iron, repeated cohorts) is at least as
      consistent. The whole flip rides one `ciExcludesNull` call. Actions: (1) let
      the grounding pass pin red meat's T2D figure to a real meta-analysis; (2) this
      is the first concrete case for **per-outcome** verdicts — red meat may be
      "neutral overall, negative-for-diabetes." Fold into the multi-conclusion work
      (per-outcome, not just per-group). Audit that foods sharing an outcome get
      `ciExcludesNull` set by a consistent rule, not case-by-case.
- [x] **(a2) Alcohol under-call — RESOLVED (v0.28)** via the per-outcome cancer verdict
      (see above).
- [x] **(a3) Surface WHO 2023 non-sugar-sweetener guidance** in the artificial-
      sweeteners steelmanning. DONE (v0.16): added as an attributed counter-argument,
      evaluated honestly (conditional, low-certainty, reverse-causation-prone →
      reinforces neutral, not harm).
- [x] **(a4) Olive oil PREDIMED `rctLevel` — RESOLVED (v0.25).** Grounding confirmed
      PREDIMED tested the whole Mediterranean *pattern* (EVOO supplied to the MedDiet
      arm), not the oil in isolation → `rctLevel: pattern` is correct; olive oil stays
      Low. Verified on Guasch-Ferré 2022 (HR 0.81).
- [x] **(b) All-cause-mortality magnitude bump — RETIRED (v0.41).** Magnitude is now
      pure relative effect; importance-at-population-scale moved to the queued
      absolute-burden axis (§3b) and effect-at-realistic-intake to the dose curve (§3a,
      conditional crowning). The over-fire is gone (coffee/fruit/veg no longer inflated
      onto the shortlist). History below.
- [~] ~~(b) All-cause-mortality magnitude bump over-fires.~~ PARTIALLY addressed
      (v0.31): magnitude is now the **max across a food's outcomes** (`maxMagnitude`),
      which is the structural half of the redesign. The bump itself STILL over-fires —
      the one-tier bump for acting on all-cause mortality pushes moderate-RR foods
      (coffee RR 0.83, |ln|≈0.19 → moderate) up to "large," the same tier as trans fat.
      **DECISION (2026-07-01, maintainer): do NOT ship a near-term softening** (gating
      the bump on significance / half-step). The bump is a home-grown proxy for "how
      much a food matters" with no established analog; the principled replacement is an
      **absolute attributable-burden axis** (GBD PAF-style) — see §3, now promoted to a
      real queued task. The absolute-burden axis supersedes the bump entirely rather
      than patching it. (Already decoupled from the champion, which ranks on raw |ln RR|,
      so the over-fire is display-only and low-stakes until §3 lands.)
- [x] **(c) Neutral-/12 vs directional-/16 cross-scale optics.** DONE (note option,
      v0.16): added an explicit METHODOLOGY caveat that the two scales aren't directly
      comparable (the butter-vs-olive-oil case spelled out), so the certainty tier is
      read as "how solid for *this kind* of verdict," not a cross-verdict ranking. A
      deeper recalibration of the cut-points remains optional/open.

## Shortlists & coverage strategy (queue planning, 2026-06-30)  ⟶ *queued; spend approved*

- [ ] **Big combined research pass (spend approved by maintainer).** Run it as a
      sustained push, not metered: (1) **mechanistic** evidence + sources per food →
      derive `experimentalDirection`; (2) **dose-response** curves for the 26 missing
      foods; (3) remaining **observational** grounding (~19 foods). This is the critical
      path that unlocks the mechanism lens, the per-food wrestling section, the dose
      curves, and most "provisional" flags at once.
- [x] **Crown a single champion per direction (reproducible). DONE (v0.31).** Among the
      qualifying (gold/bin) foods, the champion is the one with the **largest effect
      magnitude** `|ln(pooledRR)|`, tie-broken by certainty then precision, restricted to
      `specific`/`uniform` (never a "not all" entry) — `championOf()` in app.js, tested.
      Today that's **tree nuts** (RR 0.78) and **trans fat** (RR 1.42), listed **first** in
      their shortlist with a direction-appropriate marker — **★ top pick** (positive) /
      **⚠ worst offender** (negative). (v0.33.x: champion moved to front; negative marker
      + section renamed "Bin fodder" → **⚠ Worst offenders**.)
- [x] **Gold standard veg artifact — FIXED (v0.31).** Leafy greens and cruciferous were
      recorded with CVD/cancer outcomes but **not all-cause mortality**, so they missed
      the all-cause magnitude bump that puts fruit on the cusp (same RR 0.90) — yet the
      same cited evidence (Aune 2017 F&V) already covers all-cause mortality. Aligned
      their outcomes list with the evidence (an artifact fix, not a re-grounding) → **both
      now sit on the cusp of Gold standard**. Also shipped the **magnitude = max across a
      food's outcomes** engine change (`Scoring.maxMagnitude`). The borrowed F&V RR still
      awaits a veg-specific grounding pass; Gold entry would need certainty to lift.
- [x] **"Not all" caveat applied EVENLY — DONE (v0.31).** Every item now records a
      `categoryUniformity` (`specific`/`uniform`/`mixed`) against one fixed question; the
      "not all" badge is derived uniformly from `mixed` (whole fruit, ultra-processed,
      artificial sweeteners), shown on cards and shortlist/cusp chips. See the settled
      design below.
- [x] **Top spots, with nuance — a "not all" caveat applied EVENLY. DONE (v0.31).** The
      spec below is implemented: `categoryUniformity` recorded for all 32 foods, "not all"
      badge derived from `mixed`, champion restricted to specific/uniform. The first-pass
      classifications themselves still want a review. A Gold-standard /
      Bin-fodder / cusp entry should signal how *actionable* it is. Rather than excluding
      heterogeneous categories, **keep them in the lists but badge them "not all"** —
      fruit stays (it's broadly good) but flagged "strongest for berries/apples; sugary/
      tropical weaker"; UPF stays but flagged "varies — some far worse." Two firm rules:
        - **Apply it evenly, reproducibly.** Record a per-item `categoryUniformity`
          (`specific` | `uniform` | `mixed`) for **every** entry against one fixed
          question — "does the verdict apply roughly uniformly across the foods this
          entry names, or is it concentrated/heterogeneous?" — *not* hand-picked for the
          ones we discussed. The "not all" badge is then derived uniformly from `mixed`.
          (First-pass calls: tree nuts/processed meat/sugary drinks/non-starchy veg/
          legumes = uniform; whole fruit = mixed→berries; ultra-processed = mixed; the
          single-food items = specific. These classifications themselves want review.)
        - **The single CHAMPION (★ top pick) still requires `specific` or `uniform`** —
          you can't crown a "not all" entry as THE thing to do.
      Net: fruit/UPF appear with a caveat, veg stay clean (uniform), nuts crowned, and
      the honest "go for berries specifically" message survives. Pairs with the (b)
      magnitude redesign. Buildable now (small).
- [~] **Next food tranche — BERRIES added (v0.38).** Berries added as its own item
      (Positive · Low for T2D; Guo 2016 RR 0.82, blueberries strongest per Muraki 2013),
      split conceptually from whole fruit, with mechanism/dose-curve/exceptions/steelman
      and `mixed` uniformity (blueberries carry the signal). Lands Positive · Low ·
      moderate-magnitude (not on the shortlist — funding-unclear keeps certainty Low).
      More contenders still to scout below.
- [ ] **Target the next food tranche at top/bottom CONTENDERS.** Expand coverage toward
      likely **Gold-standard / Bin-fodder (and champion) candidates** — the strongest
      plausible positives and worst plausible negatives we don't yet list — rather than
      arbitrary breadth, so the shortlists are genuinely "best/worst," not "best/worst
      of what we happened to add." (Candidates to scout: extra-virgin foods, oily-fish
      variants, sugar-sweetened/UPF subtypes, sugary cereals, deep-fried foods, etc.)
- [ ] **Category-as-item granularity (the "does this apply to bananas vs raspberries?"
      gap).** Many shortlist entries are really *categories* (tree nuts, whole fruit,
      whole grains, processed meat) because data is better at the class level — fine,
      but two problems: **(a) naming is ambiguous.** "Tree nuts (almonds, walnuts)"
      reads as if scoped to two nuts; the evidence actually pools tree-nut types broadly
      (Aune) and applies to the class. *Partly done (v0.33.x):* the redundant
      "(examples, etc.)" is now lifted out of the name into a muted "e.g. …" subtitle, so
      the title is just "Tree nuts" — reads as the class, not a two-item claim. Still to
      do: record an explicit **scope** ("applies to the class; evidence pooled across
      types"). **(b) it hides within-category
      variation.** Surface known heterogeneity on the card where it exists — e.g. for
      whole fruit, *berries/apples/grapes show the strongest signal (Muraki 2013) while
      sugary/tropical fruits are weaker or less-studied, and juice is separate and
      worse.* Then, per taxonomy-first (§2), **split out a specific member as its own
      item only where it genuinely diverges**: **berries** is the prime candidate (a
      likely Gold/champion contender — fold into the targeted top/bottom tranche above);
      individual tree nuts do **not** need splitting (homogeneous outcome data). This is
      the granularity spine — nutrient → food group → category-item → specific food — and
      we refine downward only where evidence supports a real difference.
- [ ] **Don't add thin foods as full items — keep a "nothing notable yet" list.** Where
      a food has too little research to say anything, DON'T create an empty verdict-
      bearing entry (redundant, dilutes the list). Instead maintain a lightweight
      **holding list** ("known foods we can't yet assess — no notable evidence /
      not researched") shown separately. A food graduates to a full item only when there's
      a real verdict to give. (Refines the taxonomy-first scaling plan in §2.)

## UI direction  ⟶ *queued*

- [x] **Re-form the verdict/severity colour indicator** (was a rounded left/top border
      stripe = AI smell). Kept the colour cue but changed the *form*: a **solid, square
      (non-curved) accent bar**, inset from the rounded corners so it can't follow the
      curve, on cards + group/outcome/counter/exception blocks (colour = verdict/
      severity). Highlights keep their gradient. (v0.30.x; extended to the outcome
      ledger and Explore diff rows in v0.33.x.)
- [x] **Grid ordering: row-major (v0.35.x).** Tried CSS multi-column masonry (v0.30.x)
      but it reads column-major (top-to-bottom), which fought the "pinned = first three
      across the top" model. Reverted to a **row-major CSS grid** (left-to-right, wraps to
      next row) with `align-items:start` so a tall expanded card doesn't stretch its
      neighbours. Trade-off accepted: a lone expanded card can leave a gap in its row (no
      masonry packing) — but horizontal ordering is more intuitive and pairs with pinning.
- [x] **Pin up to 3 expanded cards to the top for side-by-side comparison. DONE (v0.35.x).**
      Expanding a food PINS it to the **front of the grid** (not a separate section) and
      scrolls to it, so up to three open foods occupy the top row for side-by-side
      comparison — and it fixes the old "expand makes the card jump" problem. Clicking a
      pinned card unpins it (returns to its sorted position, collapsed); a 4th pin replaces
      the oldest (FIFO). (Reworked from an initial separate-strip version — pinned cards
      now live inline as the first grid items, per maintainer feedback.)
- [~] **Explore "What if we judged on…" diff — first-pass declutter (v0.33.x).** Was
      visually noisy: up to four competing coloured pills per row (before/after × effect/
      certainty), and it had lost the accent-bar colour cue. Now: rows carry the square
      accent bar (coloured by the after-effect), certainty is demoted to muted text so only
      the DIRECTION is a coloured pill, and the list is split into **"Changes the verdict"**
      (direction flips) vs **"Only changes certainty"** (tier-only). A deeper rethink of this
      section's layout is still a good candidate for the UI research pass below.
- [ ] **UI research pass.** Generate and evaluate directions for the overall UI — the
      shortlist/champion presentation, the food grid + expand/compare interaction, the
      dose-curve and **Explore/lens diff** visualisations, the effects-by-outcome ledger,
      density vs. readability, mobile. Produce a few concrete design directions (not just
      tweaks) to choose from before investing in a bigger redesign. The current look is
      functional but ad-hoc; this sets a direction.

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
      - **Batch 4 done (v0.34):** background multi-agent research pass. Verified: eggs
        (Drouin-Chartier 2020, 0.98 → neutral), avocado (Pacheco 2022, 0.84; a 2-cohort
        pooled analysis), soy (Nachvak 2019, 0.88), whole fruit (Aune 2017, 0.90/200 g).
        Re-grounded: yogurt 0.82→0.86 (Gijsbers 2016) Low→Moderate; legumes → all-cause
        mortality 0.94 (Zargarzadeh 2023) Low→Moderate + **dropped the T2D claim (soy-
        specific, Tang 2020)**; ultra-processed 1.25→1.15 (Liang 2025, I²=91%). Added
        processed-meat CHD per-outcome verdict (Micha 2010, 1.42). **20 of 32 source-
        verified.** Caveat: WebFetch to PubMed/journals is proxy-blocked, so figures are
        snippet-cross-verified, not page-rendered. Left unclean: green tea, refined grains
        (contested/industry-tinged), leafy-green/cruciferous all-cause (no clean subtype MA).
      - **Batch 5 done (v0.35):** second background pass over the remaining foods. Verified:
        cocoa (COSMOS 0.90 NS), alcohol headline (Zhao 2023, no protection → null), milk
        (Larsson ~0.99; PURE fig is total dairy), red meat headline (Wang 2016 1.10 NS),
        refined grains (PURE 1.27). **25 of 32 source-verified.** Added the **`contested`
        flag** (refined grains, red meat, artificial sweeteners) and a per-food
        **deep-researched date**. Still verified:false (honest gaps): green tea (no N),
        poultry (no N), coconut oil (no hard-outcome data exists), tomatoes (biomarker-vs-
        intake contested), cruciferous & leafy greens (no clean subtype meta-analysis).
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

## Publishing  ⟶ *live*

- [x] Deployed via **GitHub Pages** (Settings → Pages → Deploy from `main` / root).
      Zero build step; live at **https://00-1.github.io/eat/**. Added `.nojekyll` so
      files are served as-is, and confirmed all asset paths are relative (works under
      the `/eat/` project subpath). README links the live site.

## 3a. Magnitude at a REALISTIC ADDED intake (dose-integrated), not per serving  ⟶ *queued — cuts to the guiding purpose (maintainer, 2026-07-01)*

**The guiding question is "what happens to health when you ADD this food to your
diet."** Magnitude today reads the pooled RR at a modest single-serving-ish
contrast (whole fruit per 200 g/day; leafy greens "high vs low"). But people add
foods in *food-specific realistic quantities* — often **many** servings of veg
(7–10 portions/day), a tablespoon of oil, a small amount of trans fat. Reading
every food at ~one serving understates the ones people pile on, and is only a
**partial answer** to our own question.

This is **distinct from — and more central than — absolute population burden.** It
is an *individual-level* dose question ("if I add a realistic amount of veg, what
happens to *me*"), answered by **integrating the food's dose-response curve up to a
realistic added intake**, not by GBD PAF. Worked example: Aune 2017 F&V — all-cause
mortality RR ≈ **0.90 at 200 g/day but ≈ 0.69 at ~800 g/day** (the amount people
actually aim for). At a realistic added intake veg is a **large** effect, not a
modest one — which puts it on/above the shortlist cusp **honestly and for the right
reason** (the dose actually eaten), with no all-cause bump needed.

- [x] **Engine + card readings DONE (v0.39.x).** `Scoring.doseExtremeReading`
      (best case for positives / worst case for negatives) and `Scoring.ascensionDose`
      (the smallest intake at which a food reaches a target magnitude tier, + curve
      shape) read named points off the recorded curve — reproducible + unit-tested.
      Each charted card now shows a "reading the curve" block: positives → "Best case
      ~28 g/day → ~22% lower risk (large) — the sweet spot" (wording reflects
      plateau/monotonic/J-U shape); negatives → where harm appears + worst measured
      intake. Informative only; no shortlist change yet.
- [x] Separated cleanly from **certainty** (dose doesn't make us surer) and from
      **§3b population burden**.
- [x] **Design decided (maintainer, 2026-07-01):** "optimal" = the dose curve's
      plateau/nadir; monotonic-to-edge is tagged "as far as studied" (no
      extrapolation). Nuts are the plateau/"sweet-spot" case (optimum ~28 g, more is
      not better) vs veg the monotonic case (more keeps helping). The qualifier pill
      carries the **specific ascension intake** ("~28 g/day"; "above ~800 g/day"), not
      a vague "if you eat a lot".
- [x] **Prereq DONE (v0.40): high-intake dose-curve grounding pass** — grounded
      leafy greens (CVD; stays moderate), cruciferous (Zhang 2011; large only at
      ~180 g/day, high-consuming), whole grains (extended to reach large at ~135 g/day),
      total veg/fruit (stay moderate to ~800 g). Honest bottom line: veg/fruit/leafy
      greens do NOT reach large; whole grains, cruciferous (high intake), berries, nuts do.
- [x] **FLIPPED ON (v0.41).** Retired the all-cause bump (magnitude = pure relative
      effect); added conditional "if you eat plenty: ~X" crowning read off the dose curve
      (`optimalMagnitudeOf` + `ascensionDose`), gated on source-verification; champion
      restricted to unconditional picks. Result: nuts unconditional gold; whole grains
      (~135 g/day) + fatty fish (~3 srv/wk) conditional; veg/fruit/coffee/green-tea/
      cruciferous off the shortlist (honest — moderate on relative effect / unverified).
      Tests + docs updated.
- [ ] **Still ahead (§3b): the absolute-burden axis** so veg/whole-grains/fruit can
      rank on *population impact* — the axis they legitimately dominate — separately
      from relative effect.

## 3b. Absolute population impact (beyond relative effect)  ⟶ *v1 SHIPPED (v0.45)*

**v1 done (v0.45):** Added a `BURDEN` record (GBD 2017 dietary-risk attributable
deaths/DALYs/TMREL, mapped to foods) as a **separate axis** from relative effect.
Surfaced as a per-card "Population impact" block, a compact chip (notable only), and
a summary callout — in a distinct indigo so it never reads as a verdict. `Scoring.
burdenTier` derives the tier from attributable deaths. Honest limits baked in: shared
risks (veg, fruit) say "shared across the category, not this food alone"; alcohol is
flagged a separate GBD risk; figures are GBD-summary-level (verified:false), and foods
with no clean GBD mapping (refined grains, berries-alone, most single veg) simply have
no burden block. This delivers the payoff — whole grains/fruit/nuts/veg rank at the top
on *burden* precisely because they're eaten universally, even though they're modest
per serving.
**Still to do:** appendix-verify the lower-tier death counts (processed meat, SSB,
trans fat, legumes); optionally offer the shortlist under a "biggest population impact"
ordering; resolve the GBD-2017-vs-2019 red-meat figure.

---
*Original plan (now largely implemented above):*
## 3b(old). Absolute population impact (beyond relative effect)

Magnitude is currently a *relative*-effect proxy, patched by the all-cause bump
(§(b)) — a home-grown proxy with no established analog. The methodology review
(`research/methodology-review.md`) identifies the principled replacement: a
**separate absolute attributable-burden axis** (GBD PAF-style), which supersedes
the bump rather than patching it. Maintainer decision: build this instead of a
near-term bump softening. NB: this answers "how much does this food matter at the
*population* level," a **different** question from §3a's individual "what happens
when *I* add a realistic amount" — keep the two axes separate.

**What it answers.** "How much does this food *matter* at the population level?" —
a genuinely different question from "how big and sure is its relative effect?"
Broad staples (vegetables, whole grains, fruit) legitimately dominate absolute
burden (GBD's top diet risks: high sodium, low whole grains, low fruit) precisely
because they're eaten in quantity — even though their *per-serving relative* effect
is modest. Keeping the two axes separate resolves the veg/fruit puzzle honestly.

**Design sketch (to refine):**
- [ ] Record a per-food/-outcome **absolute-burden input**: relative effect ×
      exposure prevalence (how common/how much consumed vs a TMREL counterfactual) ×
      baseline outcome frequency. GBD's PAF is the reference formula. Data source:
      GBD 2019 diet estimates where a food maps to a GBD risk; honest "not estimated"
      otherwise (per the highlight-inadequacies policy).
- [ ] Add it as a **second measure** alongside magnitude+certainty — never fold it
      back into the relative-effect magnitude tier.
- [ ] Offer the shortlist under **either lens**: "biggest sure *relative* effect"
      (current) vs "biggest *population impact*" — labelled so they're not conflated.
- [ ] Once it lands, **remove the all-cause magnitude bump** (§(b)) entirely.

Caveats: PAF depends on a chosen counterfactual (TMREL) and on exposure data that
vary by population; GBD uses a mediation matrix to avoid double-counting shared
pathways (e.g. fibre). Treat early numbers as provisional and sourced.

## Done

- Deterministic scoring engine; certainty computed from recorded facts (v0.4).
- Validated-causal-pathway tier, evidence-basis labels, observation-over-mechanism
  guardrail (v0.5).
- Impact magnitude + Gold standard / Bin fodder shortlists; steelmanning (v0.6).
- Per-food subgroup exceptions ("who should be careful").
- Unit + data-integrity tests (`npm test`).

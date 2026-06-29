# Gap audit — 2026-06-29

Independent skeptical review (an isolated reviewer agent) plus spot-verification,
commissioned to find gaps of the kind "the scaffolding has outrun the substance" —
where the method looks rigorous but the inputs/UX don't yet earn that confidence.
Findings below; the work queue derived from them is in `ROADMAP.md`.

`[verified]` = I reproduced it directly. `[reported]` = auditor finding, plausible,
not yet independently reproduced.

## A. Grounding / provenance (the central concern) — HIGH
- **A1 [verified]** No per-fact provenance. Every `pooledRR`, `participants`, and
  ordinal call in `data.js` is a bare value; `studies[]` isn't linked to the
  specific fact it supports. Exception `prevalence.source` values are vague labels,
  not citations. → add a `source`/`ref` per score-driving fact; test for it.
- **A2 [verified]** A user can't tell verified facts from estimates — identical
  "computed, 14/16 → High" presentation regardless. → per-food `verified` flag,
  surfaced on the card.
- **A3 [verified]** Ordinal calls (`heterogeneity`, `confoundingRisk`, `pubBias`,
  `funding`, …) are framed as "objective facts" but are unsourced judgements that
  swing the score (e.g. `pubBias: tested-clean` = +1, asserted for 8 foods with no
  recorded funnel/Egger check). → require a one-line basis per ordinal call;
  consider downgrading unsourced favourable calls to the conservative default.

## B. Internal inconsistencies — HIGH/MEDIUM
- **B1 [verified]** Neutral foods show a non-trivial magnitude chip:
  red-meat = "Moderate effect", cheese/potatoes/artificial-sweeteners = "Small",
  all with `ciExcludesNull:false`. `classifyMagnitude` never consults the CI. →
  force magnitude `minimal` (or hide the chip) when `ciExcludesNull === false`.
- **B2 [verified]** The all-cause-mortality magnitude bump triggers on a literal
  string and inflates borderline cases: whole-fruit (RR 0.90, genuinely moderate)
  is bumped to "large" — the sole reason it's "on the cusp of Gold standard." The
  README/METHODOLOGY narrative also implies the bump lifted trans fat into Bin
  fodder; it didn't (RR alone does). → gate the bump on `ciExcludesNull`;
  reconsider bumping borderline RRs; fix the narrative.
- **B3 [verified]** `doseResponse:"some"` (+1) recorded for null associations
  (eggs RR 1.0, milk 0.98, cheese 0.96). Padding low totals. → set `none` or justify.
- **B4 [reported]** trans-fat is the only `confoundingRisk:"low"` (+2, triggers
  "convergent") — defensible but unsourced and load-bearing. → document the basis.
- **B5 [verified]** `effectEstimate` prose vs recorded `pooledRR`: trans-fat says
  "~35%+" but `pooledRR 1.35` is an extrapolation from the cited "per 2% energy"
  figure, not a reported pooled RR; legumes' headline emphasises a different
  outcome than its recorded RR. → record RRs that match a real reported figure for
  the stated primary outcome; flag extrapolations.
- **B6 [verified]** Placeholder citations (fatty-fish "Zhang B, et al.";
  red-meat/poultry/cheese/potatoes generic) pass the non-empty test but are
  unverifiable. → real citations; require year + journal in the test.

## C. Methodology assumptions — MEDIUM
- **C1 [verified]** `unknown → 1` (and any unrecognised string → 1) rewards missing
  data: avocado, coconut-oil get a free consistency point. → score `unknown → 0`
  or require the field; make unknown strings throw.
- **C2 [reported]** Thresholds are asserted-not-calibrated; hard precision cliffs
  (499,999 → 1) and the NutriGrade effect-size cut applied to our non-standard
  "realistic intake" basis. → document tier sensitivity; flag foods within ±1 point
  of a boundary as fragile.
- **C3 [verified]** METHODOLOGY §5 says directional labels need ≥ Moderate
  certainty, but legumes, olive-oil, yogurt, avocado (Positive) and refined-grains
  (Negative) are directional at **Low**. Methodology contradicts the data, untested.
  → enforce the rule (downgrade to "neutral (leaning…)") or revise the rule; add a test.

## D. Coverage gaps — MEDIUM/LOW
- **D1 [verified]** Cancer badly under-considered: CVD 19×, mortality 12×, T2D 11×,
  cancer only 3×. Known signals omitted (alcohol→breast/colorectal, red
  meat→colorectal, dairy→prostate). → add cancer outcomes where WCRF/CUP grades are
  strong; state the CVD/mortality bias as a known limitation.
- **D2 [reported]** Exception checklist isn't provably applied per category — only
  "an entry exists" is enforced; no record of checked-clear vs never-considered. →
  record per-food per-category status; test all 7 types were considered.
- **D3 [verified]** ~12 foods have no steelman; foods with none render no section,
  so "no criticism exists" looks like "not done yet." → explicit placeholder;
  finish the backlog (second research pass).
- **D4 [verified]** Only 26 foods, skewed (4 fats, 3 dairy, 2 veg). Expansion queued.

## E. Honesty / UX risks — HIGH/MEDIUM
- **E1 [verified]** App over-signals confidence; the load-bearing caveats ("facts
  unverified", "not medical advice", "relative not absolute") live only in
  markdown/Approach tab. Gold/Bin shortlists give the simplest take-home from the
  least-verified inputs. → persistent uncertainty/provenance banner on cards + the
  highlights block; repeat "not medical advice" in the foods view.
- **E2 [reported]** `mitigate` → "Manageable" may read as dismissive of real
  clinical impact. → reconsider wording.

## F. Testing gaps — HIGH/MEDIUM
- **F1 [verified — LIVE BUG]** `renderHighlights` defines a local `const chips =
  (foods) => …` (app.js:353) that shadows the module-level effect-filter `chips`
  (app.js:14); the chip-click handler's `chips.forEach(...)` (app.js:392) runs
  against the function → `TypeError`. Clicking any Gold/Bin/cusp chip throws; the
  jump-to-card behaviour is broken. No UI test caught it. → rename local; add a
  jsdom click test.
- **F2 [verified]** Entire UI layer untested (rendering, `matches`, `sortFoods`
  incl. the impact path, search, view-switching, `escapeHtml`). → add jsdom tests.
- **F3 [verified]** Data tests check shape, not cross-field truth (effect sign vs
  RR; magnitude vs CI; the ≥Moderate rule; effectEstimate vs RR). → add coherence tests.

## G. Other — MEDIUM/LOW
- **G1 [verified]** Versions disagree: `data.js` = 0.8, `METHODOLOGY.md` header =
  0.6, while its changelog/ROADMAP describe v0.9 work as done. → single source of
  truth; test header == `METHODOLOGY_VERSION`.
- **G2 [verified]** "Pure function / objective facts / we did not type these
  conclusions" oversells: the determinism is real, the objectivity isn't (inputs
  are hand-chosen, mostly unsourced). → soften to "deterministic given the recorded
  judgements"; pair every "computed" claim with input provenance status.
- **G3 [verified]** Study links are PubMed *search* guesses, not stable PMIDs/DOIs;
  results can drift. → store PMIDs/DOIs (schema already allows `url`).

# Adding a food — the reproducible process

The goal is that **anyone (or a research agent) follows the same steps and gets
the same kind of entry** — so the list can grow to hundreds of foods without
becoming a pile of opinions. You record *facts*; the engine computes the verdict's
certainty, magnitude, evidence-basis, and shortlist membership. Your judgement
goes into sourcing the facts, not into the score.

> Rule of thumb: if you find yourself wanting to set a tier directly, stop — change
> a **fact** instead.

## Step 0 — Decide the food is in scope

One entry = one thing people add to a diet, scoped to how it's actually eaten
(e.g. "industrial trans fat", not "all fats"; "whole fruit" separate from "fruit
juice"). Give it a stable `id` (kebab-case slug).

## Step 1 — Gather the evidence facts (`data.js` → `ASSESSMENTS[id].evidence`)

Find the **best available evidence**, in this priority order: meta-analyses of
prospective cohorts → large individual cohorts (with dose-response/substitution) →
RCTs on outcomes (rare) → RCTs on risk markers / mechanism (supporting only).
Prefer recent systematic reviews; search PubMed, Cochrane, the WCRF/AICR CUP
reports, and IHME/GBD.

Record these atomic facts (see `scoring.js` for the exact field meanings):

| Field | How to source it |
|-------|------------------|
| `pooledRR` + `ciExcludesNull` | The pooled relative risk for the primary outcome **at realistic habitual intake** (not per tiny unit — see `intakeBasis`). Does its 95% interval exclude 1.0? |
| `intakeBasis` | The realistic high-vs-low intake the RR refers to (e.g. "~2 servings/day vs none"). |
| `participants` | Approx. total in the main evidence base (drives precision). |
| `heterogeneity` | low / moderate / high / unknown — from I² or the review's consistency. |
| `outcomeType` | hard (mortality/disease) / surrogate (biomarker) / indirect. |
| `doseResponse` | graded / some / none — is there a reported gradient? |
| `rctLevel` | outcomes / pathway (validated causal surrogate) / pattern / markers / mechanism / none. |
| `funding` | independent / mixed / industry / unknown. |
| `pubBias` | tested-clean / suspected / untested (did the review test for it?). |
| `confoundingRisk` | low / moderate / high — observational defaults to moderate; high for heavy-confounding cases (alcohol, reverse causation); low only with trial/mechanistic corroboration. |
| `directionallyConsistent` | *(optional, only consulted when `heterogeneity: high`)* true if cohorts disagree on magnitude but agree on **direction** — earns partial consistency credit instead of 0. |

Also write `effectEstimate`: a one-line plain-language summary of the conservative
direction (stating the intake).

**Directionality floor.** A verdict is `positive`/`negative` only if `ciExcludesNull`
is true **and** the effect clears a trivially-small floor (|ln RR| > 0.03). A
significant-but-tiny association (e.g. butter, RR 1.0134) stays neutral by rule —
record the honest `ciExcludesNull: true` and the engine keeps it neutral.

## Step 1b — Provenance (`verified` + `sources`)

Until a fact is checked against the actual paper, leave the food **unverified** (the
app shows a "facts estimated" chip and the data-status banner counts it). Once the
score-driving figures are confirmed, set `verified: true` and add a `sources` map
pinning each to a citable figure with a **PMID or DOI** (a test enforces this):

```js
verified: true,
sources: {
  pooledRR:     { figure: "RR 0.78 (0.72–0.84) per 28 g/day", cite: "Aune 2016 BMC Medicine", id: "PMID:27916000" },
  participants: { figure: "819,448 across 15 cohorts",        cite: "Aune 2016 BMC Medicine", id: "PMID:27916000" },
}
```

## Step 1c — Mechanism record + research date (`ASSESSMENTS[id].mechanism`, `RESEARCHED_ON`)

Separately from the observational `evidence`, record what **trials + mechanism alone**
say — the input for the "Trials & mechanism only" lens and the per-food "Under a
different lens" section. `experimentalDirection` is **derived** from this record's
`direction`, so ground it, don't assert it:

```js
mechanism: {
  direction: "negative",              // positive | negative | neutral | none
  trial: "RCT/meta finding + design", // what the strongest trial/marker shows
  mechanism: "validated pathway + which way it points",
  source: { cite: "First author Year Journal", id: "PMID:… or DOI:…" },
  confidence: "high|medium|low",
  note: "optional — esp. where trials & mechanism CONTRADICT the observed outcome",
}
```

Also add the food to `RESEARCHED_ON` with the date of its last dedicated research pass
(shown in the card footer so staleness is visible); update it each time you re-research.

## Step 2 — Let the engine compute the verdict's metadata

`scoring.js` turns those facts into the eight sub-scores, total, **certainty tier**,
**magnitude**, and **evidence basis**. Do not hand-set these. Set the food's
`effect` (positive / negative / neutral) from the observed direction under the
guardrail (mechanism corroborates, never overrides observation), and set
`certainty` to the tier the engine computes (the test enforces they match).

## Step 3 — Write the human-facing fields (`data.js` → `FOODS`)

- `name`, `category`, `outcomes`, `summary`.
- `rationale` — how the evidence maps to the label (don't restate the tier word;
  the badge shows it).
- `considerations` — the caveats that matter for *this* food (substitution,
  confounding, dose-response).
- `studies` — the real citations behind the verdict (first author, year, journal;
  faithful one-line finding; a PubMed `search` string).
- `lastReviewed`, and a `revisions` entry whenever a later change moves a verdict.

**Optional richer fields:**
- `doseCurve` — where a published dose-response exists, record its points
  `[{x, rr, lo?, hi?}]` + `unit`, `normalRange`, `outcome`, `shape`, `source`. The
  `shape` is *derived* from the points by `Scoring.classifyDoseShape()` (a test
  asserts your recorded shape matches), so the curve can't be mislabelled. Renders
  as a small SVG + plain-language label ("Dose makes the poison", "Diminishing
  returns", "Safe up to a point", …).
- `components` — constituent "worries" (saturated fat, sugar) the food's **outcome
  adjudicates**: `[{name, worry, resolution}]`. A component is context, it **never
  sets the verdict** (direction of inference is whole-food → verdict, never
  component → food).
- `categoryUniformity` — `specific` (a single food) / `uniform` (a category whose
  members behave alike) / `mixed` (members genuinely diverge). Assessed against one
  fixed question for **every** item; the "not all" badge derives from `mixed`, and the
  single champion (★/⚠) requires `specific`/`uniform`. Add a `uniformityNote` on `mixed`.
- `contested` — a string, present only when credible high-quality sources genuinely
  **disagree on direction** (≠ low certainty). Renders a ⚖ badge + a callout laying out
  both sides. Use it instead of silently picking a side.
- **Name convention:** put example members in a trailing bracket ending in "etc."
  (e.g. `"Tree nuts (almonds, walnuts, etc.)"`) — the loader lifts them into a muted
  "e.g. …" subtitle automatically. Brackets that *scope* the verdict (e.g. potatoes
  "(boiled/baked)") don't end in "etc." and are kept in the name.

## Step 3b — Food-group membership (`groups.js`)

If the food belongs to an evidence-bearing **group of whole foods** (vegetables,
fermented dairy, …), add it to `FOOD_GROUPS[id]`. The group is itself a scored
entity (its own `evidence` → engine → verdict) and renders as an "as part of a food
group" conclusion + a collapsed-row chip. Groups are classes of *edible whole
foods* — **never** nutrient/component abstractions (no "fibre" group).

## Step 4 — Run the fixed exception checklist (`exceptions.js`)

Run the food against **every** category — allergy, intolerance/malabsorption,
autoimmune, condition, medication, life-stage, contaminant — using established
reference lists (Big-9 allergens, Monash FODMAP, oxalate/purine tables, FDA/EPA
mercury, pregnancy guidance). Record each applicable one with `group`,
`prevalence {estimate, source}`, `severity`, and a `mitigation`. **Always add an
entry for the food, even if it's `[]`** ("assessed, nothing notable").

## Step 5 — Steelman the critics (`counter-arguments.js`)

Add the popular, **real, attributed** counter-arguments to the verdict (name the
proponent/source — no strawmen), each with a `stance` (holds / partial / valid)
and an honest `assessment` in the model's terms. If the critique has merit or
matches our uncertainty, say so. Use `stance: "certainty"` for a special case — an
argument that **agrees with our direction but disputes our confidence** (e.g. "why
are you only Low on olive oil?"); we defend or revisit the certainty, not the verdict.

Foods that aren't ready for a full entry go in `HOLDING_LIST` instead (name + `reason`
"thin"/"unresearched" + note) — a lightweight "Not yet assessed" list, so a thin food
isn't turned into an empty verdict-bearing card.

## Step 6 — Verify

```bash
npm test          # data integrity + the central invariant (stored == computed)
```

The tests check: required fields and enums, unique id, ≥1 study, an assessment
with `intakeBasis`, an exceptions entry, computed tier == stored `certainty`,
directionality consistent with the verdict (`Scoring.isDirectional`), pooledRR sign
matches the effect, verified foods carry sourced figures (PMID/DOI), dose-curve
shape matches the classifier, and group invariants. Open `index.html` and confirm
the card renders.

## Automation (the scalable layer)

The above is also a **research-agent spec**: given a food name, an agent can return
the structured `evidence` + draft `studies` + `exceptions` for human review, which
a maintainer then sanity-checks before committing. A reusable research workflow for
this is a planned next step (see `ROADMAP.md`).

## Worked example

`tree-nuts`: evidence `pooledRR 0.78` at `~28 g/day vs none`, `participants
819448`, `heterogeneity moderate` (I²=66%), `outcomeType hard`, `doseResponse
graded`, `rctLevel pattern` (PREDIMED), `pubBias tested-clean`, `confoundingRisk
moderate` → engine computes 13/16 → **high certainty**, **large** magnitude,
**observation-led** → **Gold standard**. Source-verified against Aune 2016 BMC
Medicine (`verified: true`). We didn't hand-set any of those four conclusions —
they're computed from the recorded facts.

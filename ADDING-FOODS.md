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

Also write `effectEstimate`: a one-line plain-language summary of the conservative
direction (stating the intake).

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
matches our uncertainty, say so.

## Step 6 — Verify

```bash
npm test          # data integrity + the central invariant (stored == computed)
```

The tests check: required fields and enums, unique id, ≥1 study, an assessment
with `intakeBasis`, an exceptions entry, computed tier == stored `certainty`, and
that directional verdicts have `ciExcludesNull: true`. Open `index.html` and
confirm the card renders.

## Automation (the scalable layer)

The above is also a **research-agent spec**: given a food name, an agent can return
the structured `evidence` + draft `studies` + `exceptions` for human review, which
a maintainer then sanity-checks before committing. A reusable research workflow for
this is a planned next step (see `ROADMAP.md`).

## Worked example

`tree-nuts`: evidence `pooledRR 0.78` at `~28 g/day vs none`, `participants
819000`, `heterogeneity low`, `outcomeType hard`, `doseResponse graded`, `rctLevel
pattern` (PREDIMED), `pubBias tested-clean`, `confoundingRisk moderate` → engine
computes 14/16 → **high certainty**, **large** magnitude, **observation-led** →
**Gold standard**. We didn't hand-set any of those four conclusions — they're
computed from the recorded facts (which themselves still need source-verifying).

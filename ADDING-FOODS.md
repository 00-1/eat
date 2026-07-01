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

**Pick the intake that honestly answers "what happens when you *add* this food."**
The `pooledRR`/`intakeBasis` must reflect a **realistic amount actually consumed**,
not the most flattering contrast. This is a real trap: alcohol looked *neutral* when
anchored on the low-volume-vs-occasional-drinker contrast, but regrounded to realistic
regular intake it's **negative** (mortality rises with dose; cancer from the first
drink). If a food is eaten in large amounts (vegetables), don't judge it on one
serving — see the dose curve below, which reads the effect across the whole range.
When you re-anchor an existing food, add a `revisions` entry and bump its `researchedOn`.

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

## Step 1d — Per-outcome verdicts (`ASSESSMENTS[id].outcomeVerdicts`)

A single headline verdict sometimes hides that a food acts differently on different
outcomes. Where the evidence supports a **specific** direction for a **specific**
outcome that isn't the headline, record it:

```js
outcomeVerdicts: [{
  outcome: "Type 2 diabetes", effect: "negative",
  evidence: { pooledRR: 1.10, ciExcludesNull: true, /* …same fields as the headline… */ },
  rationale: "…", doseCurve: { /* optional, same schema */ }, source: {…}, verified: true,
}]
```

This is how **red meat** (neutral overall, **negative for type-2 diabetes**) and
**alcohol** (its cancer verdict) carry an honest signal the headline would bury. The
engine's `maxMagnitude` already reflects the strongest outcome, and the summary lists
give a neutral-headline food with a directional per-outcome verdict its **own section**
("Neutral overall — but worth limiting for one risk / helps a specific outcome"). Each
per-outcome verdict is scored and sourced exactly like the headline.

## Step 2 — Let the engine compute the verdict's metadata

`scoring.js` turns those facts into the eight sub-scores, total, **certainty tier**,
**magnitude**, and **evidence basis**. Do not hand-set these. Set the food's
`effect` (positive / negative / neutral) from the observed direction under the
guardrail (mechanism corroborates, never overrides observation), and set
`certainty` to the tier the engine computes (the test enforces they match).

**Magnitude is pure relative effect** (large/moderate/small/minimal from |ln RR|).
There is no "all-cause-mortality bump" — that was retired (v0.41). Two things it is
*not*, so don't try to encode them into the RR: **(a) population importance** — how
much a food matters at population scale is a separate absolute-burden axis (queued,
ROADMAP §3b); **(b) effect at high intake** — that comes from the dose curve (below),
which is how a food eaten in quantity earns a bigger reading. Just record the honest
relative effect at a realistic intake.

**How the food lands in the "Worth adding / Worth cutting down" summaries** (all
computed, nothing hand-placed): a `positive` food goes in *Worth adding*, a `negative`
food in *Worth cutting down*, each in one of three tiers — *surest+biggest*
(high certainty + large), *strong* (a notch short, **or** large only at high intake if
source-verified), *also supported/worth reducing* (everything else directional). A
**neutral** food with a directional per-outcome verdict lands in the separate
"Neutral overall — but…" section. Each row shows a per-food **amount** from the dose
curve (see below).

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
- `doseCurve` — **record one wherever a dose-response exists** (it now drives real
  UI, not just a chart). Points `[{x, rr, lo?, hi?}]` + `unit`, `normalRange`,
  `outcome`, `shape`, `source`. The `shape` is *derived* by
  `Scoring.classifyDoseShape()` (a test asserts your recorded shape matches). Two or
  more real reported points is enough (you may map a reported "per-X-unit slope" to a
  point — e.g. "per ½ serving/day HR 0.80" → a point at ½ serving/day; flag
  `verified: false` and note any extrapolation). What the curve now feeds:
    - the **best-case reading** on the card ("~28–45 g/day → 20–22% lower risk") and
      the **amount** shown in the Worth-adding summary — the near-optimal *band*
      (`Scoring.optimalBand`): the contiguous intake range holding the food's best
      magnitude tier;
    - the **safe dose** in the Worth-cutting summary — "safe below ~X" for a
      threshold-harm curve, or **"no safe level"** for a monotonic-harm curve;
    - **conditional shortlist promotion** — a food that only reaches a large effect at
      high intake is promoted with the intake it needs (`ascensionDose`), *if*
      source-verified. A food with no curve shows "—" for its amount (honest), so a
      curve is worth adding for any food that could be a contender.
- `components` — constituent "worries" (saturated fat, sugar) the food's **outcome
  adjudicates**: `[{name, worry, resolution}]`. A component is context, it **never
  sets the verdict** (direction of inference is whole-food → verdict, never
  component → food).
- `categoryUniformity` — `specific` (a single food) / `uniform` (a category whose
  members behave alike) / `mixed` (members genuinely diverge). Assessed against one
  fixed question for **every** item; the "not all" badge derives from `mixed`, and the
  single champion (★/⚠) requires `specific`/`uniform`. Add a `uniformityNote` on `mixed`.
  For a `mixed` food, also record a **`members`** breakdown so "which ones, actually?"
  is answered: `[{name, tag, note}]` with `tag` ∈ `good | likely | weaker | worse |
  unknown`, plus a one-line `memberIntro` on whether the effect **generalises**. Key
  rule: most category effects rest on shared properties (fibre, anthocyanins,
  unsaturated fat), so an under-studied member is **`likely`**, not `unknown`/bad —
  *concentrated evidence ≠ a member-specific effect*. Use `unknown` only when it truly
  hasn't been studied and doesn't clearly share the profile; `worse` for a member that
  genuinely diverges (e.g. cranberries eaten as sweetened juice).
- `scope` — set in the `FOOD_SCOPE` map: `group` if the card is a whole **class** of
  many foods (legumes, whole fruit, fried foods, berries…), `item` (the default) if it's
  a single food. Group cards get a subtle "◎ food group" chip so a class verdict isn't
  read as a peer of its own members (e.g. "Soy foods" sitting under "Legumes"). Only list
  group-scope ids in `FOOD_SCOPE`. This is DISTINCT from `groups.js` (the super-groups a
  food *belongs to*, shown as a secondary verdict) — `scope` labels what the card *is*.
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

## Step 3c — Absolute population burden (`BURDEN` in `data.js`)

If the food maps to a **GBD dietary risk factor**, add/extend a `BURDEN` entry with the
risk's attributable **deaths (`deathsM`, millions/yr) + DALYs + TMREL**, and list the
food ids it covers. This is a **separate axis** from relative effect ("how much it
matters at population scale"), rendered as the card's "Population impact" block. Rules:
one GBD risk often spans several of our foods (e.g. "diet low in vegetables") — list
them all; the loader flags `sharedAcross` so we never imply one food owns the whole
category's burden. Leave `deathsM: null` where GBD's appendix figure can't be verified
from public summaries (shown as "not separately quantified"). Foods with no clean GBD
mapping (e.g. refined grains) simply get no burden block — don't invent one. All
`verified: false` until appendix-checked. Source: GBD 2017 Diet Collaborators (Lancet 2019).

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

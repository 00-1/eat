# Diet Effects

A small web app that lists whether common foods generally have a **positive**,
**negative**, or **neutral** effect when *added* to a typical diet — based on
free-living observational data (what tends to actually happen when people add a
food to how they already eat).

The point of the project is **transparency and revisability**: every verdict is
tied to the actual studies behind it, carries an explicit certainty rating, and
can be challenged.

## What it shows

Each food has:

- a **verdict** — 🟢 positive · 🟡 neutral/mixed · 🔴 negative;
- a **certainty tier** — high → moderate → low → very low
  (NutriGrade-aligned);
- the **studies** the verdict rests on (mostly cohort meta-analyses and large
  prospective cohorts, cross-checked against trials), each linking to PubMed;
- the **reasoning** for the verdict and the **key caveats** that matter for that
  food (what it replaces, confounding, dose-response, …);
- a **reproducible assessment** — eight 0–2 sub-scores (total /16 → tier)
  **computed** by a fixed engine from recorded evidence facts, plus the
  conservative effect estimate behind the direction;
- a **revision log** when a verdict has changed.

You can search, and filter by effect or food category. The **“The approach”** tab
explains exactly how verdicts are decided.

## The method (and how to challenge it)

How a food gets its label and certainty tier is documented in
[`METHODOLOGY.md`](./METHODOLOGY.md) and summarized in-app. In short: we answer
"what happens when this food is *added* to a real diet," weight the strongest
study designs, grade our confidence explicitly, account for the standard biases
of nutritional epidemiology (confounding, reverse causation, the substitution
problem, measurement error), and **revise verdicts as evidence accrues**.

Conclusions are provisional by design. Challenges are handled by the maintainer
directly — each is reviewed with AI-assisted research and the verdict is updated
if it holds up. (There is no public submission form.)

## Important caveats

These are population-level **associations** from mostly observational data —
**not** proof of cause and effect, and **not** personal medical or dietary
advice. Real-world effects depend on **what a food replaces**, overall dietary
pattern, quantity, and individual health. Consult a qualified professional about
your own diet.

## Running it

Static site, no build step or dependencies:

```bash
# open directly
open index.html

# or serve locally (recommended)
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Project structure

| File / dir                     | Purpose                                                   |
|--------------------------------|-----------------------------------------------------------|
| `index.html`                   | Page structure: Foods view + "The approach" view          |
| `styles.css`                   | Styling                                                   |
| `app.js`                       | Filtering, sorting, expandable evidence (UI only)         |
| `scoring.js`                   | Deterministic scoring engine (facts → scores → tier)      |
| `data.js`                      | Food dataset: verdicts, studies, and recorded evidence    |
| `counter-arguments.js`         | Real, attributed counter-arguments + our assessment       |
| `exceptions.js`                | Subgroup exceptions (allergy/intolerance/condition…)      |
| `test/`                        | Unit + data-integrity tests (`npm test`)                  |
| `METHODOLOGY.md`               | Canonical, versioned description of how verdicts are made |
| `research/`                    | Source research behind the methodology                    |

## Adding or editing foods

Edit `data.js`. Each entry carries its verdict, certainty, outcomes, reasoning,
caveats, and the studies behind it:

```js
{
  id: "tree-nuts",
  name: "Tree nuts (almonds, walnuts)",
  category: "Nuts & seeds",
  effect: "positive",            // "positive" | "negative" | "neutral"
  certainty: "moderate",         // high | moderate | low | very-low (NutriGrade-aligned)
  outcomes: ["All-cause mortality", "Cardiovascular disease"],
  summary: "One-line takeaway.",
  rationale: "How the evidence maps to the label under our methodology.",
  considerations: { substitution: "…", confounding: "…", doseResponse: "…" },
  studies: [
    {
      citation: "Aune D, et al. BMC Medicine. 2016.",
      type: "Dose-response meta-analysis of cohorts",
      finding: "28 g/day associated with ~22% lower all-cause mortality.",
      search: "Aune nut consumption mortality 2016",   // builds a PubMed link
      // url: "https://doi.org/…"                       // optional explicit link
    }
  ],
  lastReviewed: "2026-06-28",
  revisions: []                   // append { date, change } when a verdict changes
}
```

Each food also has an entry in the `ASSESSMENTS` map (keyed by `id`) holding its
**recorded evidence facts** and the conservative effect estimate. The eight
sub-scores are **not** stored — they are computed from these facts by
`scoring.js`. The `certainty` field must equal the tier the engine computes; the
test suite enforces this.

```js
"tree-nuts": {
  evidence: {
    pooledRR: 0.78, ciExcludesNull: true, participants: 819000,
    heterogeneity: "low", outcomeType: "hard", doseResponse: "graded",
    rctLevel: "pattern", funding: "independent", pubBias: "tested-clean",
    confoundingRisk: "moderate",
  }, // engine -> 14/16 -> "high"
  effectEstimate: "Pooled RR ≈ 0.78 for all-cause mortality at ~28 g/day; interval excludes no-effect.",
}
```

To change a verdict you change the **facts**, not the score. New categories appear
in the filter automatically. When you change a verdict, add a `revisions` entry;
when you change the *method* (the rules in `scoring.js`), bump
`METHODOLOGY_VERSION` in `data.js` and update `METHODOLOGY.md`.

## Impact magnitude & standout lists

Direction and certainty don't say how *big* an effect is, so each food also gets a
computed **magnitude** (large / moderate / small / minimal) from its recorded
relative effect, with a bump for acting on all-cause mortality. Two computed
shortlists fall out of it: **★ Gold standard** (positive · high certainty · large)
and **✕ Bin fodder** (negative · high certainty · large), shown at the top of the
Foods view. (Magnitude is a *relative*-effect proxy, not absolute burden — see
`METHODOLOGY.md`.)

## Steelmanning attempts

Each card surfaces **popular, real, attributed** counter-arguments to its verdict
(`counter-arguments.js`), put in their strongest form and weighed honestly with a
stance: **holds** (our verdict survives — and why the argument fails under our
approach), **partial** (partly right / matches our stated uncertainty), or
**valid** (a genuine limitation we concede). The aim is to pressure-test the model
against positions people actually hold — not strawmen — so attributions must name
real sources.

## Exceptions ("who should be careful")

A verdict is a population average; it can be wrong for *you*. So every food is run
through a **fixed checklist** (`exceptions.js`) — allergy, intolerance/malabsorption,
autoimmune, condition-specific, medication, life-stage, contaminant — applied
equally to all foods (a food with nothing flagged records an empty list, i.e.
"assessed, none"). Each exception names the affected group, the **scale**
(prevalence with its source), a **severity** (avoid / caution / manageable), and a
**mitigation** where one exists (e.g. soak and ramp up legumes; lactase for dairy;
choose low-mercury fish). Prevalence figures are established estimates with their
basis recorded, to be verified/refined.

## Tests

The scoring process is the core of the project, so it is unit-tested. Run:

```bash
npm test          # node --test
```

- `test/scoring.test.js` — every scoring rule and threshold in the engine
  (effect-size bands, precision steps, tier cut-points, determinism, …).
- `test/data.test.js` — data integrity, and the **central invariant**: each
  food's stored `certainty` equals the tier the engine computes from its recorded
  evidence facts. Edit a fact or a verdict and fall out of sync, and this fails.

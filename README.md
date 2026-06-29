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
- a **reproducible assessment** — the food’s 0–2 score on each of eight evidence
  dimensions (total /16 → tier) plus the conservative effect estimate behind the
  direction;
- a **revision log** when a verdict has changed;
- a **“Challenge this conclusion”** button that opens a prefilled email to the
  maintainer.

You can search, and filter by effect or food category. The **“The approach”** tab
explains exactly how verdicts are decided.

## The method (and how to challenge it)

How a food gets its label and certainty tier is documented in
[`METHODOLOGY.md`](./METHODOLOGY.md) and summarized in-app. In short: we answer
"what happens when this food is *added* to a real diet," weight the strongest
study designs, grade our confidence explicitly, account for the standard biases
of nutritional epidemiology (confounding, reverse causation, the substitution
problem, measurement error), and **revise verdicts as evidence accrues**.

Conclusions are provisional by design. To contest one, use the *Challenge this
conclusion* button on any card — it opens a prefilled email to the maintainer
(set by `CHALLENGE_CONTACT` in `data.js`), who reviews it with AI-assisted
research and updates the verdict if it holds up.

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
| `app.js`                       | Filtering, sorting, expandable evidence, challenge links  |
| `data.js`                      | The curated food dataset with studies (edit here)         |
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
eight 0–2 sub-scores and the conservative effect estimate. The `certainty` field
must match the tier implied by the score total — `NUTRIGRADE_RUBRIC.thresholds`
defines the cut-points, and the validation in the smoke test checks this:

```js
"tree-nuts": {
  scores: { quality: 1, consistency: 2, precision: 2, directness: 2,
            effectSize: 1, doseResponse: 2, biasFreedom: 1, experimental: 1 }, // = 12 → moderate
  effect: "Pooled RR ≈ 0.78 for all-cause mortality at ~28 g/day; interval excludes no-effect.",
}
```

New categories appear in the filter automatically. When you change a verdict, add
a `revisions` entry; when you change the *method*, bump `METHODOLOGY_VERSION` in
`data.js` and update `METHODOLOGY.md`.

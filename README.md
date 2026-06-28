# Diet Effects

A small web app that lists whether common foods generally have a **positive**,
**negative**, or **neutral** effect when *added* to a typical diet — based on
free-living observational data (what tends to actually happen when people add a
food to how they already eat).

## What it shows

Each food is rated by the general direction of association observed in large
**prospective cohort studies** and **meta-analyses** (e.g. Nurses' Health Study,
Health Professionals Follow-up Study, EPIC, PURE, and pooled analyses) for
outcomes such as all-cause mortality, cardiovascular disease, and type 2
diabetes.

- 🟢 **Positive** — added intake is associated with better outcomes
- 🟡 **Neutral / mixed** — little net association, or evidence points both ways
- 🔴 **Negative** — added intake is associated with worse outcomes

Each card also shows an **evidence-strength** indicator (3 dots = consistent
across many large cohorts + meta-analyses; 1 dot = limited or mixed evidence).

You can search by name and filter by effect or food category.

## Important caveats

These are population-level **associations** from observational data — **not**
proof of cause and effect, and **not** personal medical or dietary advice.
Real-world effects depend heavily on **what a food replaces** (e.g. nuts instead
of chips), overall dietary pattern, quantity, and individual health. Observational
studies can be confounded by lifestyle. Consult a qualified professional about
your own diet.

## Running it

It's a static site with no build step or dependencies. Either:

```bash
# Option 1: just open the file
open index.html

# Option 2: serve locally (recommended)
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

| File         | Purpose                                            |
|--------------|----------------------------------------------------|
| `index.html` | Page structure, header, controls, footer/legend    |
| `styles.css` | Styling                                            |
| `app.js`     | Filtering, sorting, and rendering logic            |
| `data.js`    | The curated food dataset (edit here to add foods)  |

## Adding or editing foods

Edit `data.js`. Each entry looks like:

```js
{
  name: "Tree nuts (almonds, walnuts)",
  category: "Nuts & seeds",
  effect: "positive",          // "positive" | "negative" | "neutral"
  confidence: "strong",        // "strong" | "moderate" | "limited"
  note: "Short, evidence-grounded explanation of the association.",
}
```

New categories appear in the filter dropdown automatically.

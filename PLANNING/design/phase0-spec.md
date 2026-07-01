# Phase 0 spec — signal tiers + long-tail "eat to taste" list

Worker builds this as **task 0**, before any food grinding. Planner hard-reviews and
merges to `main` first. Goal: let hundreds of foods coexist without burying the
notable ~40 or bloating the summary.

## 1. `signalTier(food, assessment)` — pure, derived (add to `scoring.js`, export it)
Returns `"notable"` or `"long-tail"`. **Notable if ANY** of:
- `food.effect !== "neutral"` (directional verdict), OR
- `Scoring.leanOf(assessment.evidence) !== null` (neutral but leaning), OR
- `(assessment.outcomeVerdicts || []).some(ov => ov.effect !== "neutral")` (directional
  per-outcome), OR
- `!!food.contested`, OR
- `["high","very-high"].includes(Scoring.burdenTier(assessment.burden && assessment.burden.deathsM))`, OR
- `food.categoryUniformity === "mixed"`.

Otherwise `"long-tail"`. (Holding-list items are not foods; unaffected.)

Attach `food.signalTier` in the merge loop like the other derived fields.

## 2. Rendering (`app.js`)
- Partition `FOODS` by `signalTier`.
- **Summary panels** (`renderHighlights`) and the **card grid**: NOTABLE foods only
  (current behaviour, just filtered to notable). Long-tail never appears in the
  add/cut/neutral panels or as a full card.
- **New section** below the grid (above or beside the holding list): **"Eat to taste —
  no strong signal"**. Compact: long-tail foods grouped by category, one line each
  (name + a short "to taste" amount if we have one), tap to expand a brief note
  (summary + neutral verdict + one line on why it's here). Reuse existing muted styling;
  keep it dense — this is the long tail, not a showcase.
- **Search/filter** must still find long-tail foods (match them; expand/scroll to the
  long-tail entry, or promote it to a temporary card on click).

## 3. Tests (`test/data.test.js` or a new file)
- `signalTier` returns a valid value for every food; exported from scoring.js.
- Partition invariant: every food is exactly one of notable / long-tail.
- Anchors: `trans-fat` notable; `artificial-sweeteners` notable (contested);
  `red-meat` notable (directional per-outcome); a neutral-no-lean food (e.g. `poultry`)
  long-tail.

## 4. Expected reclassifications (sanity — don't be surprised)
With today's data, these current foods move to **long-tail** (neutral, no lean, no
directional per-outcome, not contested, burden < high, not mixed): shellfish,
coconut-oil, poultry, milk, butter, potatoes, fruit-juice, eggs. These STAY notable:
white-bread (leans negative), tomatoes (leans positive), all directional foods, plus
red-meat / artificial-sweeteners / mixed categories. Confirm each against the rule; if
one surprises you, check the rule, not a hand-exception.

## 5. Not in scope for Phase 0
No verdict changes; no new foods. Purely the tier field + the UI split + tests. Bump
METHODOLOGY_VERSION + changelog. Then STOP for review.

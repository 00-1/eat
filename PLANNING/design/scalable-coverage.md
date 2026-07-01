# Design: Scalable exhaustive coverage (hundreds of foods)

Goal: cover hundreds+ of foods without (a) burying the ~40 that matter, (b) breaking
the summary UI, or (c) tempting the worker to fabricate figures for thin foods.

## The unlock: signal tiers (DERIVED, not hand-assigned)
The user's insight — "say when there's not much interesting to say, and list those at
the bottom" — is the key. Formalize it as a signal tier that FALLS OUT of existing
fields (consistent with compute-not-assign; no new hand-labels):

- **Notable** — full card + eligible for the summary panels. A food is notable iff ANY:
  directional verdict (positive/negative); OR a directional per-outcome verdict; OR
  `contested`; OR burden tier ≥ high; OR `mixed` uniformity with a real member
  divergence.
- **Long tail ("eat to taste")** — neutral, minimal magnitude, no directional
  per-outcome story, low/unquantified burden, not contested. Rendered as a COMPACT
  list at the bottom ("No strong signal either way — eat to taste"), grouped by
  category, one line each, tap to expand the (brief) evidence. NOT in the summary
  panels.
- **Holding** (existing) — known but not yet assessed / genuinely no hard-outcome
  evidence. Unchanged.

`signalTier(food)` is a pure function of recorded fields → testable, reproducible.
Bonus: this also fixes the *current* complaints (summary getting long, tag noise) —
the summary only ever shows notable foods; everything else collapses.

## Why this must come BEFORE the big grounding pass
If the worker adds 300 foods against today's model, the grid and summary panels
render 300 full cards — an unusable wall, and the 40 that matter drown. So Phase 0 =
ship the signal-tier data field + long-tail list UI. THEN foods self-sort as they're
added: a thin "eat to taste" food costs one line, not a card.

## Honesty at scale
At hundreds of foods, MOST will legitimately be `verified:false` and/or neutral/thin —
that's fine and honest, and the long-tail bucket is exactly where they belong. Hard
rules for the worker stay: real PMID/DOI or an honest gap; compute-don't-assign;
`node --test` green. Expect the ratio of notable:long-tail to be low, and that's the
point — the app's value is separating signal from the long tail.

## Candidate taxonomy (the worker's work-list)
Generate a structured food taxonomy (categories → items) as the exhaustive candidate
list, ~300–500 items: fruits, vegetables (leafy/cruciferous/root/allium/nightshade/
squash/other), grains & starches, legumes, nuts & seeds, dairy, eggs, red/white/
processed meats, seafood (fish/shellfish/other), fats & oils, beverages
(water/coffee/tea/juice/soda/energy/alcohol/plant-milk), sweets & snacks, condiments
& sauces, herbs & spices, fermented foods, prepared/fast foods, supplements. Worker
decides per item: own card (notable) / long-tail card / member of an existing food /
holding.

## Phasing
- **Phase 0 (design + build, with user):** signalTier field + long-tail list UI +
  generate the taxonomy. Small, high-judgment — do it here, not unattended.
- **Phase 1 (worker, unattended, batched):** exhaustive grounding down the taxonomy;
  foods self-sort into notable / long-tail / member / holding.
- **Parallel:** substitution graph; epistemic-honesty readout.

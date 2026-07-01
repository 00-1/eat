# Design: Substitution ("vs what?")

## The problem
Verdicts answer "what happens when you ADD this to a typical diet?" That's a clean,
defensible question — but it hides the comparator, and the comparator is often what
actually matters. "Butter · neutral" is roughly true as a marginal addition, but
misleading if you read it as "butter is fine" — vs olive oil it's clearly worse; vs
nothing it's ~neutral. The same is true for white vs wholemeal bread, red meat vs
legumes, juice vs whole fruit. We already carry `considerations.substitution` prose on
many foods, but it's buried and unstructured, and the headline verdict can mislead a
skimmer.

## Options (roughly light → heavy)
- **A. Structured swap field.** Add an optional `swap: { betterThan: [...],
  worseThan: [...], note }` per food, rendered as a small "Compared with…" line on the
  card. Cheap; reuses existing substitution prose; no engine change.
- **B. Comparator chips on the summary row.** e.g. on "Butter", a muted "worse than
  olive oil" chip. Higher visibility, but adds noise to an already-busy summary.
- **C. Swap matrix.** A small evidence-based "instead of X → Δrisk" table per food,
  sourced (e.g. Mousavi 2025-style substitution HRs, PREDIMED swaps). Most rigorous,
  most work, and only some foods have real substitution estimates.
- **D. Methodology reframe.** Keep "added" as the base question but always pair the
  verdict with its best evidence-based swap. A framing/doc change layered on A.

## Open questions for the user
1. How heavy — a light structured note (A/D) or a real sourced matrix (C)?
2. Where does it live — expanded card only (safe), or also the summary row (visible
   but noisier)?
3. Scope — every food, or only the ones where the comparator genuinely changes the
   read (fats, grains, meats, drinks)?

## My lean
Start with **A + D**: a structured `swap` field surfaced as a "Compared with…" line,
populated from the substitution prose we already have, and only where a comparator
materially changes the read. It's honest, low-noise, and we can promote to a sourced
matrix (C) later for the foods that have real substitution HRs. Avoid summary-row
chips for now — the summary is already busy.

## DECISION (user): go full/sourced — but as a GRAPH, not a dense matrix
User wants the ambitious version. Important reframe: a literal N×N matrix over hundreds
of foods is ~90k cells and almost entirely EMPTY — the literature only estimates a
handful of swaps. So "full matrix" = a **sourced substitution graph**:
- **Sourced edges** where a real substitution estimate exists:
  `swaps: [{ with: "legumes", deltaRR: 0.83, outcome: "…", cite, id }]`. Known-rich
  sources: processed/red meat → nuts/fish/legumes/whole grains (Zheng 2019 BMJ;
  Guasch-Ferré 2019); butter → olive oil (Guasch-Ferré 2022); refined → whole grain;
  SSB → water/coffee; juice → whole fruit; white → brown rice; potato/fries → whole
  grain (Mousavi 2025).
- **Derived comparisons** where no direct HR exists: within a food's role/category,
  rank by our own verdicts ("a better swap than X, worse than Y"), clearly flagged
  `derived` vs `sourced` so we never imply a substitution study that doesn't exist.
- Render as a "Compared with…" block on the card: sourced swaps first (with the HR +
  citation), then the derived within-category ranking.
This is more useful AND more honest than a sparse matrix. A dense all-pairs matrix is
explicitly NOT the goal.

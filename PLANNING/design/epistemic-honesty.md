# Design: Epistemic honesty (fight the "computed = objective" illusion)

## The problem
The engine is deterministic, which is a genuine strength — but it can flatter itself.
The *inputs* are still curated judgment calls, and tiers are sensitive to them (soy
flipped Moderate→Low on a single confounding call in the v0.61 audit). A reader can
mistake "computed" for "objective/settled." The project's best differentiator is its
honesty; this stream makes the honesty *legible* rather than implied.

## Ideas (compose freely)
- **A. Input-sensitivity readout.** For each food, compute which single evidence-input
  change would move the tier ("would drop to Low if confounding were scored high"),
  and show the nearest such flip. Purely derived from the engine — reproducible,
  testable, and it makes the fragility visible. *Strongest candidate.*
- **B. "What would change our mind" line.** A short, per-food statement of the study
  that would most move the verdict (a big RCT, a bias-corrected re-analysis). Some are
  already implied in rationales; make it a first-class field.
- **C. Tier-margin signal.** Show how far a verdict is from the next tier boundary
  (e.g. "9/16 — 1 point from Low"), so borderline calls read as borderline. Trivial to
  derive; pairs well with A.
- **D. Explicit "curated inputs" framing.** One honest sentence somewhere central:
  the math is deterministic, the inputs are our best reading of the evidence and are
  challengeable — with a pointer to the challenge path.
- **E. Confidence-in-the-inputs vs confidence-in-the-tier.** Distinguish "the evidence
  is thin" (already = certainty) from "we're unsure we scored the evidence right"
  (meta-uncertainty) — probably too subtle for v1; note and defer.

## Open questions for the user
1. Numeric transparency (C: "9/16, 1 from Low") — clarifying, or does it over-expose
   the bespoke scoring and invite bikeshedding?
2. Is A (sensitivity readout) a per-card detail, or too much for most users → keep it
   to a methodology/"how sure are we" view?
3. Does this tie into the parked **challenge mechanism** (D points at it)? Worth
   pairing?

## My lean
**C + A first**, both engine-derived and cheap: show the tier margin, and the single
input flip nearest to the boundary, in the expanded card's "Evidence assessment"
block. That directly answers "how fragile is this call?" using the machinery we
already have. Layer **D** (the one honest framing sentence) into the intro/approach
tab. Defer B/E until we see how A/C land.

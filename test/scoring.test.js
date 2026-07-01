"use strict";

// The scoring ENGINE is the heart of this project: a verdict's certainty must be
// a deterministic function of recorded evidence facts. These tests pin down the
// rules so the process can't silently drift.

const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../scoring.js");

// Baseline evidence that scores 0 on every dimension; override one field per test
// to isolate each rule.
function ev(overrides) {
  return Object.assign(
    {
      pooledRR: 1.0,            // effectSize 0
      ciExcludesNull: false,
      participants: 0,          // precision 0
      heterogeneity: "high",    // consistency 0
      outcomeType: "indirect",  // directness 0
      doseResponse: "none",     // doseResponse 0
      rctLevel: "none",         // experimental 0
      funding: "industry",      // biasFreedom 0
      pubBias: "untested",
      confoundingRisk: "high",  // quality 0
    },
    overrides || {}
  );
}

test("baseline evidence scores all zeros", () => {
  const s = S.computeScores(ev());
  assert.deepEqual(s, {
    quality: 0, consistency: 0, precision: 0, directness: 0,
    effectSize: 0, doseResponse: 0, biasFreedom: 0, experimental: 0,
  });
  assert.equal(S.totalScore(s), 0);
  assert.equal(S.tierFromTotal(0), "very-low");
});

test("effectSize bands by |ln(RR)| (protective and harmful symmetric)", () => {
  // strong: RR <= 0.80 or >= 1.25
  assert.equal(S.computeScores(ev({ pooledRR: 0.80 })).effectSize, 2);
  assert.equal(S.computeScores(ev({ pooledRR: 1.25 })).effectSize, 2);
  assert.equal(S.computeScores(ev({ pooledRR: 0.64 })).effectSize, 2);
  // modest: just inside the strong band
  assert.equal(S.computeScores(ev({ pooledRR: 0.81 })).effectSize, 1);
  assert.equal(S.computeScores(ev({ pooledRR: 0.90 })).effectSize, 1);
  assert.equal(S.computeScores(ev({ pooledRR: 1.12 })).effectSize, 1);
  // trivial / null (note 1.11 is just inside null: 1/0.90 ≈ 1.111 is the boundary)
  assert.equal(S.computeScores(ev({ pooledRR: 0.95 })).effectSize, 0);
  assert.equal(S.computeScores(ev({ pooledRR: 1.0 })).effectSize, 0);
  assert.equal(S.computeScores(ev({ pooledRR: 1.10 })).effectSize, 0);
  // junk input is safe
  assert.equal(S.computeScores(ev({ pooledRR: 0 })).effectSize, 0);
  assert.equal(S.computeScores(ev({ pooledRR: undefined })).effectSize, 0);
});

test("precision steps on sample size", () => {
  assert.equal(S.computeScores(ev({ participants: 500000 })).precision, 2);
  assert.equal(S.computeScores(ev({ participants: 499999 })).precision, 1);
  assert.equal(S.computeScores(ev({ participants: 100000 })).precision, 1);
  assert.equal(S.computeScores(ev({ participants: 99999 })).precision, 0);
});

test("consistency maps heterogeneity (unknown/unreported scores 0)", () => {
  assert.equal(S.computeScores(ev({ heterogeneity: "low" })).consistency, 2);
  assert.equal(S.computeScores(ev({ heterogeneity: "moderate" })).consistency, 1);
  assert.equal(S.computeScores(ev({ heterogeneity: "high" })).consistency, 0);
  assert.equal(S.computeScores(ev({ heterogeneity: "unknown" })).consistency, 0);
  assert.equal(S.computeScores(ev({ heterogeneity: "garbage" })).consistency, 0);
});

test("consistency: high I² with directional agreement earns partial credit", () => {
  // genuine directional disagreement (or unmarked) still scores 0
  assert.equal(S.computeScores(ev({ heterogeneity: "high" })).consistency, 0);
  assert.equal(S.computeScores(ev({ heterogeneity: "high", directionallyConsistent: false })).consistency, 0);
  // high I² but all cohorts point the same way -> 1 (not penalised like real conflict)
  assert.equal(S.computeScores(ev({ heterogeneity: "high", directionallyConsistent: true })).consistency, 1);
  // the flag only matters at high I² — it can't inflate moderate/low/unknown
  assert.equal(S.computeScores(ev({ heterogeneity: "moderate", directionallyConsistent: true })).consistency, 1);
  assert.equal(S.computeScores(ev({ heterogeneity: "low", directionallyConsistent: true })).consistency, 2);
  assert.equal(S.computeScores(ev({ heterogeneity: "unknown", directionallyConsistent: true })).consistency, 0);
});

test("directness maps outcome type", () => {
  assert.equal(S.computeScores(ev({ outcomeType: "hard" })).directness, 2);
  assert.equal(S.computeScores(ev({ outcomeType: "surrogate" })).directness, 1);
  assert.equal(S.computeScores(ev({ outcomeType: "indirect" })).directness, 0);
});

test("doseResponse maps gradient", () => {
  assert.equal(S.computeScores(ev({ doseResponse: "graded" })).doseResponse, 2);
  assert.equal(S.computeScores(ev({ doseResponse: "some" })).doseResponse, 1);
  assert.equal(S.computeScores(ev({ doseResponse: "none" })).doseResponse, 0);
});

test("experimental: outcome RCTs beat any other corroboration", () => {
  assert.equal(S.computeScores(ev({ rctLevel: "outcomes" })).experimental, 2);
  assert.equal(S.computeScores(ev({ rctLevel: "pattern" })).experimental, 1);
  assert.equal(S.computeScores(ev({ rctLevel: "markers" })).experimental, 1);
  assert.equal(S.computeScores(ev({ rctLevel: "mechanism" })).experimental, 1);
  assert.equal(S.computeScores(ev({ rctLevel: "none" })).experimental, 0);
});

test("biasFreedom adds funding independence and tested-clean publication bias", () => {
  assert.equal(S.computeScores(ev({ funding: "independent", pubBias: "tested-clean" })).biasFreedom, 2);
  assert.equal(S.computeScores(ev({ funding: "independent", pubBias: "untested" })).biasFreedom, 1);
  assert.equal(S.computeScores(ev({ funding: "industry", pubBias: "tested-clean" })).biasFreedom, 1);
  assert.equal(S.computeScores(ev({ funding: "mixed", pubBias: "suspected" })).biasFreedom, 0);
});

test("quality maps confounding risk", () => {
  assert.equal(S.computeScores(ev({ confoundingRisk: "low" })).quality, 2);
  assert.equal(S.computeScores(ev({ confoundingRisk: "moderate" })).quality, 1);
  assert.equal(S.computeScores(ev({ confoundingRisk: "high" })).quality, 0);
});

test("tier thresholds (13 / 10 / 7) including boundaries", () => {
  assert.equal(S.tierFromTotal(16), "high");
  assert.equal(S.tierFromTotal(13), "high");
  assert.equal(S.tierFromTotal(12), "moderate");
  assert.equal(S.tierFromTotal(10), "moderate");
  assert.equal(S.tierFromTotal(9), "low");
  assert.equal(S.tierFromTotal(7), "low");
  assert.equal(S.tierFromTotal(6), "very-low");
  assert.equal(S.tierFromTotal(0), "very-low");
});

test("a perfect evidence base scores the maximum and is High", () => {
  const perfect = ev({
    pooledRR: 0.5, ciExcludesNull: true, participants: 1000000, heterogeneity: "low",
    outcomeType: "hard", doseResponse: "graded", rctLevel: "outcomes",
    funding: "independent", pubBias: "tested-clean", confoundingRisk: "low",
  });
  const a = S.assess(perfect);
  assert.equal(a.total, S.MAX);
  assert.equal(a.total, 16);
  assert.equal(a.tier, "high");
});

test("a neutral verdict is scored on the 6 quality dims (/12) and CAN reach High", () => {
  // The point of v0.11: a well-established null isn't capped by lacking an effect.
  const strongNull = ev({
    pooledRR: 1.0, ciExcludesNull: false, participants: 1000000, heterogeneity: "low",
    outcomeType: "hard", doseResponse: "none", rctLevel: "outcomes",
    funding: "independent", pubBias: "tested-clean", confoundingRisk: "low",
  });
  const a = S.assess(strongNull);
  assert.equal(a.neutralScored, true);
  assert.equal(a.max, 12); // effect-size & dose-response don't count for a null
  assert.equal(a.tier, "high"); // a confident neutral is now expressible
  // a weak/contested null (high confounding + heterogeneity) stays very-low
  const weakNull = ev({
    pooledRR: 1.1, ciExcludesNull: false, participants: 100000, heterogeneity: "high",
    outcomeType: "hard", doseResponse: "none", rctLevel: "none",
    funding: "independent", pubBias: "untested", confoundingRisk: "high",
  });
  assert.equal(S.assess(weakNull).tier, "very-low");
});

test("scoring is deterministic and does not mutate its input", () => {
  const input = ev({ pooledRR: 0.78, participants: 819000, heterogeneity: "low" });
  const snapshot = JSON.parse(JSON.stringify(input));
  const a = S.computeScores(input);
  const b = S.computeScores(input);
  assert.deepEqual(a, b);
  assert.deepEqual(input, snapshot); // unchanged
});

test("engine constants are internally consistent", () => {
  assert.equal(S.MAX, 16);
  assert.deepEqual(S.THRESHOLDS, { high: 13, moderate: 10, low: 7 });
});

test("experimental: a validated causal pathway scores like an outcome RCT", () => {
  assert.equal(S.computeScores(ev({ rctLevel: "pathway" })).experimental, 2);
  assert.equal(S.computeScores(ev({ rctLevel: "outcomes" })).experimental, 2);
  // a weaker surrogate stays at 1 — this is what keeps coconut from being upgraded
  assert.equal(S.computeScores(ev({ rctLevel: "markers" })).experimental, 1);
});

test("evidence basis is classified from the computed scores", () => {
  const strongObs = { consistency: 2, precision: 2, directness: 2, doseResponse: 2 };
  const weakObs = { consistency: 0, precision: 0, directness: 0, doseResponse: 0 };
  assert.equal(S.classifyBasis(Object.assign({ experimental: 2, quality: 1 }, strongObs)), "convergent");
  assert.equal(S.classifyBasis(Object.assign({ experimental: 1, quality: 1 }, strongObs)), "observation-led");
  assert.equal(S.classifyBasis(Object.assign({ experimental: 2, quality: 1 }, weakObs)), "mechanism-led");
  assert.equal(S.classifyBasis(Object.assign({ experimental: 1, quality: 1 }, weakObs)), "limited");
});

test("standout: qualifying needs top tier on both axes; marginal is one notch short", () => {
  // qualifying
  assert.equal(S.standout("positive", "high", "large"), "gold");
  assert.equal(S.standout("negative", "high", "large"), "bin");
  // marginal — one tier short on exactly one axis (rank sum 5)
  assert.equal(S.standout("positive", "moderate", "large"), "marginal-gold"); // coffee, fish
  assert.equal(S.standout("positive", "high", "moderate"), "marginal-gold");
  assert.equal(S.standout("negative", "high", "moderate"), "marginal-bin");   // trans fat
  assert.equal(S.standout("negative", "moderate", "large"), "marginal-bin");  // ultra-processed
  // two notches short, or neutral, or null inputs -> nothing
  assert.equal(S.standout("positive", "low", "large"), null);
  assert.equal(S.standout("positive", "moderate", "moderate"), null);
  assert.equal(S.standout("neutral", "high", "large"), null);
  assert.equal(S.standout("positive", "high", "bogus"), null);
});

test("magnitude is minimal when the interval crosses the null (no claimed effect)", () => {
  // A neutral food must not advertise an effect size, however large the point RR.
  assert.equal(S.classifyMagnitude({ pooledRR: 0.5, ciExcludesNull: false }, ["All-cause mortality"]), "minimal");
  assert.equal(S.classifyMagnitude({ pooledRR: 1.5, ciExcludesNull: false }, []), "minimal");
  // still reports magnitude when the interval excludes the null
  assert.equal(S.classifyMagnitude({ pooledRR: 0.64, ciExcludesNull: true }, []), "large");
});

test("GUARDRAIL: a hard-to-no-observation poison can still be certain via a pathway", () => {
  // The user's case: demonstrable mechanistic poison, little/no cohort data.
  const poison = ev({
    pooledRR: 1.5, participants: 500, heterogeneity: "unknown",
    outcomeType: "surrogate", doseResponse: "none", rctLevel: "pathway",
    funding: "independent", pubBias: "untested", confoundingRisk: "low",
  });
  assert.equal(S.assess(poison).basis, "mechanism-led");
});

test("magnitude reflects relative effect size (no all-cause bump — retired v0.41)", () => {
  // direction-agnostic: protective and harmful of equal |ln RR| score the same
  assert.equal(S.classifyMagnitude({ pooledRR: 0.64 }), "large");
  assert.equal(S.classifyMagnitude({ pooledRR: 1.30 }), "large");
  assert.equal(S.classifyMagnitude({ pooledRR: 0.85 }), "moderate");
  assert.equal(S.classifyMagnitude({ pooledRR: 0.97 }), "small");
  assert.equal(S.classifyMagnitude({ pooledRR: 1.0 }), "minimal");
  // The all-cause-mortality bump is GONE: acting on all-cause mortality no longer
  // lifts the tier. Importance-at-population-scale is the separate absolute-burden
  // axis; effect-at-realistic-intake is the dose curve. Magnitude is pure relative effect.
  assert.equal(S.classifyMagnitude({ pooledRR: 0.86 }, ["Heart disease"]), "moderate");
  assert.equal(S.classifyMagnitude({ pooledRR: 0.86 }, ["All-cause mortality"]), "moderate");
  assert.equal(S.classifyMagnitude({ pooledRR: 1.0 }, ["All-cause mortality"]), "minimal");
});

test("maxMagnitude takes the strongest of a food's outcomes", () => {
  // A food moves the needle as much as its biggest outcome, not just its headline.
  // Empty / all-null -> minimal.
  assert.equal(S.maxMagnitude([]), "minimal");
  assert.equal(S.maxMagnitude([{ ev: { pooledRR: 1.0, ciExcludesNull: false }, outcomes: [] }]), "minimal");
  // headline neutral (minimal) but a directional per-outcome verdict lifts it
  assert.equal(
    S.maxMagnitude([
      { ev: { pooledRR: 1.0, ciExcludesNull: false }, outcomes: ["All-cause mortality"] }, // minimal
      { ev: { pooledRR: 1.10, ciExcludesNull: true }, outcomes: ["Type 2 diabetes"] },       // small
    ]),
    "small"
  );
  // the max wins even when it's the headline
  assert.equal(
    S.maxMagnitude([
      { ev: { pooledRR: 0.78, ciExcludesNull: true }, outcomes: [] },       // large
      { ev: { pooledRR: 0.97, ciExcludesNull: true }, outcomes: [] },       // small
    ]),
    "large"
  );
});

test("leanOf: a neutral estimate leans only when it's a non-trivial size", () => {
  // directional foods have a verdict, not a lean
  assert.equal(S.leanOf({ pooledRR: 0.78, ciExcludesNull: true }), null);
  // neutral, CI crosses null, non-trivial estimate → leans the way it points
  assert.equal(S.leanOf({ pooledRR: 1.10, ciExcludesNull: false }), "negative");
  assert.equal(S.leanOf({ pooledRR: 0.90, ciExcludesNull: false }), "positive");
  // neutral but within the floor (≈1.0) → genuinely flat, no lean
  assert.equal(S.leanOf({ pooledRR: 1.01, ciExcludesNull: false }), null);
  assert.equal(S.leanOf({ pooledRR: 0.98, ciExcludesNull: false }), null);
  assert.equal(S.leanOf({ pooledRR: 1.0, ciExcludesNull: false }), null);
  // CI excludes null but effect below the floor (butter) → neutral & flat, no lean
  assert.equal(S.leanOf({ pooledRR: 1.0134, ciExcludesNull: true }), null);
});

test("assess settings.zero forces a dim to 0 but keeps it in the denominator", () => {
  // A directional food carried partly by experimental evidence; zeroing it lowers
  // the total but not the max, so the tier can drop — the explore "observational
  // only" rule.
  const pathwayBacked = ev({
    pooledRR: 0.78, ciExcludesNull: true, participants: 500000, heterogeneity: "low",
    outcomeType: "hard", doseResponse: "graded", rctLevel: "pathway",
    funding: "independent", pubBias: "tested-clean", confoundingRisk: "low",
  });
  const full = S.assess(pathwayBacked);
  const obsOnly = S.assess(pathwayBacked, null, { zero: ["experimental"] });
  assert.equal(full.max, 16);
  assert.equal(obsOnly.max, 16); // denominator unchanged
  assert.equal(obsOnly.total, full.total - 2); // lost the 2 experimental points
  assert.ok(S.CERTAINTY_ORDER[obsOnly.tier] <= S.CERTAINTY_ORDER[full.tier]);
});

test("assess settings.only judges on a subset (numerator AND denominator)", () => {
  const pathwayBacked = ev({
    pooledRR: 0.78, ciExcludesNull: true, participants: 500000, heterogeneity: "low",
    outcomeType: "hard", doseResponse: "graded", rctLevel: "pathway",
    funding: "independent", pubBias: "tested-clean", confoundingRisk: "low",
  });
  const only = S.assess(pathwayBacked, null, { only: ["experimental"] });
  assert.equal(only.max, 2); // one dim in scope
  assert.equal(only.total, 2); // pathway scores 2
  assert.equal(only.tier, "high");
});

test("verdictUnderLens re-derives DIRECTION, not just certainty, per evidence lens", () => {
  // Observation-led negative (e.g. trans fat): cohorts + validated pathway.
  const transfat = ev({
    pooledRR: 1.42, ciExcludesNull: true, participants: 150000, heterogeneity: "low",
    outcomeType: "hard", doseResponse: "graded", rctLevel: "pathway", funding: "independent",
    pubBias: "untested", confoundingRisk: "low", experimentalDirection: "negative",
  });
  assert.equal(S.verdictUnderLens(transfat, [], "default").effect, "negative");
  assert.equal(S.verdictUnderLens(transfat, [], "observational").effect, "negative"); // cohorts still say so
  assert.equal(S.verdictUnderLens(transfat, [], "experimental").effect, "negative"); // pathway agrees

  // A sat-fat food exonerated by observation but condemned by LDL mechanism (cheese-like).
  const cheeseLike = ev({
    pooledRR: 0.9, ciExcludesNull: true, participants: 200000, heterogeneity: "moderate",
    outcomeType: "hard", doseResponse: "some", rctLevel: "none", funding: "independent",
    pubBias: "untested", confoundingRisk: "moderate", experimentalDirection: "negative",
  });
  assert.equal(S.verdictUnderLens(cheeseLike, [], "default").effect, "positive");
  assert.equal(S.verdictUnderLens(cheeseLike, [], "experimental").effect, "negative"); // flips (at low certainty)!

  // A cohort-only positive with no trial/mechanism (coffee-like) → insufficient under trials-only.
  const coffeeLike = ev({
    pooledRR: 0.83, ciExcludesNull: true, participants: 520000, heterogeneity: "moderate",
    outcomeType: "hard", doseResponse: "some", rctLevel: "none", funding: "independent",
    pubBias: "tested-clean", confoundingRisk: "moderate", experimentalDirection: "none",
  });
  assert.equal(S.verdictUnderLens(coffeeLike, [], "default").effect, "positive");
  assert.equal(S.verdictUnderLens(coffeeLike, [], "experimental").effect, "insufficient");
  assert.equal(S.verdictUnderLens(coffeeLike, [], "experimental").tier, null);
});

test("PRESETS expose the explore lenses and default is a no-op", () => {
  assert.equal(S.PRESETS["default"].lens, "default");
  assert.equal(S.PRESETS["observational"].lens, "observational");
  assert.equal(S.PRESETS["mechanism"].lens, "experimental");
  // the default lens reproduces the canonical verdict
  const someEv = ev({
    pooledRR: 0.78, ciExcludesNull: true, participants: 500000, heterogeneity: "low",
    outcomeType: "hard", doseResponse: "graded", rctLevel: "outcomes",
    funding: "independent", pubBias: "tested-clean", confoundingRisk: "low",
    experimentalDirection: "positive",
  });
  const d = S.verdictUnderLens(someEv, [], "default");
  assert.equal(d.effect, "positive");
  assert.equal(d.tier, S.assess(someEv).tier);
});

test("isDirectional: needs CI excluding null AND effect above the trivially-small floor", () => {
  assert.equal(S.isDirectional({ pooledRR: 0.78, ciExcludesNull: true }), true);
  assert.equal(S.isDirectional({ pooledRR: 1.26, ciExcludesNull: true }), true);
  // CI crosses null -> not directional regardless of size
  assert.equal(S.isDirectional({ pooledRR: 0.78, ciExcludesNull: false }), false);
  // excludes null but trivially small (~1%, butter) -> not directional
  assert.equal(S.isDirectional({ pooledRR: 1.0134, ciExcludesNull: true }), false);
  assert.equal(S.isDirectional({ pooledRR: 0.98, ciExcludesNull: true }), false); // |ln|=0.020 < 0.03
  assert.equal(S.isDirectional({ pooledRR: 0.96, ciExcludesNull: true }), true);  // |ln|=0.041 > 0.03
  // and a below-floor food is scored as neutral (/12) by assess
  assert.equal(S.assess({ pooledRR: 1.0134, ciExcludesNull: true }).neutralScored, true);
});

test("classifyDoseShape derives the shape from the curve points", () => {
  const c = S.classifyDoseShape;
  // monotonic harm — rises throughout
  assert.equal(c([{ x: 0, rr: 1.0 }, { x: 1, rr: 1.13 }, { x: 2, rr: 1.26 }, { x: 3, rr: 1.42 }]), "monotonic-harm");
  // monotonic benefit — falls throughout
  assert.equal(c([{ x: 0, rr: 1.0 }, { x: 1, rr: 0.9 }, { x: 2, rr: 0.8 }, { x: 3, rr: 0.72 }]), "monotonic-benefit");
  // plateau benefit — falls then flattens
  assert.equal(c([{ x: 0, rr: 1.0 }, { x: 15, rr: 0.86 }, { x: 28, rr: 0.78 }, { x: 45, rr: 0.8 }]), "plateau-benefit");
  // plateau harm — rises then flattens
  assert.equal(c([{ x: 0, rr: 1.0 }, { x: 1, rr: 1.2 }, { x: 2, rr: 1.35 }, { x: 3, rr: 1.36 }]), "plateau-harm");
  // threshold harm — flat at low intake, then climbs (white rice)
  assert.equal(c([{ x: 0, rr: 1.0 }, { x: 158, rr: 0.97 }, { x: 300, rr: 1.02 }, { x: 450, rr: 1.16 }]), "threshold-harm");
  // threshold benefit — flat then falls
  assert.equal(c([{ x: 0, rr: 1.0 }, { x: 1, rr: 1.0 }, { x: 2, rr: 0.9 }, { x: 3, rr: 0.8 }]), "threshold-benefit");
  // J/U — down then up (a real reversal)
  assert.equal(c([{ x: 0, rr: 1.0 }, { x: 1, rr: 0.85 }, { x: 2, rr: 0.9 }, { x: 4, rr: 1.2 }]), "j-u-curve");
  // flat — barely moves
  assert.equal(c([{ x: 0, rr: 1.0 }, { x: 1, rr: 1.01 }, { x: 2, rr: 0.99 }]), "flat");
  // too few points to judge
  assert.equal(c([{ x: 0, rr: 1.0 }, { x: 1, rr: 0.8 }]), null);
  assert.equal(c("nonsense"), null);
});

test("GUARDRAIL: mechanism does not override good observational outcome data", () => {
  // The "carbs spike sugar → carbs bad" trap: a food with strong observational
  // BENEFIT and an adverse biomarker stays observation-led and benefits stand —
  // the direction comes from the observed association, never from the biomarker.
  const carbHeavyButHealthy = ev({
    pooledRR: 0.82, participants: 700000, heterogeneity: "low",
    outcomeType: "hard", doseResponse: "graded", rctLevel: "markers",
    funding: "independent", pubBias: "tested-clean", confoundingRisk: "moderate",
  });
  const a = S.assess(carbHeavyButHealthy);
  assert.equal(a.basis, "observation-led");
  assert.ok(a.scores.effectSize >= 1); // the protective signal is intact
});

test("dose-curve readings: nadir/peak/threshold and best-case magnitude", () => {
  // A benefit curve that keeps improving to the studied edge.
  const benefit = { unit: "g/day", points: [
    { x: 0, rr: 1.0 }, { x: 100, rr: 0.9 }, { x: 200, rr: 0.82 }, { x: 400, rr: 0.75 },
  ] };
  const r = S.curveReadings(benefit);
  assert.equal(r.nadir.rr, 0.75);
  assert.equal(r.nadir.x, 400);
  assert.ok(r.nadir.atStudiedEdge, "nadir at the top of the studied range");
  assert.equal(r.harmThreshold, null, "a pure benefit curve never crosses into harm");
  // best-case magnitude for a positive food reads the nadir (0.75 → large)
  const pos = S.doseExtremeReading(benefit, "positive");
  assert.equal(pos.magnitude, "large");
  assert.equal(pos.atStudiedEdge, true);

  // A harm curve: worst case reads the peak; threshold is the first harmful point.
  const harm = { unit: "g/day", points: [
    { x: 0, rr: 1.0 }, { x: 50, rr: 1.05 }, { x: 150, rr: 1.4 },
  ] };
  const neg = S.doseExtremeReading(harm, "negative");
  assert.equal(neg.rr, 1.4);
  assert.equal(neg.magnitude, "large");
  const hr = S.curveReadings(harm);
  assert.equal(hr.harmThreshold.x, 50, "first intake past the directionality floor");

  // magnitudeOfRR has no all-cause bump — a raw 0.83 is 'moderate', not 'large'.
  assert.equal(S.magnitudeOfRR(0.83), "moderate");
  assert.equal(S.magnitudeOfRR(0.78), "large");
  assert.equal(S.magnitudeOfRR(1.0), "minimal");
  // no usable curve → null
  assert.equal(S.doseExtremeReading(null, "positive"), null);
  assert.equal(S.curveReadings({ points: [{ x: 0, rr: 1 }] }), null);
});

test("ascensionDose: intake to reach a target tier, with shape", () => {
  // Nuts: plateau, reaches 'large' (rr<=0.80) first at 28 g/day.
  const nuts = { unit: "g/day", points: [
    { x: 0, rr: 1 }, { x: 15, rr: 0.86 }, { x: 28, rr: 0.78 }, { x: 45, rr: 0.8 },
  ] };
  const a = S.ascensionDose(nuts, "positive", "large");
  assert.equal(a.x, 28);
  assert.equal(a.shape, "plateau-benefit");
  // Fruit: plateaus at 0.86 (moderate) — never reaches 'large'.
  const fruit = { unit: "g/day", points: [
    { x: 0, rr: 1 }, { x: 200, rr: 0.9 }, { x: 550, rr: 0.86 },
  ] };
  assert.equal(S.ascensionDose(fruit, "positive", "large"), null);
  assert.equal(S.ascensionDose(fruit, "positive", "moderate").x, 200); // 0.90 -> moderate
  // Harm curve reaching 'large' at its high end.
  const harm = { unit: "g/day", points: [
    { x: 0, rr: 1 }, { x: 50, rr: 1.1 }, { x: 150, rr: 1.42 },
  ] };
  const h = S.ascensionDose(harm, "negative", "large");
  assert.equal(h.x, 150);
  assert.ok(h.atStudiedEdge);
});

test("optimalBand: contiguous near-best range at the same magnitude tier", () => {
  // Nuts: 28 g and 45 g are both 'large'; 15 g is only 'moderate' → band 28–45.
  const nuts = { unit: "g/day", points: [
    { x: 0, rr: 1 }, { x: 15, rr: 0.86 }, { x: 28, rr: 0.78 }, { x: 45, rr: 0.8 },
  ] };
  const b = S.optimalBand(nuts, "positive");
  assert.equal(b.loX, 28);
  assert.equal(b.hiX, 45);
  assert.equal(b.single, false);
  assert.equal(b.tier, "large");
  // A single-point peak stays single.
  const one = { unit: "g/day", points: [
    { x: 0, rr: 1 }, { x: 10, rr: 0.9 }, { x: 20, rr: 0.78 }, { x: 30, rr: 0.9 },
  ] };
  const b2 = S.optimalBand(one, "positive");
  assert.equal(b2.loX, 20);
  assert.equal(b2.hiX, 20);
  assert.equal(b2.single, true);
});

test("burdenTier: population-burden tiers from GBD attributable deaths (millions/yr)", () => {
  assert.equal(S.burdenTier(3.0), "very-high");
  assert.equal(S.burdenTier(2.0), "high");
  assert.equal(S.burdenTier(0.5), "moderate");
  assert.equal(S.burdenTier(0.1), "low");
  assert.equal(S.burdenTier(null), "unquantified");
  assert.equal(S.burdenTier(undefined), "unquantified");
});

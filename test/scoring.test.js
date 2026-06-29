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

test("magnitude reflects relative effect size, with an all-cause-mortality bump", () => {
  // direction-agnostic: protective and harmful of equal |ln RR| score the same
  assert.equal(S.classifyMagnitude({ pooledRR: 0.64 }, []), "large");
  assert.equal(S.classifyMagnitude({ pooledRR: 1.30 }, []), "large");
  assert.equal(S.classifyMagnitude({ pooledRR: 0.85 }, []), "moderate");
  assert.equal(S.classifyMagnitude({ pooledRR: 0.97 }, []), "small");
  assert.equal(S.classifyMagnitude({ pooledRR: 1.0 }, []), "minimal");
  // acting on all-cause mortality bumps a non-null effect up one tier (capped)
  assert.equal(S.classifyMagnitude({ pooledRR: 0.86 }, ["Heart disease"]), "moderate");
  assert.equal(S.classifyMagnitude({ pooledRR: 0.86 }, ["All-cause mortality"]), "large");
  assert.equal(S.classifyMagnitude({ pooledRR: 1.0 }, ["All-cause mortality"]), "minimal"); // null isn't bumped
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

test("PRESETS expose the explore rules and default is a no-op", () => {
  assert.ok(S.PRESETS["default"]);
  assert.equal(S.PRESETS["default"].settings, null);
  assert.deepEqual(S.PRESETS["observational"].settings, { zero: ["experimental"] });
  assert.deepEqual(S.PRESETS["mechanism"].settings, { only: ["experimental"] });
  // default settings (null) leaves assess identical to no settings at all
  const someEv = ev({
    pooledRR: 0.78, ciExcludesNull: true, participants: 500000, heterogeneity: "low",
    outcomeType: "hard", doseResponse: "graded", rctLevel: "outcomes",
    funding: "independent", pubBias: "tested-clean", confoundingRisk: "low",
  });
  assert.deepEqual(S.assess(someEv, null, S.PRESETS["default"].settings), S.assess(someEv));
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

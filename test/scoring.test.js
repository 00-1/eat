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

test("consistency maps heterogeneity (unknown defaults to mid)", () => {
  assert.equal(S.computeScores(ev({ heterogeneity: "low" })).consistency, 2);
  assert.equal(S.computeScores(ev({ heterogeneity: "moderate" })).consistency, 1);
  assert.equal(S.computeScores(ev({ heterogeneity: "high" })).consistency, 0);
  assert.equal(S.computeScores(ev({ heterogeneity: "unknown" })).consistency, 1);
  assert.equal(S.computeScores(ev({ heterogeneity: "garbage" })).consistency, 1);
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
    pooledRR: 0.5, participants: 1000000, heterogeneity: "low",
    outcomeType: "hard", doseResponse: "graded", rctLevel: "outcomes",
    funding: "independent", pubBias: "tested-clean", confoundingRisk: "low",
  });
  const a = S.assess(perfect);
  assert.equal(a.total, S.MAX);
  assert.equal(a.total, 16);
  assert.equal(a.tier, "high");
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

test("GUARDRAIL: a hard-to-no-observation poison can still be certain via a pathway", () => {
  // The user's case: demonstrable mechanistic poison, little/no cohort data.
  const poison = ev({
    pooledRR: 1.5, participants: 500, heterogeneity: "unknown",
    outcomeType: "surrogate", doseResponse: "none", rctLevel: "pathway",
    funding: "independent", pubBias: "untested", confoundingRisk: "low",
  });
  assert.equal(S.assess(poison).basis, "mechanism-led");
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

/*
 * Deterministic scoring engine.
 *
 * Scores are a PURE FUNCTION of recorded evidence facts — never hand-assigned.
 * Human judgement lives only in these rules (which facts matter and where the
 * thresholds sit), applied identically to every food. Change an input fact and
 * the score recomputes; change a rule here and every food re-scores.
 *
 * Each of eight dimensions yields 0–2; the total (max 16) maps to a certainty
 * tier. See METHODOLOGY.md.
 *
 * Works both in the browser (attaches `window.Scoring`) and in Node
 * (`module.exports`) so the same engine backs the app and the unit tests.
 *
 * `evidence` fields:
 *   pooledRR        number   representative pooled relative risk / hazard ratio
 *                            for the primary outcome (≈1.0 for a true null)
 *   ciExcludesNull  boolean  does the 95% interval exclude no-effect?
 *   participants    number   approx. total participants in the main evidence base
 *   heterogeneity   "low" | "moderate" | "high" | "unknown"
 *   outcomeType     "hard" | "surrogate" | "indirect"
 *   doseResponse    "graded" | "some" | "none"
 *   rctLevel        "outcomes" | "pattern" | "markers" | "mechanism" | "none"
 *   funding         "independent" | "mixed" | "industry" | "unknown"
 *   pubBias         "tested-clean" | "suspected" | "untested"
 *   confoundingRisk "low" | "moderate" | "high"
 */
(function (global) {
  "use strict";

  var MAX = 16;
  var THRESHOLDS = { high: 13, moderate: 10, low: 7 }; // else very-low

  // Effect-size bands by |ln(RR)|: ±0.223 ≈ RR 0.80/1.25; ±0.105 ≈ RR 0.90/1.11.
  function scoreEffectSize(rr) {
    if (typeof rr !== "number" || rr <= 0) return 0;
    var m = Math.abs(Math.log(rr));
    if (m >= 0.223) return 2;
    if (m >= 0.105) return 1;
    return 0;
  }

  // Precision proxied by sample size (CI width tracks N).
  function scorePrecision(n) {
    if (typeof n !== "number") return 0;
    if (n >= 500000) return 2;
    if (n >= 100000) return 1;
    return 0;
  }

  function scoreConsistency(h) {
    return h === "low" ? 2 : h === "moderate" ? 1 : h === "high" ? 0 : 1; // unknown -> 1
  }

  function scoreDirectness(o) {
    return o === "hard" ? 2 : o === "surrogate" ? 1 : 0;
  }

  function scoreDoseResponse(d) {
    return d === "graded" ? 2 : d === "some" ? 1 : 0;
  }

  // Any experimental/mechanistic corroboration beyond pure observation.
  function scoreExperimental(r) {
    if (r === "outcomes") return 2;
    if (r === "pattern" || r === "markers" || r === "mechanism") return 1;
    return 0;
  }

  function scoreBiasFreedom(funding, pubBias) {
    return (funding === "independent" ? 1 : 0) + (pubBias === "tested-clean" ? 1 : 0);
  }

  function scoreQuality(confoundingRisk) {
    return confoundingRisk === "low" ? 2 : confoundingRisk === "moderate" ? 1 : 0;
  }

  // Compute all eight sub-scores from the recorded evidence facts.
  function computeScores(ev) {
    ev = ev || {};
    return {
      quality: scoreQuality(ev.confoundingRisk),
      consistency: scoreConsistency(ev.heterogeneity),
      precision: scorePrecision(ev.participants),
      directness: scoreDirectness(ev.outcomeType),
      effectSize: scoreEffectSize(ev.pooledRR),
      doseResponse: scoreDoseResponse(ev.doseResponse),
      biasFreedom: scoreBiasFreedom(ev.funding, ev.pubBias),
      experimental: scoreExperimental(ev.rctLevel),
    };
  }

  function totalScore(scores) {
    var t = 0;
    for (var k in scores) if (Object.prototype.hasOwnProperty.call(scores, k)) t += scores[k] || 0;
    return t;
  }

  function tierFromTotal(total) {
    return total >= THRESHOLDS.high
      ? "high"
      : total >= THRESHOLDS.moderate
      ? "moderate"
      : total >= THRESHOLDS.low
      ? "low"
      : "very-low";
  }

  // Convenience: evidence -> { scores, total, tier }.
  function assess(ev) {
    var scores = computeScores(ev);
    var total = totalScore(scores);
    return { scores: scores, total: total, tier: tierFromTotal(total) };
  }

  var api = {
    MAX: MAX,
    THRESHOLDS: THRESHOLDS,
    computeScores: computeScores,
    totalScore: totalScore,
    tierFromTotal: tierFromTotal,
    assess: assess,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.Scoring = api;
})(typeof window !== "undefined" ? window : globalThis);

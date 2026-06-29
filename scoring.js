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
 *                            for the primary outcome (≈1.0 for a true null).
 *                            CONVENTION: this is the RR at a REALISTIC habitual
 *                            high-vs-low intake contrast — what the food does in
 *                            the amounts people actually eat — NOT per arbitrary
 *                            small unit (e.g. not "per 2% of energy"). Per-tiny-
 *                            unit figures understate calorie-dense foods eaten in
 *                            quantity. (Mirrors the Burden-of-Proof "data-dense
 *                            15th–85th percentile" exposure range.)
 *   ciExcludesNull  boolean  does the 95% interval exclude no-effect?
 *   participants    number   approx. total participants in the main evidence base
 *   heterogeneity   "low" | "moderate" | "high" | "unknown"
 *   outcomeType     "hard" | "surrogate" | "indirect"
 *   doseResponse    "graded" | "some" | "none"
 *   rctLevel        "outcomes" | "pattern" | "markers" | "mechanism" | "none"
 *   funding         "independent" | "mixed" | "industry" | "unknown"
 *   pubBias         "tested-clean" | "suspected" | "untested"
 *   confoundingRisk "low" | "moderate" | "high"
 *   intakeBasis     string — the realistic high-vs-low intake the pooledRR refers
 *                   to (documentation/transparency; not used in scoring)
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

  // Experimental / causal corroboration beyond pure observation.
  //   outcomes  RCT on hard health outcomes               -> 2 (gold)
  //   pathway   trial on a VALIDATED causal pathway: the surrogate->outcome
  //             link is itself robust AND the food's effect on it is
  //             unambiguous and not offset (e.g. trans fat raising LDL while
  //             lowering HDL, with the LDL->CVD link established) -> 2
  //   pattern   RCT on a dietary pattern containing the food -> 1
  //   markers   trial on a surrogate with a weaker/offset outcome link -> 1
  //   mechanism mechanistic plausibility only             -> 1
  //   none                                                -> 0
  function scoreExperimental(r) {
    if (r === "outcomes" || r === "pathway") return 2;
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

  // Evidence basis: WHICH kind of evidence carries the verdict. Derived from the
  // same computed sub-scores, so it is reproducible (not a hand-written claim).
  //   observation = breadth/quality/consistency of direct outcome cohort data
  //   causal      = experimental / validated-pathway corroboration (or clean
  //                 confounding, which implies experimental backing)
  // This is also where the guiding principle lives: a verdict can be confident
  // via strong observation OR strong causal evidence; mechanism is a fallback,
  // never an override of good observational outcome data (the DIRECTION is taken
  // from the observed association, not invented from mechanism).
  function classifyBasis(scores) {
    var observationStrong =
      scores.consistency + scores.precision + scores.directness + scores.doseResponse >= 5;
    var causalStrong = scores.experimental >= 2 || scores.quality === 2;
    if (observationStrong && causalStrong) return "convergent";
    if (observationStrong) return "observation-led";
    if (causalStrong) return "mechanism-led";
    return "limited";
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

  // Impact magnitude — HOW MUCH the food moves the needle (separate from how
  // SURE we are). Derived from the recorded relative effect (pooledRR), with a
  // one-tier bump when the food acts on all-cause mortality (the broadest, most
  // consequential outcome). This is a relative-effect proxy; it does not capture
  // absolute population burden (which would need GBD-style attributable
  // fractions) — a documented limitation.
  //   |ln(RR)| >= 0.22 -> large   (RR <= ~0.80 or >= ~1.25)
  //            >= 0.10 -> moderate (RR <= ~0.90 or >= ~1.11)
  //            >  0.03 -> small
  //   else             -> minimal (a true null moves nothing)
  var MAGNITUDE_ORDER = { minimal: 0, small: 1, moderate: 2, large: 3 };
  function classifyMagnitude(ev, outcomes) {
    if (!ev || ev.ciExcludesNull === false) return "minimal"; // no claimed effect → moves nothing
    var rr = ev.pooledRR;
    if (typeof rr !== "number" || rr <= 0) return "minimal";
    var m = Math.abs(Math.log(rr));
    var tier = m >= 0.22 ? 3 : m >= 0.1 ? 2 : m > 0.03 ? 1 : 0;
    var broad =
      Array.isArray(outcomes) &&
      outcomes.some(function (o) { return /all-cause mortality/i.test(o); });
    if (broad && tier > 0 && tier < 3) tier += 1;
    return ["minimal", "small", "moderate", "large"][tier];
  }

  // Convenience: evidence -> { scores, total, tier, basis, magnitude? }.
  function assess(ev, outcomes) {
    var scores = computeScores(ev);
    var total = totalScore(scores);
    return {
      scores: scores,
      total: total,
      tier: tierFromTotal(total),
      basis: classifyBasis(scores),
      magnitude: classifyMagnitude(ev, outcomes),
    };
  }

  var BASIS_LABEL = {
    convergent: "Convergent",
    "observation-led": "Observation-led",
    "mechanism-led": "Mechanism/trial-led",
    limited: "Limited / contested",
  };
  var BASIS_NOTE = {
    convergent: "Cohort outcome data and causal/trial evidence agree.",
    "observation-led": "Carried by direct cohort outcome data.",
    "mechanism-led": "Rests on a validated causal pathway or trial, not large cohorts.",
    limited: "Neither cohort nor causal evidence is strong — held cautiously.",
  };

  // Standout classification, used for the Gold standard / Bin fodder shortlists
  // and the "on the cusp" marginal tiers. Qualifying = top tier on BOTH axes
  // (certainty high + magnitude large). Marginal = exactly one tier short on a
  // single axis (the two tier-ranks sum to 5), so you can see what would join if
  // a threshold eased a little.
  var CERTAINTY_ORDER = { high: 3, moderate: 2, low: 1, "very-low": 0 };
  function standout(effect, certainty, magnitude) {
    var c = CERTAINTY_ORDER[certainty];
    var m = MAGNITUDE_ORDER[magnitude];
    if (c == null || m == null) return null;
    if (effect !== "positive" && effect !== "negative") return null;
    var top = effect === "positive" ? "gold" : "bin";
    if (c === 3 && m === 3) return top;
    if (c + m === 5) return "marginal-" + top; // one notch short on one axis
    return null;
  }

  var MAGNITUDE_LABEL = {
    large: "Large effect",
    moderate: "Moderate effect",
    small: "Small effect",
    minimal: "Minimal effect",
  };

  var api = {
    MAX: MAX,
    THRESHOLDS: THRESHOLDS,
    computeScores: computeScores,
    totalScore: totalScore,
    tierFromTotal: tierFromTotal,
    classifyBasis: classifyBasis,
    classifyMagnitude: classifyMagnitude,
    standout: standout,
    CERTAINTY_ORDER: CERTAINTY_ORDER,
    assess: assess,
    BASIS_LABEL: BASIS_LABEL,
    BASIS_NOTE: BASIS_NOTE,
    MAGNITUDE_ORDER: MAGNITUDE_ORDER,
    MAGNITUDE_LABEL: MAGNITUDE_LABEL,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.Scoring = api;
})(typeof window !== "undefined" ? window : globalThis);

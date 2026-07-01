/*
 * Deterministic scoring engine.
 *
 * Scores are deterministic given the recorded inputs — they're computed, not
 * hand-assigned. (The determinism is real; the inputs themselves are recorded
 * judgements, many not yet source-verified — see the data-status note in the app.)
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
 *   directionallyConsistent  boolean (optional) — only consulted when
 *                            heterogeneity is "high": true if the cohorts disagree
 *                            on magnitude but agree on the DIRECTION of effect, which
 *                            earns partial consistency credit instead of 0.
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
  // (Only counts toward the tier for DIRECTIONAL verdicts — see assess().)
  function scoreEffectSize(ev) {
    var rr = ev && ev.pooledRR;
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

  // Consistency from heterogeneity. High statistical heterogeneity (I²) normally
  // scores 0 — BUT if the cohorts disagree only on the MAGNITUDE while all pointing
  // the same direction (`directionallyConsistent`), that is not the same failure as
  // genuine directional disagreement, so it earns partial credit (1). This keeps a
  // robust-but-heterogeneous finding (e.g. whole grains, I²=83% yet uniformly
  // protective) from being marked down like a truly conflicting one.
  // unknown / unreported / unrecognised -> 0 (absence of evidence isn't consistency).
  function scoreConsistency(h, directionallyConsistent) {
    if (h === "low") return 2;
    if (h === "moderate") return 1;
    if (h === "high") return directionallyConsistent ? 1 : 0;
    return 0;
  }

  function scoreDirectness(o) {
    return o === "hard" ? 2 : o === "surrogate" ? 1 : 0;
  }

  // Dose-response gradient (only counts toward the tier for DIRECTIONAL verdicts).
  function scoreDoseResponse(ev) {
    var d = ev && ev.doseResponse;
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
      consistency: scoreConsistency(ev.heterogeneity, ev.directionallyConsistent),
      precision: scorePrecision(ev.participants),
      directness: scoreDirectness(ev.outcomeType),
      effectSize: scoreEffectSize(ev),
      doseResponse: scoreDoseResponse(ev),
      biasFreedom: scoreBiasFreedom(ev.funding, ev.pubBias),
      experimental: scoreExperimental(ev.rctLevel),
    };
  }

  function totalScore(scores) {
    var t = 0;
    for (var k in scores) if (Object.prototype.hasOwnProperty.call(scores, k)) t += scores[k] || 0;
    return t;
  }

  // Which sub-scores count toward the certainty tier.
  // Directional verdicts use all eight. NEUTRAL verdicts (interval crosses null)
  // use only the six evidence-QUALITY dimensions — effect size and dose-response
  // measure the strength of an effect, which a null doesn't have, so counting them
  // would structurally cap a well-established neutral below High. This decouples
  // certainty (how sure) from magnitude (how big), consistent with the rest of the
  // model. (A null isn't *rewarded* for being null — it just isn't penalised; a
  // confident neutral still needs strong quality/consistency/precision.)
  var DIRECTIONAL_DIMS = ["quality", "consistency", "precision", "directness", "effectSize", "doseResponse", "biasFreedom", "experimental"];
  var NEUTRAL_DIMS = ["quality", "consistency", "precision", "directness", "biasFreedom", "experimental"];

  function sumDims(scores, dims) {
    var t = 0;
    for (var i = 0; i < dims.length; i++) t += scores[dims[i]] || 0;
    return t;
  }

  function tierFromRatio(total, max) {
    var r = max > 0 ? total / max : 0;
    return r >= 0.8 ? "high" : r >= 0.6 ? "moderate" : r >= 0.4 ? "low" : "very-low";
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

  // Kept for the directional /16 scale (back-compat; equivalent to tierFromRatio(total, 16)).
  function tierFromTotal(total) {
    return tierFromRatio(total, MAX);
  }

  // Impact magnitude — HOW MUCH the food moves the needle (separate from how
  // SURE we are). A pure relative-effect reading from the recorded pooledRR.
  //
  // NOTE (v0.41): the former one-tier "all-cause mortality bump" has been RETIRED.
  // It was a home-grown proxy for importance with no established analog, and it
  // over-fired (it alone put moderate-RR foods like coffee/fruit/veg on the
  // shortlist). "How much a food matters" at the population level is now the job of
  // the separate absolute-burden axis (ROADMAP §3b, GBD PAF-style); "how much it
  // helps if you eat a realistic amount" is handled by reading the dose curve at
  // high intake (ROADMAP §3a). Magnitude here is just the relative effect.
  //   |ln(RR)| >= 0.22 -> large   (RR <= ~0.80 or >= ~1.25)
  //            >= 0.10 -> moderate (RR <= ~0.90 or >= ~1.11)
  //            >  0.03 -> small
  //   else             -> minimal (a true null moves nothing)
  var MAGNITUDE_ORDER = { minimal: 0, small: 1, moderate: 2, large: 3 };
  function classifyMagnitude(ev) {
    if (!ev || ev.ciExcludesNull === false) return "minimal"; // no claimed effect → moves nothing
    var rr = ev.pooledRR;
    if (typeof rr !== "number" || rr <= 0) return "minimal";
    return magnitudeOfRR(rr);
  }

  // A food moves the needle as much as its STRONGEST outcome does — not just its
  // headline one. Given the headline evidence plus any per-outcome evidence, return
  // the largest magnitude band. This is why unprocessed red meat (neutral on
  // mortality, but negative on diabetes) still registers a real effect, and why a
  // food's shortlist impact reflects everything it does, not one summary line.
  //   entries: [{ ev, outcomes }]  — each an evidence object + its outcome name(s)
  function maxMagnitude(entries) {
    if (!Array.isArray(entries) || !entries.length) return "minimal";
    var best = "minimal";
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i] || {};
      var m = classifyMagnitude(e.ev, e.outcomes);
      if (MAGNITUDE_ORDER[m] > MAGNITUDE_ORDER[best]) best = m;
    }
    return best;
  }

  // Convenience: evidence -> { scores, total, max, tier, basis, magnitude, neutralScored }.
  // Tier is computed over the dimensions that apply to the verdict's kind.
  //
  // Optional `settings` runs a WHAT-IF under alternate criteria (for the explore
  // diff), without changing the data:
  //   settings.zero = [dimKeys]  -> force those scores to 0 but keep them in the
  //                                 denominator ("we have no such evidence")
  //   settings.only = [dimKeys]  -> judge ONLY on these dims (numerator AND max)
  // A verdict is DIRECTIONAL only if its interval excludes the null AND the effect
  // is more than trivially small. The floor (|ln RR| > 0.03, the same boundary
  // below which magnitude is "minimal") stops a statistically-significant-but-tiny
  // association from being scored as a real direction — e.g. butter's RR 1.0134
  // (CI 1.0003–1.0266) excludes null yet is a ~1% effect, so it stays neutral. This
  // makes the methodology's "trivially small effect → neutral" clause a rule, not a
  // per-food judgement.
  var DIRECTION_FLOOR = 0.03;
  function isDirectional(ev) {
    if (!ev || ev.ciExcludesNull !== true) return false;
    var rr = ev.pooledRR;
    if (typeof rr !== "number" || rr <= 0) return false;
    return Math.abs(Math.log(rr)) > DIRECTION_FLOOR;
  }

  // For a NEUTRAL verdict, which way does the (non-significant) point estimate tilt?
  // A food reads neutral either because its interval crosses no-effect OR because the
  // effect is below the directionality floor. Those are different situations:
  //   • estimate a non-trivial size (|ln RR| > floor) but not significant → it LEANS
  //     ("the data tilt this way, we just can't rule out null") → "positive"/"negative"
  //   • estimate within the floor (≈ RR 1.0) → genuinely nothing there → null (flat)
  // Reuses the SAME floor that separates directional from neutral, so a lean is
  // exactly "big enough to point somewhere, not solid enough to be a verdict". Returns
  // null for directional foods (they have a verdict, not a lean). Display-only — it
  // never changes the verdict, certainty, magnitude, or the shortlists.
  function leanOf(ev) {
    if (!ev || isDirectional(ev)) return null;
    var rr = ev.pooledRR;
    if (typeof rr !== "number" || rr <= 0) return null;
    if (Math.abs(Math.log(rr)) <= DIRECTION_FLOOR) return null; // negligible → flat
    return rr < 1 ? "positive" : "negative";
  }

  function assess(ev, outcomes, settings) {
    var scores = computeScores(ev);
    var neutral = !isDirectional(ev);
    var dims = neutral ? NEUTRAL_DIMS : DIRECTIONAL_DIMS;
    var zero = (settings && settings.zero) || [];
    var only = settings && settings.only;
    var total = 0, max = 0;
    for (var i = 0; i < dims.length; i++) {
      var d = dims[i];
      if (only && only.indexOf(d) === -1) continue; // restrict to subset (num+max)
      max += 2;
      total += zero.indexOf(d) !== -1 ? 0 : (scores[d] || 0);
    }
    return {
      scores: scores,
      total: total,
      max: max,
      tier: tierFromRatio(total, max),
      basis: classifyBasis(scores),
      magnitude: classifyMagnitude(ev, outcomes),
      neutralScored: neutral,
    };
  }

  // Named criteria presets for the explore/diff view. Each maps to a `lens` that
  // re-derives the whole VERDICT (direction + certainty), not just the tier.
  var PRESETS = {
    "default": { label: "Default (all evidence)", lens: "default" },
    "observational": {
      label: "Observational only",
      note: "Ignore trial & mechanistic corroboration — judge on cohort outcome data alone. (This is our normal preference, minus the corroboration bonus.)",
      lens: "observational",
    },
    "mechanism": {
      label: "Trials & mechanism only",
      note: "Throw out the cohort/observational data entirely and judge ONLY on trials + mechanism — the view of people who dismiss observational nutrition. Watch the foods cohorts exonerate get re-condemned, and the cohort-only winners become unprovable. (Each food's trial/mechanism direction is now grounded in recorded RCT/marker evidence with sources — see 'Under a different lens' on a food's card.)",
      lens: "experimental",
    },
  };

  // Re-derive the VERDICT (effect + certainty tier) under a single evidence lens.
  //   "default"      — observation sets direction; trials/mechanism corroborate (canonical).
  //   "observational"— observation sets direction; strip the experimental dimension
  //                    from certainty (what cohorts alone support).
  //   "experimental" — IGNORE observation: direction comes from what trials+mechanism
  //                    point to (`ev.experimentalDirection`); certainty from the
  //                    experimental dimension only. "none" → insufficient (no basis).
  // A directional verdict that collapses to very-low falls back to neutral (a
  // direction on near-nothing overclaims) — so a strict lens can deflate a verdict.
  function verdictUnderLens(ev, outcomes, lens) {
    if (!ev) return { effect: "insufficient", tier: null };
    if (lens === "experimental") {
      var dir = ev.experimentalDirection || "none";
      if (dir === "none") return { effect: "insufficient", tier: null };
      // No very-low→neutral fallback here: under a mechanism-only lens the whole
      // point is that mechanism SETS the direction (often at very-low certainty).
      // "Negative · very-low" is the honest rendering of "LDL says bad, weakly."
      var ae = assess(ev, outcomes, { only: ["experimental"] });
      return { effect: dir, tier: ae.tier };
    }
    // default / observational: observation sets direction
    var neutral = !isDirectional(ev);
    var eff2 = neutral ? "neutral" : ev.pooledRR < 1 ? "positive" : "negative";
    var a2 = assess(ev, outcomes, lens === "observational" ? { zero: ["experimental"] } : null);
    if (eff2 !== "neutral" && CERTAINTY_ORDER[a2.tier] === 0) eff2 = "neutral";
    return { effect: eff2, tier: a2.tier };
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

  // Standout classification, used for the Gold standard / Worst offenders shortlists
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

  // Dose-response SHAPE vocabulary — plain-language labels for how risk changes
  // across the range of normal intake. A single RR is one point on this curve; the
  // shape is the rest of the story (the dose makes the poison; diminishing returns;
  // a sweet spot; a true null). `dir` drives the colour of the rendered curve.
  var DOSE_SHAPE = {
    "monotonic-harm": { label: "Dose makes the poison", dir: "harm",
      note: "Risk rises across the whole range — no safe threshold; more is worse." },
    "monotonic-benefit": { label: "More is better (so far)", dir: "benefit",
      note: "Risk keeps falling across the studied range — no plateau seen yet." },
    "plateau-benefit": { label: "Diminishing returns", dir: "benefit",
      note: "Benefit rises then flattens — past the plateau, extra intake adds little." },
    "plateau-harm": { label: "Plateau (harm)", dir: "harm",
      note: "Harm rises then flattens at higher intake." },
    "threshold-harm": { label: "Safe up to a point", dir: "harm",
      note: "Little change at low intake, then risk climbs once a threshold is passed." },
    "threshold-benefit": { label: "Kicks in past a point", dir: "benefit",
      note: "Little change at low intake, then benefit appears above a threshold." },
    "j-u-curve": { label: "J / U-shaped", dir: "mixed",
      note: "A sweet spot — lowest risk at moderate intake, higher at the extremes." },
    "flat": { label: "No dose-response", dir: "neutral",
      note: "Risk barely moves across the range — consistent with a true null." },
  };

  // Classify the curve's shape from its recorded points — DERIVED, not hand-set, so
  // a curve can't be mislabelled. Returns a DOSE_SHAPE key, or null when there
  // aren't enough points to judge (need >=3 spanning a range). Uses |ln(RR)| with a
  // dead-zone so trivial wiggles read as flat rather than as a direction change.
  function classifyDoseShape(points) {
    if (!Array.isArray(points)) return null;
    var pts = points
      .filter(function (p) { return p && typeof p.x === "number" && typeof p.rr === "number" && p.rr > 0; })
      .slice()
      .sort(function (a, b) { return a.x - b.x; });
    if (pts.length < 3) return null;
    var DEAD = 0.04; // ~4% change in RR before a segment counts as moving
    var dirs = [];
    for (var i = 1; i < pts.length; i++) {
      var d = Math.log(pts[i].rr) - Math.log(pts[i - 1].rr);
      dirs.push(Math.abs(d) < DEAD ? 0 : d < 0 ? -1 : 1);
    }
    var anyDown = dirs.indexOf(-1) !== -1;
    var anyUp = dirs.indexOf(1) !== -1;
    if (!anyDown && !anyUp) return "flat";
    var nz = dirs.filter(function (d) { return d !== 0; });
    var changes = 0;
    for (var j = 1; j < nz.length; j++) if (nz[j] !== nz[j - 1]) changes++;
    if (changes >= 1) return "j-u-curve"; // a genuine reversal of direction
    // monotonic overall (no reversal). Distinguish a leading flat run (threshold:
    // little happens, then it moves) from a trailing flat run (plateau: it moves,
    // then levels off) from neither (steady monotonic).
    var sign = nz[0]; // +1 harm, -1 benefit
    if (dirs[0] === 0) return sign < 0 ? "threshold-benefit" : "threshold-harm";
    if (dirs[dirs.length - 1] === 0) return sign < 0 ? "plateau-benefit" : "plateau-harm";
    return sign < 0 ? "monotonic-benefit" : "monotonic-harm";
  }

  // ---- Dose-curve readings (best case / worst case / threshold) ----
  // The headline magnitude reads the pooled RR at a normal portion. The dose curve
  // holds the rest of the story: how much a food could help at its *optimal* intake,
  // or harm if you *really pile it on*, and the intake at which a harmful food first
  // turns harmful. These readings are derived purely from the recorded curve points
  // (reproducible + testable), so a food is only ever "conditionally" promoted by the
  // same rule applied to every food — never hand-picked.

  // Magnitude tier from a raw RR, WITHOUT the all-cause bump (the honest, dose-based
  // reading). Mirrors classifyMagnitude's cut-points on |ln RR|.
  function magnitudeOfRR(rr) {
    if (typeof rr !== "number" || rr <= 0) return "minimal";
    var m = Math.abs(Math.log(rr));
    var tier = m >= 0.22 ? 3 : m >= 0.1 ? 2 : m > 0.03 ? 1 : 0;
    return ["minimal", "small", "moderate", "large"][tier];
  }

  // Read named points off a dose curve. Returns null if there's no usable curve.
  //   nadir  — the most beneficial point (lowest RR): "best case at optimal intake"
  //   peak   — the most harmful point (highest RR): "worst case if you eat a lot"
  //   atStudiedEdge — true if that extreme sits at the top of the studied range
  //                   (curve still moving → tag "as far as studied", don't extrapolate)
  function curveReadings(doseCurve) {
    if (!doseCurve || !Array.isArray(doseCurve.points)) return null;
    var pts = doseCurve.points.filter(function (p) {
      return p && typeof p.x === "number" && typeof p.rr === "number" && p.rr > 0;
    });
    if (pts.length < 2) return null;
    var sorted = pts.slice().sort(function (a, b) { return a.x - b.x; });
    var nadir = sorted[0], peak = sorted[0];
    for (var i = 1; i < sorted.length; i++) {
      if (sorted[i].rr < nadir.rr) nadir = sorted[i];
      if (sorted[i].rr > peak.rr) peak = sorted[i];
    }
    var maxX = sorted[sorted.length - 1].x;
    // First intake at which the curve crosses into harm (|ln RR| past the floor, rr>1).
    var threshold = null;
    for (var j = 0; j < sorted.length; j++) {
      if (sorted[j].rr > 1 && Math.abs(Math.log(sorted[j].rr)) > 0.03) { threshold = sorted[j]; break; }
    }
    return {
      unit: doseCurve.unit || null,
      nadir: { x: nadir.x, rr: nadir.rr, atStudiedEdge: nadir.x === maxX },
      peak: { x: peak.x, rr: peak.rr, atStudiedEdge: peak.x === maxX },
      harmThreshold: threshold ? { x: threshold.x, rr: threshold.rr } : null,
    };
  }

  // Best-achievable (positive) / worst-case (negative) reading from the dose curve,
  // as a magnitude tier plus the intake it occurs at. Returns null with no curve.
  function doseExtremeReading(doseCurve, direction) {
    var r = curveReadings(doseCurve);
    if (!r) return null;
    var pick = direction === "negative" ? r.peak : r.nadir;
    return {
      rr: pick.rr,
      x: pick.x,
      unit: r.unit,
      atStudiedEdge: pick.atStudiedEdge,
      magnitude: magnitudeOfRR(pick.rr),
    };
  }

  // The "ascension dose": the smallest intake at which the food first reaches a
  // target magnitude tier (in its own direction) on its dose curve — i.e. the
  // amount you'd need to eat for it to earn that shortlist rung. This is what a
  // qualifier pill states ("~28 g/day", "above ~800 g/day"). Also returns the
  // curve shape so the UI can word it as a sweet-spot (plateau) vs "more helps"
  // (monotonic). Returns null if the curve never reaches the target tier.
  //   targetTier: "small" | "moderate" | "large" (default "large")
  function ascensionDose(doseCurve, direction, targetTier) {
    if (!doseCurve || !Array.isArray(doseCurve.points)) return null;
    var want = MAGNITUDE_ORDER[targetTier || "large"];
    if (want == null) return null;
    var pts = doseCurve.points.filter(function (p) {
      return p && typeof p.x === "number" && typeof p.rr === "number" && p.rr > 0;
    });
    if (pts.length < 2) return null;
    var sorted = pts.slice().sort(function (a, b) { return a.x - b.x; });
    var maxX = sorted[sorted.length - 1].x;
    for (var i = 0; i < sorted.length; i++) {
      var p = sorted[i];
      var beneficial = p.rr < 1, harmful = p.rr > 1;
      var matchesDir = direction === "negative" ? harmful : beneficial;
      if (matchesDir && MAGNITUDE_ORDER[magnitudeOfRR(p.rr)] >= want) {
        return {
          x: p.x,
          rr: p.rr,
          unit: doseCurve.unit || null,
          shape: classifyDoseShape(sorted),
          atStudiedEdge: p.x === maxX,
        };
      }
    }
    return null;
  }

  // The near-optimal BAND: the contiguous run of intakes (around the best point)
  // over which the effect holds its best magnitude tier — so "28 g" becomes the
  // honest "28–45 g" when higher intakes are barely different. Reproducible from the
  // curve. Returns {loX, hiX, bestRR, loRR, hiRR, tier, single, atStudiedEdge, unit}.
  function optimalBand(doseCurve, direction) {
    var r = curveReadings(doseCurve);
    if (!r) return null;
    var pts = doseCurve.points.filter(function (p) {
      return p && typeof p.x === "number" && typeof p.rr === "number" && p.rr > 0;
    }).sort(function (a, b) { return a.x - b.x; });
    var ext = direction === "negative" ? r.peak : r.nadir;
    var tier = magnitudeOfRR(ext.rr);
    var ei = -1;
    for (var k = 0; k < pts.length; k++) { if (pts[k].x === ext.x) { ei = k; break; } }
    if (ei === -1) return null;
    var inBand = function (p) {
      var dirOk = direction === "negative" ? p.rr > 1 : p.rr < 1;
      return dirOk && magnitudeOfRR(p.rr) === tier;
    };
    var lo = ei, hi = ei;
    while (lo - 1 >= 0 && inBand(pts[lo - 1])) lo--;
    while (hi + 1 < pts.length && inBand(pts[hi + 1])) hi++;
    return {
      unit: r.unit,
      loX: pts[lo].x, hiX: pts[hi].x,
      loRR: pts[lo].rr, hiRR: pts[hi].rr,
      bestRR: ext.rr, bestX: ext.x,
      tier: tier,
      single: lo === hi,
      atStudiedEdge: pts[hi].x === pts[pts.length - 1].x,
    };
  }

  var api = {
    MAX: MAX,
    THRESHOLDS: THRESHOLDS,
    magnitudeOfRR: magnitudeOfRR,
    curveReadings: curveReadings,
    doseExtremeReading: doseExtremeReading,
    ascensionDose: ascensionDose,
    optimalBand: optimalBand,
    computeScores: computeScores,
    totalScore: totalScore,
    tierFromTotal: tierFromTotal,
    classifyBasis: classifyBasis,
    classifyMagnitude: classifyMagnitude,
    maxMagnitude: maxMagnitude,
    standout: standout,
    CERTAINTY_ORDER: CERTAINTY_ORDER,
    DIRECTIONAL_DIMS: DIRECTIONAL_DIMS,
    NEUTRAL_DIMS: NEUTRAL_DIMS,
    assess: assess,
    isDirectional: isDirectional,
    leanOf: leanOf,
    verdictUnderLens: verdictUnderLens,
    PRESETS: PRESETS,
    BASIS_LABEL: BASIS_LABEL,
    BASIS_NOTE: BASIS_NOTE,
    MAGNITUDE_ORDER: MAGNITUDE_ORDER,
    MAGNITUDE_LABEL: MAGNITUDE_LABEL,
    DOSE_SHAPE: DOSE_SHAPE,
    classifyDoseShape: classifyDoseShape,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.Scoring = api;
})(typeof window !== "undefined" ? window : globalThis);

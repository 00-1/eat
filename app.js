/* Diet Effects — rendering, filtering, expandable evidence, and challenges.
   Vanilla JS, no build step. */

(function () {
  "use strict";

  // ---- Elements ----
  const listEl = document.getElementById("list");
  const countEl = document.getElementById("count");
  const emptyEl = document.getElementById("empty");
  const searchEl = document.getElementById("search");
  const categoryEl = document.getElementById("category");
  const sortEl = document.getElementById("sort");
  const chips = Array.from(document.querySelectorAll(".chip"));
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const views = {
    foods: document.getElementById("view-foods"),
    approach: document.getElementById("view-approach"),
  };

  const state = { query: "", effect: "all", category: "all", sort: "default", preset: "default", pinned: [] };

  // ---- Constants ----
  const EFFECT_LABEL = { positive: "Positive", negative: "Negative", neutral: "Neutral / mixed" };
  const EFFECT_ORDER = { positive: 0, neutral: 1, negative: 2 };
  const CERTAINTY_RANK = { high: 4, moderate: 3, low: 2, "very-low": 1 };
  const CERTAINTY_LABEL = {
    high: "High certainty",
    moderate: "Moderate certainty",
    low: "Low certainty",
    "very-low": "Very low certainty",
  };

  // ---- Helpers ----
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function pubmedLink(study) {
    if (study.url) return study.url;
    return "https://pubmed.ncbi.nlm.nih.gov/?term=" + encodeURIComponent(study.search || study.citation);
  }

  // Compact evidence-basis chip (what kind of evidence carries the verdict).
  function basisChip(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    if (!a || !a.evidence || typeof Scoring === "undefined") return "";
    const basis = Scoring.classifyBasis(Scoring.computeScores(a.evidence));
    return (
      "<span class='basis basis-" + basis + "' title='" + escapeHtml(Scoring.BASIS_NOTE[basis]) + "'>" +
        escapeHtml(Scoring.BASIS_LABEL[basis]) +
      "</span>"
    );
  }

  // Canonical certainty, DERIVED live from the evidence (not read from storage).
  // (data.js still carries `certainty` as a regression snapshot the tests check.)
  function certaintyOf(food, settings) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    if (!a || !a.evidence || typeof Scoring === "undefined") return food.certainty;
    return Scoring.assess(a.evidence, food.outcomes, settings).tier;
  }

  // How much the food moves the needle (direction-agnostic magnitude), taken as the
  // MAX across all of its outcomes — the headline evidence plus any per-outcome
  // verdicts. A food's impact reflects the strongest thing it does, so red meat
  // (neutral on mortality, negative on diabetes) isn't buried as "minimal".
  function magnitudeOf(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    if (!a || !a.evidence || typeof Scoring === "undefined") return null;
    const entries = [{ ev: a.evidence, outcomes: food.outcomes }];
    (a.outcomeVerdicts || []).forEach(function (ov) {
      entries.push({ ev: ov.evidence, outcomes: [ov.outcome] });
    });
    return Scoring.maxMagnitude(entries);
  }
  function magnitudeChip(food) {
    const mag = magnitudeOf(food);
    if (!mag) return "";
    return "<span class='mag mag-" + mag + "' title='How much it moves the needle, across all its outcomes'>" + escapeHtml(Scoring.MAGNITUDE_LABEL[mag]) + "</span>";
  }
  // Absolute population burden — a SEPARATE axis (GBD attributable burden), shown only
  // where it's notable so the collapsed row isn't cluttered.
  function burdenChip(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    if (!a || !a.burden || typeof Scoring === "undefined") return "";
    const t = Scoring.burdenTier(a.burden.deathsM);
    if (t === "unquantified" || t === "low") return "";
    return "<span class='burden-chip burden-" + t + "' title='How much this matters at POPULATION scale (GBD attributable burden) — a different axis from the per-serving effect'>◍ " + escapeHtml(Scoring.BURDEN_LABEL[t].toLowerCase()) + " population impact</span>";
  }
  // Full "Population impact" block for the expanded card.
  function burdenHtml(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    if (!a || !a.burden || typeof Scoring === "undefined") return "";
    const b = a.burden, t = Scoring.burdenTier(b.deathsM);
    const bits = [];
    bits.push("GBD attributes <strong>" + escapeHtml(b.deaths) + "</strong> to <strong>" + escapeHtml(b.risk.toLowerCase()) + "</strong>" +
      (b.rank ? " — the #" + b.rank + " dietary risk worldwide" : "") + (b.dalysM ? " (~" + b.dalysM + " million DALYs/yr)" : "") + ".");
    if (b.tmrel) bits.push("Optimal intake ≈ " + escapeHtml(b.tmrel) + ".");
    if (b.sharedAcross) bits.push("Shared across <em>" + escapeHtml(b.sharedAcross) + "</em> — not this food alone.");
    if (b.separate) bits.push("Counted as a separate GBD risk, not one of the 15 dietary risks.");
    if (b.note) bits.push(escapeHtml(b.note));
    return (
      "<div class='burden'>" +
        "<h4 class='block-h'>Population impact <span class='block-sub'>— a separate axis: how much this matters at population scale, not per serving</span></h4>" +
        "<p class='burden-line'><span class='burden-chip burden-" + t + "'>◍ " + escapeHtml(Scoring.BURDEN_LABEL[t]) + "</span> " + bits.join(" ") + "</p>" +
        "<p class='burden-cite'>" + escapeHtml(b.source.cite) + " · estimated (GBD summary figures, not appendix-verified)</p>" +
      "</div>"
    );
  }

  // "Not all" caveat — shown for entries whose members genuinely diverge
  // (categoryUniformity === "mixed"), so a heterogeneous category is never read as
  // a blanket claim. Derived uniformly from the recorded field, never hand-picked.
  function isMixed(food) {
    return food && food.categoryUniformity === "mixed";
  }
  function uniformityChip(food) {
    if (!isMixed(food)) return "";
    const note = food.uniformityNote || "The verdict doesn't apply uniformly across this category — some members are much stronger than others.";
    return "<span class='notall' title='" + escapeHtml(note) + "'>◑ not all</span>";
  }
  // Within-category guidance for a "not all" food. When we've recorded a per-member
  // breakdown (`members`), show it in full — each member tagged good / likely / weaker
  // / worse / unknown — so "which ones actually?" is answered, and "concentrated
  // evidence" is never mistaken for "only this member works." Otherwise fall back to
  // the short one-line note.
  const MEMBER_TAG = {
    good: { label: "Good", cls: "m-good" },
    likely: { label: "Likely", cls: "m-likely" },
    weaker: { label: "Weaker", cls: "m-weaker" },
    worse: { label: "Worse", cls: "m-worse" },
    unknown: { label: "Unknown", cls: "m-unknown" },
  };
  function uniformityNoteHtml(food) {
    if (!isMixed(food)) return "";
    if (Array.isArray(food.members) && food.members.length) {
      const rows = food.members.map(function (m) {
        const t = MEMBER_TAG[m.tag] || MEMBER_TAG.unknown;
        return "<li class='member'><span class='m-tag " + t.cls + "'>" + escapeHtml(t.label) + "</span>" +
          "<span class='m-body'><strong>" + escapeHtml(m.name) + "</strong> — " + escapeHtml(m.note) + "</span></li>";
      }).join("");
      return (
        "<div class='members'>" +
          "<h4 class='block-h'><span class='notall'>◑ not all</span> Within this category <span class='block-sub'>— which members the verdict actually covers</span></h4>" +
          (food.memberIntro ? "<p class='member-intro'>" + escapeHtml(food.memberIntro) + "</p>" : "") +
          "<ul class='member-list'>" + rows + "</ul>" +
          "<p class='member-foot'>“Likely” means it shares the category's profile but hasn't been studied on its own — <em>concentrated evidence isn't the same as a member-specific effect</em>, so it doesn't mean worse.</p>" +
        "</div>"
      );
    }
    const note = food.uniformityNote || "The verdict doesn't apply uniformly across this category — some members are much stronger than others.";
    return (
      "<p class='notall-note'>" +
        "<span class='notall'>◑ not all</span> " +
        "<span><strong>Doesn't apply evenly across this category.</strong> " + escapeHtml(note) + "</span>" +
      "</p>"
    );
  }

  // Contested — credible high-quality sources genuinely DISAGREE on the direction
  // (distinct from low certainty, which is thin-but-consistent). Surfaced honestly
  // rather than silently picking a side: a badge on the card + a callout in detail.
  function contestedChip(food) {
    if (!food || !food.contested) return "";
    return "<span class='contested-chip' title='Credible sources disagree on the direction — see the card'>⚖ contested</span>";
  }
  function contestedNoteHtml(food) {
    if (!food || !food.contested) return "";
    return (
      "<div class='contested-note'>" +
        "<span class='contested-k'>⚖ Contested verdict</span> " +
        escapeHtml(food.contested) +
      "</div>"
    );
  }

  // A neutral verdict's tilt: shows which way a non-significant point estimate leans
  // (or nothing, when the estimate is genuinely flat). Derived by the engine, never
  // hand-set; it does not change the verdict — it just says more than "neutral".
  function leanFor(evidence) {
    if (typeof Scoring === "undefined" || !Scoring.leanOf || !evidence) return null;
    return Scoring.leanOf(evidence);
  }
  function leanChip(effect, evidence) {
    if (effect !== "neutral") return "";
    const lean = leanFor(evidence);
    if (!lean) return "";
    const arrow = lean === "positive" ? "↗" : "↘";
    const word = lean === "positive" ? "good" : "bad";
    return (
      " <span class='lean lean-" + lean + "' " +
      "title='The point estimate tilts this way, but the interval crosses no-effect — a non-significant lean, not a verdict.'>" +
      arrow + " lean " + word + "</span>"
    );
  }

  // ---- "As part of a food group" — the broader-class conclusion(s) ----
  // A food carries its own verdict PLUS the verdict(s) of the food group(s) it
  // belongs to, each scored live by the same engine. This is how tomatoes can read
  // "neutral on its own, but part of Vegetables (positive)" without either claim
  // swallowing the other.
  function groupConclusionsHtml(food) {
    if (typeof groupsFor !== "function" || typeof Scoring === "undefined") return "";
    const groups = groupsFor(food.id);
    if (!groups.length) return "";
    const items = groups
      .map(function (g) {
        const A = Scoring.assess(g.evidence, g.outcomes);
        const mag = Scoring.classifyMagnitude(g.evidence, g.outcomes);
        const magChip = mag && mag !== "minimal"
          ? "<span class='mag mag-" + mag + "'>" + escapeHtml(Scoring.MAGNITUDE_LABEL[mag]) + "</span>" : "";
        return (
          "<li class='group-item group-" + g.effect + "'>" +
            "<div class='group-head'>" +
              "<span class='group-name'>" + escapeHtml(g.name) + "</span>" +
              "<span class='badge " + g.effect + "'>" + EFFECT_LABEL[g.effect] + "</span>" +
              "<span class='tier " + A.tier + "'>" + CERTAINTY_LABEL[A.tier] + "</span>" +
              magChip +
            "</div>" +
            "<p class='group-rationale'>" + escapeHtml(g.rationale) + "</p>" +
            (g.reconcile ? "<p class='reconcile'>" + escapeHtml(g.reconcile) + "</p>" : "") +
          "</li>"
        );
      })
      .join("");
    return (
      "<h4 class='block-h'>As part of a food group <span class='block-sub'>— what's known about the broader class, scored the same way</span></h4>" +
      "<ul class='group-list'>" + items + "</ul>"
    );
  }

  // ---- Effects by outcome — the at-a-glance ledger ----
  // The good/bad summary collapses what a food actually does to DIFFERENT outcomes.
  // This ledger un-collapses it: one row per outcome the food touches, each with its
  // own direction + certainty, so "positive for X, neutral for Y, negative for Z" is
  // visible at a glance. Rows come from real scored entities only — a dedicated
  // per-outcome verdict (◆) where we have one, otherwise the overall verdict applied
  // to the outcomes it rests on. We do NOT invent per-outcome effect sizes we don't
  // have; unmarked rows are honestly flagged as sharing the overall direction.
  function outcomeLedgerHtml(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    if (!a || !a.evidence || typeof Scoring === "undefined") return "";
    const ovs = Array.isArray(a.outcomeVerdicts) ? a.outcomeVerdicts : [];
    const headOutcomes = Array.isArray(food.outcomes) ? food.outcomes : [];
    const headCert = certaintyOf(food);
    const headLean = food.effect === "neutral" ? leanFor(a.evidence) : null;
    const used = [];
    const matchOv = (name) =>
      ovs.find(function (o) {
        if (used.indexOf(o) !== -1) return false;
        const x = o.outcome.toLowerCase(), y = name.toLowerCase();
        return x === y || x.indexOf(y) === 0 || y.indexOf(x) === 0;
      });
    const rows = [];
    headOutcomes.forEach(function (oc) {
      const ov = matchOv(oc);
      if (ov) {
        used.push(ov);
        rows.push({ outcome: ov.outcome, effect: ov.effect, certainty: Scoring.assess(ov.evidence, [ov.outcome]).tier, dedicated: true });
      } else {
        rows.push({ outcome: oc, effect: food.effect, certainty: headCert, lean: headLean, dedicated: false });
      }
    });
    ovs.forEach(function (ov) {
      if (used.indexOf(ov) !== -1) return;
      rows.push({ outcome: ov.outcome, effect: ov.effect, certainty: Scoring.assess(ov.evidence, [ov.outcome]).tier, dedicated: true });
    });
    if (!rows.length) return "";
    const anyDedi = rows.some(function (r) { return r.dedicated; });
    const anyOverall = rows.some(function (r) { return !r.dedicated; });
    const items = rows
      .map(function (r) {
        const leanTxt = r.effect === "neutral" && r.lean
          ? " <span class='led-lean lean-" + r.lean + "'>lean " + (r.lean === "positive" ? "good" : "bad") + "</span>" : "";
        const mark = r.dedicated ? "<span class='led-mark' title='Has its own dedicated evidence'>◆</span>" : "";
        return (
          "<li class='led-row led-" + r.effect + "'>" +
            "<span class='led-outcome'>" + escapeHtml(r.outcome) + mark + "</span>" +
            "<span class='badge " + r.effect + "'>" + EFFECT_LABEL[r.effect] + "</span>" + leanTxt +
            "<span class='tier " + r.certainty + "'>" + CERTAINTY_LABEL[r.certainty] + "</span>" +
          "</li>"
        );
      })
      .join("");
    const legend = anyDedi && anyOverall
      ? "<p class='led-legend'>◆ has its own dedicated evidence; other rows share the overall verdict's direction.</p>"
      : anyDedi
        ? "<p class='led-legend'>◆ has its own dedicated evidence.</p>"
        : "<p class='led-legend'>These outcomes share the overall verdict's direction — per-outcome evidence isn't separated out yet (a research pass is queued).</p>";
    return (
      "<h4 class='block-h'>Effects by outcome <span class='block-sub'>— what it's been shown to affect, and which way</span></h4>" +
      "<ul class='ledger'>" + items + "</ul>" + legend
    );
  }

  // ---- By individual outcome (per-outcome verdicts) ----
  // A food can act differently on different outcomes (red meat ≈ neutral on
  // mortality but negative on diabetes; alcohol neutral on mortality but negative on
  // cancer). Each per-outcome verdict carries its own evidence (and optional dose
  // curve), scored live by the same engine — additive to the headline verdict.
  function outcomeVerdictsHtml(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    if (!a || !Array.isArray(a.outcomeVerdicts) || !a.outcomeVerdicts.length || typeof Scoring === "undefined") return "";
    const items = a.outcomeVerdicts
      .map(function (ov) {
        const A = Scoring.assess(ov.evidence, [ov.outcome]);
        const mag = Scoring.classifyMagnitude(ov.evidence, [ov.outcome]);
        const magChip = mag && mag !== "minimal"
          ? "<span class='mag mag-" + mag + "'>" + escapeHtml(Scoring.MAGNITUDE_LABEL[mag]) + "</span>" : "";
        const prov = ov.verified
          ? "<span class='prov prov-yes' title='Recorded facts checked against the source'>✓ source-verified</span>"
          : "<span class='prov prov-no' title='Figures are best-estimates, not yet source-checked'>facts estimated</span>";
        const curve = ov.doseCurve ? buildDoseSvg(ov.doseCurve) : "";
        return (
          "<li class='outcome-item outcome-" + ov.effect + "'>" +
            "<div class='group-head'>" +
              "<span class='group-name'>" + escapeHtml(ov.outcome) + "</span>" +
              "<span class='badge " + ov.effect + "'>" + EFFECT_LABEL[ov.effect] + "</span>" +
              "<span class='tier " + A.tier + "'>" + CERTAINTY_LABEL[A.tier] + "</span>" +
              magChip +
            "</div>" +
            (ov.rationale ? "<p class='group-rationale'>" + escapeHtml(ov.rationale) + "</p>" : "") +
            curve +
            "<p class='dr-src'>" + (ov.source ? escapeHtml(ov.source.cite) + " " : "") + prov + "</p>" +
          "</li>"
        );
      })
      .join("");
    return (
      "<h4 class='block-h'>By individual outcome <span class='block-sub'>— where this food acts differently on different outcomes</span></h4>" +
      "<ul class='group-list'>" + items + "</ul>"
    );
  }

  // ---- Dose-response curve (a single RR is one point on this line) ----
  // Small zero-dependency inline SVG. Green where the curve sits below the
  // no-effect line (benefit), red where above (harm); the normal-intake range is
  // shaded so you can see where typical consumers actually sit on the curve.
  function buildDoseSvg(curve) {
    const pts = (curve.points || [])
      .filter((p) => p && typeof p.x === "number" && typeof p.rr === "number" && p.rr > 0)
      .slice()
      .sort((a, b) => a.x - b.x);
    if (pts.length < 2) return "";
    const W = 320, H = 150, padL = 38, padR = 14, padT = 14, padB = 30;
    const xs = pts.map((p) => p.x);
    const rrs = [1.0];
    pts.forEach((p) => { rrs.push(p.rr); if (typeof p.lo === "number") rrs.push(p.lo); if (typeof p.hi === "number") rrs.push(p.hi); });
    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    let yMin = Math.min(...rrs), yMax = Math.max(...rrs);
    const yPad = (yMax - yMin) * 0.12 || 0.05; yMin -= yPad; yMax += yPad;
    const X = (x) => padL + (xMax > xMin ? (x - xMin) / (xMax - xMin) : 0) * (W - padL - padR);
    const Y = (r) => padT + (yMax > yMin ? (yMax - r) / (yMax - yMin) : 0.5) * (H - padT - padB);
    const dir = (Scoring.DOSE_SHAPE[curve.shape] || {}).dir || "neutral";
    const parts = [];
    if (Array.isArray(curve.normalRange)) {
      const nx0 = X(Math.max(curve.normalRange[0], xMin));
      const nx1 = X(Math.min(curve.normalRange[1], xMax));
      parts.push("<rect class='dr-normal' x='" + nx0.toFixed(1) + "' y='" + padT + "' width='" + Math.max(0, nx1 - nx0).toFixed(1) + "' height='" + (H - padT - padB) + "'/>");
    }
    const y1 = Y(1.0);
    parts.push("<line class='dr-base' x1='" + padL + "' y1='" + y1.toFixed(1) + "' x2='" + (W - padR) + "' y2='" + y1.toFixed(1) + "'/>");
    parts.push("<text class='dr-axis' x='" + (padL - 5) + "' y='" + (y1 + 3).toFixed(1) + "' text-anchor='end'>1.0</text>");
    // Label the y-scale endpoints so the curve's height is readable, not just its shape —
    // using the CENTRAL point estimates the line traces (not the CI whiskers), with faint
    // gridlines at those values.
    const centralRRs = [1.0].concat(pts.map((p) => p.rr));
    const dataMin = Math.min.apply(null, centralRRs), dataMax = Math.max.apply(null, centralRRs);
    const yTick = (rr) => {
      const yy = Y(rr);
      parts.push("<line class='dr-grid' x1='" + padL + "' y1='" + yy.toFixed(1) + "' x2='" + (W - padR) + "' y2='" + yy.toFixed(1) + "'/>");
      parts.push("<text class='dr-axis' x='" + (padL - 5) + "' y='" + (yy + 3).toFixed(1) + "' text-anchor='end'>" + rr.toFixed(2) + "</text>");
    };
    if (dataMax > 1.02) yTick(dataMax);
    if (dataMin < 0.98) yTick(dataMin);
    const d = pts.map((p, i) => (i ? "L" : "M") + X(p.x).toFixed(1) + " " + Y(p.rr).toFixed(1)).join(" ");
    parts.push("<path class='dr-line dr-" + dir + "' d='" + d + "'/>");
    pts.forEach((p) => {
      if (typeof p.lo === "number" && typeof p.hi === "number") {
        parts.push("<line class='dr-ci' x1='" + X(p.x).toFixed(1) + "' y1='" + Y(p.lo).toFixed(1) + "' x2='" + X(p.x).toFixed(1) + "' y2='" + Y(p.hi).toFixed(1) + "'/>");
      }
      const cls = p.rr > 1.001 ? "dr-pt dr-pt-harm" : p.rr < 0.999 ? "dr-pt dr-pt-benefit" : "dr-pt";
      parts.push("<circle class='" + cls + "' cx='" + X(p.x).toFixed(1) + "' cy='" + Y(p.rr).toFixed(1) + "' r='3.2'/>");
    });
    parts.push("<text class='dr-axis' x='" + padL + "' y='" + (H - 9) + "' text-anchor='start'>" + escapeHtml(String(xMin)) + "</text>");
    parts.push("<text class='dr-axis' x='" + (W - padR) + "' y='" + (H - 9) + "' text-anchor='end'>" + escapeHtml(String(xMax) + " " + (curve.unit || "")) + "</text>");
    parts.push("<text class='dr-axis dr-axis-y' x='" + (padL - 5) + "' y='" + (padT + 6) + "' text-anchor='end'>RR</text>");
    return "<svg class='dr-svg' viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Dose-response curve for " + escapeHtml(curve.outcome || "") + "'>" + parts.join("") + "</svg>";
  }

  // Honest placeholder shown when a food has no recorded dose-response curve — the
  // gap is surfaced, not hidden (a curve might exist but be un-fetched, or genuinely
  // not have been published). A dedicated dose-response research pass is queued.
  function doseResponsePlaceholder() {
    return (
      "<div class='dose dose-empty'>" +
        "<h4 class='block-h'>Dose-response <span class='block-sub'>— how risk changes across the range of intake</span></h4>" +
        "<p class='dr-none'>No dose-response curve recorded for this food yet — either no clean dose-response is " +
        "published for it, or our research pass hasn't fetched it. A known gap, " +
        "<strong>not</strong> a finding of “no relationship.”</p>" +
      "</div>"
    );
  }

  // Plain-language "what dose does what" readings pulled straight off the curve:
  // best case at optimal intake (positives), and where harm begins / worst case
  // (negatives). Values come from Scoring so they're reproducible, and the wording
  // reflects the shape (a plateau "sweet spot" vs "more keeps helping").
  function doseReadingsHtml(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    if (!a || !a.doseCurve || typeof Scoring === "undefined") return "";
    const c = a.doseCurve;
    const unit = c.unit ? " " + c.unit : "";
    const pct = (rr, harm) => Math.round((harm ? rr - 1 : 1 - rr) * 100);
    const magL = (m) => (Scoring.MAGNITUDE_LABEL[m] || m).toLowerCase();
    const rows = [];
    if (food.effect === "positive") {
      const band = Scoring.optimalBand(c, "positive");
      if (band && band.bestRR < 1) {
        const shape = c.shape || "";
        // dose label: a range when a band of intakes is near-best, else a single point
        const dose = band.single
          ? "~" + band.loX + unit
          : "~" + band.loX + "–" + band.hiX + unit;
        // benefit as a range across the band (min..max % lower risk)
        const p1 = pct(band.loRR, false), p2 = pct(band.hiRR, false);
        const lo = Math.min(p1, p2), hi = Math.max(p1, p2);
        const benefit = lo === hi ? "about " + hi + "% lower risk" : "about " + lo + "–" + hi + "% lower risk";
        const monotonic = /monotonic/.test(shape);
        // Is the top of the band the last studied point (data runs out) or a real
        // boundary where the next point drops below top-tier? We must not claim
        // "more adds little" when we simply have no data above.
        const edgeLimited = band.atStudiedEdge;
        const topStr = "~" + band.hiX + unit;
        const how = band.single
          ? (band.atStudiedEdge
              ? (monotonic ? "and more may help further, but " + topStr + " is the most studied"
                           : "the most studied intake — no data recorded above it")
              : /plateau|threshold/.test(shape)
                ? "the sweet spot — more than this adds little"
                : /j-u-curve/.test(shape)
                  ? "a sweet spot — beyond it the benefit fades"
                  : "above this the benefit slips below top-tier")
          : (edgeLimited
              ? (monotonic
                  ? "near-best across this range, and possibly higher — " + topStr + " is the most studied"
                  : "near-best across this range; not studied above " + topStr)
              : "near-best from the low end up to " + topStr + "; above that it slips below top-tier");
        rows.push(
          "<li class='dr-read dr-read-good'><span class='dr-read-k'>Best case</span> " +
          "<span class='dr-pill dr-pill-good'>" + escapeHtml(dose) + "</span> " +
          "→ " + benefit + " (" + magL(band.tier) + ") — " + how + "</li>"
        );
      }
    } else if (food.effect === "negative") {
      const r = Scoring.curveReadings(c);
      const worstX = r && r.peak ? r.peak.x : null;
      if (r && r.harmThreshold && r.harmThreshold.x !== worstX) {
        rows.push(
          "<li class='dr-read dr-read-bad'><span class='dr-read-k'>Harm appears</span> around " +
          "<span class='dr-pill dr-pill-bad'>~" + escapeHtml(String(r.harmThreshold.x)) + escapeHtml(unit) + "</span></li>"
        );
      }
      const worst = Scoring.doseExtremeReading(c, "negative");
      if (worst && worst.rr > 1) {
        rows.push(
          "<li class='dr-read dr-read-bad'><span class='dr-read-k'>Worst measured</span> " +
          "<span class='dr-pill dr-pill-bad'>~" + escapeHtml(String(worst.x)) + escapeHtml(unit) +
          (worst.atStudiedEdge ? " (as far as studied)" : "") + "</span> " +
          "→ about " + pct(worst.rr, true) + "% higher risk (" + magL(worst.magnitude) + ")</li>"
        );
      }
    }
    if (!rows.length) return "";
    return "<ul class='dr-readings'>" + rows.join("") + "</ul>";
  }

  function doseResponseHtml(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    if (!a || typeof Scoring === "undefined" || !Scoring.DOSE_SHAPE) return "";
    if (!a.doseCurve) return doseResponsePlaceholder();
    const c = a.doseCurve;
    const svg = buildDoseSvg(c);
    if (!svg) return doseResponsePlaceholder();
    const meta = Scoring.DOSE_SHAPE[c.shape] || {};
    const prov = c.verified
      ? "<span class='prov prov-yes' title='Curve checked against the source'>✓ source-verified</span>"
      : "<span class='prov prov-no' title='Representative published figures, not yet individually source-checked'>estimated</span>";
    return (
      "<div class='dose'>" +
        "<h4 class='block-h'>Dose-response <span class='block-sub'>— a single number is one point on this curve</span></h4>" +
        "<p class='dr-shape-line'><span class='dr-shape dr-" + (meta.dir || "neutral") + "'>" + escapeHtml(meta.label || c.shape) + "</span> " +
          "<span class='dr-shape-note'>" + escapeHtml(meta.note || "") + "</span></p>" +
        svg +
        doseReadingsHtml(food) +
        (c.note ? "<p class='dr-note'>" + escapeHtml(c.note) + "</p>" : "") +
        "<p class='dr-src'><span class='dr-src-out'>" + escapeHtml(c.outcome || "") + "</span>" +
          (c.source ? " · " + escapeHtml(c.source.cite) : "") + " " + prov + "</p>" +
      "</div>"
    );
  }

  // Compact group chip(s) for the collapsed meta row, so a food's group verdict is
  // visible at a glance (e.g. tomatoes shows "Vegetables: Positive" without opening).
  function groupChips(food) {
    if (typeof groupsFor !== "function" || typeof Scoring === "undefined") return "";
    return groupsFor(food.id)
      .map(function (g) {
        const tier = Scoring.assess(g.evidence, g.outcomes).tier;
        const shortName = String(g.name).split(" (")[0];
        return "<span class='group-chip group-chip-" + g.effect + "' title='As part of " +
          escapeHtml(g.name) + " — " + EFFECT_LABEL[g.effect] + ", " + CERTAINTY_LABEL[tier] + "'>⊕ " +
          escapeHtml(shortName) + ": " + EFFECT_LABEL[g.effect] + "</span>";
      })
      .join("");
  }

  // Compact shape chip for the collapsed card meta row (only when a curve exists).
  function doseChip(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    if (!a || !a.doseCurve || typeof Scoring === "undefined" || !Scoring.DOSE_SHAPE) return "";
    const meta = Scoring.DOSE_SHAPE[a.doseCurve.shape] || {};
    return "<span class='dr-chip dr-" + (meta.dir || "neutral") + "' title='Dose-response: " + escapeHtml(meta.note || "") + "'>↗ " + escapeHtml(meta.label || a.doseCurve.shape) + "</span>";
  }

  // Scores are COMPUTED from recorded evidence facts by the shared engine —
  // never read from the data file. (scoring.js exposes window.Scoring.)
  function assessmentHtml(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    if (!a || !a.evidence || typeof Scoring === "undefined") return "";
    const A = Scoring.assess(a.evidence, food.outcomes);
    const scores = A.scores;
    const basis = A.basis;
    const counting = A.neutralScored ? Scoring.NEUTRAL_DIMS : Scoring.DIRECTIONAL_DIMS;
    const rows = NUTRIGRADE_RUBRIC.dimensions
      .map(function (d) {
        const v = scores[d.key] || 0;
        const counts = counting.indexOf(d.key) !== -1;
        const cell = counts
          ? "<span class='score-pips' title='" + v + " / 2'>" +
              '<span class="pip ' + (v >= 1 ? "on" : "") + '"></span>' +
              '<span class="pip ' + (v >= 2 ? "on" : "") + '"></span>' +
            "</span>"
          : "<span class='score-na' title='not scored for a neutral verdict'>n/a</span>";
        return (
          "<div class='score-row" + (counts ? "" : " score-row-na") + "'>" +
            "<span class='score-label'>" + escapeHtml(d.label) + "</span>" + cell +
          "</div>"
        );
      })
      .join("");
    const neutralNote = A.neutralScored
      ? " <span class='rubric-sub'>— neutral verdict, scored on evidence quality</span>"
      : "";
    return (
      "<h4 class='block-h'>Evidence assessment <span class='rubric-note'>(computed, " + A.total + "/" + A.max + " → " + CERTAINTY_LABEL[A.tier] + ")</span>" + neutralNote + "</h4>" +
      "<p class='basis-line'><span class='basis basis-" + basis + "'>" + escapeHtml(Scoring.BASIS_LABEL[basis]) + "</span> " +
        "<span class='basis-note'>" + escapeHtml(Scoring.BASIS_NOTE[basis]) + "</span></p>" +
      "<p class='effect-line'><span class='effect-k'>Conservative estimate:</span> " + escapeHtml(a.effectEstimate) + "</p>" +
      (a.evidence.intakeBasis ? "<p class='effect-line intake-line'><span class='effect-k'>At intake:</span> " + escapeHtml(a.evidence.intakeBasis) + "</p>" : "") +
      "<div class='scores'>" + rows + "</div>"
    );
  }

  function populateCategories() {
    const cats = Array.from(new Set(FOODS.map((f) => f.category))).sort();
    for (const cat of cats) {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryEl.appendChild(opt);
    }
  }

  function matches(food) {
    if (state.effect !== "all" && food.effect !== state.effect) return false;
    if (state.category !== "all" && food.category !== state.category) return false;
    if (state.query) {
      const q = state.query.toLowerCase();
      const hay = (
        food.name + " " + (food.examples || "") + " " + food.category + " " + food.summary + " " +
        food.rationale + " " + (food.outcomes || []).join(" ") + " " +
        (food.studies || []).map((s) => s.citation + " " + s.finding).join(" ")
      ).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }

  function magRank(food) {
    if (typeof Scoring === "undefined") return 0;
    const mag = magnitudeOf(food);
    return (Scoring.MAGNITUDE_ORDER && Scoring.MAGNITUDE_ORDER[mag]) || 0;
  }

  function sortFoods(a, b) {
    if (state.sort === "alpha") return a.name.localeCompare(b.name);
    if (state.sort === "impact") {
      const m = magRank(b) - magRank(a);
      if (m !== 0) return m;
      const conf = (CERTAINTY_RANK[certaintyOf(b)] || 0) - (CERTAINTY_RANK[certaintyOf(a)] || 0);
      if (conf !== 0) return conf;
      return a.name.localeCompare(b.name);
    }
    // default: verdict (positive→neutral→negative) then certainty then name
    if (EFFECT_ORDER[a.effect] !== EFFECT_ORDER[b.effect]) {
      return EFFECT_ORDER[a.effect] - EFFECT_ORDER[b.effect];
    }
    const conf = (CERTAINTY_RANK[certaintyOf(b)] || 0) - (CERTAINTY_RANK[certaintyOf(a)] || 0);
    if (conf !== 0) return conf;
    return a.name.localeCompare(b.name);
  }

  // ---- Card sub-renderers ----
  function studiesHtml(food) {
    if (!food.studies || !food.studies.length) return "";
    const items = food.studies
      .map(function (s) {
        return (
          "<li class='study'>" +
            "<a class='study-cite' href='" + escapeHtml(pubmedLink(s)) + "' target='_blank' rel='noopener'>" +
              escapeHtml(s.citation) +
            "</a>" +
            "<span class='study-type'>" + escapeHtml(s.type) + "</span>" +
            "<span class='study-finding'>" + escapeHtml(s.finding) + "</span>" +
          "</li>"
        );
      })
      .join("");
    return "<h4 class='block-h'>Evidence this rests on</h4><ul class='studies'>" + items + "</ul>";
  }

  function considerationsHtml(food) {
    const c = food.considerations || {};
    const labels = {
      substitution: "What it replaces",
      confounding: "Confounding",
      doseResponse: "Dose-response",
      reverseCausation: "Reverse causation",
    };
    const rows = Object.keys(labels)
      .filter(function (k) { return c[k]; })
      .map(function (k) {
        return (
          "<div class='consid'><span class='consid-k'>" + labels[k] + "</span>" +
          "<span class='consid-v'>" + escapeHtml(c[k]) + "</span></div>"
        );
      })
      .join("");
    return rows ? "<h4 class='block-h'>Key caveats</h4><div class='consids'>" + rows + "</div>" : "";
  }

  function challengeHtml() {
    return "<span class='challenge-note'>Disagree? Verdicts are reviewed and revised — see “The approach.”</span>";
  }

  const SEVERITY_LABEL = { avoid: "Avoid", caution: "Caution", mitigate: "Minor" };

  function exceptionsHtml(food) {
    if (typeof EXCEPTIONS === "undefined") return "";
    const list = EXCEPTIONS[food.id];
    if (!list) return "";
    if (!list.length) {
      return (
        "<h4 class='block-h'>Who should be careful</h4>" +
        "<p class='exc-none'>No notable subgroup exceptions identified.</p>"
      );
    }
    const items = list
      .map(function (e) {
        const typeLabel = (typeof EXCEPTION_TYPE_LABEL !== "undefined" && EXCEPTION_TYPE_LABEL[e.type]) || e.type;
        const prev = e.prevalence || {};
        return (
          "<li class='exc exc-" + e.severity + "'>" +
            "<div class='exc-head'>" +
              "<span class='exc-group'>" + escapeHtml(e.group) + "</span>" +
              "<span class='sev sev-" + e.severity + "'>" + SEVERITY_LABEL[e.severity] + "</span>" +
            "</div>" +
            "<p class='exc-meta'><span class='exc-type'>" + escapeHtml(typeLabel) + "</span>" +
              (prev.estimate ? " · <span class='exc-prev'>" + escapeHtml(prev.estimate) +
                (prev.source ? " <span class='exc-src'>(" + escapeHtml(prev.source) + ")</span>" : "") +
              "</span>" : "") +
            "</p>" +
            (e.mitigation ? "<p class='exc-mit'><span class='counter-k'>Mitigation:</span> " + escapeHtml(e.mitigation) + "</p>" : "") +
          "</li>"
        );
      })
      .join("");
    return "<h4 class='block-h'>Who should be careful</h4><ul class='excs'>" + items + "</ul>";
  }

  // Component context: "what's in it" worries that the food's OUTCOME adjudicates —
  // they never set the verdict (direction of inference is whole-food → verdict,
  // never component → food). This is where the matrix-not-molecule story lives.
  function componentsHtml(food) {
    if (!Array.isArray(food.components) || !food.components.length) return "";
    const items = food.components
      .map(function (c) {
        return (
          "<li class='component'>" +
            "<span class='comp-name'>" + escapeHtml(c.name) + "</span>" +
            (c.worry ? "<p class='comp-worry'><span class='counter-k'>The worry:</span> " + escapeHtml(c.worry) + "</p>" : "") +
            (c.resolution ? "<p class='comp-res'><span class='counter-k'>But the outcomes say:</span> " + escapeHtml(c.resolution) + "</p>" : "") +
          "</li>"
        );
      })
      .join("");
    return (
      "<h4 class='block-h'>What's in it <span class='block-sub'>— component worries, judged by the food's own outcomes (a component never sets the verdict)</span></h4>" +
      "<ul class='components'>" + items + "</ul>"
    );
  }

  const STANCE_LABEL = { holds: "Our verdict holds", partial: "Partly valid", valid: "Valid limitation", certainty: "Challenges our certainty" };

  function scopeLabelFor(claim) {
    if (!claim.shared || typeof TAG_LABEL === "undefined") return "";
    const labels = claim.scope.map(function (t) { return TAG_LABEL[t] || t; }).join(", ");
    return "<span class='ca-scope'>Category claim · " + escapeHtml(labels) + "</span>";
  }

  function counterArgsHtml(food) {
    const list = typeof counterArgumentsFor === "function"
      ? counterArgumentsFor(food.id)
      : (typeof COUNTER_ARGUMENTS !== "undefined" ? COUNTER_ARGUMENTS[food.id] || [] : []);
    if (!list.length) {
      // Show the gap rather than hide it (highlight-inadequacies policy).
      return (
        "<h4 class='block-h'>Steelmanning attempts</h4>" +
        "<p class='exc-none'>No popular counter-argument assessed yet for this food. " +
        "If there's a credible challenge to this verdict, it belongs here — this is a known gap.</p>"
      );
    }
    // For a category claim, ground it in THIS food's own verdict (we don't score
    // categories — we compare the claim to each member food's score).
    const verdictLine =
      "<p class='ca-ground'><span class='counter-k'>Our verdict for " + escapeHtml(food.name) + ":</span> " +
      EFFECT_LABEL[food.effect] + " · " + CERTAINTY_LABEL[certaintyOf(food)] + "</p>";
    const items = list
      .map(function (c) {
        return (
          "<li class='counter counter-" + c.stance + (c.shared ? " counter-shared" : "") + "'>" +
            "<div class='counter-head'>" +
              "<span class='counter-claim'>“" + escapeHtml(c.claim) + "”</span>" +
              "<span class='stance stance-" + c.stance + "'>" + STANCE_LABEL[c.stance] + "</span>" +
            "</div>" +
            scopeLabelFor(c) +
            "<p class='counter-who'>" + escapeHtml(c.proponents) + "</p>" +
            (c.shared ? verdictLine : "") +
            (c.evidenceCited ? "<p class='counter-eD'><span class='counter-k'>Cites:</span> " + escapeHtml(c.evidenceCited) + "</p>" : "") +
            "<p class='counter-assess'><span class='counter-k'>Our take:</span> " + escapeHtml(c.assessment) + "</p>" +
          "</li>"
        );
      })
      .join("");
    return (
      "<h4 class='block-h'>Steelmanning attempts <span class='block-sub'>— popular counter-arguments, put in their strongest form</span></h4>" +
      "<ul class='counters'>" + items + "</ul>"
    );
  }

  function revisionsHtml(food) {
    if (!food.revisions || !food.revisions.length) return "";
    const items = food.revisions
      .map(function (r) {
        return "<li><time>" + escapeHtml(r.date) + "</time> — " + escapeHtml(r.change) + "</li>";
      })
      .join("");
    return "<h4 class='block-h'>Revision log</h4><ul class='revisions'>" + items + "</ul>";
  }

  // ---- "Under a different lens" — wrestle observation vs trials/mechanism ----
  // Re-derives the food's verdict under three lenses (all evidence / observational only
  // / trials & mechanism only), flags whether they agree, and — where they diverge —
  // shows the grounded mechanism evidence and a reconciliation. Operationalises the
  // "mechanism corroborates, never overrides" guardrail, per food and challengeably.
  function verdictMini(v) {
    const VE = { positive: "Positive", negative: "Negative", neutral: "Neutral", insufficient: "Insufficient" };
    if (!v || v.effect === "insufficient" || !v.tier) {
      return "<span class='vchip vchip-insufficient'>Insufficient</span>";
    }
    return "<span class='vchip vchip-" + v.effect + "'>" + VE[v.effect] + "</span> " +
      "<span class='diff-tierlabel'>" + CERTAINTY_LABEL[v.tier].replace(" certainty", "") + "</span>";
  }
  function reconGeneric(flagcls, def) {
    if (flagcls === "agree") {
      return def.effect === "neutral"
        ? "Both lenses land neutral — no directional claim to reconcile."
        : "Cohort outcomes and trials/mechanism agree — convergent evidence, which is why we can hold this with more confidence.";
    }
    if (flagcls === "contradict") {
      return "The two lenses disagree on direction. Our guardrail prefers observed whole-food outcomes over an isolated marker/mechanism — but the tension is real and worth watching.";
    }
    const dd = def.effect === "positive" || def.effect === "negative";
    return dd
      ? "Cohort outcomes carry this verdict; trials/mechanism alone neither clearly confirm nor deny it, so a mechanism purist would be unconvinced."
      : "Trials/markers lean one way, but the cohort outcomes don't bear it out — we hold neutral rather than upgrade on mechanism alone.";
  }
  function lensSectionHtml(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    if (!a || !a.evidence || !a.mechanism || typeof Scoring === "undefined" || !Scoring.verdictUnderLens) return "";
    const ev = a.evidence, oc = food.outcomes || [];
    const def = Scoring.verdictUnderLens(ev, oc, "default");
    const obs = Scoring.verdictUnderLens(ev, oc, "observational");
    const exp = Scoring.verdictUnderLens(ev, oc, "experimental");
    const dir = function (v) { return v && (v.effect === "positive" || v.effect === "negative") ? v.effect : null; };
    const dd = dir(def), de = dir(exp);
    let flag, flagcls;
    if (dd && de && dd === de) { flag = "Lenses converge"; flagcls = "agree"; }
    else if (dd && de && dd !== de) { flag = "Lenses contradict"; flagcls = "contradict"; }
    else if (!dd && !de) { flag = "Lenses converge"; flagcls = "agree"; }
    else { flag = "In tension"; flagcls = "tension"; }
    const m = a.mechanism;
    const recon = m.note ? m.note : reconGeneric(flagcls, def);
    const src = m.source ? escapeHtml(m.source.cite) + (m.source.id ? " · " + escapeHtml(m.source.id) : "") : "";
    return (
      "<h4 class='block-h'>Under a different lens <span class='block-sub'>— does the verdict hold if you judge on only one kind of evidence?</span></h4>" +
      "<div class='lens-grid'>" +
        "<div class='lens-col'><span class='lens-k'>All evidence</span>" + verdictMini(def) + "</div>" +
        "<div class='lens-col'><span class='lens-k'>Observational only</span>" + verdictMini(obs) + "</div>" +
        "<div class='lens-col'><span class='lens-k'>Trials &amp; mechanism only</span>" + verdictMini(exp) + "</div>" +
      "</div>" +
      "<p class='lens-flag lens-" + flagcls + "'>" + flag + "</p>" +
      "<p class='lens-mech'><span class='counter-k'>What trials &amp; mechanism show:</span> " + escapeHtml(m.trial) +
        " <span class='lens-path'>" + escapeHtml(m.mechanism) + "</span>" +
        (src ? " <span class='dr-src'>" + src + "</span>" : "") + "</p>" +
      "<p class='lens-recon'><span class='counter-k'>Reconciliation:</span> " + escapeHtml(recon) + "</p>"
    );
  }

  function cardHtml(food, isPinned) {
    const eff = food.effect;
    const aEv = (typeof ASSESSMENTS !== "undefined" && ASSESSMENTS[food.id]) ? ASSESSMENTS[food.id].evidence : null;
    return (
      "<li class='card " + eff + (isPinned ? " card-pinned" : "") + "' data-food-card='" + escapeHtml(food.id) + "'>" +
        "<details" + (isPinned ? " open" : "") + ">" +
          "<summary>" +
            "<div class='card-top'>" +
              "<div>" +
                "<h3>" + escapeHtml(food.name) + "</h3>" +
                "<p class='cat'>" + escapeHtml(food.category) +
                  (food.examples ? " <span class='examples'>e.g. " + escapeHtml(food.examples) + "</span>" : "") +
                "</p>" +
              "</div>" +
              "<span class='badge " + eff + "'>" + EFFECT_LABEL[eff] + "</span>" +
              leanChip(eff, aEv) +
              (isPinned ? "<span class='pin-badge' title='Pinned for comparison — click to unpin'>📌</span>" : "") +
            "</div>" +
            "<p class='summary'>" + escapeHtml(food.summary) + "</p>" +
            "<div class='card-meta'>" +
              (function () { var t = certaintyOf(food); return "<span class='tier " + t + "'>" + CERTAINTY_LABEL[t] + "</span>"; })() +
              magnitudeChip(food) +
              burdenChip(food) +
              uniformityChip(food) +
              contestedChip(food) +
              doseChip(food) +
              groupChips(food) +
              basisChip(food) +
              verifiedChip(food) +
              ((food.outcomes || []).length
                ? "<span class='outcomes' title='The outcome(s) this verdict is about'>for " + escapeHtml(food.outcomes.join(" · ")) + "</span>"
                : "") +
              "<span class='expand-hint'>" + (isPinned ? "📌 Unpin ▴" : "Pin & compare ▾") + "</span>" +
            "</div>" +
          "</summary>" +
          "<div class='card-detail'>" +
            "<h4 class='block-h'>Why this verdict</h4>" +
            "<p class='rationale'>" + escapeHtml(food.rationale) + "</p>" +
            uniformityNoteHtml(food) +
            contestedNoteHtml(food) +
            outcomeLedgerHtml(food) +
            groupConclusionsHtml(food) +
            outcomeVerdictsHtml(food) +
            lensSectionHtml(food) +
            doseResponseHtml(food) +
            burdenHtml(food) +
            assessmentHtml(food) +
            studiesHtml(food) +
            considerationsHtml(food) +
            componentsHtml(food) +
            exceptionsHtml(food) +
            counterArgsHtml(food) +
            revisionsHtml(food) +
            "<div class='card-foot'>" +
              "<span class='foot-dates'>" +
                "<span class='reviewed'>Last reviewed " + escapeHtml(food.lastReviewed || "—") + "</span>" +
                (food.researchedOn
                  ? "<span class='reviewed researched' title='When this food last had a dedicated deep-research pass — its evidence is current as of this date'> · deep-researched " + escapeHtml(food.researchedOn) + "</span>"
                  : "<span class='reviewed researched researched-none' title='No dedicated research pass recorded yet'> · not yet deep-researched</span>") +
              "</span>" +
              challengeHtml(food) +
            "</div>" +
          "</div>" +
        "</details>" +
      "</li>"
    );
  }

  // ---- Render ----
  // ---- Pinning: expanding a food pins it to the FRONT of the grid (top row) ----
  // Pinned foods live in the normal grid, just ordered first and rendered expanded —
  // so opening one moves it to the top row (and we scroll to it) instead of expanding
  // in place. Up to MAX_PINNED; pinning a 4th bumps the oldest.
  const MAX_PINNED = 3;
  function isPinned(id) { return state.pinned.indexOf(id) !== -1; }
  function togglePin(id) {
    const i = state.pinned.indexOf(id);
    if (i !== -1) { state.pinned.splice(i, 1); render(); return; } // unpin (collapse)
    if (state.pinned.length >= MAX_PINNED) state.pinned.shift(); // bump the oldest
    state.pinned.push(id);
    render();
    scrollToPinned(id);
  }
  function scrollToPinned(id) {
    const el = listEl.querySelector("[data-food-card='" + id + "']");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function render() {
    // keep only still-existing pins
    state.pinned = state.pinned.filter(function (id) { return FOODS.some(function (f) { return f.id === id; }); });
    // Pinned foods come FIRST (in pin order, shown regardless of the active filter),
    // then everything matching the filter — one grid, pinned expanded at the top.
    const pinnedFoods = state.pinned
      .map(function (id) { return FOODS.find(function (f) { return f.id === id; }); })
      .filter(Boolean);
    const rest = FOODS.filter(function (f) { return matches(f) && !isPinned(f.id); }).sort(sortFoods);
    const ordered = pinnedFoods.concat(rest);
    listEl.innerHTML = ordered.map(function (f) { return cardHtml(f, isPinned(f.id)); }).join("");
    emptyEl.hidden = ordered.length !== 0;

    const total = FOODS.length;
    const filteredCount = FOODS.filter(matches).length;
    countEl.textContent =
      filteredCount === total
        ? "Showing all " + total + " foods"
        : "Showing " + filteredCount + " of " + total + " foods";
    layoutMasonry();
  }

  // ---- Masonry packing (keeps DOM order + pinning) ----
  // The grid reads row-major (pinned first, across the top). With uniform-height
  // collapsed cards that packs fine, but a tall expanded/pinned card leaves a gap
  // under the short cards beside it. We restore vertical "box stacking" WITHOUT
  // reordering: each card is given a grid-row span proportional to its own height,
  // so shorter cards pack up into the space beside a tall one. Order is untouched
  // (default sparse row auto-flow), so pinning and sort order still hold.
  function layoutMasonry() {
    if (!listEl) return;
    const cs = getComputedStyle(listEl);
    if (cs.display !== "grid") return;
    const rowUnit = parseFloat(cs.gridAutoRows) || 8;
    const rowGap = parseFloat(cs.rowGap) || 0;
    const cards = listEl.children;
    // Measure with spans reset so each card reports its natural content height.
    for (let i = 0; i < cards.length; i++) cards[i].style.gridRowEnd = "";
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const inner = card.firstElementChild || card; // the <details>, unclipped by the card's overflow
      const h = inner.getBoundingClientRect().height;
      if (!h) continue;
      const span = Math.max(1, Math.ceil((h + rowGap) / (rowUnit + rowGap)));
      card.style.gridRowEnd = "span " + span;
    }
  }
  let _masonryRAF = 0;
  function scheduleMasonry() {
    if (_masonryRAF) cancelAnimationFrame(_masonryRAF);
    _masonryRAF = requestAnimationFrame(function () { _masonryRAF = 0; layoutMasonry(); });
  }
  window.addEventListener("resize", scheduleMasonry);
  // Fonts/late layout can change heights after first paint — re-pack once settled.
  window.addEventListener("load", scheduleMasonry);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleMasonry);

  // ---- Provenance: are a food's recorded facts source-verified yet? ----
  function isVerified(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    return !!(a && a.verified);
  }
  function verifiedChip(food) {
    return isVerified(food)
      ? "<span class='prov prov-yes' title='Recorded facts checked against the cited sources'>✓ source-verified</span>"
      : "<span class='prov prov-no' title='Figures are best-estimates from background knowledge, not yet individually checked against sources'>facts estimated</span>";
  }

  // Honest, always-visible status of how well-grounded the data is.
  function renderDataStatus() {
    const el = document.getElementById("data-status");
    if (!el) return;
    const total = FOODS.length;
    const verified = FOODS.filter(isVerified).length;
    const unverified = total - verified;
    el.innerHTML =
      "<strong>Data status:</strong> " + verified + " of " + total +
      " foods are <strong>source-verified</strong> — their score-driving figures checked against the " +
      "cited papers. The other " + unverified + " are still best-estimates from background knowledge, " +
      "not yet individually checked — treat those verdicts as <strong>provisional</strong> (look for the " +
      "“facts estimated” chip). The scoring method itself is tested and reproducible.";
  }

  // ---- Highlights: the sure, high-impact bets in each direction ----
  // Why a marginal food is short of qualifying (for the chip tooltip/label).
  function shortfall(food) {
    const bits = [];
    var cert = certaintyOf(food);
    if (cert !== "high") bits.push(CERTAINTY_LABEL[cert].toLowerCase());
    const mag = magnitudeOf(food);
    if (mag !== "large") bits.push((Scoring.MAGNITUDE_LABEL[mag] || mag).toLowerCase());
    return bits.join(", ");
  }

  // ---- Champion: the single ★ top pick per direction ----
  // Among the QUALIFYING (gold/bin) foods, crown the one with the largest headline
  // effect |ln(pooledRR)|, tie-broken by certainty then precision (participants).
  // Reproducible, not hand-picked. Restricted to specific/uniform entries — you
  // can't crown a "not all" (mixed) category as THE thing to do or drop.
  function lnRR(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    const rr = a && a.evidence && a.evidence.pooledRR;
    return typeof rr === "number" && rr > 0 ? Math.abs(Math.log(rr)) : 0;
  }
  function participantsOf(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    return (a && a.evidence && a.evidence.participants) || 0;
  }
  function championOf(foods) {
    const eligible = foods.filter((f) => !isMixed(f));
    if (!eligible.length) return null;
    return eligible.slice().sort((a, b) => {
      const d = lnRR(b) - lnRR(a);
      if (Math.abs(d) > 1e-9) return d;
      const c = (CERTAINTY_RANK[certaintyOf(b)] || 0) - (CERTAINTY_RANK[certaintyOf(a)] || 0);
      if (c !== 0) return c;
      return participantsOf(b) - participantsOf(a);
    })[0];
  }

  // Best-achievable magnitude at a high (dose-curve) intake — the basis for a
  // CONDITIONAL shortlist promotion ("gold if you eat plenty"). Null with no curve.
  function optimalMagnitudeOf(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    if (!a || !a.doseCurve || typeof Scoring === "undefined") return null;
    const d = Scoring.doseExtremeReading(a.doseCurve, food.effect);
    return d ? d.magnitude : null;
  }
  const STAND_RANK = { gold: 3, bin: 3, "marginal-gold": 2, "marginal-bin": 2 };
  // A food's shortlist standing. It qualifies at its NORMAL relative effect, or
  // CONDITIONALLY at a high intake read off its dose curve — but conditional
  // promotion requires the food to be source-verified (we don't crown foods whose
  // headline facts aren't checked, e.g. green tea, cruciferous). Returns the intake
  // (`at`) needed for a conditional promotion so the chip can say "if you eat plenty".
  function standoutOf(food) {
    const cert = certaintyOf(food);
    const normal = Scoring.standout(food.effect, cert, magnitudeOf(food));
    let tag = normal, conditional = false, at = null;
    if (isVerified(food)) {
      const om = optimalMagnitudeOf(food);
      const optimal = om ? Scoring.standout(food.effect, cert, om) : null;
      if ((STAND_RANK[optimal] || 0) > (STAND_RANK[normal] || 0)) {
        tag = optimal;
        conditional = true;
        const asc = Scoring.ascensionDose(ASSESSMENTS[food.id].doseCurve, food.effect, om);
        at = asc ? "~" + asc.x + (asc.unit ? " " + asc.unit : "") : null;
      }
    }
    return { tag: tag, conditional: conditional, at: at };
  }

  // Optimal amount to ADD, read off the dose curve: the near-optimal band (the range
  // where the effect is at its best tier). Null with no curve.
  function addBand(curve) {
    if (!curve || typeof Scoring === "undefined") return null;
    const b = Scoring.optimalBand(curve, "positive");
    if (!b || !(b.bestRR < 1)) return null;
    const u = curve.unit ? " " + curve.unit : "";
    return { text: b.single ? "~" + b.loX + u : "~" + b.loX + "–" + b.hiX + u };
  }
  function addQuantity(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    return a ? addBand(a.doseCurve) : null;
  }
  // Highest "safe" dose for a food to REDUCE, from a (harm-shaped) dose curve.
  //   monotonic-harm → { none: true } ("no safe level" — risk from the first serving)
  //   threshold-harm → "safe up to ~X" (the last point before harm begins)
  //   else → "harm from ~X" if a threshold is recorded, else null
  function safeQuantity(curve) {
    if (!curve || typeof Scoring === "undefined") return null;
    const u = curve.unit ? " " + curve.unit : "";
    if (/monotonic-harm/.test(curve.shape || "")) return { text: "no safe level", none: true };
    const r = Scoring.curveReadings(curve);
    if (/threshold-harm/.test(curve.shape || "") && r && r.harmThreshold) {
      return { text: "safe below ~" + r.harmThreshold.x + u };
    }
    if (r && r.harmThreshold) return { text: "harm from ~" + r.harmThreshold.x + u };
    return null;
  }
  const shortOutcome = (o) => String(o || "").replace(/\s*\(.*$/, "").toLowerCase();

  function renderHighlights() {
    const el = document.getElementById("highlights");
    if (!el || typeof Scoring === "undefined") return;
    const cls = {};
    FOODS.forEach(function (f) { cls[f.id] = standoutOf(f); });
    const outcomesOf = (f, eff) => ((ASSESSMENTS[f.id] || {}).outcomeVerdicts || []).filter((o) => o.effect === eff);

    // Tier a headline-directional food: 1 = surest+largest (unconditional top tier),
    // 2 = a notch short OR top-tier only at high intake, 3 = everything else the
    // evidence still supports (any certainty/magnitude, directional).
    const tierFor = (f, full) => {
      const s = cls[f.id];
      if (s.tag === full && !s.conditional) return 1;
      if (s.tag) return 2;
      return 3;
    };
    const champMarker = (dir) =>
      dir === "reduce"
        ? "<span class='hl-champ-mark' title='Largest harmful effect among the surest'>⚠ biggest harm</span> "
        : "<span class='hl-champ-mark' title='Largest beneficial effect among the surest'>★ top pick</span> ";

    // Build entries.
    //   ADD / REDUCE  = foods whose HEADLINE verdict is positive / negative (tiered).
    //   *Outcome-specific* = foods NEUTRAL overall but carrying a per-outcome verdict
    //   (red meat → diabetes, alcohol → cancer) — their own section, not lumped in with
    //   genuinely directional foods, since the food is fine on the whole.
    const addEntries = FOODS.filter((f) => f.effect === "positive").map((f) => ({
      f: f, dir: "add", tier: tierFor(f, "gold"), dose: addQuantity(f),
    }));
    const redEntries = FOODS.filter((f) => f.effect === "negative").map((f) => ({
      f: f, dir: "reduce", tier: tierFor(f, "bin"), dose: safeQuantity((ASSESSMENTS[f.id] || {}).doseCurve),
    }));
    const addOutcome = [], redOutcome = [];
    FOODS.filter((f) => f.effect === "neutral").forEach((f) => {
      outcomesOf(f, "negative").forEach((ov) => redOutcome.push({
        f: f, dir: "reduce", dose: safeQuantity(ov.doseCurve),
        forOutcome: shortOutcome(ov.outcome), neutralHeadline: true,
      }));
      outcomesOf(f, "positive").forEach((ov) => addOutcome.push({
        f: f, dir: "add", dose: addBand(ov.doseCurve),
        forOutcome: shortOutcome(ov.outcome), neutralHeadline: true,
      }));
    });

    // Champions: the largest-effect UNCONDITIONAL pick among the tier-1 foods.
    const goldChamp = championOf(addEntries.filter((e) => e.tier === 1).map((e) => e.f));
    const binChamp = championOf(redEntries.filter((e) => e.tier === 1).map((e) => e.f));
    addEntries.forEach((e) => { e.isChamp = goldChamp && e.f.id === goldChamp.id; });
    redEntries.forEach((e) => { e.isChamp = binChamp && e.f.id === binChamp.id; });

    const MO = Scoring.MAGNITUDE_ORDER, CO = { high: 3, moderate: 2, low: 1, "very-low": 0 };
    const rowHtml = (e) => {
      const f = e.f;
      const marker = e.isChamp ? champMarker(e.dir) : "";
      const notall = isMixed(f)
        ? " <span class='hl-notall' title='" + escapeHtml(f.uniformityNote || "Doesn't apply uniformly across the category") + "'>not all</span>"
        : "";
      const forO = e.forOutcome ? " <span class='hl-row-for'>for " + escapeHtml(e.forOutcome) + "</span>" : "";
      const dose = e.dose
        ? "<span class='hl-row-dose" + (e.dose.none ? " is-none" : "") + "'>" + escapeHtml(e.dose.text) + "</span>"
        : "<span class='hl-row-dose is-muted'>—</span>";
      // Pills (not-all, population impact) go on their OWN line under the name so they
      // never push the amount onto a new line; the name+amount top line stays clean.
      const tags = notall + burdenChip(f);
      return (
        "<button class='hl-row' data-food='" + escapeHtml(f.id) + "'>" +
          "<span class='hl-row-top'>" +
            "<span class='hl-row-name'>" + marker + escapeHtml(f.name) + forO + "</span>" +
            dose +
          "</span>" +
          (tags ? "<span class='hl-row-tags'>" + tags + "</span>" : "") +
        "</button>"
      );
    };
    const sortEntries = (arr) => arr.slice().sort((a, b) => {
      if (a.isChamp !== b.isChamp) return a.isChamp ? -1 : 1;
      const dm = (MO[magnitudeOf(b.f)] || 0) - (MO[magnitudeOf(a.f)] || 0);
      if (dm) return dm;
      const dc = (CO[certaintyOf(b.f)] || 0) - (CO[certaintyOf(a.f)] || 0);
      if (dc) return dc;
      return lnRR(b.f) - lnRR(a.f);
    });
    // Render a section from an explicit list of entries (already grouped by the caller).
    const sectionHtml = (rows, title, note) => {
      rows = sortEntries(rows);
      if (!rows.length) return "";
      return (
        "<div class='hl-sec'>" +
          "<p class='hl-sec-h'>" + escapeHtml(title) + " <span class='hl-sec-note'>— " + escapeHtml(note) + "</span></p>" +
          "<div class='hl-rows'>" + rows.map(rowHtml).join("") + "</div>" +
        "</div>"
      );
    };
    const tier = (entries, t) => entries.filter((e) => e.tier === t);

    // Neutral panel: foods with no net verdict AND no directional per-outcome verdict
    // (those live in the add/cut "neutral overall — but…" sections). Grouped by their
    // recorded `lean` into a good→neutral→bad gradient. The honest recommendation is
    // "eat to taste" — not "as much as you like" (calories/displacement still apply)
    // and not a health range (no basis) — carried in each section's subtitle.
    const neuLean = (f) => Scoring.leanOf((ASSESSMENTS[f.id] || {}).evidence);
    const neutralFoods = FOODS.filter(function (f) {
      return f.effect === "neutral" && !outcomesOf(f, "negative").length && !outcomesOf(f, "positive").length;
    });
    const neutralRow = (f) =>
      "<button class='hl-row' data-food='" + escapeHtml(f.id) + "'>" +
        "<span class='hl-row-top'><span class='hl-row-name'>" + escapeHtml(f.name) + "</span></span>" +
        (burdenChip(f) ? "<span class='hl-row-tags'>" + burdenChip(f) + "</span>" : "") +
      "</button>";
    const neutralSection = (list, title, note) => {
      if (!list.length) return "";
      const rows = list.slice().sort((a, b) => lnRR(b) - lnRR(a));
      return (
        "<div class='hl-sec'>" +
          "<p class='hl-sec-h'>" + escapeHtml(title) + " <span class='hl-sec-note'>— " + escapeHtml(note) + "</span></p>" +
          "<div class='hl-rows'>" + rows.map(neutralRow).join("") + "</div>" +
        "</div>"
      );
    };

    el.innerHTML =
      "<div class='hl-card hl-gold'>" +
        "<h2>Worth adding</h2>" +
        "<p class='hl-sub'>What the evidence supports adding to your diet — with the amount that earns the benefit.</p>" +
        sectionHtml(tier(addEntries, 1), "Surest, biggest benefit", "high certainty and a large effect") +
        sectionHtml(tier(addEntries, 2), "Strong", "a notch short on one axis, or large only at a higher intake") +
        sectionHtml(tier(addEntries, 3), "Also supported", "smaller or less certain, but the evidence points to benefit") +
        sectionHtml(addOutcome, "Neutral overall — but helps a specific outcome", "no net verdict, but a benefit shows up for one condition") +
      "</div>" +
      "<div class='hl-card hl-bin'>" +
        "<h2>Worth cutting down</h2>" +
        "<p class='hl-sub'>What the evidence supports reducing — with the highest safe amount, or where there's no safe level.</p>" +
        sectionHtml(tier(redEntries, 1), "Surest, biggest harm", "high certainty and a large effect") +
        sectionHtml(tier(redEntries, 2), "Strong reasons to cut down", "a notch short, or large only in quantity") +
        sectionHtml(tier(redEntries, 3), "Also worth reducing", "smaller or less certain, but the evidence points to harm") +
        sectionHtml(redOutcome, "Neutral overall — but worth limiting for one risk", "no net verdict, but linked to a specific harm") +
      "</div>" +
      "<div class='hl-card hl-neutral'>" +
        "<h2>Fine either way</h2>" +
        "<p class='hl-sub'>No clear health effect from adding these — eat them for taste, not for or against your health. (Normal amounts: neutral is measured at typical intakes, not unlimited.)</p>" +
        neutralSection(neutralFoods.filter((f) => neuLean(f) === "positive"), "Leans slightly beneficial", "a mild plus, but don't count on it") +
        neutralSection(neutralFoods.filter((f) => !neuLean(f)), "No clear effect", "eat to taste — no health reason to seek it out or avoid it") +
        neutralSection(neutralFoods.filter((f) => neuLean(f) === "negative"), "Leans slightly worse", "fine in normal amounts; easy on large or frequent servings") +
      "</div>" +
      "<p class='hl-burden-note'>" +
        "<strong>A different question — population impact.</strong> Some foods are modest per serving but huge in aggregate, because nearly everyone eats too little (or too much) of them. GBD's <strong>#1</strong> diet risk worldwide is <strong>too much sodium (salt)</strong> — not a single food here, but it rides in processed foods and bread. Just behind it: eating too little <strong>whole grains (#2)</strong>, <strong>fruit (#3)</strong>, <strong>nuts (#4)</strong> and <strong>vegetables (#5)</strong> — a different axis from the per-serving effect above, shown in each card's <em>Population impact</em> section." +
      "</p>";

    // Clicking a row jumps to that card and opens it.
    el.querySelectorAll(".hl-row").forEach(function (row) {
      row.addEventListener("click", function () {
        jumpToFood(row.dataset.food);
      });
    });
  }

  // ---- Explore: live what-if diff between canonical and alternate criteria ----
  // The published verdicts (the cards above) always reflect ALL the evidence.
  // This panel re-derives the certainty tier under a narrower rule and shows ONLY
  // what moves — making concrete that everything is reproducibly generated from
  // the same dataset (e.g. "observational only" weakens trans fat from High).
  function renderExplore() {
    const sel = document.getElementById("explore");
    const noteEl = document.getElementById("explore-note");
    const diffEl = document.getElementById("explore-diff");
    if (!sel || !diffEl || typeof Scoring === "undefined" || !Scoring.PRESETS) return;

    const presets = Scoring.PRESETS;
    const preset = presets[state.preset] || presets["default"];
    noteEl.textContent = preset && preset.note ? preset.note : "";

    if (!preset || preset.lens === "default") {
      diffEl.innerHTML =
        "<p class='explore-empty'>Pick an alternate lens above to see how the verdicts would change " +
        "if we judged the same data differently. The published verdicts don’t change.</p>";
      return;
    }

    // Compact renderers. Only the DIRECTION gets a coloured pill; certainty is
    // demoted to muted text so a row shows at most one colour change (two on a flip),
    // not four competing pills. The row's colour cue is the accent bar (after-effect).
    const VE = { positive: "Positive", negative: "Negative", neutral: "Neutral", insufficient: "Insufficient" };
    const effClass = function (eff) { return eff === "insufficient" || !eff ? "insufficient" : eff; };
    const effChip = function (eff) {
      return eff === "insufficient" || !eff
        ? "<span class='vchip vchip-insufficient' title='No trial/mechanism basis to judge'>Insufficient</span>"
        : "<span class='vchip vchip-" + eff + "'>" + VE[eff] + "</span>";
    };
    const tierText = function (t, cls) {
      if (!t) return "";
      return "<span class='diff-tierlabel " + (cls || "") + "'>" + CERTAINTY_LABEL[t].replace(" certainty", "") + "</span>";
    };

    // Compare each food's canonical verdict to its verdict under the chosen lens —
    // DIRECTION and certainty, both re-derived live.
    const rows = FOODS.map(function (food) {
      const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
      if (!a || !a.evidence) return null;
      const before = Scoring.verdictUnderLens(a.evidence, food.outcomes, "default");
      const after = Scoring.verdictUnderLens(a.evidence, food.outcomes, preset.lens);
      const dirChanged = before.effect !== after.effect;
      const tierChanged = before.tier !== after.tier;
      if (!dirChanged && !tierChanged) return null;
      return { food: food, before: before, after: after, dirChanged: dirChanged };
    }).filter(Boolean);

    // Direction changes first (most consequential), then certainty-only shifts.
    rows.sort(function (x, y) {
      if (x.dirChanged !== y.dirChanged) return x.dirChanged ? -1 : 1;
      return x.food.name.localeCompare(y.food.name);
    });

    if (!rows.length) {
      diffEl.innerHTML =
        "<p class='explore-empty'>No verdicts shift under this lens across all " + FOODS.length + " foods.</p>";
      return;
    }

    const renderRow = function (r) {
      const change = r.dirChanged
        ? effChip(r.before.effect) + tierText(r.before.tier) +
            "<span class='diff-arrow'>→</span>" +
            effChip(r.after.effect) + tierText(r.after.tier, "diff-after")
        : effChip(r.after.effect) + tierText(r.before.tier) +
            "<span class='diff-arrow'>→</span>" +
            tierText(r.after.tier, "diff-after");
      return (
        "<li class='diff-row eff-" + effClass(r.after.effect) + "' data-food='" + escapeHtml(r.food.id) + "'>" +
          "<button class='diff-jump' data-food='" + escapeHtml(r.food.id) + "'>" + escapeHtml(r.food.name) + "</button>" +
          "<span class='diff-change'>" + change + "</span>" +
        "</li>"
      );
    };
    const group = function (title, sub, list) {
      if (!list.length) return "";
      return (
        "<div class='diff-group'>" +
          "<p class='diff-group-h'>" + title + " <span class='diff-group-sub'>" + sub + "</span></p>" +
          "<ul class='diff-list'>" + list.map(renderRow).join("") + "</ul>" +
        "</div>"
      );
    };

    const flipRows = rows.filter(function (r) { return r.dirChanged; });
    const tierRows = rows.filter(function (r) { return !r.dirChanged; });
    const summary =
      "<p class='diff-summary'>" + rows.length + " of " + FOODS.length + " verdicts shift" +
      (flipRows.length ? " · <strong>" + flipRows.length + " change direction</strong>" : "") +
      " <span class='diff-summary-note'>(the published verdicts on the cards don’t change — this is a what-if)</span></p>";

    diffEl.innerHTML =
      summary +
      group("Changes the verdict", "— the direction flips under this lens", flipRows) +
      group("Only changes certainty", "— same direction, different confidence", tierRows);

    diffEl.querySelectorAll(".diff-jump").forEach(function (btn) {
      btn.addEventListener("click", function () {
        jumpToFood(btn.dataset.food);
      });
    });
  }

  // Clear filters, render, and open a food's card.
  function jumpToFood(id) {
    state.query = ""; state.effect = "all"; state.category = "all";
    searchEl.value = ""; categoryEl.value = "all";
    chips.forEach((c) => c.classList.toggle("is-active", c.dataset.effect === "all"));
    if (!isPinned(id)) {
      if (state.pinned.length >= MAX_PINNED) state.pinned.shift();
      state.pinned.push(id);
    }
    render();
    scrollToPinned(id);
  }

  // Clicking a card's summary pins it (or unpins if already pinned) instead of the
  // native in-place <details> toggle — so expanding always moves it to the top row.
  listEl.addEventListener("click", function (e) {
    const summary = e.target.closest ? e.target.closest("summary") : null;
    if (!summary || !listEl.contains(summary)) return;
    const card = summary.closest("[data-food-card]");
    if (!card) return;
    e.preventDefault(); // we control open state via state.pinned + render()
    togglePin(card.getAttribute("data-food-card"));
  });

  function populateExplore() {
    const sel = document.getElementById("explore");
    if (!sel || typeof Scoring === "undefined" || !Scoring.PRESETS) return;
    Object.keys(Scoring.PRESETS).forEach(function (key) {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = Scoring.PRESETS[key].label;
      sel.appendChild(opt);
    });
    sel.value = state.preset;
  }

  // ---- View switching ----
  function showView(name) {
    Object.keys(views).forEach(function (k) {
      views[k].hidden = k !== name;
    });
    tabs.forEach(function (t) {
      const active = t.dataset.view === name;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---- Events ----
  searchEl.addEventListener("input", function () {
    state.query = searchEl.value.trim();
    render();
  });
  categoryEl.addEventListener("change", function () {
    state.category = categoryEl.value;
    render();
  });
  sortEl.addEventListener("change", function () {
    state.sort = sortEl.value;
    render();
  });
  const exploreEl = document.getElementById("explore");
  if (exploreEl) {
    exploreEl.addEventListener("change", function () {
      state.preset = exploreEl.value;
      renderExplore();
    });
  }
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      state.effect = chip.dataset.effect;
      render();
    });
  });
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      showView(tab.dataset.view);
    });
  });
  document.querySelectorAll(".to-approach").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      showView("approach");
    });
  });

  // ---- Holding list: known foods we can't yet give a verdict for ----
  // Named honestly rather than turned into empty cards (which would imply we'd
  // assessed them). Part of "highlight inadequacies": show the gaps.
  function renderHolding() {
    const el = document.getElementById("holding");
    if (!el || typeof HOLDING_LIST === "undefined" || !HOLDING_LIST.length) return;
    const items = HOLDING_LIST.map(function (h) {
      const tag = h.reason === "thin"
        ? "<span class='hold-tag hold-thin' title='Some evidence exists, but it is thin or mixed'>thin evidence</span>"
        : "<span class='hold-tag hold-unres' title='We simply have not run the research pass yet'>not researched</span>";
      return (
        "<li class='hold-item'>" +
          "<span class='hold-name'>" + escapeHtml(h.name) + "</span>" + tag +
          (h.note ? "<span class='hold-note'>" + escapeHtml(h.note) + "</span>" : "") +
        "</li>"
      );
    }).join("");
    el.innerHTML =
      "<h2>Not yet assessed <span class='hold-sub'>— known foods we haven't given a verdict</span></h2>" +
      "<p class='hold-intro'>These come up often, but we don't yet have a real, sourced verdict for them — either the hard-outcome evidence is thin, or we simply haven't run the research pass. They're listed so their absence isn't mistaken for an oversight; each graduates to a full card only once there's something honest to say.</p>" +
      "<ul class='hold-list'>" + items + "</ul>";
  }

  // ---- Build stamp: which commit is live ----
  // Zero-build static site, so there's no compile step to inject a SHA. We show the
  // methodology version immediately, and fetch the latest main commit from the GitHub
  // API (what Pages serves) so you can see exactly which build you're looking at.
  // Degrades to "local" when offline / opened from file:// without network.
  function renderBuildStamp() {
    const mEl = document.getElementById("build-method");
    if (mEl) mEl.textContent = "v" + (typeof METHODOLOGY_VERSION !== "undefined" ? METHODOLOGY_VERSION : "?");
    const sEl = document.getElementById("build-sha");
    if (!sEl || typeof fetch !== "function") return;
    fetch("https://api.github.com/repos/00-1/eat/commits/main", { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (data) {
        const sha = data && data.sha ? String(data.sha).slice(0, 7) : null;
        if (!sha) { sEl.textContent = "unknown"; return; }
        sEl.textContent = sha;
        sEl.href = "https://github.com/00-1/eat/commit/" + data.sha;
        const when = data.commit && data.commit.author && data.commit.author.date;
        if (when) sEl.title = "Latest commit on main · " + when.slice(0, 10);
      })
      .catch(function () { sEl.textContent = "local"; sEl.removeAttribute("href"); });
  }

  // ---- Init ----
  document.getElementById("method-ver").textContent =
    "v" + (typeof METHODOLOGY_VERSION !== "undefined" ? METHODOLOGY_VERSION : "?");
  renderBuildStamp();
  renderHolding();
  populateCategories();
  populateExplore();
  renderDataStatus();
  renderHighlights();
  renderExplore();
  render();
})();

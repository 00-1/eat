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

  const state = { query: "", effect: "all", category: "all", sort: "default", preset: "default" };

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

  // How much the food moves the needle (direction-agnostic magnitude).
  function magnitudeOf(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    if (!a || !a.evidence || typeof Scoring === "undefined") return null;
    return Scoring.classifyMagnitude(a.evidence, food.outcomes);
  }
  function magnitudeChip(food) {
    const mag = magnitudeOf(food);
    if (!mag) return "";
    return "<span class='mag mag-" + mag + "' title='How much it moves the needle'>" + escapeHtml(Scoring.MAGNITUDE_LABEL[mag]) + "</span>";
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

  function doseResponseHtml(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    if (!a || !a.doseCurve || typeof Scoring === "undefined" || !Scoring.DOSE_SHAPE) return "";
    const c = a.doseCurve;
    const svg = buildDoseSvg(c);
    if (!svg) return "";
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
        (c.note ? "<p class='dr-note'>" + escapeHtml(c.note) + "</p>" : "") +
        "<p class='dr-src'><span class='dr-src-out'>" + escapeHtml(c.outcome || "") + "</span>" +
          (c.source ? " · " + escapeHtml(c.source.cite) : "") + " " + prov + "</p>" +
      "</div>"
    );
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
        food.name + " " + food.category + " " + food.summary + " " +
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

  const SEVERITY_LABEL = { avoid: "Avoid", caution: "Caution", mitigate: "Manageable" };

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

  const STANCE_LABEL = { holds: "Our verdict holds", partial: "Partly valid", valid: "Valid limitation" };

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

  function cardHtml(food) {
    const eff = food.effect;
    return (
      "<li class='card " + eff + "' data-food-card='" + escapeHtml(food.id) + "'>" +
        "<details>" +
          "<summary>" +
            "<div class='card-top'>" +
              "<div>" +
                "<h3>" + escapeHtml(food.name) + "</h3>" +
                "<p class='cat'>" + escapeHtml(food.category) + "</p>" +
              "</div>" +
              "<span class='badge " + eff + "'>" + EFFECT_LABEL[eff] + "</span>" +
            "</div>" +
            "<p class='summary'>" + escapeHtml(food.summary) + "</p>" +
            "<div class='card-meta'>" +
              (function () { var t = certaintyOf(food); return "<span class='tier " + t + "'>" + CERTAINTY_LABEL[t] + "</span>"; })() +
              magnitudeChip(food) +
              doseChip(food) +
              basisChip(food) +
              verifiedChip(food) +
              "<span class='outcomes'>" + escapeHtml((food.outcomes || []).join(" · ")) + "</span>" +
              "<span class='expand-hint'>Evidence ▾</span>" +
            "</div>" +
          "</summary>" +
          "<div class='card-detail'>" +
            "<h4 class='block-h'>Why this verdict</h4>" +
            "<p class='rationale'>" + escapeHtml(food.rationale) + "</p>" +
            doseResponseHtml(food) +
            assessmentHtml(food) +
            studiesHtml(food) +
            considerationsHtml(food) +
            exceptionsHtml(food) +
            counterArgsHtml(food) +
            revisionsHtml(food) +
            "<div class='card-foot'>" +
              "<span class='reviewed'>Last reviewed " + escapeHtml(food.lastReviewed || "—") + "</span>" +
              challengeHtml(food) +
            "</div>" +
          "</div>" +
        "</details>" +
      "</li>"
    );
  }

  // ---- Render ----
  function render() {
    const filtered = FOODS.filter(matches).sort(sortFoods);
    listEl.innerHTML = filtered.map(cardHtml).join("");
    emptyEl.hidden = filtered.length !== 0;

    const total = FOODS.length;
    countEl.textContent =
      filtered.length === total
        ? "Showing all " + total + " foods"
        : "Showing " + filtered.length + " of " + total + " foods";
  }

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
    el.innerHTML =
      "<strong>Data status:</strong> " + verified + " of " + total +
      " foods source-verified. The <em>method</em> is tested and reproducible, but most of the " +
      "underlying figures (relative risks, sample sizes, prevalences) are best-estimates from " +
      "background knowledge, not yet individually checked against the cited papers — so treat " +
      "verdicts as <strong>provisional</strong>. (Verification is the top item in the roadmap.)";
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

  function renderHighlights() {
    const el = document.getElementById("highlights");
    if (!el || typeof Scoring === "undefined") return;
    const tagOf = (f) => Scoring.standout(f.effect, certaintyOf(f), magnitudeOf(f));
    const pick = (tag) => FOODS.filter((f) => tagOf(f) === tag);
    const gold = pick("gold"), bin = pick("bin");
    const marginalGold = pick("marginal-gold"), marginalBin = pick("marginal-bin");

    const chipsHtml = (foods) =>
      foods.map((f) => "<button class='hl-chip' data-food='" + escapeHtml(f.id) + "'>" + escapeHtml(f.name) + "</button>").join("");
    const cuspChips = (foods) =>
      foods
        .map(
          (f) =>
            "<button class='hl-chip hl-cusp' data-food='" + escapeHtml(f.id) + "'>" +
              escapeHtml(f.name) +
              " <span class='hl-short'>(" + escapeHtml(shortfall(f)) + ")</span>" +
            "</button>"
        )
        .join("");
    const cusp = (foods) =>
      foods.length
        ? "<p class='hl-cusp-h'>On the cusp <span class='hl-cusp-note'>— one notch from qualifying</span></p>" +
          "<div class='hl-chips'>" + cuspChips(foods) + "</div>"
        : "";

    el.innerHTML =
      "<div class='hl-card hl-gold'>" +
        "<h2>★ Gold standard</h2>" +
        "<p class='hl-sub'>High certainty, large positive effect — the surest things to add.</p>" +
        "<div class='hl-chips'>" + (gold.length ? chipsHtml(gold) : "<span class='hl-empty'>none yet</span>") + "</div>" +
        cusp(marginalGold) +
      "</div>" +
      "<div class='hl-card hl-bin'>" +
        "<h2>✕ Bin fodder</h2>" +
        "<p class='hl-sub'>High certainty, large negative effect — the surest things to drop.</p>" +
        "<div class='hl-chips'>" + (bin.length ? chipsHtml(bin) : "<span class='hl-empty'>none yet</span>") + "</div>" +
        cusp(marginalBin) +
      "</div>";

    // Clicking a highlight chip jumps to that card and opens it.
    el.querySelectorAll(".hl-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        jumpToFood(chip.dataset.food);
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

    if (!preset || !preset.settings) {
      diffEl.innerHTML =
        "<p class='explore-empty'>Pick an alternate rule above to see which verdicts would shift " +
        "if we judged the same data differently. The published verdicts don’t change.</p>";
      return;
    }

    // Compare each food's canonical tier to its tier under the alternate rule.
    const rows = FOODS.map(function (food) {
      const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
      if (!a || !a.evidence) return null;
      const before = certaintyOf(food);
      const after = certaintyOf(food, preset.settings);
      if (before === after) return null;
      const dir = (CERTAINTY_RANK[after] || 0) - (CERTAINTY_RANK[before] || 0);
      return { food: food, before: before, after: after, dir: dir };
    }).filter(Boolean);

    rows.sort(function (x, y) {
      if (x.dir !== y.dir) return x.dir - y.dir; // biggest drops first
      return x.food.name.localeCompare(y.food.name);
    });

    if (!rows.length) {
      diffEl.innerHTML =
        "<p class='explore-empty'>No verdicts shift under this rule — the certainty tiers are " +
        "robust to it across all " + FOODS.length + " foods.</p>";
      return;
    }

    const items = rows
      .map(function (r) {
        const cls = r.dir < 0 ? "diff-down" : "diff-up";
        const arrow = r.dir < 0 ? "↓" : "↑";
        return (
          "<li class='diff-row " + cls + "' data-food='" + escapeHtml(r.food.id) + "'>" +
            "<button class='diff-jump' data-food='" + escapeHtml(r.food.id) + "'>" + escapeHtml(r.food.name) + "</button>" +
            "<span class='diff-change'>" +
              "<span class='tier " + r.before + "'>" + CERTAINTY_LABEL[r.before] + "</span>" +
              "<span class='diff-arrow'>" + arrow + "</span>" +
              "<span class='tier " + r.after + "'>" + CERTAINTY_LABEL[r.after] + "</span>" +
            "</span>" +
          "</li>"
        );
      })
      .join("");

    const drops = rows.filter(function (r) { return r.dir < 0; }).length;
    const ups = rows.length - drops;
    const summary =
      "<p class='diff-summary'>" + rows.length + " of " + FOODS.length + " verdicts shift" +
      (drops ? " · " + drops + " weaker" : "") + (ups ? " · " + ups + " stronger" : "") +
      " <span class='diff-summary-note'>(certainty only; published verdicts unchanged)</span></p>";

    diffEl.innerHTML = summary + "<ul class='diff-list'>" + items + "</ul>";

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
    render();
    const card = listEl.querySelector("[data-food-card='" + id + "']");
    if (card) {
      const details = card.querySelector("details");
      if (details) details.open = true;
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

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

  // ---- Init ----
  document.getElementById("method-ver").textContent =
    "v" + (typeof METHODOLOGY_VERSION !== "undefined" ? METHODOLOGY_VERSION : "?");
  populateCategories();
  populateExplore();
  renderDataStatus();
  renderHighlights();
  renderExplore();
  render();
})();

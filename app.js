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

  const state = { query: "", effect: "all", category: "all", sort: "default" };

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

  // Scores are COMPUTED from recorded evidence facts by the shared engine —
  // never read from the data file. (scoring.js exposes window.Scoring.)
  function assessmentHtml(food) {
    const a = typeof ASSESSMENTS !== "undefined" ? ASSESSMENTS[food.id] : null;
    if (!a || !a.evidence || typeof Scoring === "undefined") return "";
    const scores = Scoring.computeScores(a.evidence);
    const total = Scoring.totalScore(scores);
    const basis = Scoring.classifyBasis(scores);
    const max = Scoring.MAX;
    const rows = NUTRIGRADE_RUBRIC.dimensions
      .map(function (d) {
        const v = scores[d.key] || 0;
        const pips =
          '<span class="pip ' + (v >= 1 ? "on" : "") + '"></span>' +
          '<span class="pip ' + (v >= 2 ? "on" : "") + '"></span>';
        return (
          "<div class='score-row'>" +
            "<span class='score-label'>" + escapeHtml(d.label) + "</span>" +
            "<span class='score-pips' title='" + v + " / 2'>" + pips + "</span>" +
          "</div>"
        );
      })
      .join("");
    return (
      "<h4 class='block-h'>Evidence assessment <span class='rubric-note'>(computed, " + total + "/" + max + " → " + CERTAINTY_LABEL[Scoring.tierFromTotal(total)] + ")</span></h4>" +
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
      const conf = (CERTAINTY_RANK[b.certainty] || 0) - (CERTAINTY_RANK[a.certainty] || 0);
      if (conf !== 0) return conf;
      return a.name.localeCompare(b.name);
    }
    // default: verdict (positive→neutral→negative) then certainty then name
    if (EFFECT_ORDER[a.effect] !== EFFECT_ORDER[b.effect]) {
      return EFFECT_ORDER[a.effect] - EFFECT_ORDER[b.effect];
    }
    const conf = (CERTAINTY_RANK[b.certainty] || 0) - (CERTAINTY_RANK[a.certainty] || 0);
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

  function counterArgsHtml(food) {
    const list = typeof COUNTER_ARGUMENTS !== "undefined" ? COUNTER_ARGUMENTS[food.id] : null;
    if (!list || !list.length) return "";
    const items = list
      .map(function (c) {
        return (
          "<li class='counter counter-" + c.stance + "'>" +
            "<div class='counter-head'>" +
              "<span class='counter-claim'>“" + escapeHtml(c.claim) + "”</span>" +
              "<span class='stance stance-" + c.stance + "'>" + STANCE_LABEL[c.stance] + "</span>" +
            "</div>" +
            "<p class='counter-who'>" + escapeHtml(c.proponents) + "</p>" +
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
              "<span class='tier " + food.certainty + "'>" + CERTAINTY_LABEL[food.certainty] + "</span>" +
              magnitudeChip(food) +
              basisChip(food) +
              "<span class='outcomes'>" + escapeHtml((food.outcomes || []).join(" · ")) + "</span>" +
              "<span class='expand-hint'>Evidence ▾</span>" +
            "</div>" +
          "</summary>" +
          "<div class='card-detail'>" +
            "<h4 class='block-h'>Why this verdict</h4>" +
            "<p class='rationale'>" + escapeHtml(food.rationale) + "</p>" +
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

  // ---- Highlights: the sure, high-impact bets in each direction ----
  // Why a marginal food is short of qualifying (for the chip tooltip/label).
  function shortfall(food) {
    const bits = [];
    if (food.certainty !== "high") bits.push(CERTAINTY_LABEL[food.certainty].toLowerCase());
    const mag = magnitudeOf(food);
    if (mag !== "large") bits.push((Scoring.MAGNITUDE_LABEL[mag] || mag).toLowerCase());
    return bits.join(", ");
  }

  function renderHighlights() {
    const el = document.getElementById("highlights");
    if (!el || typeof Scoring === "undefined") return;
    const tagOf = (f) => Scoring.standout(f.effect, f.certainty, magnitudeOf(f));
    const pick = (tag) => FOODS.filter((f) => tagOf(f) === tag);
    const gold = pick("gold"), bin = pick("bin");
    const marginalGold = pick("marginal-gold"), marginalBin = pick("marginal-bin");

    const chips = (foods) =>
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
        "<div class='hl-chips'>" + (gold.length ? chips(gold) : "<span class='hl-empty'>none yet</span>") + "</div>" +
        cusp(marginalGold) +
      "</div>" +
      "<div class='hl-card hl-bin'>" +
        "<h2>✕ Bin fodder</h2>" +
        "<p class='hl-sub'>High certainty, large negative effect — the surest things to drop.</p>" +
        "<div class='hl-chips'>" + (bin.length ? chips(bin) : "<span class='hl-empty'>none yet</span>") + "</div>" +
        cusp(marginalBin) +
      "</div>";

    // Clicking a highlight chip jumps to that card and opens it.
    el.querySelectorAll(".hl-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        const id = chip.dataset.food;
        // clear filters so the target is visible
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
      });
    });
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
  renderHighlights();
  render();
})();

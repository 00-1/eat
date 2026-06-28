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
  const chips = Array.from(document.querySelectorAll(".chip"));
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const views = {
    foods: document.getElementById("view-foods"),
    approach: document.getElementById("view-approach"),
  };

  const state = { query: "", effect: "all", category: "all" };

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

  // Build a prefilled GitHub issue URL so anyone can challenge a verdict.
  function challengeUrl(food) {
    const title = "Challenge: " + food.name + " (" + EFFECT_LABEL[food.effect] + ")";
    const body = [
      "**Food:** " + food.name + " (`" + food.id + "`)",
      "**Current verdict:** " + EFFECT_LABEL[food.effect] + " — certainty: " + CERTAINTY_LABEL[food.certainty],
      "**Methodology version:** " + (typeof METHODOLOGY_VERSION !== "undefined" ? METHODOLOGY_VERSION : "?"),
      "",
      "### What I think is wrong",
      "(e.g. wrong direction, wrong certainty, missing caveat)",
      "",
      "### Evidence I'm relying on",
      "(link studies — ideally meta-analyses or large cohorts; note study design and effect size)",
      "",
      "### Which methodology point this touches",
      "(e.g. substitution, confounding, reverse causation, certainty tier)",
    ].join("\n");
    return (
      "https://github.com/" + REPO_SLUG + "/issues/new" +
      "?title=" + encodeURIComponent(title) +
      "&labels=" + encodeURIComponent("challenge") +
      "&body=" + encodeURIComponent(body)
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

  function sortFoods(a, b) {
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
      "<li class='card " + eff + "'>" +
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
              "<span class='outcomes'>" + escapeHtml((food.outcomes || []).join(" · ")) + "</span>" +
              "<span class='expand-hint'>Evidence ▾</span>" +
            "</div>" +
          "</summary>" +
          "<div class='card-detail'>" +
            "<h4 class='block-h'>Why this verdict</h4>" +
            "<p class='rationale'>" + escapeHtml(food.rationale) + "</p>" +
            studiesHtml(food) +
            considerationsHtml(food) +
            revisionsHtml(food) +
            "<div class='card-foot'>" +
              "<span class='reviewed'>Last reviewed " + escapeHtml(food.lastReviewed || "—") + "</span>" +
              "<a class='challenge' href='" + escapeHtml(challengeUrl(food)) + "' target='_blank' rel='noopener'>" +
                "Challenge this conclusion ↗" +
              "</a>" +
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
  render();
})();

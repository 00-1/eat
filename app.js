/* Diet Effects — rendering and filtering. Vanilla JS, no build step. */

(function () {
  "use strict";

  const listEl = document.getElementById("list");
  const countEl = document.getElementById("count");
  const emptyEl = document.getElementById("empty");
  const searchEl = document.getElementById("search");
  const categoryEl = document.getElementById("category");
  const chips = Array.from(document.querySelectorAll(".chip"));

  const state = { query: "", effect: "all", category: "all" };

  const CONF_LEVEL = { strong: 3, moderate: 2, limited: 1 };
  const EFFECT_LABEL = { positive: "Positive", negative: "Negative", neutral: "Neutral" };
  // Sort order: positive first, then neutral, then negative.
  const EFFECT_ORDER = { positive: 0, neutral: 1, negative: 2 };

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function confidenceDots(confidence) {
    const filled = CONF_LEVEL[confidence] || 0;
    let dots = "";
    for (let i = 0; i < 3; i++) {
      dots += i < filled ? "●" : '<span class="off">●</span>';
    }
    return dots;
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
      const hay = (food.name + " " + food.category + " " + food.note).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }

  function sortFoods(a, b) {
    if (EFFECT_ORDER[a.effect] !== EFFECT_ORDER[b.effect]) {
      return EFFECT_ORDER[a.effect] - EFFECT_ORDER[b.effect];
    }
    // Within an effect, stronger evidence first, then alphabetical.
    const conf = (CONF_LEVEL[b.confidence] || 0) - (CONF_LEVEL[a.confidence] || 0);
    if (conf !== 0) return conf;
    return a.name.localeCompare(b.name);
  }

  function cardHtml(food) {
    const eff = food.effect;
    return (
      '<li class="card ' + eff + '">' +
        '<div class="card-top">' +
          "<div>" +
            "<h3>" + escapeHtml(food.name) + "</h3>" +
            '<p class="cat">' + escapeHtml(food.category) + "</p>" +
          "</div>" +
          '<span class="badge ' + eff + '">' + EFFECT_LABEL[eff] + "</span>" +
        "</div>" +
        '<p class="note">' + escapeHtml(food.note) + "</p>" +
        '<div class="card-foot">' +
          "Evidence strength: " +
          '<span class="conf-dots" title="' + escapeHtml(food.confidence) + ' evidence">' +
            confidenceDots(food.confidence) +
          "</span>" +
        "</div>" +
      "</li>"
    );
  }

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

  // Events
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

  // Init
  populateCategories();
  render();
})();

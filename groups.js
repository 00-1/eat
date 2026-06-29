/*
 * Food GROUPS — evidence-bearing classes of whole foods.
 *
 * A single food often can't carry much evidence on its own, yet the GROUP it
 * belongs to does ("we don't know much about tomatoes specifically, but diets high
 * in vegetables are clearly healthier"). So a food shows TWO kinds of conclusion:
 * its own (in data.js) plus the verdict(s) of the food group(s) it belongs to,
 * here.
 *
 * Crucially these are GROUPS OF WHOLE FOODS PEOPLE EAT (vegetables, legumes, …) —
 * each with its OWN observed outcome evidence — NOT nutrient/component abstractions
 * (fibre, saturated fat). The direction of inference is whole-food/group → verdict,
 * never component → food (see METHODOLOGY: "mechanism corroborates, never
 * overrides"). Components are context, never a verdict.
 *
 * Each group is scored by the SAME engine as a food (`Scoring.assess`) from its own
 * recorded `evidence`, so its tier is derived live and reproducibly — nothing new
 * in the engine. `certainty` is a tested regression snapshot, never displayed.
 */
(function (global) {
  "use strict";

  var GROUPS = {
    "vegetables": {
      id: "vegetables",
      name: "Vegetables (overall intake)",
      kind: "food-group",
      effect: "positive",
      certainty: "moderate", // regression snapshot; computed live from evidence
      outcomes: ["All-cause mortality", "Cardiovascular disease"],
      summary: "Diets higher in vegetables are consistently associated with lower mortality and cardiovascular disease.",
      rationale:
        "The fruit-and-vegetable dose-response (Aune 2017, ~2M participants) shows lower CVD and all-cause mortality up to ~800 g/day. The direction is robust, but vegetable intake strongly marks an overall healthy lifestyle (high confounding), so certainty is Moderate, not High. This is a GROUP-level observation about eating vegetables — it does not establish that any single vegetable carries the effect on its own.",
      evidence: {
        pooledRR: 0.9, ciExcludesNull: true, participants: 2000000, heterogeneity: "moderate",
        outcomeType: "hard", doseResponse: "graded", rctLevel: "none", funding: "independent",
        pubBias: "tested-clean", confoundingRisk: "high",
        intakeBasis: "high vs low intake (benefit up to ~800 g/day fruit & veg)",
      },
      effectEstimate: "≈10% lower mortality/CVD at high vs low intake (RR ≈ 0.90), benefit to ~800 g/day; heavily confounded by healthy-user effects.",
      studies: [
        {
          citation: "Aune D, et al. International Journal of Epidemiology. 2017.",
          type: "Dose-response meta-analysis (~2 million participants)",
          finding: "Higher fruit & vegetable intake associated with lower CVD and all-cause mortality; benefit up to ~800 g/day.",
          search: "Aune fruit vegetable intake cardiovascular cancer mortality 2017",
        },
      ],
      verified: false,
    },
    "fermented-dairy": {
      id: "fermented-dairy",
      name: "Fermented dairy (yogurt, cheese, kefir)",
      kind: "food-group",
      effect: "neutral",
      certainty: "low", // regression snapshot; computed live
      outcomes: ["All-cause mortality", "Cardiovascular disease"],
      summary: "As a broad class, fermented dairy is roughly neutral — a small protective signal that is fragile and heterogeneous.",
      rationale:
        "A dose-response meta-analysis (Guo 2017, ~938k) finds total fermented dairy associated with ~2% lower mortality and CVD per 20 g/day (RR 0.98) — statistically significant but trivially small, with very high heterogeneity (I²≈87–94%) and attenuated after removing one Swedish cohort. The effect is below our directionality floor, so the group reads neutral; specific members vary (yogurt favourable for diabetes, cheese modestly for CVD).",
      evidence: {
        pooledRR: 0.98, ciExcludesNull: true, participants: 938465, heterogeneity: "high", directionallyConsistent: false,
        outcomeType: "hard", doseResponse: "some", rctLevel: "none", funding: "independent", pubBias: "untested",
        confoundingRisk: "high", intakeBasis: "per 20 g/day (dose-response)",
      },
      effectEstimate: "RR 0.98 (0.97–0.99) per 20 g/day for mortality and CVD (Guo 2017) — tiny, I²≈90%, fragile to one cohort → neutral by the directionality floor.",
      studies: [
        {
          citation: "Guo J, et al. European Journal of Epidemiology. 2017.",
          type: "Dose-response meta-analysis (29 cohorts, ~938,000)",
          finding: "Total fermented dairy ~2% lower mortality and CVD per 20 g/day (RR 0.98, 0.97–0.99); high heterogeneity, fragile.",
          search: "Guo fermented dairy mortality cardiovascular dose-response meta-analysis 2017",
        },
      ],
      verified: false,
    },
    "dairy": {
      id: "dairy",
      name: "Dairy (overall intake)",
      kind: "food-group",
      effect: "neutral",
      certainty: "low",
      outcomes: ["All-cause mortality", "Cardiovascular disease"],
      summary: "Total dairy is genuinely direction-dependent across populations — protective in global cohorts, null in Western ones — so the broad class reads neutral.",
      rationale:
        "PURE (Dehghan 2018) found high vs low dairy protective (mortality HR 0.83, CVD 0.78), but the Western-focused dose-response meta-analysis (Guo 2017) found total dairy NULL for mortality/CHD/CVD (RR 0.99). The inverse signal is driven by non-Western, low-baseline-intake populations and tracks affluence — so the conservative cross-population reading is neutral. Specific items diverge (cheese modestly favourable, butter ~neutral, milk neutral).",
      evidence: {
        pooledRR: 0.99, ciExcludesNull: false, participants: 938465, heterogeneity: "high",
        outcomeType: "hard", doseResponse: "some", rctLevel: "none", funding: "independent", pubBias: "untested",
        confoundingRisk: "high", intakeBasis: "per 200 g/day (Western dose-response); high-vs-low protective in PURE",
      },
      effectEstimate: "Null in Western cohorts (RR 0.99, 0.96–1.03 per 200 g/day; Guo 2017); protective high-vs-low in global PURE (0.83) — population-dependent → neutral.",
      studies: [
        {
          citation: "Dehghan M, et al. (PURE). Lancet. 2018.",
          type: "Global prospective cohort (~136,000, 21 countries)",
          finding: "High vs low dairy: lower mortality (HR 0.83) and major CVD (0.78) — driven by non-Western populations.",
          search: "Dehghan dairy mortality cardiovascular PURE Lancet 2018",
        },
        {
          citation: "Guo J, et al. European Journal of Epidemiology. 2017.",
          type: "Dose-response meta-analysis (Western-focused)",
          finding: "Total dairy/milk NULL for mortality, CHD, CVD (e.g. RR 0.99 per 200 g/day for mortality).",
          search: "Guo dairy milk mortality CHD CVD dose-response meta-analysis 2017",
        },
      ],
      verified: false,
    },
  };

  // food id -> [group id, …]. A food is mapped to a group only where it is genuinely
  // a member of that class of whole foods (starchy potatoes are deliberately NOT in
  // "vegetables" — the produce protective signal generally excludes them).
  var FOOD_GROUPS = {
    "tomatoes": ["vegetables"],
    "leafy-greens": ["vegetables"],
    "cruciferous": ["vegetables"],
    "yogurt": ["fermented-dairy", "dairy"],
    "cheese": ["fermented-dairy", "dairy"],
    "milk": ["dairy"],
    "butter": ["dairy"],
  };

  function groupsFor(foodId) {
    return (FOOD_GROUPS[foodId] || []).map(function (g) { return GROUPS[g]; }).filter(Boolean);
  }

  var api = { GROUPS: GROUPS, FOOD_GROUPS: FOOD_GROUPS, groupsFor: groupsFor };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else { global.GROUPS = GROUPS; global.FOOD_GROUPS = FOOD_GROUPS; global.groupsFor = groupsFor; }
})(typeof window !== "undefined" ? window : globalThis);

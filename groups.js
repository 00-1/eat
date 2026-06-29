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
  };

  // food id -> [group id, …]. A food is mapped to a group only where it is genuinely
  // a member of that class of whole foods (starchy potatoes are deliberately NOT in
  // "vegetables" — the produce protective signal generally excludes them).
  var FOOD_GROUPS = {
    "tomatoes": ["vegetables"],
    "leafy-greens": ["vegetables"],
    "cruciferous": ["vegetables"],
  };

  function groupsFor(foodId) {
    return (FOOD_GROUPS[foodId] || []).map(function (g) { return GROUPS[g]; }).filter(Boolean);
  }

  var api = { GROUPS: GROUPS, FOOD_GROUPS: FOOD_GROUPS, groupsFor: groupsFor };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else { global.GROUPS = GROUPS; global.FOOD_GROUPS = FOOD_GROUPS; global.groupsFor = groupsFor; }
})(typeof window !== "undefined" ? window : globalThis);

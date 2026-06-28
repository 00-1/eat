/*
 * Food effects dataset.
 *
 * Each entry reflects the GENERAL direction of association observed when a food
 * is regularly ADDED to a typical free-living diet, based on prospective cohort
 * studies and meta-analyses (e.g. Nurses' Health Study, Health Professionals
 * Follow-up Study, EPIC, PURE, and pooled analyses). These are population-level
 * ASSOCIATIONS for outcomes like all-cause mortality, cardiovascular disease,
 * and type 2 diabetes — not causal guarantees or individual medical advice.
 *
 * effect:      "positive" | "negative" | "neutral"
 * confidence:  "strong" | "moderate" | "limited"
 *   strong   = consistent across many large cohorts + meta-analyses
 *   moderate = generally consistent but with notable heterogeneity/debate
 *   limited  = fewer studies, mixed results, or short follow-up
 */

const FOODS = [
  // ---------- POSITIVE ----------
  {
    name: "Tree nuts (almonds, walnuts)",
    category: "Nuts & seeds",
    effect: "positive",
    confidence: "strong",
    note: "Eating a handful most days is linked to roughly 20% lower all-cause and cardiovascular mortality across large cohorts and pooled analyses, despite being calorie-dense. Associations hold after adjusting for overall diet quality.",
  },
  {
    name: "Legumes (beans, lentils, chickpeas)",
    category: "Legumes",
    effect: "positive",
    confidence: "strong",
    note: "Regular intake is associated with lower risk of heart disease and type 2 diabetes, and was among the strongest dietary predictors of longevity in cross-cultural cohort work. High in fiber and resistant starch.",
  },
  {
    name: "Whole grains (oats, barley, whole wheat)",
    category: "Grains",
    effect: "positive",
    confidence: "strong",
    note: "Dose-response cohort data show each additional serving is linked to lower mortality, heart disease, and diabetes risk — largely when displacing refined grains. Benefit is much weaker for refined-grain products.",
  },
  {
    name: "Leafy green vegetables",
    category: "Vegetables",
    effect: "positive",
    confidence: "strong",
    note: "Higher intake tracks with lower cardiovascular risk and slower cognitive decline in cohorts. Among the most consistently beneficial food groups, though some effect reflects healthier overall lifestyles.",
  },
  {
    name: "Cruciferous vegetables (broccoli, cabbage)",
    category: "Vegetables",
    effect: "positive",
    confidence: "moderate",
    note: "Associated with modestly lower cardiovascular and total mortality. Some cohort and mechanistic evidence suggests benefit for certain cancers, but causal certainty is limited.",
  },
  {
    name: "Berries",
    category: "Fruit",
    effect: "positive",
    confidence: "moderate",
    note: "Anthocyanin-rich berries are linked to lower risk of heart attack and better cardiometabolic markers in cohorts. Whole fruit, not juice, drives the signal.",
  },
  {
    name: "Whole fruit (apples, citrus, etc.)",
    category: "Fruit",
    effect: "positive",
    confidence: "strong",
    note: "Higher whole-fruit intake is consistently associated with lower mortality and diabetes risk. Fruit JUICE shows neutral-to-negative associations, so the form matters.",
  },
  {
    name: "Fatty fish (salmon, sardines, mackerel)",
    category: "Seafood",
    effect: "positive",
    confidence: "moderate",
    note: "One to two servings per week is associated with lower cardiac death across cohorts. The signal is strongest for oily fish; benefit beyond a couple servings flattens out.",
  },
  {
    name: "Extra-virgin olive oil",
    category: "Fats & oils",
    effect: "positive",
    confidence: "moderate",
    note: "A core component of Mediterranean-style diets; higher intake is linked to lower cardiovascular and total mortality in cohorts, especially when replacing butter or margarine.",
  },
  {
    name: "Yogurt & fermented dairy",
    category: "Dairy",
    effect: "positive",
    confidence: "moderate",
    note: "Regular yogurt intake is associated with modestly lower type 2 diabetes risk and better weight trajectories in cohorts — among the more favorable dairy forms.",
  },
  {
    name: "Coffee",
    category: "Beverages",
    effect: "positive",
    confidence: "moderate",
    note: "Habitual coffee (3–4 cups/day) is associated with lower all-cause mortality, type 2 diabetes, and liver disease across very large cohorts. Holds for caffeinated and decaf; loaded sugary versions are different.",
  },
  {
    name: "Green & black tea",
    category: "Beverages",
    effect: "positive",
    confidence: "limited",
    note: "Regular tea drinking shows modest associations with lower cardiovascular risk in cohorts, though confounding by lifestyle is hard to rule out.",
  },
  {
    name: "Avocado",
    category: "Fruit",
    effect: "positive",
    confidence: "limited",
    note: "Cohort data link regular avocado intake to lower cardiovascular risk, particularly when replacing butter, cheese, or processed meats. Evidence base is still relatively small.",
  },
  {
    name: "Extra fiber (from whole foods)",
    category: "Other",
    effect: "positive",
    confidence: "strong",
    note: "Across cohorts and trials, higher dietary fiber is one of the most robust predictors of lower mortality, heart disease, and diabetes. Whole-food sources outperform isolated supplements.",
  },
  {
    name: "Allium vegetables (garlic, onions)",
    category: "Vegetables",
    effect: "positive",
    confidence: "limited",
    note: "Higher allium intake shows modest inverse associations with some cancers and cardiovascular risk, but evidence is observational and prone to confounding.",
  },

  // ---------- NEGATIVE ----------
  {
    name: "Processed meats (bacon, sausage, deli)",
    category: "Meat",
    effect: "negative",
    confidence: "strong",
    note: "Among the most consistent harmful signals in nutrition epidemiology: each ~50g/day is linked to higher colorectal cancer, heart disease, and mortality risk across many large cohorts.",
  },
  {
    name: "Sugar-sweetened beverages (soda)",
    category: "Beverages",
    effect: "negative",
    confidence: "strong",
    note: "Regular intake is robustly associated with weight gain, type 2 diabetes, and cardiovascular disease in cohorts, with supporting trial evidence on metabolic markers.",
  },
  {
    name: "Trans fats / partially hydrogenated oils",
    category: "Fats & oils",
    effect: "negative",
    confidence: "strong",
    note: "Industrial trans fats raise heart disease risk more than any other fat per calorie — strong enough that many countries banned them. Now rare in the food supply but still appear in some products.",
  },
  {
    name: "Sugary foods & added sugar",
    category: "Sweets",
    effect: "negative",
    confidence: "moderate",
    note: "High added-sugar intake is associated with higher cardiovascular mortality and weight gain in cohorts, largely via excess calories and metabolic effects.",
  },
  {
    name: "Ultra-processed foods (general)",
    category: "Other",
    effect: "negative",
    confidence: "moderate",
    note: "Higher consumption is linked to greater mortality, obesity, and cardiometabolic disease across cohorts; one tightly controlled trial showed they drive overeating. The category is broad and heterogeneous.",
  },
  {
    name: "Deep-fried fast food",
    category: "Prepared foods",
    effect: "negative",
    confidence: "moderate",
    note: "Frequent fried-food intake is associated with higher heart disease and diabetes risk in cohorts, reflecting both cooking method and the overall dietary pattern it accompanies.",
  },
  {
    name: "Refined grains (white bread, pastries)",
    category: "Grains",
    effect: "negative",
    confidence: "moderate",
    note: "High refined-grain intake is linked to higher cardiovascular and diabetes risk, mainly when displacing whole grains. The harm is relative — context and what it replaces matter.",
  },
  {
    name: "Salty processed snacks (chips, crackers)",
    category: "Prepared foods",
    effect: "negative",
    confidence: "limited",
    note: "Tied to higher sodium intake and weight gain in cohorts. Most of the signal overlaps with the broader ultra-processed-food pattern rather than salt alone.",
  },

  // ---------- NEUTRAL / MIXED ----------
  {
    name: "Eggs",
    category: "Other",
    effect: "neutral",
    confidence: "moderate",
    note: "For most people, moderate intake (up to ~1/day) shows little association with cardiovascular risk in cohorts. Some studies find higher risk in people with diabetes, so the picture is mixed.",
  },
  {
    name: "Unprocessed red meat (beef, pork)",
    category: "Meat",
    effect: "neutral",
    confidence: "limited",
    note: "Associations are weaker and more debated than for processed meat. Some cohorts show modestly higher mortality/diabetes risk; the certainty of evidence is low and contested among researchers.",
  },
  {
    name: "Poultry (chicken, turkey)",
    category: "Meat",
    effect: "neutral",
    confidence: "moderate",
    note: "Generally neutral for cardiovascular outcomes in cohorts — neither clearly beneficial nor harmful, and often a 'better than red/processed meat' substitute.",
  },
  {
    name: "Milk (whole or low-fat)",
    category: "Dairy",
    effect: "neutral",
    confidence: "moderate",
    note: "Overall associations with mortality and heart disease are largely neutral in cohorts and the fat content matters less than once assumed. Effects vary by outcome.",
  },
  {
    name: "Cheese",
    category: "Dairy",
    effect: "neutral",
    confidence: "moderate",
    note: "Despite saturated fat and sodium, cohort and meta-analytic data show roughly neutral-to-slightly-favorable associations with heart disease — the 'dairy matrix' effect.",
  },
  {
    name: "Butter",
    category: "Fats & oils",
    effect: "neutral",
    confidence: "moderate",
    note: "Meta-analyses find butter only weakly associated with mortality and not clearly with heart disease. Outcomes depend heavily on what it replaces (worse than olive oil, better than trans fat).",
  },
  {
    name: "White potatoes (boiled/baked)",
    category: "Vegetables",
    effect: "neutral",
    confidence: "limited",
    note: "Non-fried potatoes show roughly neutral associations in most cohorts. French fries are a separate, less favorable story.",
  },
  {
    name: "White rice",
    category: "Grains",
    effect: "neutral",
    confidence: "limited",
    note: "Associations with diabetes are mixed and population-dependent (stronger in some Asian cohorts). Generally closer to neutral than clearly harmful, especially within a varied diet.",
  },
  {
    name: "Dark chocolate (moderate)",
    category: "Sweets",
    effect: "neutral",
    confidence: "limited",
    note: "Some cohorts link moderate cocoa-rich chocolate to lower cardiovascular risk, but added sugar and confounding muddy the signal. Best viewed as neutral rather than a health food.",
  },
  {
    name: "Moderate alcohol",
    category: "Beverages",
    effect: "neutral",
    confidence: "limited",
    note: "Older cohorts suggested a benefit, but newer analyses correcting for biases (e.g. 'sick quitters') point toward no safe protective level and net harm rising with intake. Increasingly viewed as not beneficial.",
  },
  {
    name: "Artificial sweeteners",
    category: "Other",
    effect: "neutral",
    confidence: "limited",
    note: "Evidence is genuinely mixed: some cohorts associate them with cardiometabolic risk (likely partly reverse causation), while substitution trials for sugary drinks show short-term benefit. Net effect uncertain.",
  },
  {
    name: "Coconut oil",
    category: "Fats & oils",
    effect: "neutral",
    confidence: "limited",
    note: "Raises LDL cholesterol like other saturated fats, but direct cohort outcome data are sparse. No strong evidence of special benefit or unusual harm — treat as a saturated fat.",
  },
];

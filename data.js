/*
 * Food effects dataset.
 *
 * Each entry reflects the GENERAL direction of association observed when a food
 * is regularly ADDED to a typical free-living diet, primarily from prospective
 * cohort studies and their meta-analyses, cross-checked against any randomized
 * trial and mechanistic evidence.
 *
 * These are population-level ASSOCIATIONS for outcomes like all-cause mortality,
 * cardiovascular disease, and type 2 diabetes — not causal guarantees and not
 * individual medical advice. See METHODOLOGY.md (and the "Approach" tab in the
 * app) for exactly how each label and certainty rating is derived, and how to
 * challenge a conclusion.
 *
 * Schema per food:
 *   id          stable slug (used for linking / challenges)
 *   name        display name
 *   category    food group
 *   effect      "positive" | "negative" | "neutral"
 *   certainty   "high" | "moderate" | "low" | "very-low"
 *                 (NutriGrade-aligned certainty tiers; see methodology)
 *   outcomes    health outcomes the verdict is mainly based on
 *   summary     one-line plain-language takeaway
 *   rationale   how the evidence maps to the label under our methodology
 *   considerations  the key methodological caveats for THIS food
 *                   (substitution, confounding, doseResponse — any may be omitted)
 *   studies     the actual evidence the verdict rests on. Each:
 *                 citation  first author, year, journal
 *                 type      study design
 *                 finding   faithful one-line result (with effect size where known)
 *                 search    PubMed search string (app builds a link from it)
 *                 url       optional explicit link (overrides PubMed search)
 *   lastReviewed  ISO date this entry was last assessed
 *   revisions     log of changes to the verdict over time
 */

const METHODOLOGY_VERSION = "0.3";

// Challenges are handled by the maintainer directly (verdicts are revised through
// review with AI-assisted research) — there is no public submission form.

const FOODS = [
  // ============================ POSITIVE ============================
  {
    id: "tree-nuts",
    name: "Tree nuts (almonds, walnuts)",
    category: "Nuts & seeds",
    effect: "positive",
    certainty: "moderate",
    outcomes: ["All-cause mortality", "Cardiovascular disease"],
    summary: "A daily handful is linked to meaningfully lower mortality and heart disease risk.",
    rationale:
      "Large dose-response meta-analyses of cohorts agree on direction and magnitude, and a major dietary trial (PREDIMED) found fewer cardiovascular events on a nut-supplemented diet — so causal support is stronger than for most foods. Not graded 'High' certainty because the trial tested a whole dietary pattern, not nuts alone.",
    considerations: {
      substitution: "Benefit is clearest when nuts replace refined snacks; they are calorie-dense, so 'added on top' may differ.",
      confounding: "Nut eaters tend to be more health-conscious; cohorts adjust for this but residual confounding remains.",
      doseResponse: "Risk reduction flattens above ~15–28 g/day — more is not proportionally better.",
    },
    studies: [
      {
        citation: "Aune D, et al. BMC Medicine. 2016.",
        type: "Dose-response meta-analysis of 20+ cohorts (~819,000 participants)",
        finding: "28 g/day of nuts associated with ~22% lower all-cause mortality and ~21% lower CVD mortality.",
        search: "Aune nut consumption cardiovascular all-cause mortality 2016 BMC Medicine",
      },
      {
        citation: "Bao Y, et al. New England Journal of Medicine. 2013.",
        type: "Two prospective cohorts (Nurses' Health Study + HPFS, ~119,000)",
        finding: "Daily nut consumers had ~20% lower mortality over up to 30 years of follow-up.",
        search: "Bao nut consumption total cause-specific mortality 2013 NEJM",
      },
      {
        citation: "Estruch R, et al. New England Journal of Medicine. 2018 (PREDIMED).",
        type: "Randomized controlled trial (~7,400)",
        finding: "Mediterranean diet supplemented with mixed nuts cut major cardiovascular events vs a control diet.",
        search: "Estruch PREDIMED Mediterranean diet nuts cardiovascular 2018 NEJM",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "legumes",
    name: "Legumes (beans, lentils, chickpeas)",
    category: "Legumes",
    effect: "positive",
    certainty: "moderate",
    outcomes: ["Heart disease", "Type 2 diabetes", "Longevity"],
    summary: "Regular beans/lentils track with lower heart disease and diabetes risk.",
    rationale:
      "Consistent inverse associations across cohorts and cuisines, biological plausibility (fiber, low glycemic load), and convergence with trial data on intermediate markers (LDL, glycemic control) support a positive label at 'Moderate' certainty.",
    considerations: {
      substitution: "Strongest signal when legumes replace red/processed meat or refined grains.",
      confounding: "Often part of broader plant-forward patterns; hard to fully isolate.",
    },
    studies: [
      {
        citation: "Darmadi-Blackberry I, et al. Asia Pacific J Clinical Nutrition. 2004.",
        type: "Cross-cultural prospective cohort of older adults",
        finding: "Legume intake was the single strongest dietary predictor of survival (~7–8% lower mortality per 20 g/day).",
        search: "Darmadi-Blackberry legumes most important dietary predictor survival older 2004",
      },
      {
        citation: "Afshin A, et al. American J Clinical Nutrition. 2014.",
        type: "Meta-analysis of cohorts",
        finding: "4 servings/week of legumes associated with ~14% lower risk of coronary heart disease.",
        search: "Afshin nuts legumes coronary heart disease meta-analysis 2014",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "whole-grains",
    name: "Whole grains (oats, barley, whole wheat)",
    category: "Grains",
    effect: "positive",
    certainty: "high",
    outcomes: ["All-cause mortality", "Cardiovascular disease", "Type 2 diabetes"],
    summary: "Each extra serving of whole grains tracks with lower mortality and disease risk.",
    rationale:
      "One of the best-supported food groups: large dose-response meta-analyses, a clear biological mechanism via fiber, and supportive trial evidence on risk markers. Direction is consistent enough across outcomes to grade 'High' certainty — provided whole grains displace refined grains.",
    considerations: {
      substitution: "Benefit is largely relative to replacing refined grains; 'whole grain' food products vary widely in quality.",
      doseResponse: "Roughly linear up to ~90 g/day, then plateaus.",
    },
    studies: [
      {
        citation: "Aune D, et al. BMJ. 2016.",
        type: "Dose-response meta-analysis of cohorts (~700,000+)",
        finding: "90 g/day whole grains associated with ~17% lower all-cause mortality, lower CVD, cancer, and diabetes.",
        search: "Aune whole grain consumption cardiovascular cancer mortality BMJ 2016",
      },
      {
        citation: "Reynolds A, et al. Lancet. 2019.",
        type: "Series of systematic reviews & meta-analyses (cohorts + RCTs)",
        finding: "Higher whole-grain and fiber intake linked to 15–30% lower mortality and incidence of several chronic diseases.",
        search: "Reynolds carbohydrate quality fiber whole grain Lancet 2019",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "fiber",
    name: "Dietary fiber (from whole foods)",
    category: "Other",
    effect: "positive",
    certainty: "high",
    outcomes: ["All-cause mortality", "Cardiovascular disease", "Type 2 diabetes", "Colorectal cancer"],
    summary: "Higher fiber from whole foods is one of the most robust dietary predictors of better outcomes.",
    rationale:
      "Convergent evidence from large cohorts AND randomized trials (on blood pressure, cholesterol, glycemia, weight) gives fiber unusually strong causal support for nutrition. Whole-food fiber outperforms isolated supplements.",
    considerations: {
      substitution: "High-fiber whole foods usually displace refined, energy-dense foods — part of the benefit.",
      doseResponse: "Risk keeps falling up to ~25–29 g/day and beyond.",
    },
    studies: [
      {
        citation: "Reynolds A, et al. Lancet. 2019.",
        type: "Systematic reviews & meta-analyses of cohorts + 58 RCTs",
        finding: "25–29 g/day fiber associated with 15–30% lower all-cause and CVD mortality; RCTs confirm lower weight, BP, cholesterol.",
        search: "Reynolds dietary fiber Lancet 2019 mortality randomised",
      },
      {
        citation: "Threapleton DE, et al. BMJ. 2013.",
        type: "Dose-response meta-analysis of cohorts",
        finding: "7 g/day more fiber associated with ~9% lower coronary heart disease risk.",
        search: "Threapleton dietary fibre coronary heart disease meta-analysis BMJ 2013",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "leafy-greens",
    name: "Leafy green vegetables",
    category: "Vegetables",
    effect: "positive",
    certainty: "moderate",
    outcomes: ["Cardiovascular disease", "Cognitive decline"],
    summary: "Higher intake tracks with lower cardiovascular risk and slower cognitive decline.",
    rationale:
      "Among the most consistently beneficial subgroups within fruit-and-vegetable research, with plausible mechanisms (nitrate, folate, potassium, fiber). Graded 'Moderate' rather than 'High' certainty because healthy-user confounding is substantial and RCT outcome data are thin.",
    considerations: {
      confounding: "Greens strongly mark an overall healthy lifestyle; residual confounding likely inflates effect sizes.",
    },
    studies: [
      {
        citation: "Aune D, et al. International J Epidemiology. 2017.",
        type: "Dose-response meta-analysis of cohorts (~2 million participants)",
        finding: "Higher fruit & vegetable intake (esp. leafy greens) linked to lower CVD and all-cause mortality; benefit up to ~800 g/day.",
        search: "Aune fruit vegetable intake cardiovascular cancer mortality 2017",
      },
      {
        citation: "Morris MC, et al. Neurology. 2018.",
        type: "Prospective cohort (Memory and Aging Project)",
        finding: "~1 serving/day of leafy greens associated with slower cognitive decline (≈11 years younger in age).",
        search: "Morris green leafy vegetables cognitive decline Neurology 2018",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "whole-fruit",
    name: "Whole fruit (apples, citrus, berries)",
    category: "Fruit",
    effect: "positive",
    certainty: "moderate",
    outcomes: ["All-cause mortality", "Type 2 diabetes"],
    summary: "Whole fruit tracks with lower mortality and diabetes — but fruit juice does not.",
    rationale:
      "Consistent inverse associations for whole fruit across very large cohorts, with a clear contrast against fruit juice that argues against pure confounding. Graded 'Moderate'.",
    considerations: {
      substitution: "Whole fruit vs juice matters: juice shows neutral-to-harmful associations for diabetes.",
      doseResponse: "Benefit plateaus around 2–3 servings/day.",
    },
    studies: [
      {
        citation: "Muraki I, et al. BMJ. 2013.",
        type: "Three large US cohorts (~187,000)",
        finding: "Whole fruit (esp. blueberries, grapes, apples) lowered type 2 diabetes risk; fruit juice raised it.",
        search: "Muraki fruit consumption type 2 diabetes juice BMJ 2013",
      },
      {
        citation: "Wang X, et al. BMJ. 2014.",
        type: "Dose-response meta-analysis of cohorts",
        finding: "Each serving/day of fruit associated with ~5–6% lower all-cause mortality.",
        search: "Wang fruit vegetable consumption mortality dose-response BMJ 2014",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "fatty-fish",
    name: "Fatty fish (salmon, sardines, mackerel)",
    category: "Seafood",
    effect: "positive",
    certainty: "moderate",
    outcomes: ["Cardiac death", "Cardiovascular disease"],
    summary: "One to two servings a week is linked to lower cardiac death.",
    rationale:
      "Cohorts consistently show lower coronary death with modest oily-fish intake, with plausible omega-3 mechanisms. Pure omega-3 supplement RCTs are mixed, so we credit the food (not capsules) and hold certainty at 'Moderate'.",
    considerations: {
      substitution: "Benefit partly reflects fish replacing red/processed meat.",
      doseResponse: "Most of the benefit appears by ~250 mg/day omega-3 (≈1–2 servings/week); little added benefit beyond.",
    },
    studies: [
      {
        citation: "Mozaffarian D, Rimm EB. JAMA. 2006.",
        type: "Pooled cohort evidence review",
        finding: "Modest fish intake (~1–2 servings/week) associated with ~36% lower coronary heart disease death.",
        search: "Mozaffarian Rimm fish intake contaminants human health JAMA 2006",
      },
      {
        citation: "Zhang B, et al. (fish & mortality meta-analyses).",
        type: "Meta-analyses of prospective cohorts",
        finding: "Higher fish consumption associated with lower CVD and all-cause mortality in a dose-dependent way.",
        search: "fish consumption all-cause cardiovascular mortality meta-analysis cohort",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "olive-oil",
    name: "Extra-virgin olive oil",
    category: "Fats & oils",
    effect: "positive",
    certainty: "moderate",
    outcomes: ["Cardiovascular disease", "All-cause mortality"],
    summary: "Higher intake, especially replacing butter/margarine, tracks with lower CVD and mortality.",
    rationale:
      "Backed by both large US cohorts and the PREDIMED trial (where extra-virgin olive oil was a core arm), giving better-than-usual causal support. Graded 'Moderate' since the trial tested a pattern, not the oil in isolation.",
    considerations: {
      substitution: "Clearest benefit when it replaces butter, margarine, or other animal fats.",
    },
    studies: [
      {
        citation: "Guasch-Ferré M, et al. J American College of Cardiology. 2022.",
        type: "Two US cohorts (~92,000, 28-yr follow-up)",
        finding: ">7 g/day olive oil associated with ~19% lower CVD mortality and lower total mortality.",
        search: "Guasch-Ferre olive oil consumption cardiovascular mortality JACC 2022",
      },
      {
        citation: "Estruch R, et al. NEJM. 2018 (PREDIMED).",
        type: "Randomized controlled trial",
        finding: "Mediterranean diet with extra-virgin olive oil reduced major cardiovascular events vs control.",
        search: "Estruch PREDIMED olive oil cardiovascular 2018 NEJM",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "yogurt",
    name: "Yogurt & fermented dairy",
    category: "Dairy",
    effect: "positive",
    certainty: "low",
    outcomes: ["Type 2 diabetes"],
    summary: "Regular yogurt is linked to modestly lower type 2 diabetes risk.",
    rationale:
      "Fairly consistent inverse association with diabetes across cohorts, but no strong trial evidence on hard outcomes and meaningful confounding — so 'Low' certainty.",
    considerations: {
      substitution: "Often replaces less healthy snacks; choosing unsweetened matters.",
      confounding: "Yogurt eaters tend to have healthier overall diets.",
    },
    studies: [
      {
        citation: "Chen M, et al. BMC Medicine. 2014.",
        type: "Three US cohorts + meta-analysis",
        finding: "One serving/day of yogurt associated with ~18% lower type 2 diabetes risk.",
        search: "Chen yogurt dairy type 2 diabetes BMC Medicine 2014",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "coffee",
    name: "Coffee",
    category: "Beverages",
    effect: "positive",
    certainty: "moderate",
    outcomes: ["All-cause mortality", "Type 2 diabetes", "Liver disease"],
    summary: "Habitual coffee (3–4 cups/day) tracks with lower mortality and diabetes risk.",
    rationale:
      "An umbrella review across dozens of meta-analyses found mostly benefit and few harms, holding for caffeinated and decaf — which argues against caffeine-driven confounding. Graded 'Moderate'. Sugary coffee drinks are a different question.",
    considerations: {
      confounding: "Smoking historically confounded coffee studies; modern analyses adjust for it.",
      doseResponse: "Lowest mortality around 3–4 cups/day; benefit reverses at very high intakes for some outcomes.",
    },
    studies: [
      {
        citation: "Poole R, et al. BMJ. 2017.",
        type: "Umbrella review of 200+ meta-analyses",
        finding: "3–4 cups/day associated with ~17% lower all-cause mortality and lower CVD, diabetes, and liver disease.",
        search: "Poole coffee consumption health umbrella review BMJ 2017",
      },
      {
        citation: "Gunter MJ, et al. Annals of Internal Medicine. 2017.",
        type: "EPIC cohort (~520,000 across 10 countries)",
        finding: "Higher coffee intake associated with lower all-cause and digestive-disease mortality.",
        search: "Gunter coffee mortality EPIC 2017 Annals Internal Medicine",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "avocado",
    name: "Avocado",
    category: "Fruit",
    effect: "positive",
    certainty: "low",
    outcomes: ["Cardiovascular disease"],
    summary: "Regular avocado intake is linked to lower cardiovascular risk, on a small evidence base.",
    rationale:
      "Promising cohort signal and favorable lipid effects in feeding studies, but few large studies and short follow-up — 'Low' certainty.",
    considerations: {
      substitution: "Benefit largest when avocado replaces butter, cheese, or processed meats.",
    },
    studies: [
      {
        citation: "Pacheco LS, et al. J American Heart Association. 2022.",
        type: "Two US cohorts (~110,000, 30-yr follow-up)",
        finding: "≥2 servings/week associated with ~16–21% lower cardiovascular disease risk.",
        search: "Pacheco avocado consumption cardiovascular disease JAHA 2022",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },

  // ============================ NEGATIVE ============================
  {
    id: "processed-meat",
    name: "Processed meats (bacon, sausage, deli)",
    category: "Meat",
    effect: "negative",
    certainty: "high",
    outcomes: ["Colorectal cancer", "Cardiovascular disease", "All-cause mortality"],
    summary: "Among the most consistent harmful signals in nutrition; raises colorectal cancer and heart disease risk.",
    rationale:
      "Consistent dose-response harm across many large cohorts, biological plausibility (nitrosamines, heme iron, sodium), and a formal IARC carcinogen classification for colorectal cancer. One of the few foods graded 'High' certainty.",
    considerations: {
      substitution: "Risk is partly relative to what it displaces; replacing with legumes/fish/poultry lowers risk in models.",
      doseResponse: "Risk rises roughly per 50 g/day, with no clear safe threshold for cancer.",
    },
    studies: [
      {
        citation: "Bouvard V, et al. (IARC Monograph). Lancet Oncology. 2015.",
        type: "Expert evidence review (800+ studies)",
        finding: "Processed meat classified Group 1 carcinogen; 50 g/day raises colorectal cancer risk ~18%.",
        search: "Bouvard IARC processed meat carcinogenicity Lancet Oncology 2015",
      },
      {
        citation: "Micha R, et al. Circulation. 2010.",
        type: "Meta-analysis of cohorts",
        finding: "50 g/day processed meat associated with ~42% higher CHD and ~19% higher diabetes risk; unprocessed red meat much weaker.",
        search: "Micha red processed meat coronary heart disease diabetes Circulation 2010",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "sugary-drinks",
    name: "Sugar-sweetened beverages (soda)",
    category: "Beverages",
    effect: "negative",
    certainty: "high",
    outcomes: ["Type 2 diabetes", "Weight gain", "Cardiovascular disease"],
    summary: "Regular sugary drinks robustly raise diabetes, weight, and heart disease risk.",
    rationale:
      "Cohort consistency plus supporting randomized evidence on weight and metabolic markers, with a clear mechanism (rapid liquid sugar, low satiety). Graded 'High' certainty.",
    considerations: {
      substitution: "Replacing with water or unsweetened drinks reverses much of the risk in modeling studies.",
      doseResponse: "Risk rises per serving/day with no apparent threshold.",
    },
    studies: [
      {
        citation: "Malik VS, et al. Diabetes Care. 2010.",
        type: "Meta-analysis of cohorts (~310,000)",
        finding: "1–2 servings/day associated with ~26% higher type 2 diabetes and higher metabolic syndrome risk.",
        search: "Malik sugar-sweetened beverages diabetes metabolic syndrome Diabetes Care 2010",
      },
      {
        citation: "Malik VS, et al. Circulation. 2019.",
        type: "Two large US cohorts",
        finding: "Higher SSB intake associated with higher cardiovascular and all-cause mortality.",
        search: "Malik sugar-sweetened beverages mortality Circulation 2019",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "trans-fat",
    name: "Trans fats / partially hydrogenated oils",
    category: "Fats & oils",
    effect: "negative",
    certainty: "high",
    outcomes: ["Cardiovascular disease"],
    summary: "Industrial trans fat raises heart disease risk more than any other fat per calorie.",
    rationale:
      "Strong, coherent evidence (cohorts + controlled feeding trials showing adverse LDL/HDL shifts) — strong enough that WHO called for global elimination and many countries banned it. Graded 'High' certainty. Now rare but still in some products.",
    considerations: {
      doseResponse: "Even 2% of energy from trans fat measurably raises CHD risk.",
    },
    studies: [
      {
        citation: "Mozaffarian D, et al. NEJM. 2006.",
        type: "Evidence review (cohorts + metabolic trials)",
        finding: "A 2%-energy increase in trans fat associated with ~23% higher coronary heart disease risk.",
        search: "Mozaffarian trans fatty acids cardiovascular disease NEJM 2006",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "ultra-processed",
    name: "Ultra-processed foods (general)",
    category: "Other",
    effect: "negative",
    certainty: "moderate",
    outcomes: ["All-cause mortality", "Obesity", "Cardiovascular disease"],
    summary: "Higher intake tracks with more obesity, heart disease, and mortality.",
    rationale:
      "Consistent cohort associations PLUS a tightly controlled inpatient trial showing these foods cause overeating give this category unusual causal weight for nutrition. Held at 'Moderate' because the category is broad and heterogeneous (not all UPFs behave alike).",
    considerations: {
      confounding: "UPF intake correlates with lower income and other risks; cohorts adjust imperfectly.",
      substitution: "Effect reflects displacement of minimally processed foods as much as the processing itself.",
    },
    studies: [
      {
        citation: "Hall KD, et al. Cell Metabolism. 2019.",
        type: "Randomized controlled inpatient feeding trial",
        finding: "On an ultra-processed diet, people ate ~500 kcal/day more and gained weight vs an unprocessed diet.",
        search: "Hall ultra-processed diet ad libitum food intake Cell Metabolism 2019",
      },
      {
        citation: "Pagliai G, et al. British J Nutrition. 2021.",
        type: "Meta-analysis of cohorts",
        finding: "Highest vs lowest UPF intake associated with higher all-cause mortality, CVD, and overweight/obesity.",
        search: "Pagliai ultra-processed food health meta-analysis British Journal Nutrition 2021",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "refined-grains",
    name: "Refined grains (white bread, pastries)",
    category: "Grains",
    effect: "negative",
    certainty: "low",
    outcomes: ["Cardiovascular disease", "Type 2 diabetes"],
    summary: "High intake is linked to higher heart disease and diabetes risk — largely vs whole grains.",
    rationale:
      "The harm is mostly relative (displacing whole grains and raising glycemic load) rather than absolute, and global cohort data are mixed by region. Graded 'Low'.",
    considerations: {
      substitution: "Much of the risk is the flip side of NOT eating whole grains.",
    },
    studies: [
      {
        citation: "Swaminathan S, et al. (PURE). BMJ. 2021.",
        type: "Global prospective cohort (~137,000 across 21 countries)",
        finding: "Highest refined-grain intake associated with higher mortality and major cardiovascular events.",
        search: "Swaminathan refined grains PURE mortality cardiovascular BMJ 2021",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },

  // ============================ NEUTRAL / MIXED ============================
  {
    id: "eggs",
    name: "Eggs",
    category: "Other",
    effect: "neutral",
    certainty: "moderate",
    outcomes: ["Cardiovascular disease"],
    summary: "For most people, moderate intake shows little net association with heart disease.",
    rationale:
      "Large cohorts and meta-analyses mostly land near no effect for the general population, though results split (some show higher risk in people with diabetes). We grade the NEUTRAL direction as 'Moderate' precisely because high-quality studies disagree but cluster around null.",
    considerations: {
      substitution: "What eggs replace matters (vs pastries vs processed meat).",
      confounding: "Egg intake correlates with breakfast patterns and other behaviors.",
    },
    studies: [
      {
        citation: "Drouin-Chartier JP, et al. BMJ. 2020.",
        type: "Three US cohorts + updated meta-analysis (>1.7 million)",
        finding: "Moderate egg intake (~1/day) not associated with cardiovascular disease risk overall.",
        search: "Drouin-Chartier egg consumption cardiovascular disease BMJ 2020",
      },
      {
        citation: "Zhong VW, et al. JAMA. 2019.",
        type: "Pooled US cohorts",
        finding: "Found higher egg/cholesterol intake associated with modestly higher CVD risk — illustrating the genuine disagreement.",
        search: "Zhong egg dietary cholesterol cardiovascular disease mortality JAMA 2019",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "red-meat",
    name: "Unprocessed red meat (beef, pork)",
    category: "Meat",
    effect: "neutral",
    certainty: "very-low",
    outcomes: ["All-cause mortality", "Type 2 diabetes"],
    summary: "Associations are weak, contested, and of low certainty — distinct from processed meat.",
    rationale:
      "Some cohorts show modestly higher risk, but a major systematic review judged the certainty low and the absolute effects small; experts genuinely disagree. We label this NEUTRAL/contested at 'Very low' certainty rather than asserting harm.",
    considerations: {
      substitution: "Risk estimates depend heavily on the comparison food (poultry/fish/legumes lower modeled risk).",
      confounding: "Red-meat intake clusters with smoking, low veg intake, etc.",
    },
    studies: [
      {
        citation: "Zeraatkar D, et al. (NutriRECS). Annals of Internal Medicine. 2019.",
        type: "Systematic review of cohorts with GRADE certainty rating",
        finding: "Low-certainty evidence; possible small risk reduction from cutting red meat, judged not compelling.",
        search: "Zeraatkar red processed meat reduction NutriRECS Annals Internal Medicine 2019",
      },
      {
        citation: "Wang X, et al. (red meat & mortality).",
        type: "Meta-analysis of cohorts",
        finding: "Modest higher all-cause and CVD mortality at high intakes — smaller and less consistent than for processed meat.",
        search: "red meat consumption all-cause cardiovascular mortality meta-analysis cohort",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "poultry",
    name: "Poultry (chicken, turkey)",
    category: "Meat",
    effect: "neutral",
    certainty: "low",
    outcomes: ["Cardiovascular disease"],
    summary: "Generally neutral for cardiovascular outcomes; often a 'better-than-red-meat' swap.",
    rationale:
      "Cohorts cluster near no association for heart disease, and poultry usually appears as the favorable comparator in substitution analyses. The neutral direction is consistent, but poultry is rarely studied as an exposure in its own right — so certainty is 'Low'.",
    considerations: {
      substitution: "Looks beneficial mainly because it replaces red/processed meat; cooking method (fried) can change this.",
    },
    studies: [
      {
        citation: "Substitution analyses across US cohorts (e.g., NHS/HPFS).",
        type: "Prospective cohorts with isocaloric substitution modeling",
        finding: "Swapping poultry for red/processed meat lowers modeled mortality; poultry itself ≈ neutral.",
        search: "poultry red meat substitution mortality cardiovascular cohort",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [
      { date: "2026-06-28", change: "Certainty refined from Moderate to Low under v0.3 explicit scoring (limited direct evidence; the neutral verdict is unchanged)." },
    ],
  },
  {
    id: "milk",
    name: "Milk (whole or low-fat)",
    category: "Dairy",
    effect: "neutral",
    certainty: "moderate",
    outcomes: ["All-cause mortality", "Cardiovascular disease"],
    summary: "Overall associations with mortality and heart disease are roughly neutral.",
    rationale:
      "Large global cohorts find little net association with hard outcomes, and the long-assumed penalty for whole-fat milk is not well supported. Neutral direction graded 'Moderate'.",
    considerations: {
      substitution: "Fat content matters less than expected; what milk replaces (e.g., soda) can dominate.",
    },
    studies: [
      {
        citation: "Dehghan M, et al. (PURE). Lancet. 2018.",
        type: "Global prospective cohort (~136,000 across 21 countries)",
        finding: "Dairy intake associated with lower mortality and CVD; whole-fat not worse than low-fat.",
        search: "Dehghan dairy consumption cardiovascular mortality PURE Lancet 2018",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "cheese",
    name: "Cheese",
    category: "Dairy",
    effect: "neutral",
    certainty: "low",
    outcomes: ["Cardiovascular disease"],
    summary: "Despite saturated fat and salt, associations with heart disease are roughly neutral.",
    rationale:
      "Meta-analyses show a flat or slightly favorable relationship, attributed to the fermented 'dairy matrix'. The neutral direction is fairly consistent, but rests on a thin evidence base with no trials on hard outcomes — so certainty is 'Low'.",
    considerations: {
      confounding: "Cheese is embedded in varied dietary patterns; hard to isolate.",
      doseResponse: "Some analyses suggest a shallow U-shape (modest intake ≈ lowest risk).",
    },
    studies: [
      {
        citation: "de Goede J, et al. (cheese & CVD).",
        type: "Dose-response meta-analysis of cohorts",
        finding: "Modest cheese intake (~40 g/day) associated with slightly lower CHD/stroke risk; overall near-neutral.",
        search: "de Goede cheese coronary heart disease stroke dose-response meta-analysis",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [
      { date: "2026-06-28", change: "Certainty refined from Moderate to Low under v0.3 explicit scoring (thin evidence base; the neutral verdict is unchanged)." },
    ],
  },
  {
    id: "butter",
    name: "Butter",
    category: "Fats & oils",
    effect: "neutral",
    certainty: "low",
    outcomes: ["All-cause mortality", "Cardiovascular disease"],
    summary: "Only weakly associated with mortality and not clearly with heart disease.",
    rationale:
      "A meta-analysis found small, mostly non-significant associations. The verdict is highly substitution-dependent (worse than olive oil, better than trans fat), so we label neutral at 'Low'.",
    considerations: {
      substitution: "Replacing butter with olive/seed oils lowers modeled CVD risk; replacing trans fat with butter lowers it.",
    },
    studies: [
      {
        citation: "Pimpin L, et al. PLoS ONE. 2016.",
        type: "Meta-analysis of cohorts (~636,000)",
        finding: "Each 14 g/day butter associated with a small higher all-cause mortality and slightly LOWER diabetes risk; weak overall.",
        search: "Pimpin butter mortality cardiovascular diabetes meta-analysis PLoS ONE 2016",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "potatoes",
    name: "White potatoes (boiled/baked)",
    category: "Vegetables",
    effect: "neutral",
    certainty: "low",
    outcomes: ["Type 2 diabetes", "Cardiovascular disease"],
    summary: "Non-fried potatoes look roughly neutral; fries are a separate, worse story.",
    rationale:
      "Associations for boiled/baked potatoes are weak and inconsistent, while French fries show clearer harm — so we keep plain potatoes neutral at 'Low' and call out preparation.",
    considerations: {
      substitution: "High glycemic load means swaps to whole grains/legumes look better in models.",
      doseResponse: "Risk signals appear mainly at high intakes and for fried forms.",
    },
    studies: [
      {
        citation: "Mu L, et al. / potato & cardiometabolic cohorts.",
        type: "Prospective cohorts",
        finding: "Fried potatoes associated with higher mortality/diabetes; non-fried potatoes near-neutral.",
        search: "potato consumption fried type 2 diabetes mortality cohort",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "alcohol",
    name: "Moderate alcohol",
    category: "Beverages",
    effect: "neutral",
    certainty: "low",
    outcomes: ["All-cause mortality", "Cancer"],
    summary: "Once-claimed benefits largely vanish after correcting for bias; increasingly seen as not protective.",
    rationale:
      "Earlier cohorts suggested a J-curve, but analyses correcting for 'sick-quitter' and abstainer biases find no clear protection and rising harm with intake (cancer risk increases from low levels). We label NEUTRAL (no net benefit) at 'Low', trending toward harm. This is an active area of revision.",
    considerations: {
      confounding: "Light drinkers are healthier for reasons other than alcohol; former drinkers contaminate the 'abstainer' group.",
      doseResponse: "Cancer risk rises roughly linearly from low intake; cardiovascular 'benefit' is contested.",
    },
    studies: [
      {
        citation: "Zhao J, et al. JAMA Network Open. 2023.",
        type: "Meta-analysis of 107 cohort studies, bias-adjusted",
        finding: "No significant mortality protection from low/moderate intake after adjusting for study-design biases.",
        search: "Zhao alcohol all-cause mortality meta-analysis JAMA Network Open 2023",
      },
      {
        citation: "GBD 2016 Alcohol Collaborators. Lancet. 2018.",
        type: "Global systematic analysis",
        finding: "The level of alcohol that minimizes total health loss is zero.",
        search: "Global Burden Disease alcohol no safe level Lancet 2018",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [
      {
        date: "2026-06-28",
        change: "Moved from 'positive (J-curve)' framing to NEUTRAL/contested, reflecting bias-corrected meta-analyses.",
      },
    ],
  },
  {
    id: "artificial-sweeteners",
    name: "Artificial sweeteners",
    category: "Other",
    effect: "neutral",
    certainty: "very-low",
    outcomes: ["Type 2 diabetes", "Cardiovascular disease"],
    summary: "Genuinely mixed evidence; net long-term effect is uncertain.",
    rationale:
      "Some cohorts link them to cardiometabolic risk (likely partly reverse causation — at-risk people switch to them), while substitution trials replacing sugary drinks show short-term benefit. We label NEUTRAL at 'Very low' certainty and flag this as unsettled.",
    considerations: {
      confounding: "Strong reverse causation: people already at risk choose diet products.",
      substitution: "Compared with sugary drinks they look better; compared with water, possibly not.",
    },
    studies: [
      {
        citation: "Debras C, et al. (NutriNet-Santé). PLoS Medicine. 2022.",
        type: "Large prospective cohort (~103,000)",
        finding: "Higher artificial-sweetener intake associated with modestly higher cardiovascular risk (association, not proof).",
        search: "Debras artificial sweeteners cardiovascular NutriNet-Sante PLoS Medicine 2022",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
  {
    id: "coconut-oil",
    name: "Coconut oil",
    category: "Fats & oils",
    effect: "neutral",
    certainty: "low",
    outcomes: ["Cardiovascular risk markers"],
    summary: "Raises LDL like other saturated fats; little direct outcome data — treat as a saturated fat.",
    rationale:
      "Controlled trials show it raises LDL cholesterol versus unsaturated oils, but there is little direct cohort evidence on heart attacks or mortality, and no support for special benefit. Neutral-pending at 'Low'.",
    considerations: {
      substitution: "Worse than olive/seed oils for LDL; better than butter/trans fat is not established.",
    },
    studies: [
      {
        citation: "Neelakantan N, et al. Circulation. 2020.",
        type: "Meta-analysis of randomized trials",
        finding: "Coconut oil raised LDL cholesterol significantly vs non-tropical vegetable oils.",
        search: "Neelakantan coconut oil LDL cholesterol meta-analysis Circulation 2020",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [],
  },
];

/*
 * NutriGrade-ADAPTED scoring rubric (this project's reproducible application).
 *
 * Each food–evidence base is scored 0–2 on eight dimensions (max 16). The total
 * maps to the certainty tier shown on the card:
 *     total >= 13  -> high        (>=80% of max)
 *     total >= 10  -> moderate    (>=60%)
 *     total >=  7  -> low         (>=40%)
 *     else         -> very-low    (<40%)
 *
 * Scoring per dimension: 2 = strong / well-met, 1 = adequate / partial,
 * 0 = weak / concern. This is our transparent adaptation of NutriGrade — not a
 * recomputation of an official published score. See METHODOLOGY.md.
 */
const NUTRIGRADE_RUBRIC = {
  max: 16,
  thresholds: { high: 13, moderate: 10, low: 7 }, // else very-low
  dimensions: [
    { key: "quality",      label: "Study quality / confounding control" },
    { key: "consistency",  label: "Consistency (low heterogeneity)" },
    { key: "precision",    label: "Precision of the pooled estimate" },
    { key: "directness",   label: "Directness (hard outcomes, relevant people)" },
    { key: "effectSize",   label: "Effect size" },
    { key: "doseResponse", label: "Dose-response gradient" },
    { key: "biasFreedom",  label: "Freedom from publication / funding bias" },
    { key: "experimental", label: "Experimental / mechanistic corroboration" },
  ],
};

// Per-food assessments. `scores` keys match NUTRIGRADE_RUBRIC.dimensions.
// `effect` summarizes the conservative pooled estimate that drove the direction
// (does its uncertainty interval exclude "no effect"?).
const ASSESSMENTS = {
  "tree-nuts": {
    scores: { quality: 1, consistency: 2, precision: 2, directness: 2, effectSize: 1, doseResponse: 2, biasFreedom: 1, experimental: 1 },
    effect: "Pooled RR ≈ 0.78 for all-cause mortality at ~28 g/day; interval excludes no-effect → lower risk.",
  },
  "legumes": {
    scores: { quality: 1, consistency: 2, precision: 1, directness: 2, effectSize: 1, doseResponse: 1, biasFreedom: 1, experimental: 1 },
    effect: "Pooled RR ≈ 0.86 for coronary heart disease at ~4 servings/week; interval excludes no-effect.",
  },
  "whole-grains": {
    scores: { quality: 1, consistency: 2, precision: 2, directness: 2, effectSize: 1, doseResponse: 2, biasFreedom: 1, experimental: 2 },
    effect: "≈17% lower all-cause mortality at 90 g/day (RR ≈ 0.83); clear dose-response, interval excludes no-effect.",
  },
  "fiber": {
    scores: { quality: 1, consistency: 2, precision: 2, directness: 2, effectSize: 1, doseResponse: 2, biasFreedom: 1, experimental: 2 },
    effect: "≈15–30% lower all-cause/CVD mortality at 25–29 g/day; interval excludes no-effect; RCTs confirm risk-factor effects.",
  },
  "leafy-greens": {
    scores: { quality: 1, consistency: 2, precision: 1, directness: 2, effectSize: 1, doseResponse: 1, biasFreedom: 1, experimental: 1 },
    effect: "Part of the fruit-and-veg dose-response; lower CVD/mortality up to ~800 g/day F&V; interval excludes no-effect.",
  },
  "whole-fruit": {
    scores: { quality: 1, consistency: 2, precision: 1, directness: 2, effectSize: 1, doseResponse: 1, biasFreedom: 1, experimental: 1 },
    effect: "≈5–6% lower mortality per serving/day; whole fruit lowers type 2 diabetes while juice raises it.",
  },
  "fatty-fish": {
    scores: { quality: 1, consistency: 2, precision: 1, directness: 2, effectSize: 1, doseResponse: 1, biasFreedom: 1, experimental: 1 },
    effect: "≈36% lower coronary death at 1–2 servings/week; interval excludes no-effect; benefit plateaus.",
  },
  "olive-oil": {
    scores: { quality: 1, consistency: 1, precision: 1, directness: 2, effectSize: 1, doseResponse: 1, biasFreedom: 1, experimental: 2 },
    effect: "≈19% lower CVD mortality at >7 g/day (RR ≈ 0.81); supported by the PREDIMED trial arm.",
  },
  "yogurt": {
    scores: { quality: 1, consistency: 1, precision: 1, directness: 1, effectSize: 1, doseResponse: 1, biasFreedom: 1, experimental: 0 },
    effect: "≈18% lower type 2 diabetes at 1 serving/day; single-outcome, no hard-outcome trials.",
  },
  "coffee": {
    scores: { quality: 1, consistency: 2, precision: 2, directness: 2, effectSize: 1, doseResponse: 1, biasFreedom: 1, experimental: 0 },
    effect: "≈17% lower all-cause mortality at 3–4 cups/day; consistent across many meta-analyses; no RCT on hard outcomes.",
  },
  "avocado": {
    scores: { quality: 1, consistency: 1, precision: 1, directness: 1, effectSize: 1, doseResponse: 0, biasFreedom: 1, experimental: 1 },
    effect: "≈16–21% lower CVD at ≥2 servings/week; small evidence base, wide interval.",
  },
  "processed-meat": {
    scores: { quality: 1, consistency: 2, precision: 2, directness: 2, effectSize: 2, doseResponse: 2, biasFreedom: 1, experimental: 1 },
    effect: "+18% colorectal cancer and +42% CHD per 50 g/day; interval excludes no-effect; IARC Group 1 carcinogen.",
  },
  "sugary-drinks": {
    scores: { quality: 1, consistency: 2, precision: 2, directness: 2, effectSize: 1, doseResponse: 2, biasFreedom: 1, experimental: 2 },
    effect: "+26% type 2 diabetes at 1–2 servings/day; interval excludes no-effect; RCT support on weight/metabolic markers.",
  },
  "trans-fat": {
    scores: { quality: 1, consistency: 2, precision: 2, directness: 2, effectSize: 2, doseResponse: 1, biasFreedom: 1, experimental: 2 },
    effect: "+23% CHD per 2% of energy; interval excludes no-effect; controlled-feeding RCTs corroborate the mechanism.",
  },
  "ultra-processed": {
    scores: { quality: 1, consistency: 2, precision: 1, directness: 2, effectSize: 1, doseResponse: 1, biasFreedom: 1, experimental: 2 },
    effect: "Higher mortality/CVD at highest intake; an inpatient RCT showed ~500 kcal/day overeating; category is heterogeneous.",
  },
  "refined-grains": {
    scores: { quality: 1, consistency: 1, precision: 1, directness: 1, effectSize: 1, doseResponse: 1, biasFreedom: 1, experimental: 0 },
    effect: "Higher mortality/major CVD at highest intake (PURE); mostly relative to whole grains; region-dependent.",
  },
  "eggs": {
    scores: { quality: 1, consistency: 1, precision: 2, directness: 2, effectSize: 1, doseResponse: 1, biasFreedom: 1, experimental: 1 },
    effect: "Pooled RR ≈ 1.0 for CVD in the general population; interval spans no-effect → neutral; subgroups disagree.",
  },
  "red-meat": {
    scores: { quality: 1, consistency: 0, precision: 1, directness: 1, effectSize: 1, doseResponse: 0, biasFreedom: 1, experimental: 0 },
    effect: "Small, inconsistent excess risk; a GRADE review judged certainty low; interval near/over no-effect → contested.",
  },
  "poultry": {
    scores: { quality: 1, consistency: 2, precision: 1, directness: 2, effectSize: 1, doseResponse: 0, biasFreedom: 1, experimental: 0 },
    effect: "≈ no association with CVD; interval spans no-effect → neutral; looks favorable mainly as a substitute.",
  },
  "milk": {
    scores: { quality: 1, consistency: 2, precision: 2, directness: 2, effectSize: 1, doseResponse: 1, biasFreedom: 1, experimental: 0 },
    effect: "≈ neutral for mortality/CVD (PURE); whole-fat not worse than low-fat; interval spans no-effect.",
  },
  "cheese": {
    scores: { quality: 1, consistency: 2, precision: 1, directness: 1, effectSize: 1, doseResponse: 1, biasFreedom: 1, experimental: 0 },
    effect: "Flat-to-slightly-protective (~RR 0.96 at ~40 g/day); interval near no-effect → neutral.",
  },
  "butter": {
    scores: { quality: 1, consistency: 1, precision: 1, directness: 1, effectSize: 1, doseResponse: 0, biasFreedom: 1, experimental: 1 },
    effect: "Small, mostly non-significant association with mortality; interval spans no-effect; highly substitution-dependent.",
  },
  "potatoes": {
    scores: { quality: 1, consistency: 1, precision: 1, directness: 1, effectSize: 1, doseResponse: 1, biasFreedom: 1, experimental: 0 },
    effect: "Non-fried ≈ neutral; fried associated with higher risk; interval spans no-effect for plain potatoes.",
  },
  "alcohol": {
    scores: { quality: 0, consistency: 1, precision: 1, directness: 2, effectSize: 1, doseResponse: 1, biasFreedom: 1, experimental: 0 },
    effect: "No significant mortality protection after bias adjustment; cancer risk rises from low intake → net neutral, trending harmful.",
  },
  "artificial-sweeteners": {
    scores: { quality: 0, consistency: 0, precision: 1, directness: 1, effectSize: 1, doseResponse: 0, biasFreedom: 1, experimental: 1 },
    effect: "Conflicting: some cohorts show higher CVD (likely reverse causation); substitution trials show benefit → net uncertain.",
  },
  "coconut-oil": {
    scores: { quality: 1, consistency: 1, precision: 1, directness: 1, effectSize: 1, doseResponse: 0, biasFreedom: 1, experimental: 1 },
    effect: "Raises LDL vs unsaturated oils (RCTs); no direct outcome data → neutral pending.",
  },
};

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

const METHODOLOGY_VERSION = "0.49";

// Challenges are handled by the maintainer directly (verdicts are revised through
// review with AI-assisted research) — there is no public submission form.

const FOODS = [
  // ============================ POSITIVE ============================
  {
    id: "tree-nuts",
    name: "Tree nuts (almonds, walnuts, etc.)",
    category: "Nuts & seeds",
    effect: "positive",
    certainty: "high",
    outcomes: ["All-cause mortality", "Cardiovascular disease"],
    summary: "A daily handful is linked to meaningfully lower mortality and heart disease risk.",
    rationale:
      "Large dose-response meta-analyses of cohorts agree on direction and magnitude, and a major dietary trial (PREDIMED) found fewer cardiovascular events on a nut-supplemented diet — so causal support is stronger than for most foods. The consistency, dose-response, sizeable effect, and trial corroboration together clear our bar for high certainty.",
    considerations: {
      substitution: "Benefit is clearest when nuts replace refined snacks; they are calorie-dense, so 'added on top' may differ.",
      confounding: "Nut eaters tend to be more health-conscious; cohorts adjust for this but residual confounding remains.",
      doseResponse: "Risk reduction flattens above ~15–28 g/day — more is not proportionally better.",
      variety: "Benefits are broadly consistent across nut types (peanuts ≈ tree nuts; Bao 2013) — almonds are best-evidenced for LDL-lowering, walnuts add omega-3/ALA — differences of emphasis, not direction. No study stratifies salted vs unsalted outcomes; choose unsalted/dry-roasted if you're salt-sensitive.",
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
    lastReviewed: "2026-06-29",
    revisions: [
      { date: "2026-06-29", change: "Source-verified (grounding pass): RR 0.78 (0.72–0.84) per 28 g/day confirmed (Aune 2016 BMC Medicine); heterogeneity corrected low → moderate (I²=66%). Certainty stays High (13/16); verdict unchanged." },
    ],
  },
  {
    id: "legumes",
    name: "Legumes (beans, lentils, chickpeas, etc.)",
    category: "Legumes",
    effect: "positive",
    certainty: "moderate",
    outcomes: ["All-cause mortality", "Heart disease"],
    summary: "Regular beans/lentils track with modestly lower mortality — but the diabetes benefit is soy-specific, not from beans/lentils.",
    rationale:
      "A large dose-response meta-analysis (Zargarzadeh 2023, ~1.14M) finds higher legume intake associated with lower all-cause mortality (HR 0.94), with a graded dose-response and biological plausibility (fibre, low glycemic load). The effect is small and confounding-prone (legumes mark a plant-forward pattern), so Moderate, not High. Note the once-assumed type-2-diabetes benefit does NOT hold for total legumes (Tang 2020, NS) — it is concentrated in SOY specifically — so diabetes is dropped from this verdict.",
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
        citation: "Zargarzadeh N, et al. Advances in Nutrition. 2023.",
        type: "Dose-response meta-analysis (32 cohorts, ~1.14 million)",
        finding: "Higher legume intake associated with lower all-cause mortality (HR 0.94, 0.91–0.98); 0.94 per 50 g/day.",
        search: "Zargarzadeh legume intake all-cause mortality dose-response meta-analysis Advances in Nutrition 2023",
      },
      {
        citation: "Tang J, et al. American J Clinical Nutrition. 2020.",
        type: "Meta-analysis of cohorts (~566,000)",
        finding: "Total legumes NOT significantly associated with type 2 diabetes (RR 0.95, 0.79–1.14); the protective signal is soy-specific.",
        search: "Tang legume soy type 2 diabetes meta-analysis American Journal Clinical Nutrition 2020",
      },
      {
        citation: "Afshin A, et al. American J Clinical Nutrition. 2014.",
        type: "Meta-analysis of cohorts",
        finding: "4 servings/week of legumes associated with ~14% lower risk of coronary heart disease.",
        search: "Afshin nuts legumes coronary heart disease meta-analysis 2014",
      },
    ],
    lastReviewed: "2026-07-01",
    revisions: [
      { date: "2026-07-01", change: "Source-verified + re-grounded (grounding pass): headline moved to all-cause mortality (HR 0.94, 0.91–0.98; Zargarzadeh 2023 Adv Nutr, ~1.14M), pooledRR 0.86→0.94, N 250k→1.14M → Low→Moderate. Dropped the type-2-diabetes claim: total legumes are NOT significantly associated with T2D (Tang 2020) — that benefit is soy-specific. Verdict stays positive." },
    ],
  },
  {
    id: "whole-grains",
    name: "Whole grains (oats, barley, whole wheat, etc.)",
    category: "Grains",
    effect: "positive",
    certainty: "moderate",
    outcomes: ["All-cause mortality", "Cardiovascular disease", "Type 2 diabetes"],
    summary: "Each extra serving of whole grains tracks with lower mortality and disease risk.",
    rationale:
      "One of the best-supported food groups by direction: large dose-response meta-analyses agree it lowers mortality, with a fibre mechanism and supportive trial evidence on risk markers. Graded Moderate (not High) because the verified pooled estimate (Aune 2016 BMJ) carries high between-study heterogeneity (I²=83%) — the cohorts agree on direction but not magnitude, and our rubric maps high I² to lower consistency. (This may revert to High if we refine the consistency rule to credit directional agreement; see the roadmap.) Benefit is relative to displacing refined grains.",
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
    lastReviewed: "2026-06-29",
    revisions: [
      { date: "2026-06-29", change: "High → Moderate under the grounding pass (v0.15): the verified Aune 2016 BMJ figure (RR 0.83, 0.77–0.90 per 90 g/day) carries I²=83% heterogeneity, so the consistency sub-score drops. Direction (positive) unchanged. Surfaced a rubric tension — high I² with directional agreement arguably shouldn't be penalised like genuine directional disagreement; queued for review." },
    ],
  },
  {
    id: "leafy-greens",
    name: "Leafy green vegetables",
    category: "Vegetables",
    effect: "positive",
    certainty: "moderate",
    outcomes: ["All-cause mortality", "Cardiovascular disease", "Cognitive decline"],
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
    revisions: [
      { date: "2026-07-01", change: "Added 'All-cause mortality' to the recorded outcomes (v0.31) — it was already part of the cited evidence base (Aune 2017 F&V dose-response lowers CVD AND all-cause mortality; the study finding already stated it), so this aligns the outcomes list with the evidence and lets the all-cause magnitude bump apply, putting leafy greens on the cusp of Gold standard. The RR is still borrowed from the F&V umbrella; a cruciferous/leafy-SPECIFIC re-grounding remains queued. Verdict/certainty unchanged." },
    ],
  },
  {
    id: "whole-fruit",
    name: "Whole fruit (apples, citrus, berries, etc.)",
    category: "Fruit",
    effect: "positive",
    certainty: "moderate",
    outcomes: ["All-cause mortality", "Type 2 diabetes"],
    memberIntro: "The whole-fruit benefit generalises across most types, but not uniformly — polyphenol- and fibre-rich, lower-glycaemic fruits carry the strongest signal, higher-GI fruits are weaker, and fruit juice diverges the wrong way.",
    members: [
      { name: "Berries", tag: "good", note: "Strongest type-2-diabetes signal — blueberries HR 0.74 per 3 servings/week (Muraki 2013)." },
      { name: "Apples & pears", tag: "good", note: "T2D HR 0.93 per 3 servings/week (Muraki 2013); inversely linked to mortality (Wang 2014)." },
      { name: "Grapes", tag: "good", note: "Grapes/raisins HR 0.88 per 3 servings/week for T2D (Muraki 2013)." },
      { name: "Citrus", tag: "good", note: "Inversely associated with CVD/all-cause mortality (~9–12% lower CVD; Aune 2017)." },
      { name: "Stone fruit (peach, plum)", tag: "likely", note: "Shares the fibre/polyphenol profile; grouped with beneficial 'other fruits', rarely analysed alone." },
      { name: "Tropical (mango, pineapple)", tag: "likely", note: "Whole-fruit profile but higher-GI and under-studied individually — inferred, not measured." },
      { name: "Bananas", tag: "weaker", note: "Higher-glycaemic; individual T2D association weaker/non-significant (Muraki 2013)." },
      { name: "Melon / cantaloupe", tag: "worse", note: "Cantaloupe was positively (adversely) associated with T2D in Muraki 2013 — a higher-GI outlier." },
      { name: "Fruit juice", tag: "worse", note: "Separate item: HR 1.08 per 3 servings/week — raises T2D risk; whole fruit beats juice (Muraki 2013)." },
    ],
    summary: "Whole fruit tracks with lower mortality and diabetes — but fruit juice does not.",
    rationale:
      "Consistent inverse associations for whole fruit across very large cohorts, with a clear contrast against fruit juice that argues against pure confounding. Assessed at realistic intake (2–3 servings/day) the effect is meaningful rather than marginal, which supports moderate certainty.",
    considerations: {
      substitution: "Whole fruit vs juice matters: juice shows neutral-to-harmful associations for diabetes.",
      doseResponse: "Benefit plateaus around 2–3 servings/day.",
    },
    components: [
      {
        name: "Sugar (in the whole-fruit matrix)",
        worry: "Fruit is high in sugar, which spikes blood glucose — so fruit must be bad.",
        resolution: "Sugar bound up with fibre, water and polyphenols in whole fruit behaves nothing like liquid sugar: whole-fruit outcomes are positive (lower diabetes), while fruit JUICE and soda go the other way. The matrix, not the molecule, is what the outcomes track — so 'contains sugar' never sets the verdict.",
      },
    ],
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
    lastReviewed: "2026-06-29",
    revisions: [
      { date: "2026-06-29", change: "Low → Moderate under v0.8: effect size re-based from per-serving to realistic 2–3 servings/day intake (RR ≈ 0.90). Now on the cusp of the Gold standard list. Verdict (positive) unchanged." },
      { date: "2026-07-01", change: "Source-verified (grounding pass): all-cause mortality RR 0.90 (0.86–0.94) per 200 g/day fruit (Aune 2017 Int J Epidemiol, I²=44%); T2D 0.93 (0.88–0.99)/serving (Li 2014). Confirms 0.90; whole fruit only (juice raises T2D). Certainty/verdict unchanged." },
    ],
  },
  {
    id: "fatty-fish",
    name: "Fatty fish (salmon, sardines, mackerel, etc.)",
    category: "Seafood",
    effect: "positive",
    certainty: "moderate",
    outcomes: ["Cardiac death", "Cardiovascular disease"],
    summary: "One to two servings a week tracks with modestly lower cardiac death — smaller than older estimates, and mainly from the food, not fish-oil pills.",
    rationale:
      "Modern dose-response meta-analyses (Zhang 2020, Ricci 2023) show a modest inverse association with cardiac/CVD death — RR ~0.85–0.93, weaker than the ~0.64 older reviews suggested, and stronger in Asian than Western cohorts. Omega-3 SUPPLEMENT RCTs are essentially null (Cochrane), so we credit the food, not capsules, and hold certainty at 'Moderate'.",
    considerations: {
      substitution: "Benefit partly reflects fish replacing red/processed meat.",
      confounding: "Effect is stronger in Asian cohorts and weaker/U-shaped in Western ones — population-dependent.",
      doseResponse: "Most of the benefit appears by ~1–2 servings/week; little added beyond.",
    },
    studies: [
      {
        citation: "Zhang B, et al. Nutrients. 2020.",
        type: "Meta-analysis (27 studies, ~1.14 million)",
        finding: "Highest vs lowest fish intake associated with ~15% lower CHD mortality (RR 0.85, 0.77–0.94).",
        search: "Zhang fish consumption coronary heart disease meta-analysis Nutrients 2020",
      },
      {
        citation: "Ricci H, et al. Nutrients. 2023.",
        type: "Meta-analysis (~1.44 million)",
        finding: "~7% lower CVD at 2–3 servings/week (RR 0.93, 0.91–0.96).",
        search: "Ricci fish consumption cardiovascular disease meta-analysis Nutrients 2023",
      },
      {
        citation: "Abdelhamid AS, et al. Cochrane. (omega-3 supplements).",
        type: "Cochrane review of RCTs (~143,000)",
        finding: "Omega-3 SUPPLEMENTS show little/no effect on CVD events (RR 0.96, 0.92–1.01) — contrast with the dietary-fish signal.",
        search: "Abdelhamid omega-3 fatty acids cardiovascular Cochrane",
      },
    ],
    lastReviewed: "2026-06-29",
    revisions: [
      { date: "2026-06-29", change: "Source-verified (grounding pass): pooledRR 0.64 → 0.85 — the old ~36% figure (Mozaffarian 2006) was materially optimistic; modern meta-analyses (Zhang 2020 CHD-mortality 0.85, Ricci 2023 CVD 0.93) are weaker. Participants 250k → 1.14M. Magnitude drops Large → Moderate; certainty stays Moderate; verdict (positive) unchanged. Noted the Asian-vs-Western gap and null supplement RCTs." },
    ],
  },
  {
    id: "olive-oil",
    name: "Extra-virgin olive oil",
    category: "Fats & oils",
    effect: "positive",
    certainty: "low",
    outcomes: ["Cardiovascular disease", "All-cause mortality"],
    summary: "Higher intake, especially replacing butter/margarine, tracks with lower CVD and mortality.",
    rationale:
      "Backed by both large US cohorts and the PREDIMED trial (where extra-virgin olive oil was a core arm), giving better-than-usual causal support. The outcome-cohort base is fairly small and the trial tested a whole pattern, not the oil in isolation, which caps certainty.",
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
    lastReviewed: "2026-06-29",
    revisions: [
      { date: "2026-06-29", change: "Source-verified (grounding pass): HR 0.81 (0.78–0.84) all-cause / 0.81 (0.75–0.87) CVD mortality at >7 g/day (Guasch-Ferré 2022 JACC). Settles the open (a4) question — PREDIMED tested EVOO within a whole Mediterranean pattern, not the oil alone, so rctLevel stays 'pattern' and certainty stays Low. Verdict unchanged." },
    ],
  },
  {
    id: "yogurt",
    name: "Yogurt",
    category: "Dairy",
    effect: "positive",
    certainty: "moderate",
    outcomes: ["Type 2 diabetes"],
    summary: "Regular yogurt is linked to modestly lower type 2 diabetes risk.",
    rationale:
      "A large dose-response meta-analysis (Gijsbers 2016, 22 cohorts, ~580k) finds a non-linear inverse association with type 2 diabetes, RR 0.86 at ~80 g/day (plateauing after). The big sample and graded dose-response lift this to Moderate, though it's a single outcome with no hard-outcome trials and is confounding-prone (yogurt eaters eat better overall).",
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
    lastReviewed: "2026-07-01",
    revisions: [
      { date: "2026-06-29", change: "Renamed 'Yogurt & fermented dairy' → 'Yogurt': the entry's evidence is yogurt-specific (diabetes), and cheese — also a fermented dairy — is a separate item with a different verdict, so the old name double-counted it. 'Fermented dairy' is being modelled as a food group instead. Verdict unchanged." },
      { date: "2026-07-01", change: "Source-verified + re-grounded on Gijsbers 2016 (AJCN dose-response, 22 cohorts, ~580k): T2D RR 0.86 at 80 g/day (non-linear plateau). pooledRR 0.82→0.86, N 200k→580k, dose-response some→graded → Low→Moderate. Verdict (positive) unchanged." },
    ],
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
    lastReviewed: "2026-06-29",
    revisions: [
      { date: "2026-06-29", change: "Source-verified (grounding pass): RR 0.83 (0.79–0.88) all-cause mortality at 3–4 cups/day (Poole 2017 BMJ umbrella, corrected), corroborated by Crippa 2014 & Kim 2019. Added a U-shaped dose curve. Certainty/verdict unchanged." },
    ],
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
    lastReviewed: "2026-07-01",
    revisions: [
      { date: "2026-07-01", change: "Source-verified (grounding pass): CVD HR 0.84 (0.75–0.95) at ≥2 servings/week (Pacheco 2022 JAHA, ~110k). Noted it's a 2-cohort pooled analysis, not a meta-analysis, and null for stroke — evidence base stays thin → Low. Verdict unchanged." },
    ],
  },
  {
    id: "berries",
    name: "Berries (blueberries, strawberries, etc.)",
    category: "Fruit",
    effect: "positive",
    certainty: "low",
    outcomes: ["Type 2 diabetes", "Cardiovascular disease"],
    // Within-category guidance. The benefit rests on shared compounds, so it likely
    // GENERALISES across berries — the evidence is just concentrated in the best-studied
    // ones. "unknown/likely" is honest where a member isn't separately studied; we never
    // imply a member is bad just for being under-researched. First pass (verified:false).
    memberIntro: "The berry signal rests on shared compounds (anthocyanins, fibre, low glycaemic load), so it most likely extends across berries — the evidence is just concentrated in the best-studied ones, not exclusive to them.",
    members: [
      { name: "Blueberries", tag: "good", note: "Strongest single-fruit signal for type-2 diabetes (Muraki 2013, HR ~0.74 per 3 servings/week); anthocyanin RCTs corroborate on vascular markers." },
      { name: "Blackberries", tag: "likely", note: "Among the highest-anthocyanin berries — shares blueberries' mechanism, but little berry-specific hard-outcome data." },
      { name: "Raspberries", tag: "likely", note: "Anthocyanin-rich, high-fibre, low-sugar profile like other berries; not separately studied for hard outcomes." },
      { name: "Strawberries", tag: "weaker", note: "No clear type-2-diabetes association in cohorts (Muraki 2013) — still a low-sugar, vitamin-C-rich fruit, just not a standout." },
      { name: "Cranberries", tag: "worse", note: "Usually eaten as sweetened juice or sugar-infused dried fruit, which offsets the benefit; plain/fresh would likely behave like other berries." },
    ],
    summary: "Berries track with lower diabetes risk — strongest for blueberries; a step above fruit generally.",
    rationale:
      "A berry-specific cohort meta-analysis (Guo 2016) finds ~18% lower type-2-diabetes risk at high vs low intake (RR 0.82), with a graded dose-response; the landmark blueberry signal is stronger still (Muraki 2013, HR ~0.74 per 3 servings/week). Anthocyanin RCTs corroborate on vascular markers (Curtis 2019: blueberries improved endothelial function). Held at Low certainty: moderate heterogeneity, healthy-user confounding, and much berry research is industry-adjacent (funding not always clear).",
    considerations: {
      confounding: "Berry eaters tend to have healthier overall diets; residual confounding likely.",
      doseResponse: "Curvilinear — steeper benefit at lower intakes, plateauing; most benefit by a few servings/week.",
      substitution: "Benefit is clearest replacing lower-fibre snacks or sugary/tropical fruit and juice.",
    },
    studies: [
      {
        citation: "Guo X, et al. European Journal of Clinical Nutrition. 2016.",
        type: "Meta-analysis of prospective cohorts (~194,000)",
        finding: "Highest vs lowest berry intake associated with ~18% lower type-2-diabetes risk (RR 0.82, 0.76–0.89); graded dose-response.",
        search: "Guo anthocyanins berry fruits type 2 diabetes meta-analysis European Journal Clinical Nutrition 2016",
      },
      {
        citation: "Muraki I, et al. BMJ. 2013.",
        type: "Three US cohorts (~187,000)",
        finding: "Blueberries showed the strongest single-fruit signal: ~26% lower type-2-diabetes risk per 3 servings/week (HR 0.74).",
        search: "Muraki fruit consumption blueberries type 2 diabetes BMJ 2013",
      },
      {
        citation: "Cassidy A, et al. Circulation. 2013.",
        type: "Prospective cohort (~93,600 women, NHS II)",
        finding: "Highest anthocyanin intake (largely from berries) associated with ~32% lower myocardial-infarction risk (HR 0.68).",
        search: "Cassidy anthocyanin intake myocardial infarction women Circulation 2013",
      },
    ],
    lastReviewed: "2026-07-01",
    revisions: [
      { date: "2026-07-01", change: "New item — split conceptually from whole fruit as a likely stronger-than-fruit contender. Source-verified on Guo 2016 (T2D RR 0.82) + Muraki 2013 (blueberries 0.74) + Cassidy 2013 (anthocyanins/MI). Marked 'mixed' uniformity: the signal is concentrated in blueberries." },
    ],
  },

  // ============================ NEGATIVE ============================
  {
    id: "processed-meat",
    name: "Processed meats (bacon, sausage, deli, etc.)",
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
    lastReviewed: "2026-06-29",
    revisions: [
      { date: "2026-06-29", change: "Source-verified (grounding pass): colorectal-cancer RR 1.18 (1.10–1.28) per 50 g/day (Chan 2011 PLoS ONE; IARC 2015; WCRF/CUP 2017); dose curve now source-verified. Certainty (High) / verdict unchanged." },
      { date: "2026-07-01", change: "Added a per-outcome coronary-heart-disease verdict: RR 1.42 (1.07–1.89) per 50 g/day (Micha 2010 Circulation, ~614k) — a large effect attributed largely to sodium/preservatives. (Unprocessed red meat is null for CHD, RR 1.00, in the same paper.)" },
    ],
  },
  {
    id: "sugary-drinks",
    name: "Sugar-sweetened beverages (soda, etc.)",
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
    components: [
      {
        name: "Sugar (as liquid, no matrix)",
        worry: "It's just sugar — the same sugar that's in fruit, which we call positive.",
        resolution: "Same molecule, opposite outcome: liquid sugar with no fibre, water or polyphenols is absorbed fast with little satiety, and the cohorts show clear harm (diabetes, weight) — the mirror image of whole fruit. This is exactly why the model judges foods by outcomes, not by their component sugar.",
      },
    ],
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
      "Strong, coherent evidence: cohorts show a consistent dose-response, and controlled feeding trials prove the causal pathway (raising LDL while lowering HDL, an effect tightly linked to heart disease) — strong enough that the WHO called for global elimination. At the intakes where trans fat is actually eaten the effect is large, which is why it now sits in the high-confidence, large-effect group. Refers to industrial (partially hydrogenated) trans fat, not the natural ruminant trans fats in dairy/meat; now rare but still in some products.",
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
    lastReviewed: "2026-06-29",
    revisions: [
      { date: "2026-06-29", change: "Moderate → High under v0.5: scoring now credits a validated causal pathway (feeding-trial-proven LDL/HDL mechanism), and the cohort dose-response was recorded. Verdict (negative) unchanged." },
      { date: "2026-06-29", change: "v0.7: effect size re-based to realistic habitual intake (was 'per 2% energy', which understated it) → magnitude now Large, so trans fat joins the Bin fodder shortlist. Verdict unchanged." },
      { date: "2026-06-29", change: "Source-verified (grounding pass): industrial trans fat CHD RR 1.42 (1.05–1.92) highest vs lowest (de Souza 2015 BMJ); per-2%-energy 1.23 (1.11–1.37) (Mozaffarian 2006). pooledRR 1.35 → 1.42. Ruminant trans fat confirmed null. Certainty stays High; verdict unchanged." },
    ],
  },
  {
    id: "ultra-processed",
    name: "Ultra-processed foods (general)",
    category: "Other",
    effect: "negative",
    certainty: "moderate",
    outcomes: ["All-cause mortality", "Obesity", "Cardiovascular disease"],
    memberIntro: "The UPF harm does NOT generalise uniformly — NOVA's category is very mixed: animal-based products and sweetened drinks drive most of the signal, while some fibre-rich or fermented UPF look neutral or even beneficial.",
    members: [
      { name: "Sugary & diet drinks", tag: "worse", note: "Among the strongest-harm subgroups for cardiometabolic multimorbidity (HR ~1.09; Cordova 2023, EPIC)." },
      { name: "Processed meats", tag: "worse", note: "The animal-based UPF subgroup carried the highest disease association (Cordova 2023), matching known processed-meat harm." },
      { name: "Packaged snacks & confectionery", tag: "worse", note: "Energy-dense sweet/salty UPF track with the overall harm in dose-response mortality meta-analyses (Taneri 2024)." },
      { name: "Ready meals", tag: "weaker", note: "Contribute to the overall association but aren't a top-driving subgroup; harm partly confounded by diet quality (Cordova 2023)." },
      { name: "Sweetened breakfast cereals", tag: "weaker", note: "On the adverse side, but fortification/fibre attenuates the signal vs drinks and meats (Cordova 2023)." },
      { name: "Packaged wholegrain breads & cereals", tag: "good", note: "Inversely associated with disease (HR ~0.97) despite NOVA UPF status — attributed to fibre (Cordova 2023)." },
      { name: "Yogurt & dairy-based UPF", tag: "likely", note: "Share a favourable dairy/fermentation profile and aren't in the harmful subgroups (Cordova 2023); dedicated data limited." },
      { name: "Plant-based meat/dairy alternatives", tag: "likely", note: "Not significantly associated with disease in EPIC (Cordova 2023), but few long-term studies — an under-powered null." },
    ],
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
    lastReviewed: "2026-07-01",
    revisions: [
      { date: "2026-07-01", change: "Source-verified + re-grounded (grounding pass): all-cause mortality HR 1.15 (1.09–1.22) high vs low, 1.10 (1.04–1.16) per 10% increment (Liang 2025 Syst Rev, 18 cohorts, ~1.15M). pooledRR 1.25→1.15, N 300k→1.15M; heterogeneity corrected to high (I²=91%, direction-consistent). Certainty stays Moderate; verdict unchanged." },
    ],
  },
  {
    id: "refined-grains",
    name: "Refined grains (white bread, pastries, etc.)",
    category: "Grains",
    effect: "negative",
    certainty: "low",
    outcomes: ["All-cause mortality", "Cardiovascular disease"],
    summary: "Contested: some large cohorts link high intake to higher mortality/CVD, others find no CVD effect. We lean negative, but flag the dispute.",
    contested:
      "Credible meta-analyses genuinely disagree on the DIRECTION. Large global cohorts (PURE / Swaminathan 2021) link high refined-grain intake to higher mortality and major CVD; but other meta-analyses (Gaesser 2022 Trends Cardiovasc Med; Wei 2022 AJCN) find no association with CVD, CHD, or stroke — and Gaesser has grain-industry ties. The harm may be mostly relative to displacing whole grains, and it is intake- and population-dependent. We currently lean negative (on PURE), but treat this as unresolved pending a resolution pass — not a settled verdict.",
    rationale:
      "The harm is mostly relative (displacing whole grains and raising glycemic load) rather than absolute, and global cohort data are mixed by region — indeed contested (see below). Graded 'Low'.",
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
    lastReviewed: "2026-07-01",
    revisions: [
      { date: "2026-07-01", change: "Source-verified on PURE (Swaminathan 2021 BMJ): all-cause mortality HR 1.27 (1.11–1.46), major CVD 1.33 (1.16–1.52), ≥350 vs <50 g/day, ~149k. pooledRR 1.27 confirmed; N 137k→149k; headline outcome → all-cause mortality. Added a CONTESTED flag: Gaesser 2022 (grain-industry-funded) and Hu 2023 find no CVD association — credible sources disagree on direction, so we flag the dispute rather than assert. Verdict stays negative (leaning on PURE)." },
    ],
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
    lastReviewed: "2026-07-01",
    revisions: [
      { date: "2026-07-01", change: "Source-verified (grounding pass): per 1 egg/day CVD RR 0.98 (0.93–1.03), ~1.72M participants (Drouin-Chartier 2020 BMJ). Confirms neutral; population-dependent (Asian cohorts inverse). Verdict/certainty unchanged." },
    ],
  },
  {
    id: "red-meat",
    name: "Unprocessed red meat (beef, pork, etc.)",
    category: "Meat",
    effect: "neutral",
    certainty: "low",
    outcomes: ["All-cause mortality", "Type 2 diabetes"],
    summary: "Associations are weak, contested, and of low certainty — distinct from processed meat.",
    contested:
      "Genuinely contested (the NutriRECS controversy). The mortality signal is small, low-certainty and inconsistent across populations: Wang 2016 found unprocessed red meat NOT significantly associated with all-cause mortality overall (RR 1.10, 0.98–1.22), significant only in US cohorts; NutriRECS (Zeraatkar 2019) judged the evidence too weak to recommend cutting back — a conclusion others sharply disputed. We read the headline neutral (leaning bad). The diabetes association is firmer and separate (see the per-outcome verdict).",
    rationale:
      "Some cohorts show modestly higher risk, but a major systematic review judged the certainty low and the absolute effects small; experts genuinely disagree. We label this NEUTRAL/contested — the evidence base is large but conflicting, so 'Low' certainty rather than asserting harm.",
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
        citation: "Shi W, et al. European Heart Journal. 2023.",
        type: "Meta-analysis of cohorts (~4.5 million, 43 studies)",
        finding: "Unprocessed red meat: CVD HR 1.11 (1.05–1.16) per 100 g/day; the type 2 diabetes association is materially stronger and more consistent than the CVD/mortality one — supporting an outcome-specific split.",
        search: "Shi unprocessed processed red meat cardiovascular diabetes meta-analysis European Heart Journal 2023",
      },
      {
        citation: "Wang X, et al. (red meat & mortality).",
        type: "Meta-analysis of cohorts",
        finding: "Modest higher all-cause and CVD mortality at high intakes — smaller and less consistent than for processed meat.",
        search: "red meat consumption all-cause cardiovascular mortality meta-analysis cohort",
      },
    ],
    lastReviewed: "2026-06-29",
    revisions: [
      { date: "2026-06-29", change: "Very-low → Low under v0.11: neutral verdicts are now scored on the quality of the null evidence (not penalised for lacking an effect size). Red meat is data-rich but contested, which reads as Low, not Very-low. Verdict unchanged." },
      { date: "2026-07-01", change: "Source-verified headline (grounding pass): all-cause mortality RR 1.10 (0.98–1.22), NS (Wang 2016); low-certainty/contested (Zeraatkar 2019 NutriRECS, >4M). Added a CONTESTED flag (mortality signal small, population-dependent, expert dispute). Verdict/certainty unchanged; the T2D per-outcome verdict stands." },
    ],
  },
  {
    id: "poultry",
    name: "Poultry (chicken, turkey, etc.)",
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
    certainty: "low",
    outcomes: ["All-cause mortality", "Cardiovascular disease"],
    summary: "Overall associations with mortality and heart disease are roughly neutral.",
    rationale:
      "Large global cohorts find little net association with hard outcomes, and the long-assumed penalty for whole-fat milk is not well supported. The neutral direction is reasonably consistent but rests on a near-null effect with no hard-outcome trials.",
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
    lastReviewed: "2026-07-01",
    revisions: [
      { date: "2026-07-01", change: "Source-verified (grounding pass): all-cause mortality RR ~0.99 (0.95–1.03) per 200 mL/day (Larsson dose-response MA) → neutral confirmed. pooledRR 0.98→0.99, N up. Clarified that PURE's protective 0.83/0.78 figures are for TOTAL DAIRY, not milk alone. Verdict/certainty unchanged." },
    ],
  },
  {
    id: "cheese",
    name: "Cheese",
    category: "Dairy",
    effect: "positive",
    certainty: "low",
    outcomes: ["Cardiovascular disease"],
    summary: "Despite saturated fat and salt, higher intake tracks with modestly LOWER cardiovascular risk — but only at low certainty.",
    rationale:
      "The strongest cheese-CVD meta-analysis (Chen 2017, 15 cohorts) finds modest protection — total CVD RR 0.90 (0.82–0.99), CHD 0.86 — peaking near 40 g/day, plausibly via the fermented 'dairy matrix'. The interval excludes no-effect, so by our rule this earns a directional (positive) label rather than neutral; but it is borderline (upper CI 0.99), high-vs-low (not dose-response), confounding-prone, with a null stroke result and no hard-outcome trials — so certainty computes to Low. 'Positive · Low' is the honest reading of a marginal protective signal.",
    considerations: {
      confounding: "Cheese is embedded in varied dietary patterns; hard to isolate.",
      doseResponse: "Some analyses suggest a shallow U-shape (modest intake ≈ lowest risk).",
    },
    studies: [
      {
        citation: "Chen GC, et al. European Journal of Nutrition. 2017.",
        type: "Meta-analysis of 15 prospective cohorts",
        finding: "Higher cheese intake associated with lower total CVD (RR 0.90, 0.82–0.99) and CHD (0.86, 0.77–0.96); non-linear, largest reduction ~40 g/day. (Modest, high-vs-low, confounding-prone.)",
        search: "Chen cheese consumption cardiovascular disease meta-analysis European Journal Nutrition 2017",
      },
      {
        citation: "de Goede J, et al. J Am Heart Assoc. 2016.",
        type: "Dose-response meta-analysis (stroke; 18 studies, ~762,000)",
        finding: "Cheese ~marginally inversely associated with stroke (RR 0.97, 0.94–1.01 per 40 g/day) — not significant (null).",
        search: "de Goede cheese stroke dose-response meta-analysis JAHA 2016",
      },
    ],
    lastReviewed: "2026-06-28",
    revisions: [
      { date: "2026-06-28", change: "Certainty refined from Moderate to Low under v0.3 explicit scoring (thin evidence base; the neutral verdict is unchanged)." },
      { date: "2026-06-29", change: "Neutral → Positive (Low) under the grounding pass (v0.19): source-verified on Chen 2017 (the strongest cheese-CVD MA), total CVD RR 0.90 (0.82–0.99) excludes null. Resolved BY THE RULE, not by judgement — a CI excluding null earns a directional label and the borderline evidence is carried by the Low certainty tier (stroke is null; confounding-prone). pooledRR 0.96 → 0.90." },
    ],
  },
  {
    id: "butter",
    name: "Butter",
    category: "Fats & oils",
    effect: "neutral",
    certainty: "moderate",
    outcomes: ["All-cause mortality", "Cardiovascular disease"],
    summary: "Only weakly associated with mortality and not clearly with heart disease.",
    rationale:
      "A large meta-analysis found small, mostly non-significant associations — a fairly well-established near-null, so 'Moderate' certainty that butter is roughly neutral. The verdict is highly substitution-dependent (worse than olive oil, better than trans fat).",
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
    lastReviewed: "2026-06-29",
    revisions: [
      { date: "2026-06-29", change: "Low → Moderate under v0.11: neutral verdicts are now scored on the strength of the null evidence; butter's near-null is well-established (large meta-analysis), so Moderate. Verdict unchanged." },
      { date: "2026-06-29", change: "Source-verified (grounding pass): RR 1.0134 (1.0003–1.0266, P=0.045) per 14 g/day, I²=0% (Pimpin 2016). Heterogeneity corrected moderate → low. The CI marginally excludes null but the ~1% effect is trivially small, so kept neutral (not a 'butter is back' benefit — it's a tiny harm/null). Certainty stays Moderate." },
    ],
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
      "With fried potatoes split out (see French fries), boiled/baked/mashed potatoes are near-neutral: Mousavi 2025 (BMJ, three US cohorts) found them not associated with type-2 diabetes (HR 1.01, 0.98–1.05). High glycemic load, but the outcome data are flat — neutral at Low certainty.",
    considerations: {
      substitution: "High glycemic load means swaps to whole grains/legumes look better in models.",
      doseResponse: "Risk signals appear mainly for fried forms (now a separate item).",
    },
    studies: [
      {
        citation: "Mousavi SM, et al. BMJ. 2025.",
        type: "Three US cohorts (~205,000; 22,299 T2D cases)",
        finding: "Baked/boiled/mashed potatoes not associated with type-2 diabetes (HR 1.01, 0.98–1.05); French fries were (1.20).",
        search: "Mousavi potato french fries type 2 diabetes BMJ 2025",
        url: "https://www.bmj.com/content/390/bmj-2025-082121",
      },
    ],
    lastReviewed: "2026-06-29",
    revisions: [
      { date: "2026-06-29", change: "Very-low → Low under v0.11 neutral-scoring (data exists but is heterogeneous by preparation). Verdict unchanged." },
      { date: "2026-06-29", change: "Source-verified + scoped to non-fried (v0.26): Mousavi 2025 BMJ confirms baked/boiled/mashed potatoes are null for T2D (HR 1.01, 0.98–1.05); fried potatoes split into a separate 'French fries' item. pooledRR 1.05 → 1.01. Verdict (neutral) unchanged." },
    ],
  },
  {
    id: "french-fries",
    name: "French fries / fried potatoes",
    category: "Vegetables",
    effect: "negative",
    certainty: "low",
    outcomes: ["Type 2 diabetes"],
    summary: "Unlike plain potatoes, fries raise type-2 diabetes risk — a clean 'preparation matters' contrast.",
    rationale:
      "Split out from potatoes on the strength of Mousavi 2025 (BMJ, three US cohorts): +3 servings/week of French fries raised type-2 diabetes risk 20% (HR 1.20, 1.12–1.28), while baked/boiled/mashed potatoes were null — the difference is the frying (added fat, very high glycemic load, acrylamide). Certainty is Low: one (strong, recent) cohort set, heavily confounded by overall diet.",
    considerations: {
      substitution: "Swapping ~3 servings/week of fries for whole grains lowers modeled T2D risk ~17–19%.",
      confounding: "Fries strongly mark an unhealthy overall pattern (fast food, low veg); residual confounding likely.",
    },
    components: [
      {
        name: "The frying (fat + high GL + acrylamide)",
        worry: "It's still just potato — why is this negative when boiled potato is neutral?",
        resolution: "Same base food, different outcome: in the same cohorts fries raise T2D (HR 1.20) while baked/boiled are null (1.01). The preparation, not the potato, carries the harm — which is exactly why we score the food-as-eaten, not the raw ingredient.",
      },
    ],
    studies: [
      {
        citation: "Mousavi SM, et al. BMJ. 2025.",
        type: "Three US cohorts (~205,000; 5.2M person-years)",
        finding: "+3 servings/week French fries: type-2 diabetes HR 1.20 (1.12–1.28); baked/boiled/mashed null (1.01).",
        search: "Mousavi french fries fried potato type 2 diabetes BMJ 2025",
        url: "https://www.bmj.com/content/390/bmj-2025-082121",
      },
    ],
    lastReviewed: "2026-06-29",
    revisions: [
      { date: "2026-06-29", change: "New item (v0.26), split from potatoes and source-verified on Mousavi 2025 BMJ — French fries are negative for T2D (HR 1.20) where plain potatoes are null." },
    ],
  },
  {
    id: "alcohol",
    name: "Alcohol",
    category: "Beverages",
    effect: "negative",
    certainty: "low",
    outcomes: ["All-cause mortality", "Cancer"],
    summary: "No safe level: the old 'J-curve' is a bias artifact — mortality rises with intake and cancer climbs from the first drink.",
    rationale:
      "Earlier cohorts suggested a protective J-curve, but correcting 'sick-quitter'/abstainer bias removes it (Zhao/Stockwell 2023, 107 cohorts, ~4.84M): all-cause mortality rises with dose — significant from ~25 g/day in women and ~45 g/day in men — and cancer rises from the very first drink (IARC Group 1). Regrounded (v0.44) from neutral to NEGATIVE: the previous 'neutral' rested on the flattering low-volume contrast, which isn't the honest answer to 'what happens when you add alcohol to your diet.' Low certainty reflects high confounding and heterogeneity, not doubt about the direction. WHO 2023: no safe level.",
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
    lastReviewed: "2026-07-01",
    revisions: [
      {
        date: "2026-06-28",
        change: "Moved from 'positive (J-curve)' framing to NEUTRAL/contested, reflecting bias-corrected meta-analyses.",
      },
      { date: "2026-07-01", change: "Source-verified headline (grounding pass): all-cause mortality low-volume RR 0.93 (0.85–1.01), NS after abstainer/sick-quitter bias adjustment (Zhao/Stockwell 2023, 107 cohorts, ~4.84M) — recorded as null. The cancer per-outcome verdict stands. Verdict/certainty unchanged." },
    ],
  },
  {
    id: "artificial-sweeteners",
    name: "Artificial sweeteners",
    category: "Other",
    effect: "neutral",
    certainty: "low",
    outcomes: ["Type 2 diabetes", "Cardiovascular disease"],
    memberIntro: "The 'neutral' verdict is a class average that hides real divergence — most high-intensity sweeteners look broadly benign in humans, but two polyols (erythritol, xylitol) carry a distinct cardiovascular/clotting signal.",
    members: [
      { name: "Stevia (steviol glycosides)", tag: "likely", note: "Plant-derived, FDA GRAS (2018); no established harmful human effect — but often blended with erythritol, which is the concern." },
      { name: "Sucralose", tag: "likely", note: "Considered safe at approved intakes; some mechanistic concerns (Schiffman 2023) but no consistent hard-outcome harm." },
      { name: "Saccharin", tag: "likely", note: "The old rodent bladder-tumour finding never confirmed in humans; delisted as a carcinogen." },
      { name: "Aspartame", tag: "weaker", note: "IARC Group 2B ('possibly carcinogenic', limited evidence) in 2023, though JECFA/FDA kept the ADI and found the human link unconvincing." },
      { name: "Acesulfame-K", tag: "unknown", note: "Approved as safe but among the least-studied on its own for long-term human outcomes." },
      { name: "Sorbitol", tag: "weaker", note: "Sugar alcohol; systemically benign but dose-dependent laxative/GI effects; not implicated in the clotting findings." },
      { name: "Erythritol", tag: "worse", note: "Linked to 3-year cardiovascular events and shown to promote platelet aggregation/thrombosis (Witkowski/Hazen 2023, Nature Medicine)." },
      { name: "Xylitol", tag: "worse", note: "Prothrombotic and associated with incident cardiovascular events (HR ~1.57 high vs low; Hazen 2024, Eur Heart J)." },
    ],
    summary: "Genuinely mixed evidence; net long-term effect is uncertain.",
    contested:
      "Cohort and trial evidence point opposite ways. Observational cohorts link higher intake to more CVD (Debras 2022, HR 1.09, 1.01–1.18) — but this is reverse-causation-prone (at-risk people switch to diet products), and substitution RCTs plus Mendelian-randomization generally show NO causal harm (and benefit vs sugar). The WHO's 2023 advice against non-sugar sweeteners is itself conditional, low-certainty. So the direction is genuinely disputed; we hold neutral and flag it rather than pick a side.",
    rationale:
      "Some cohorts link them to cardiometabolic risk (likely partly reverse causation — at-risk people switch to them), while substitution trials replacing sugary drinks show short-term benefit. Large but conflicting evidence → NEUTRAL at 'Low' certainty; flagged as unsettled.",
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
    lastReviewed: "2026-06-29",
    revisions: [
      { date: "2026-06-29", change: "Very-low → Low under v0.11 neutral-scoring (a large cohort exists, though conflicting). Verdict (neutral/unsettled) unchanged." },
      { date: "2026-07-01", change: "Grounding pass: confirmed the cohort signal (Debras 2022 BMJ NutriNet-Santé, total sweeteners CVD HR 1.09, 1.01–1.18, ~103k) but that substitution RCTs / Mendelian randomization show no causal harm → added a CONTESTED flag (cohort-vs-trial disagreement). Left verified:false — we record the net-uncertain neutral, not the Debras harm figure. Verdict unchanged." },
    ],
  },
  {
    id: "coconut-oil",
    name: "Coconut oil",
    category: "Fats & oils",
    effect: "neutral",
    certainty: "very-low",
    outcomes: ["Cardiovascular risk markers"],
    summary: "Raises LDL like other saturated fats; little direct outcome data — treat as a saturated fat.",
    rationale:
      "Controlled trials show it raises LDL cholesterol versus unsaturated oils, but there is essentially no direct cohort evidence on heart attacks or mortality, and no support for special benefit. Neutral-pending, with very low certainty given the absent outcome data.",
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

  // ===================== ADDED v0.12 (research-grounded) =====================
  {
    id: "green-tea",
    name: "Tea (green or black)",
    category: "Beverages",
    effect: "positive",
    certainty: "moderate",
    outcomes: ["Cardiovascular disease", "Stroke"],
    summary: "A few cups a day track with modestly lower cardiovascular and stroke risk.",
    rationale:
      "Large dose-response cohort meta-analyses show a consistent, modest inverse association that plateaus around 2–3 cups/day. No trial on hard outcomes exists and short-term trials show no biomarker change, so causal certainty is capped — but the cohort signal is broad and graded.",
    considerations: {
      confounding: "Tea drinkers tend to have healthier lifestyles; residual confounding likely inflates the effect.",
      substitution: "Benefit is clearest when tea replaces sugary drinks.",
    },
    studies: [
      {
        citation: "Chung M, et al. Advances in Nutrition. 2020.",
        type: "Dose-response meta-analysis of ~39 cohorts",
        finding: "Each cup/day associated with ~4% lower CVD mortality and stroke; benefit plateaus ~3 cups/day.",
        search: "Chung tea consumption cardiovascular mortality dose-response Advances in Nutrition 2020",
      },
    ],
    lastReviewed: "2026-06-29",
    revisions: [],
  },
  {
    id: "white-rice",
    name: "White rice",
    category: "Grains",
    effect: "negative",
    certainty: "moderate",
    outcomes: ["Type 2 diabetes"],
    summary: "Higher intake raises type 2 diabetes risk — but is roughly neutral for heart disease and mortality.",
    rationale:
      "A large dose-response meta-analysis links higher white-rice intake to type 2 diabetes (moderate certainty) with a clear gradient, much stronger in high-intake Asian populations; associations with CVD, cancer and mortality are null. The harm is mostly relative — replacing it with whole grains lowers risk.",
    considerations: {
      substitution: "Swapping white rice for whole grains lowers modeled diabetes risk; the effect is about glycemic load.",
      confounding: "Tied to socioeconomic status and overall diet; isolating rice overstates it.",
      doseResponse: "~6% higher diabetes risk per extra 150 g/day; far larger in rice-staple populations.",
    },
    studies: [
      {
        citation: "Yu J, Balaji B, et al. BMJ Open. 2022.",
        type: "Systematic review & meta-analysis (8 cohorts, ~577,000; 25,956 cases)",
        finding: "Extreme-category white rice RR 1.16 (1.02–1.32) for type 2 diabetes; non-linear (≈neutral to ~1 serving/day, rising above ~300 g/day); brown rice protective (RR 0.89).",
        search: "Yu Balaji white rice brown rice type 2 diabetes meta-analysis BMJ Open 2022",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9516166/",
      },
      {
        citation: "Hu EA, et al. BMJ. 2012.",
        type: "Meta-analysis of cohorts",
        finding: "White-rice–diabetes association much stronger in Asian (RR ~1.55) than Western (~1.12) populations.",
        search: "Hu white rice type 2 diabetes BMJ 2012",
      },
    ],
    lastReviewed: "2026-06-29",
    revisions: [
      { date: "2026-06-29", change: "Re-grounded under the grounding pass (v0.15) on Yu/Balaji 2022 BMJ Open (the strongest current MA): extreme-category RR 1.18 → 1.16 (95% CI 1.02–1.32), participants/source corrected, and the association recorded as non-linear (≈neutral to ~300 g/day, then rising — which explains the Asian-vs-Western gap). Verdict (negative for diabetes) and certainty unchanged; now source-verified." },
    ],
  },
  {
    id: "soy",
    name: "Soy foods (tofu, soy milk, edamame, etc.)",
    category: "Legumes",
    effect: "positive",
    certainty: "moderate",
    outcomes: ["Cancer mortality"],
    summary: "Regular soy foods track with modestly lower cancer mortality.",
    rationale:
      "Dose-response cohort meta-analyses show higher soy/isoflavone intake associated with lower cancer (and all-cause) mortality, supported by isoflavone trials on intermediate markers. Mostly Asian-population data (confounding) and no hard-outcome trials, so moderate certainty.",
    considerations: {
      substitution: "Benefit partly reflects soy replacing red/processed meat.",
      confounding: "Intake concentrated in Asian populations with broader dietary differences.",
    },
    studies: [
      {
        citation: "Nachvak SM, et al. Journal of the Academy of Nutrition and Dietetics. 2019.",
        type: "Dose-response meta-analysis (23 cohorts, ~331,000)",
        finding: "Higher soy intake associated with ~12% lower cancer mortality; ~10% lower all-cause mortality for isoflavones.",
        search: "Nachvak soy isoflavone mortality dose-response meta-analysis 2019",
      },
    ],
    lastReviewed: "2026-07-01",
    revisions: [
      { date: "2026-07-01", change: "Source-verified (grounding pass): cancer mortality RR 0.88 (0.79–0.99), ~331k, dose-responsive per 10 mg/day isoflavones (Nachvak 2019). Confirms the figure; strongest in high-intake Asian cohorts. Verdict/certainty unchanged." },
    ],
  },
  {
    id: "cruciferous",
    name: "Cruciferous vegetables (broccoli, cabbage, etc.)",
    category: "Vegetables",
    effect: "positive",
    certainty: "moderate",
    outcomes: ["All-cause mortality", "Cardiovascular disease", "Cancer"],
    summary: "Part of the broadly-protective vegetable signal, with some cruciferous-specific cancer evidence.",
    rationale:
      "Rests largely on the strong fruit-and-vegetable dose-response (each 200 g/day → lower CVD and mortality), plus cruciferous-specific cancer associations. Cruciferous-only hard-outcome data are thinner than the produce umbrella, so moderate not high.",
    considerations: {
      confounding: "Vegetable intake strongly marks an overall healthy lifestyle.",
      substitution: "Benefit clearest when displacing refined/processed foods.",
    },
    studies: [
      {
        citation: "Aune D, et al. International Journal of Epidemiology. 2017.",
        type: "Dose-response meta-analysis (~2 million)",
        finding: "Higher fruit & vegetable intake (incl. cruciferous) linked to lower CVD and all-cause mortality; benefit to ~800 g/day.",
        search: "Aune fruit vegetable intake cardiovascular cancer mortality 2017",
      },
    ],
    lastReviewed: "2026-06-29",
    revisions: [
      { date: "2026-07-01", change: "Added 'All-cause mortality' to the recorded outcomes (v0.31) — already part of the cited F&V dose-response evidence (Aune 2017), so this aligns the outcomes list with the evidence and applies the all-cause magnitude bump, putting cruciferous on the cusp of Gold standard. The RR remains borrowed from the produce umbrella; a cruciferous-specific re-grounding is still queued. Verdict/certainty unchanged." },
    ],
  },
  {
    id: "tomatoes",
    name: "Tomatoes",
    category: "Vegetables",
    effect: "neutral",
    certainty: "low",
    outcomes: ["Cancer"],
    summary: "A modest cancer signal exists, but it's driven by blood lycopene, not clearly by eating tomatoes.",
    rationale:
      "The protective association is largely tied to the lycopene BIOMARKER (blood level), which tracks an overall healthy diet, rather than to dietary tomato intake — so we don't assert a food-level benefit. Neutral, leaning positive, at low certainty; tomatoes remain part of the broadly-beneficial vegetable group.",
    considerations: {
      confounding: "Blood lycopene is confounded with overall healthy eating; not the same as tomato intake.",
    },
    studies: [
      {
        citation: "Lycopene & cancer (blood-biomarker meta-analyses).",
        type: "Meta-analyses of cohorts (biomarker-based)",
        finding: "Higher blood lycopene associated with ~5% lower overall cancer and ~11% lower prostate cancer; dietary-intake signal weaker.",
        search: "blood lycopene cancer prostate meta-analysis cohort",
      },
    ],
    lastReviewed: "2026-06-29",
    revisions: [],
  },
  {
    id: "cocoa",
    name: "Dark chocolate / cocoa",
    category: "Sweets",
    effect: "neutral",
    certainty: "low",
    outcomes: ["Cardiovascular disease"],
    summary: "The one big trial found no significant effect on cardiovascular events — neutral, not a superfood.",
    rationale:
      "COSMOS, the only large RCT on hard outcomes, found cocoa-flavanol supplements did not significantly reduce total cardiovascular events (a secondary CVD-death signal aside). A single, industry-co-funded trial of moderate size gives only low certainty — and chocolate the food carries sugar and fat the flavanol extract doesn't.",
    considerations: {
      substitution: "Dark chocolate the food ≠ the flavanol extract trialled; added sugar/fat matter.",
    },
    components: [
      {
        name: "Saturated fat (cocoa butter)",
        worry: "Saturated fat raises LDL cholesterol, so chocolate must be bad for the heart.",
        resolution: "Cocoa butter's saturated fat is largely stearic acid (18:0), which is broadly LDL-neutral — unlike the palmitic/myristic acid in processed meat. The component label hides this; the outcome data (COSMOS null, not harmful) is what adjudicates.",
      },
      {
        name: "Added sugar",
        worry: "A chocolate bar carries sugar the trialled flavanol extract didn't.",
        resolution: "A fair caveat — it's why we judge the food, not the extract. But the observed cardiovascular outcomes for chocolate are roughly neutral, not the harm a sugar-only lens predicts; the verdict follows the outcomes.",
      },
    ],
    studies: [
      {
        citation: "Sesso HD, et al. (COSMOS). American Journal of Clinical Nutrition. 2022.",
        type: "Randomized controlled trial (~21,400)",
        finding: "Cocoa flavanols did not significantly cut total cardiovascular events (HR 0.90, 95% CI 0.78–1.02).",
        search: "Sesso COSMOS cocoa flavanol cardiovascular AJCN 2022",
      },
    ],
    lastReviewed: "2026-07-01",
    revisions: [
      { date: "2026-07-01", change: "Source-verified (grounding pass): COSMOS primary CVD outcome HR 0.90 (0.78–1.02), P=0.11 — NS (Sesso 2022 AJCN, 21,442 randomized). Confirms the trial-grade neutral; NIH-funded but Mars supplied the product. Verdict/certainty unchanged." },
    ],
  },
  {
    id: "wholemeal-bread",
    name: "Wholemeal / wholegrain bread",
    category: "Grains",
    effect: "positive",
    certainty: "moderate",
    outcomes: ["Type 2 diabetes", "Colorectal cancer"],
    summary: "The wholegrain form of the staple — linked to clearly lower type-2-diabetes risk, unlike white bread.",
    rationale:
      "In three large US cohorts (~195,000), dark/wholegrain bread was associated with ~21% lower type-2-diabetes risk at ≥1 serving/day vs <1/month (Hu 2020, HR 0.79, 0.75–0.83), and wholegrain bread tracks lower colorectal cancer and cancer mortality (Bao 2024). It carries the whole-grain benefit in bread form, and the direct food-level contrast with white bread is the cleanest 'wholemeal vs white' evidence we have. Moderate certainty: observational with healthy-user confounding, and it still carries a bread-typical sodium load.",
    considerations: {
      substitution: "Most of the gain is swapping FROM white bread; wholemeal vs no bread at all is a smaller question.",
      sodium: "Still a leading sodium source (~150 mg/slice) — wholemeal isn't automatically low-salt; check labels.",
      confounding: "Wholemeal eaters tend to have healthier overall diets; residual confounding likely.",
    },
    studies: [
      { citation: "Hu Y, et al. BMJ. 2020.", type: "Prospective cohorts (~195,000; NHS, NHS II, HPFS)", finding: "Dark/wholegrain bread ≥1 serving/day vs <1/month: ~21% lower type-2-diabetes risk (HR 0.79, 0.75–0.83); white bread carried higher risk.", search: "Hu wholegrain foods individual type 2 diabetes BMJ 2020 m2206" },
      { citation: "Bao/Wang, et al. Current Developments in Nutrition. 2024.", type: "Meta-analysis (24 publications, ~1.89M)", finding: "Wholegrain/nonwhite bread associated with lower colorectal cancer and total cancer mortality; total bread neutral for site-specific cancer.", search: "bread intake cancer mortality meta-analysis Current Developments Nutrition 2024" },
    ],
    lastReviewed: "2026-07-01",
    revisions: [],
  },
  {
    id: "white-bread",
    name: "White bread",
    category: "Grains",
    effect: "neutral",
    certainty: "low",
    outcomes: ["Type 2 diabetes"],
    summary: "No real benefit, patterns with refined grains, and the single biggest source of dietary salt.",
    rationale:
      "Bread-specific hard-outcome evidence for white bread is weak: it shows no protection for CVD/mortality (Aune 2016) and higher type-2-diabetes risk than wholegrain bread (Hu 2020), plus a weight-gain signal (SUN cohort, overweight/obesity OR 1.40). We record it NEUTRAL (no proven independent harm) but LEANING BAD — it's a high-glycemic refined grain, and because nearly everyone eats it, the #1 source of dietary sodium. The clearest move is swapping toward wholemeal.",
    considerations: {
      substitution: "The clearest move is swapping white → wholemeal bread, not necessarily cutting bread entirely.",
      sodium: "Bread is the #1 population source of dietary sodium (~7% of US intake, ~17% of UK salt); ~130–230 mg per slice.",
      glycemic: "High glycemic load; patterns with our (negative) refined-grains verdict.",
    },
    studies: [
      { citation: "Hu Y, et al. BMJ. 2020.", type: "Prospective cohorts (~195,000)", finding: "White bread associated with higher type-2-diabetes risk than dark/wholegrain bread.", search: "Hu white bread type 2 diabetes BMJ 2020 m2206" },
      { citation: "CDC Vital Signs. MMWR. 2012.", type: "Population intake analysis", finding: "Bread & rolls are the #1 single food source of sodium in the US diet (~7.4% of intake).", search: "CDC vital signs sodium bread rolls top source 2012" },
    ],
    lastReviewed: "2026-07-01",
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

// Per-food evidence FACTS. Scores are computed from these by scoring.js — never
// hand-assigned. Numeric facts (pooledRR, participants) come from the cited
// studies; ordinal facts (heterogeneity, confoundingRisk, etc.) are recorded,
// individually inspectable judgements about the evidence base. `pooledRR` is the
// risk at REALISTIC habitual intake (see `intakeBasis`), not per arbitrary small
// unit. Correct any fact and the score (and tier) recompute.
//
// PROVENANCE (grounding pass): once a food's score-driving figures are checked
// against the actual papers, set `verified: true` and add a `sources` map. Each
// entry pins a fact to a citable figure, enforced by a test:
//   sources: {
//     pooledRR:     { figure: "RR 0.78 (0.72–0.84), per 28 g/day, all-cause mortality",
//                     cite: "Aune 2016 BMC Medicine", id: "PMID:27916000" },
//     participants: { figure: "~819,000 across 20 cohorts", cite: "Aune 2016 BMC Medicine", id: "PMID:27916000" },
//   }
// `id` must be a PMID ("PMID:NNNN") or a DOI ("10.xxxx/..."). Until verified, the
// app shows a "facts estimated" provenance chip and the data-status banner counts
// it as unverified.
const ASSESSMENTS = {
  "wholemeal-bread": {
    evidence: { pooledRR: 0.79, ciExcludesNull: true, participants: 195000, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "graded", rctLevel: "markers", funding: "independent", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: "≥1 serving/day (~2–3 slices) vs <1/month" },
    effectEstimate: "Type-2 diabetes HR 0.79 (0.75–0.83) for dark/wholegrain bread ≥1 serving/day vs <1/month (Hu 2020, 3 US cohorts); lower colorectal cancer and cancer mortality (Bao 2024). The wholegrain benefit in bread form; contrasts directly with white bread.",
    verified: true,
    sources: {
      pooledRR: { figure: "Dark bread & T2D HR 0.79 (0.75–0.83), ≥1 serving/day vs <1/month", cite: "Hu 2020 BMJ", id: "PMID:32641435" },
      participants: { figure: "~195,000 across NHS, NHS II, HPFS", cite: "Hu 2020 BMJ", id: "PMID:32641435" },
    },
    doseCurve: {
      outcome: "Type 2 diabetes", unit: "slices/day", shape: "plateau-benefit", normalRange: [0, 3],
      points: [ { x: 0, rr: 1.0 }, { x: 1, rr: 0.90 }, { x: 2, rr: 0.82 }, { x: 3, rr: 0.79, lo: 0.75, hi: 0.83 } ],
      note: "Lower type-2-diabetes risk with more wholegrain bread, flattening by ~2–3 slices/day; ~1 serving ≈ 1–2 slices. Points approximated from the reported category contrast (Hu 2020).",
      source: { cite: "Hu 2020 BMJ", id: "PMID:32641435" }, verified: false,
    },
  },
  "white-bread": {
    evidence: { pooledRR: 1.05, ciExcludesNull: false, participants: 200000, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "some", rctLevel: "markers", funding: "independent", pubBias: "untested", confoundingRisk: "high", intakeBasis: "~2–3 slices/day (~66–80 g/day), typical habitual intake" },
    effectEstimate: "No protection for CVD/all-cause mortality (Aune 2016) and higher type-2-diabetes risk than wholegrain bread (Hu 2020); a weight-gain signal (SUN, overweight/obesity OR 1.40). Recorded neutral (no proven independent hard-outcome harm) but leaning bad — refined, high-glycemic, and the leading dietary sodium source.",
    verified: false,
    sources: {},
  },
  "berries": {
    evidence: { pooledRR: 0.82, ciExcludesNull: true, participants: 194019, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "graded", rctLevel: "markers", funding: "unknown", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: "highest vs lowest intake (~17 g/day increments)" },
    effectEstimate: "Type-2-diabetes RR 0.82 (95% CI 0.76–0.89) high vs low (Guo 2016, ~194k); blueberry-specific HR ~0.74 per 3 servings/week (Muraki 2013). Anthocyanin RCTs improve vascular markers (Curtis 2019). Strongest for blueberries.",
    verified: true,
    sources: {
      pooledRR: { figure: "T2D RR 0.82 (0.76–0.89) high vs low; blueberries HR 0.74 (Muraki 2013)", cite: "Guo 2016 Eur J Clin Nutr; Muraki 2013 BMJ", id: "PMID:27530472" },
      participants: { figure: "194,019 participants, 13,013 T2D cases, 5 cohorts (Guo 2016)", cite: "Guo 2016 Eur J Clin Nutr", id: "PMID:27530472" },
    },
    doseCurve: {
      outcome: "Type 2 diabetes", unit: "servings/week", shape: "plateau-benefit", normalRange: [1, 4],
      points: [ { x: 0, rr: 1.0 }, { x: 1.5, rr: 0.88 }, { x: 3, rr: 0.82, lo: 0.76, hi: 0.89 }, { x: 5, rr: 0.80 } ],
      note: "Curvilinear — steeper benefit at low intake, plateauing by a few servings/week. Intermediate points approximated from the reported gradient.",
      source: { cite: "Guo 2016 Eur J Clin Nutr; Muraki 2013 BMJ", id: "PMID:27530472" }, verified: false,
    },
  },
  "tree-nuts": {
    evidence: { pooledRR: 0.78, ciExcludesNull: true, participants: 819448, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "graded", rctLevel: "pattern", funding: "independent", pubBias: "tested-clean", confoundingRisk: "moderate", intakeBasis: "~28 g/day (a daily handful) vs none" },
    effectEstimate: "RR 0.78 (95% CI 0.72–0.84) for all-cause mortality per 28 g/day; interval excludes no-effect → lower risk. I²=66% (dose-response).",
    verified: true,
    sources: {
      pooledRR: { figure: "RR 0.78 (0.72–0.84) per 28 g/day, all-cause mortality; I²=66%", cite: "Aune 2016 BMC Medicine", id: "PMID:27916000" },
      participants: { figure: "819,448 participants, 85,870 deaths, 15 cohorts", cite: "Aune 2016 BMC Medicine", id: "PMID:27916000" },
    },
    doseCurve: {
      outcome: "All-cause mortality", unit: "g/day", shape: "plateau-benefit", normalRange: [0, 30],
      points: [ { x: 0, rr: 1.0 }, { x: 15, rr: 0.86 }, { x: 28, rr: 0.78, lo: 0.72, hi: 0.84 }, { x: 45, rr: 0.80 } ],
      note: "Most of the benefit is reached by ~15–28 g/day; eating more does little extra.",
      source: { cite: "Aune 2016 BMC Medicine", id: "PMID:27916000" }, verified: false,
    },
  },
  "legumes": {
    evidence: { pooledRR: 0.94, ciExcludesNull: true, participants: 1141793, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "graded", rctLevel: "markers", funding: "independent", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: "highest vs lowest habitual intake (per 50 g/day: 0.94)" },
    effectEstimate: "All-cause mortality HR 0.94 (95% CI 0.91–0.98) highest vs lowest, and 0.94 (0.89–0.99) per 50 g/day (Zargarzadeh 2023, 32 cohorts, ~1.14M). CHD is weaker (~0.90 high-vs-low; per-50g NS). NOTE: the type-2-diabetes benefit is SOY-specific — total legumes are not significantly associated with T2D (Tang 2020) — so it's dropped from the headline.",
    verified: true,
    sources: {
      pooledRR: { figure: "All-cause mortality HR 0.94 (0.91–0.98) high vs low; 0.94 (0.89–0.99) per 50 g/day", cite: "Zargarzadeh 2023 Adv Nutr", id: "PMID:36811595" },
      participants: { figure: "1,141,793 participants, 93,373 deaths, 32 cohorts", cite: "Zargarzadeh 2023 Adv Nutr", id: "PMID:36811595" },
    },
    doseCurve: {
      outcome: "All-cause mortality", unit: "g/day", shape: "plateau-benefit", normalRange: [50, 100],
      points: [ { x: 0, rr: 1.0 }, { x: 50, rr: 0.94, lo: 0.89, hi: 0.99 }, { x: 100, rr: 0.92 } ],
      note: "≈6% lower mortality per 50 g/day, with curvilinear flattening. A small effect; intermediate detail limited.",
      source: { cite: "Zargarzadeh 2023 Adv Nutr", id: "PMID:36811595" }, verified: false,
    },
  },
  "whole-grains": {
    evidence: { pooledRR: 0.83, ciExcludesNull: true, participants: 700000, heterogeneity: "high", directionallyConsistent: true, outcomeType: "hard", doseResponse: "graded", rctLevel: "markers", funding: "independent", pubBias: "tested-clean", confoundingRisk: "moderate", intakeBasis: "~90 g/day vs low intake" },
    effectEstimate: "≈17% lower all-cause mortality at 90 g/day (RR ≈ 0.83, 95% CI 0.77–0.90); clear dose-response, interval excludes no-effect. High between-study heterogeneity (I²=83%) — cohorts agree on direction, not magnitude.",
    verified: true,
    sources: {
      pooledRR: { figure: "RR 0.83 (0.77–0.90) per 90 g/day, all-cause mortality; I²=83%, 11 cohorts", cite: "Aune 2016 BMJ", id: "PMID:27301975" },
      participants: { figure: "11 prospective cohorts, ~100,726 deaths (aggregate N ≥ 500,000)", cite: "Aune 2016 BMJ", id: "PMID:27301975" },
    },
    doseCurve: {
      outcome: "All-cause mortality", unit: "g/day", shape: "plateau-benefit", normalRange: [0, 90],
      points: [ { x: 0, rr: 1.0 }, { x: 45, rr: 0.91 }, { x: 90, rr: 0.83, lo: 0.79, hi: 0.88 }, { x: 135, rr: 0.80, lo: 0.75, hi: 0.86 }, { x: 210, rr: 0.78, lo: 0.72, hi: 0.85 } ],
      note: "Steepest fall up to ~1 serving/day; reaches RR ~0.80 by ~135 g/day and a ~0.78 floor at ~210 g/day, then plateaus. Intermediate points modelled from the per-90 g slope and reported plateau.",
      source: { cite: "Aune 2016 BMJ", id: "PMID:27301975" }, verified: false,
    },
  },
  "leafy-greens": {
    evidence: { pooledRR: 0.9, ciExcludesNull: true, participants: 2000000, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "some", rctLevel: "none", funding: "independent", pubBias: "tested-clean", confoundingRisk: "moderate", intakeBasis: "high vs low habitual intake (part of ~800 g/day fruit & veg)" },
    effectEstimate: "Part of the fruit-and-veg dose-response; lower CVD/mortality up to ~800 g/day F&V; interval excludes no-effect.",
    doseCurve: {
      outcome: "Cardiovascular disease", unit: "servings/day", shape: "monotonic-benefit", normalRange: [0.3, 1.5],
      points: [ { x: 0, rr: 1.0 }, { x: 1, rr: 0.89, lo: 0.83, hi: 0.96 }, { x: 2, rr: 0.84, lo: 0.75, hi: 0.94 } ],
      note: "No verifiable leafy-green-SPECIFIC all-cause-mortality dose-response exists; this is the food-specific CVD curve (Hung 2004, per serving/day). Effect is moderate, not large — the widely-repeated '25% per 100 g' figure is an aggregator misattribution of the fruit-&-veg umbrella.",
      source: { cite: "Hung 2004 JNCI", id: "PMID:15523086" }, verified: false,
    },
  },
  "whole-fruit": {
    evidence: { pooledRR: 0.9, ciExcludesNull: true, participants: 833234, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "graded", rctLevel: "none", funding: "independent", pubBias: "tested-clean", confoundingRisk: "moderate", intakeBasis: "per 200 g/day fruit (~2–3 servings/day)" },
    effectEstimate: "All-cause mortality RR 0.90 (95% CI 0.86–0.94) per 200 g/day fruit (Aune 2017, I²=44%); type 2 diabetes RR 0.93 (0.88–0.99) per serving (Li 2014). Whole fruit only — fruit JUICE goes the other way (raises T2D; Muraki 2013). Berries/apples/grapes show the strongest signal.",
    verified: true,
    sources: {
      pooledRR: { figure: "All-cause mortality RR 0.90 (0.86–0.94) per 200 g/day fruit; I²=44%", cite: "Aune 2017 Int J Epidemiol", id: "PMID:28338764" },
      participants: { figure: "833,234 participants, 56,423 deaths, 16 cohorts (fruit & mortality)", cite: "Wang 2014 BMJ", id: "PMID:25073782" },
    },
    doseCurve: {
      outcome: "All-cause mortality", unit: "g/day", shape: "plateau-benefit", normalRange: [150, 300],
      points: [ { x: 0, rr: 1.0 }, { x: 100, rr: 0.94 }, { x: 200, rr: 0.90, lo: 0.85, hi: 0.91 }, { x: 300, rr: 0.88 }, { x: 400, rr: 0.87 }, { x: 550, rr: 0.86 } ],
      note: "Benefit flattens beyond ~2–3 servings/day (Wang threshold; Aune plateau to ~800 g F&V). Intermediate points approximated to the reported nonlinear shape.",
      source: { cite: "Aune 2017 Int J Epidemiol; Wang 2014 BMJ", id: "PMID:28338764" }, verified: false,
    },
  },
  "fatty-fish": {
    evidence: { pooledRR: 0.85, ciExcludesNull: true, participants: 1140000, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "some", rctLevel: "markers", funding: "independent", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: "highest vs lowest intake (~1–2 servings/week)" },
    effectEstimate: "CHD-mortality RR 0.85 (95% CI 0.77–0.94) highest vs lowest (Zhang 2020); broad CVD ~0.93 at 2–3 servings/week (Ricci 2023). Modest, stronger in Asian than Western cohorts. Omega-3 SUPPLEMENT RCTs are null (Cochrane) — the signal is for the food, not capsules.",
    verified: true,
    sources: {
      pooledRR: { figure: "CHD-mortality RR 0.85 (0.77–0.94) highest vs lowest; I²=51%, 27 studies", cite: "Zhang 2020 Nutrients", id: "10.3390/nu12082278" },
      participants: { figure: "1,139,553 participants (Zhang 2020); corroborated 1.44M (Ricci 2023)", cite: "Zhang 2020 Nutrients", id: "10.3390/nu12082278" },
    },
    doseCurve: {
      outcome: "CHD / CVD mortality", unit: "servings/week", shape: "plateau-benefit", normalRange: [1, 3],
      points: [ { x: 0, rr: 1.0 }, { x: 1, rr: 0.84 }, { x: 2, rr: 0.81 }, { x: 3, rr: 0.79 }, { x: 4, rr: 0.79, lo: 0.67, hi: 0.94 } ],
      note: "Most benefit by ~1–2 servings/week, then flat (Zhang 2020 category estimates for total fish; fatty-fish-specific splines aren't published separately).",
      source: { cite: "Zhang 2020 Nutrients; Ricci 2023", id: "10.3390/nu12082278" }, verified: false,
    },
  },
  "olive-oil": {
    evidence: { pooledRR: 0.81, ciExcludesNull: true, participants: 92000, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "some", rctLevel: "pattern", funding: "independent", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: ">7 g/day vs never/rarely" },
    effectEstimate: "All-cause mortality HR 0.81 (95% CI 0.78–0.84) and CVD-mortality 0.81 (0.75–0.87) at >7 g/day (Guasch-Ferré 2022, two US cohorts). PREDIMED supplied EVOO within a whole Mediterranean PATTERN, so it's trial evidence for the pattern, not the oil alone → rctLevel stays 'pattern', certainty Low.",
    verified: true,
    sources: {
      pooledRR: { figure: "All-cause mortality HR 0.81 (0.78–0.84); CVD-mortality 0.81 (0.75–0.87), >7 g/day", cite: "Guasch-Ferré 2022 JACC", id: "PMID:35027106" },
      participants: { figure: "~92,000 across two US cohorts (NHS + HPFS, 28-yr follow-up)", cite: "Guasch-Ferré 2022 JACC", id: "PMID:35027106" },
    },
    doseCurve: {
      outcome: "All-cause mortality", unit: "g/day", shape: "plateau-benefit", normalRange: [0, 20],
      points: [ { x: 0, rr: 1.0 }, { x: 1.5, rr: 0.94 }, { x: 4.5, rr: 0.87 }, { x: 7, rr: 0.84 }, { x: 15, rr: 0.81, lo: 0.78, hi: 0.84 }, { x: 20, rr: 0.81 }, { x: 30, rr: 0.81 } ],
      note: "Benefit appears from >0–1.5 g/day and flattens beyond ~20 g/day. Intermediate points approximated from the reported intake categories.",
      source: { cite: "Guasch-Ferré 2022 JACC", id: "PMID:35027106" }, verified: false,
    },
  },
  "yogurt": {
    evidence: { pooledRR: 0.86, ciExcludesNull: true, participants: 579832, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "graded", rctLevel: "none", funding: "independent", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: "80 g/day vs none (dose-response plateau)" },
    effectEstimate: "Type 2 diabetes RR 0.86 (95% CI 0.83–0.90) at 80 g/day — a non-linear dose-response that plateaus (~14% lower, no added benefit above ~80 g/day; Gijsbers 2016, 22 cohorts). Single-outcome, confounding-prone (healthy-user), no hard-outcome trials.",
    verified: true,
    sources: {
      pooledRR: { figure: "T2D RR 0.86 (0.83–0.90) at 80 g/day; non-linear, plateaus", cite: "Gijsbers 2016 Am J Clin Nutr", id: "PMID:26912494" },
      participants: { figure: "579,832 individuals, 43,118 T2D cases, 22 cohorts", cite: "Gijsbers 2016 Am J Clin Nutr", id: "PMID:26912494" },
    },
    doseCurve: {
      outcome: "Type 2 diabetes", unit: "g/day", shape: "plateau-benefit", normalRange: [0, 100],
      points: [ { x: 0, rr: 1.0 }, { x: 20, rr: 0.94 }, { x: 40, rr: 0.90 }, { x: 60, rr: 0.88 }, { x: 80, rr: 0.86, lo: 0.83, hi: 0.90 }, { x: 100, rr: 0.86 }, { x: 120, rr: 0.87 } ],
      note: "Non-linear inverse association plateauing around ~80 g/day. Intermediate points approximated along the reported spline.",
      source: { cite: "Gijsbers 2016 Am J Clin Nutr", id: "PMID:26912494" }, verified: false,
    },
  },
  "coffee": {
    evidence: { pooledRR: 0.83, ciExcludesNull: true, participants: 520000, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "some", rctLevel: "none", funding: "independent", pubBias: "tested-clean", confoundingRisk: "moderate", intakeBasis: "3–4 cups/day vs none" },
    effectEstimate: "RR 0.83 (95% CI 0.79–0.88) for all-cause mortality at 3–4 cups/day (Poole 2017 umbrella); U-shaped, nadir ~3 cups; corroborated by Crippa 2014 (0.84) and Kim 2019 (0.85). No RCT on hard outcomes.",
    verified: true,
    sources: {
      pooledRR: { figure: "RR 0.83 (0.79–0.88) at 3–4 cups/day, all-cause mortality (corrected per erratum)", cite: "Poole 2017 BMJ umbrella review", id: "PMID:29167102" },
      participants: { figure: "umbrella of 201 meta-analyses; corroborated in 997,464 (Crippa 2014) and 3.85M (Kim 2019)", cite: "Crippa 2014 AJE; Kim 2019 Eur J Epidemiol", id: "PMID:25156996" },
    },
    doseCurve: {
      outcome: "All-cause mortality", unit: "cups/day", shape: "j-u-curve", normalRange: [0, 5],
      points: [ { x: 0, rr: 1.0 }, { x: 1, rr: 0.92 }, { x: 3.5, rr: 0.83, lo: 0.79, hi: 0.88 }, { x: 6, rr: 0.88 } ],
      note: "A 'sweet spot' near 3–4 cups/day; benefit attenuates at very high intake but stays protective across the normal range.",
      source: { cite: "Poole 2017 BMJ; Crippa 2014 AJE", id: "PMID:29167102" }, verified: false,
    },
  },
  "avocado": {
    evidence: { pooledRR: 0.84, ciExcludesNull: true, participants: 110487, heterogeneity: "unknown", outcomeType: "hard", doseResponse: "some", rctLevel: "markers", funding: "independent", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: "≥2 servings/week vs never (per ½ serving/day: 0.80)" },
    effectEstimate: "Total CVD HR 0.84 (95% CI 0.75–0.95) at ≥2 servings/week; per ½ serving/day 0.80 (0.71–0.91) (Pacheco 2022, two US cohorts). Note: a 2-cohort POOLED analysis, not a meta-analysis of independent studies; no association with stroke. Small evidence base → Low certainty.",
    verified: true,
    sources: {
      pooledRR: { figure: "Total CVD HR 0.84 (0.75–0.95), ≥2 servings/week; per ½ serving/day 0.80 (0.71–0.91)", cite: "Pacheco 2022 J Am Heart Assoc", id: "10.1161/JAHA.121.024014" },
      participants: { figure: "110,487 across two US cohorts (NHS + HPFS), 14,274 CVD events over 30 yr", cite: "Pacheco 2022 J Am Heart Assoc", id: "10.1161/JAHA.121.024014" },
    },
    doseCurve: {
      outcome: "Cardiovascular disease", unit: "servings/week", shape: "monotonic-benefit", normalRange: [0, 2],
      points: [ { x: 0, rr: 1.0 }, { x: 2, rr: 0.84, lo: 0.75, hi: 0.95 }, { x: 3.5, rr: 0.80, lo: 0.71, hi: 0.91 } ],
      note: "Only two reported points (Pacheco 2022): the ≥2 servings/week category (0.84) and the per-½-serving/day slope (0.80 at ~3.5/week). Avocado is eaten infrequently in the cohorts, so higher intakes are unstudied and the curve is thin.",
      source: { cite: "Pacheco 2022 J Am Heart Assoc", id: "10.1161/JAHA.121.024014" }, verified: false,
    },
  },
  "processed-meat": {
    evidence: { pooledRR: 1.18, ciExcludesNull: true, participants: 800000, heterogeneity: "low", outcomeType: "hard", doseResponse: "graded", rctLevel: "mechanism", funding: "independent", pubBias: "tested-clean", confoundingRisk: "moderate", intakeBasis: "~50 g/day (about one serving) vs none" },
    effectEstimate: "Colorectal cancer RR 1.18 (95% CI 1.10–1.28) per 50 g/day (Chan 2011; adopted by IARC 2015, reconfirmed WCRF/CUP 2017); ~+42% CHD (Micha 2010); interval excludes null; IARC Group 1 carcinogen.",
    verified: true,
    sources: {
      pooledRR: { figure: "Colorectal cancer RR 1.18 (1.10–1.28) per 50 g/day", cite: "Chan 2011 PLoS ONE; IARC/Bouvard 2015", id: "PMID:21674008" },
      participants: { figure: "dose-response meta-analysis underlying the IARC Group 1 classification (800+ studies reviewed)", cite: "Chan 2011 PLoS ONE", id: "PMID:21674008" },
    },
    doseCurve: {
      outcome: "Colorectal cancer", unit: "g/day", shape: "monotonic-harm", normalRange: [0, 50],
      points: [ { x: 0, rr: 1.0 }, { x: 25, rr: 1.09 }, { x: 50, rr: 1.18, lo: 1.10, hi: 1.28 }, { x: 100, rr: 1.36 } ],
      note: "Risk rises ~18% per 50 g/day with no clear safe threshold for cancer.",
      source: { cite: "Chan 2011 PLoS ONE; IARC/Bouvard 2015", id: "PMID:21674008" }, verified: true,
    },
    outcomeVerdicts: [
      {
        outcome: "Coronary heart disease", effect: "negative",
        evidence: { pooledRR: 1.42, ciExcludesNull: true, participants: 614062, heterogeneity: "high", outcomeType: "hard", doseResponse: "some", rctLevel: "mechanism", funding: "independent", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: "per 50 g/day" },
        rationale: "Beyond colorectal cancer, processed meat raises coronary heart disease: RR 1.42 (95% CI 1.07–1.89) per 50 g/day (Micha 2010) — a large per-serving effect the authors attribute largely to sodium/preservatives (~4× the sodium of unprocessed red meat), not saturated fat. Contrast unprocessed red meat, which is null for CHD (RR 1.00).",
        source: { cite: "Micha 2010 Circulation", id: "PMID:20479151" },
        verified: true,
      },
    ],
  },
  "sugary-drinks": {
    evidence: { pooledRR: 1.26, ciExcludesNull: true, participants: 310819, heterogeneity: "low", outcomeType: "hard", doseResponse: "graded", rctLevel: "markers", funding: "independent", pubBias: "tested-clean", confoundingRisk: "moderate", intakeBasis: "1–2 servings/day vs none (highest vs lowest)" },
    effectEstimate: "+26% type 2 diabetes, highest vs lowest intake (RR 1.26, 95% CI 1.12–1.41); per-serving dose-response ≈ RR 1.13–1.27; RCT support on weight/metabolic markers.",
    verified: true,
    sources: {
      pooledRR: { figure: "RR 1.26 (1.12–1.41), highest vs lowest SSB intake, type 2 diabetes", cite: "Malik 2010 Diabetes Care", id: "PMID:20693348" },
      participants: { figure: "310,819 participants, 15,043 cases, 8 T2D cohorts", cite: "Malik 2010 Diabetes Care", id: "PMID:20693348" },
    },
    doseCurve: {
      outcome: "Type 2 diabetes", unit: "servings/day", shape: "monotonic-harm", normalRange: [0, 2],
      points: [ { x: 0, rr: 1.0 }, { x: 1, rr: 1.13 }, { x: 2, rr: 1.26, lo: 1.13, hi: 1.40 }, { x: 3, rr: 1.42 } ],
      note: "Risk climbs per serving/day with no apparent threshold — liquid sugar, low satiety.",
      source: { cite: "Malik 2010 Diabetes Care", id: "PMID:20693348" }, verified: false,
    },
  },
  "trans-fat": {
    evidence: { pooledRR: 1.42, ciExcludesNull: true, participants: 150000, heterogeneity: "low", outcomeType: "hard", doseResponse: "graded", rctLevel: "pathway", funding: "independent", pubBias: "untested", confoundingRisk: "low", intakeBasis: "highest vs lowest INDUSTRIAL trans-fat intake (ruminant trans fat is null)" },
    effectEstimate: "Industrial trans fat, highest vs lowest: CHD RR 1.42 (95% CI 1.05–1.92); CHD-mortality 1.18 (1.04–1.33) (de Souza 2015). Per 2% of energy: CHD RR 1.23 (1.11–1.37) (Mozaffarian 2006). Ruminant trans fat is null. Feeding RCTs prove the LDL/HDL causal pathway.",
    verified: true,
    sources: {
      pooledRR: { figure: "Industrial trans fat, CHD RR 1.42 (1.05–1.92) highest vs lowest; per-2%-energy RR 1.23 (1.11–1.37)", cite: "de Souza 2015 BMJ; Mozaffarian 2006 NEJM", id: "PMID:26268692" },
      participants: { figure: "4 prospective cohorts (Mozaffarian 2006); industrial-vs-ruminant isolated in de Souza 2015", cite: "Mozaffarian 2006 NEJM", id: "PMID:16611951" },
    },
    doseCurve: {
      outcome: "Coronary heart disease", unit: "% of daily calories", shape: "monotonic-harm", normalRange: [0, 1],
      points: [ { x: 0, rr: 1.0 }, { x: 1, rr: 1.10 }, { x: 2, rr: 1.21, lo: 1.10, hi: 1.33 }, { x: 3, rr: 1.32 }, { x: 4, rr: 1.42 } ],
      note: "Risk rises across the whole range — no safe threshold. Intermediate points approximated from the reported per-2%-energy slope.",
      source: { cite: "de Souza 2015 BMJ", id: "PMID:26268692" }, verified: false,
    },
  },
  "ultra-processed": {
    evidence: { pooledRR: 1.15, ciExcludesNull: true, participants: 1148387, heterogeneity: "high", directionallyConsistent: true, outcomeType: "hard", doseResponse: "graded", rctLevel: "markers", funding: "independent", pubBias: "untested", confoundingRisk: "high", intakeBasis: "highest vs lowest intake (per 10% increment: 1.10)" },
    effectEstimate: "All-cause mortality HR 1.15 (95% CI 1.09–1.22) highest vs lowest, and 1.10 (1.04–1.16) per 10% increment of UPF (Liang 2025, 18 cohorts, ~1.15M) — linear dose-response. Very high heterogeneity (I²=91%); an inpatient RCT (Hall 2019) showed ~500 kcal/day overeating. Broad, heterogeneous category and high confounding (UPF tracks smoking/low SES).",
    verified: true,
    sources: {
      pooledRR: { figure: "All-cause mortality HR 1.15 (1.09–1.22) high vs low; 1.10 (1.04–1.16) per 10% increment; I²=91%", cite: "Liang 2025 Syst Rev", id: "10.1186/s13643-025-02800-8" },
      participants: { figure: "1,148,387 participants, 173,107 deaths, 18 cohorts", cite: "Liang 2025 Syst Rev", id: "10.1186/s13643-025-02800-8" },
    },
    doseCurve: {
      outcome: "All-cause mortality", unit: "% of daily calories", shape: "monotonic-harm", normalRange: [0, 20],
      points: [ { x: 0, rr: 1.0 }, { x: 10, rr: 1.10, lo: 1.04, hi: 1.16 }, { x: 20, rr: 1.21 }, { x: 30, rr: 1.33 }, { x: 40, rr: 1.46 } ],
      note: "Roughly linear: ~10% higher mortality per 10% of energy from UPF. Points beyond 10% extrapolated from the per-increment slope.",
      source: { cite: "Liang 2025 Syst Rev", id: "10.1186/s13643-025-02800-8" }, verified: false,
    },
  },
  "refined-grains": {
    evidence: { pooledRR: 1.27, ciExcludesNull: true, participants: 148858, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "graded", rctLevel: "none", funding: "independent", pubBias: "untested", confoundingRisk: "high", intakeBasis: "≥350 g/day vs <50 g/day (PURE)" },
    effectEstimate: "Highest vs lowest refined-grain intake: all-cause mortality HR 1.27 (95% CI 1.11–1.46) and major CVD 1.33 (1.16–1.52) in the global PURE cohort (Swaminathan 2021, 21 countries, ~149k). CONTESTED: other meta-analyses (Gaesser 2022, grain-industry-funded; Hu 2023 AJCN) find no CVD association — see the contested note. Harm is largely relative to displacing whole grains and is intake/population-dependent.",
    verified: true,
    sources: {
      pooledRR: { figure: "All-cause mortality HR 1.27 (1.11–1.46); major CVD 1.33 (1.16–1.52), ≥350 vs <50 g/day (PURE)", cite: "Swaminathan 2021 BMJ (PURE)", id: "PMID:33536317" },
      participants: { figure: "148,858 across 21 countries (PURE); contested by Gaesser 2022 (17 cohorts, industry-funded, CVD 1.08 NS)", cite: "Swaminathan 2021 BMJ; Gaesser 2022 Trends Cardiovasc Med", id: "PMID:33536317" },
    },
    doseCurve: {
      outcome: "All-cause mortality", unit: "g/day", shape: "threshold-harm", normalRange: [0, 50],
      points: [ { x: 0, rr: 1.0 }, { x: 25, rr: 1.0 }, { x: 100, rr: 1.06 }, { x: 200, rr: 1.14 }, { x: 300, rr: 1.21 }, { x: 375, rr: 1.27, lo: 1.11, hi: 1.46 } ],
      note: "Little change at low intake, climbing above ~1–2 servings/day (PURE). Intermediate category points interpolated; contested (see the note above).",
      source: { cite: "Swaminathan 2021 BMJ (PURE)", id: "PMID:33536317" }, verified: false,
    },
  },
  "eggs": {
    evidence: { pooledRR: 0.98, ciExcludesNull: false, participants: 1720108, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "none", rctLevel: "markers", funding: "independent", pubBias: "tested-clean", confoundingRisk: "moderate", intakeBasis: "per 1 additional egg/day" },
    effectEstimate: "Per 1 egg/day, CVD RR 0.98 (95% CI 0.93–1.03) in the general population — interval spans no-effect → neutral (Drouin-Chartier 2020 BMJ, ~1.72M). Population-dependent (US/European ≈ null, Asian inverse ~0.92); diabetic-subgroup evidence is heterogeneous and contested.",
    verified: true,
    sources: {
      pooledRR: { figure: "CVD RR 0.98 (0.93–1.03) per 1 egg/day; I²=62.3%", cite: "Drouin-Chartier 2020 BMJ", id: "PMID:32132002" },
      participants: { figure: "1,720,108 participants, 139,195 CVD events (33 risk estimates)", cite: "Drouin-Chartier 2020 BMJ", id: "PMID:32132002" },
    },
  },
  "red-meat": {
    evidence: { pooledRR: 1.1, ciExcludesNull: false, participants: 4000000, heterogeneity: "high", outcomeType: "hard", doseResponse: "none", rctLevel: "none", funding: "independent", pubBias: "untested", confoundingRisk: "high", intakeBasis: "highest vs lowest habitual intake" },
    effectEstimate: "On all-cause mortality: small, contested, population-dependent — RR 1.10 (0.98–1.22), NOT significant highest-vs-lowest (Wang 2016), significant only in US cohorts; NutriRECS (Zeraatkar 2019) graded the evidence low-certainty and 'not compelling'. Headline = neutral (leaning). The diabetes association is firmer — see the per-outcome verdict below.",
    verified: true,
    sources: {
      pooledRR: { figure: "Unprocessed red meat, all-cause mortality RR 1.10 (0.98–1.22), NS high-vs-low (Wang 2016); low-certainty/contested (Zeraatkar 2019)", cite: "Wang 2016 Public Health Nutr; Zeraatkar 2019 Ann Intern Med", id: "PMID:26143683" },
      participants: { figure: "NutriRECS reviewed 55 cohorts, >4,000,000 participants; GRADE low certainty", cite: "Zeraatkar 2019 Ann Intern Med", id: "10.7326/M19-0655" },
    },
    outcomeVerdicts: [
      {
        outcome: "Type 2 diabetes", effect: "negative",
        evidence: { pooledRR: 1.10, ciExcludesNull: true, participants: 1970000, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "graded", rctLevel: "none", funding: "independent", pubBias: "untested", confoundingRisk: "high", intakeBasis: "per 100 g/day" },
        rationale: "Unlike the contested mortality signal, the diabetes association is consistent: HR 1.10 (1.06–1.15) per 100 g/day in the largest IPD meta-analysis (1.97M; Shi 2023 puts it higher at 1.27). Modest and confounding-prone, so Low certainty — but directional. This is why red meat reads neutral overall yet negative for diabetes (mirroring white rice).",
        doseCurve: {
          outcome: "Type 2 diabetes", unit: "g/day", shape: "monotonic-harm", normalRange: [0, 100],
          points: [ { x: 0, rr: 1.0 }, { x: 50, rr: 1.05 }, { x: 100, rr: 1.10, lo: 1.06, hi: 1.15 }, { x: 150, rr: 1.15 }, { x: 200, rr: 1.21 } ],
          note: "≈10% higher T2D risk per 100 g/day (Li 2024 IPD). Intermediate points from the per-100 g slope.",
          source: { cite: "Li 2024 Lancet Diabetes Endocrinol", id: "PMID:39174153" }, verified: false,
        },
        source: { cite: "Li 2024 Lancet Diabetes Endocrinol (IPD, 1.97M); Shi 2023 EHJ", id: "PMID:39174153" },
        verified: true,
      },
    ],
  },
  "poultry": {
    evidence: { pooledRR: 1, ciExcludesNull: false, participants: 300000, heterogeneity: "low", outcomeType: "hard", doseResponse: "none", rctLevel: "none", funding: "independent", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: "higher vs lower habitual intake" },
    effectEstimate: "≈ no association with CVD; interval spans no-effect → neutral; looks favorable mainly as a substitute.",
  },
  "milk": {
    evidence: { pooledRR: 0.99, ciExcludesNull: false, participants: 1600000, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "some", rctLevel: "none", funding: "independent", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: "per 200 mL/day (~1 glass) increment" },
    effectEstimate: "≈ neutral for all-cause mortality — RR ~0.99 (0.95–1.03) per 200 mL/day across dose-response meta-analyses (Larsson 2017); interval spans no-effect. Whole-fat not worse than low-fat. NB: PURE's protective 0.83/0.78 figures are for TOTAL DAIRY at high-vs-none, not milk alone — not attributed here.",
    verified: true,
    sources: {
      pooledRR: { figure: "All-cause mortality RR ~0.99 (0.95–1.03) per 200 mL/day milk (neutral)", cite: "Larsson 2017 (milk & mortality dose-response MA)", id: "PMID:27927192" },
      participants: { figure: ">1,600,000 across ~29 cohorts (dose-response MAs); PURE total-dairy corroboration N=136,384", cite: "Larsson 2017; Dehghan 2018 PURE", id: "PMID:27927192" },
    },
  },
  "cheese": {
    evidence: { pooledRR: 0.90, ciExcludesNull: true, participants: 200000, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "some", rctLevel: "none", funding: "independent", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: "highest vs lowest (~40 g/day, peak protection)" },
    effectEstimate: "Total CVD RR 0.90 (95% CI 0.82–0.99) high vs low, peak ~40 g/day (Chen 2017); CHD 0.86 (0.77–0.96). Interval excludes null → directional, but borderline (upper CI 0.99) and confounding-prone, so Low certainty. Stroke is null (0.97).",
    verified: true,
    sources: {
      pooledRR: { figure: "Total CVD RR 0.90 (0.82–0.99), CHD 0.86 (0.77–0.96), high vs low; non-linear, peak ~40 g/day", cite: "Chen 2017 Eur J Nutr", id: "PMID:27517544" },
      participants: { figure: "15 prospective cohorts (CVD); de Goede 2016 stroke pool ~762,000 (null)", cite: "Chen 2017 Eur J Nutr", id: "PMID:27517544" },
    },
    doseCurve: {
      outcome: "Cardiovascular disease", unit: "g/day", shape: "j-u-curve", normalRange: [20, 60],
      points: [ { x: 0, rr: 1.0 }, { x: 10, rr: 0.96 }, { x: 20, rr: 0.93 }, { x: 40, rr: 0.90, lo: 0.82, hi: 0.99 }, { x: 80, rr: 0.95 } ],
      note: "A 'sweet spot': lowest CVD risk near ~40 g/day, with the benefit fading at higher intake. Intermediate points approximated to the reported L/J shape.",
      source: { cite: "Chen 2017 Eur J Nutr", id: "PMID:27517544" }, verified: false,
    },
  },
  "butter": {
    evidence: { pooledRR: 1.01, ciExcludesNull: true, participants: 636151, heterogeneity: "low", outcomeType: "hard", doseResponse: "none", rctLevel: "markers", funding: "independent", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: "~14 g/day (1 tbsp) vs none" },
    effectEstimate: "RR 1.0134 (95% CI 1.0003–1.0266, P=0.045) per 14 g/day — a ~1% HIGHER mortality risk (not protective), I²=0%. The interval marginally excludes null but the effect is trivially small, so recorded as non-directional (neutral). Null for CVD/CHD/stroke; slightly protective for diabetes (0.96). Highly substitution-dependent.",
    verified: true,
    sources: {
      pooledRR: { figure: "RR 1.0134 (1.0003–1.0266, P=0.045) per 14 g/day, all-cause mortality; I²=0%", cite: "Pimpin 2016 PLoS ONE", id: "PMID:27355649" },
      participants: { figure: "636,151 participants, 28,271 deaths, 9 cohorts", cite: "Pimpin 2016 PLoS ONE", id: "PMID:27355649" },
    },
  },
  "potatoes": {
    evidence: { pooledRR: 1.01, ciExcludesNull: false, participants: 205107, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "some", rctLevel: "none", funding: "independent", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: "baked/boiled/mashed, per 3 servings/week" },
    effectEstimate: "Baked/boiled/mashed potatoes null for T2D (HR 1.01, 0.98–1.05; Mousavi 2025); interval spans no-effect → neutral. Fried potatoes (separate item) are harmful.",
    verified: true,
    sources: {
      pooledRR: { figure: "Baked/boiled/mashed potatoes vs T2D HR 1.01 (0.98–1.05) per 3 servings/week (null)", cite: "Mousavi 2025 BMJ", id: "PMID:40769531" },
      participants: { figure: "205,107 across three US cohorts; 22,299 T2D cases", cite: "Mousavi 2025 BMJ", id: "PMID:40769531" },
    },
  },
  "french-fries": {
    evidence: { pooledRR: 1.20, ciExcludesNull: true, participants: 205107, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "graded", rctLevel: "none", funding: "independent", pubBias: "untested", confoundingRisk: "high", intakeBasis: "+3 servings/week vs none" },
    effectEstimate: "Type-2 diabetes HR 1.20 (95% CI 1.12–1.28) per +3 servings/week (Mousavi 2025 BMJ); baked/boiled null in the same cohorts → the frying carries the harm.",
    verified: true,
    sources: {
      pooledRR: { figure: "French fries vs T2D HR 1.20 (1.12–1.28) per +3 servings/week", cite: "Mousavi 2025 BMJ", id: "PMID:40769531" },
      participants: { figure: "205,107 across three US cohorts; 5.2M person-years", cite: "Mousavi 2025 BMJ", id: "PMID:40769531" },
    },
    doseCurve: {
      outcome: "Type 2 diabetes", unit: "servings/week", shape: "monotonic-harm", normalRange: [0, 3],
      points: [ { x: 0, rr: 1.0 }, { x: 3, rr: 1.20, lo: 1.12, hi: 1.28 }, { x: 6, rr: 1.44 } ],
      note: "Deep-fried fries only — risk rises ~20% per 3 servings/week with no threshold (baked/boiled potatoes are null). Points beyond 3/wk are log-linear extrapolation from the reported per-serving slope.",
      source: { cite: "Mousavi 2025 BMJ", id: "PMID:40769531" }, verified: false,
    },
  },
  "alcohol": {
    evidence: { pooledRR: 1.19, ciExcludesNull: true, participants: 4838825, heterogeneity: "high", outcomeType: "hard", doseResponse: "graded", rctLevel: "none", funding: "independent", pubBias: "tested-clean", confoundingRisk: "high", intakeBasis: "regular intake ≈45 g/day (~3 drinks/day) vs lifetime non-drinkers" },
    effectEstimate: "Regrounded (v0.44) to realistic regular intake and net harm. There is NO safe level (WHO 2023) and no net protection — the old 'J-curve' is a reference-group / sick-quitter artifact (Zhao/Stockwell 2023, 107 cohorts, ~4.84M): light intake is null vs lifetime non-drinkers, but all-cause mortality rises with dose and is significant from ≥25 g/day in women and ≥45 g/day in men (RR ≈1.19 at ~45 g/day, ≈1.35 at ≥65 g/day). Headline is therefore negative; cancer rises from the very first drink (per-outcome verdict below). Previously recorded neutral on the flattering low-volume contrast — corrected.",
    verified: true,
    sources: {
      pooledRR: { figure: "All-cause mortality RR ≈1.19 at ~45 g/day and ≈1.35 at ≥65 g/day; significant harm ≥25 g/day (women), ≥45 g/day (men); no protection at low intake", cite: "Zhao/Stockwell 2023 JAMA Netw Open", id: "10.1001/jamanetworkopen.2023.6185" },
      participants: { figure: "4,838,825 participants across 107 cohort studies (425,564 deaths)", cite: "Zhao/Stockwell 2023 JAMA Netw Open", id: "10.1001/jamanetworkopen.2023.6185" },
    },
    doseCurve: {
      outcome: "All-cause mortality", unit: "g/day", shape: "monotonic-harm", normalRange: [0, 25],
      points: [ { x: 0, rr: 1.0 }, { x: 25, rr: 1.05 }, { x: 45, rr: 1.19, lo: 1.07, hi: 1.31 }, { x: 65, rr: 1.35, lo: 1.23, hi: 1.49 } ],
      note: "No protective 'J' once abstainer bias is removed: light intake is ~null, then mortality climbs with dose (significant from ~25 g/day in women, ~45 g/day in men). 10 g ≈ one standard drink. Intermediate points from the reported category risks.",
      source: { cite: "Zhao/Stockwell 2023 JAMA Netw Open", id: "10.1001/jamanetworkopen.2023.6185" }, verified: false,
    },
    outcomeVerdicts: [
      {
        outcome: "Cancer (breast, aerodigestive)", effect: "negative",
        evidence: { pooledRR: 1.10, ciExcludesNull: true, participants: 600000, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "graded", rctLevel: "none", funding: "independent", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: "~1–2 drinks/day vs none" },
        rationale: "Alcohol is an IARC Group 1 carcinogen and breast-cancer risk rises monotonically from the first drink — RR 1.071 (1.055–1.087) per 10 g/day (Collaborative Group 2002); light drinking already significant (1.05). No safe threshold. This is the harm the mortality headline understates.",
        doseCurve: {
          outcome: "Cancer (breast, aerodigestive)", unit: "drinks/day", shape: "monotonic-harm", normalRange: [0, 2],
          points: [ { x: 0, rr: 1.0 }, { x: 1, rr: 1.07 }, { x: 2, rr: 1.15 }, { x: 4, rr: 1.32 } ],
          note: "Risk rises from the very first drink — there is no safe threshold for cancer.",
          source: { cite: "Collaborative Group 2002 Br J Cancer; Bagnardi 2013", id: "PMID:12439712" }, verified: true,
        },
        source: { cite: "Collaborative Group on Hormonal Factors in Breast Cancer 2002", id: "PMID:12439712" },
        verified: true,
      },
    ],
  },
  "artificial-sweeteners": {
    evidence: { pooledRR: 1.09, ciExcludesNull: false, participants: 100000, heterogeneity: "high", outcomeType: "hard", doseResponse: "none", rctLevel: "markers", funding: "independent", pubBias: "untested", confoundingRisk: "high", intakeBasis: "high vs no intake" },
    effectEstimate: "Conflicting: some cohorts show higher CVD (likely reverse causation); substitution trials show benefit → net uncertain.",
  },
  "coconut-oil": {
    evidence: { pooledRR: 1, ciExcludesNull: false, participants: 1000, heterogeneity: "unknown", outcomeType: "surrogate", doseResponse: "none", rctLevel: "markers", funding: "independent", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: "regular use vs none (LDL surrogate)" },
    effectEstimate: "Raises LDL vs unsaturated oils (RCTs); essentially no direct outcome data → neutral pending.",
  },

  "green-tea": {
    evidence: { pooledRR: 0.88, ciExcludesNull: true, participants: 1960000, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "graded", rctLevel: "none", funding: "independent", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: "3–4 cups/day vs none" },
    effectEstimate: "≈4% lower CVD mortality and stroke per cup/day; ~0.88 at a realistic 3 cups/day; plateaus, no hard-outcome trial.",
    doseCurve: {
      outcome: "All-cause mortality", unit: "cups/day", shape: "monotonic-benefit", normalRange: [1, 3],
      points: [ { x: 0, rr: 1.0 }, { x: 1, rr: 0.96 }, { x: 2, rr: 0.91, lo: 0.88, hi: 0.94 }, { x: 3, rr: 0.87 }, { x: 5, rr: 0.80, lo: 0.72, hi: 0.89 } ],
      note: "≈4% lower all-cause mortality per cup/day; strongest in higher-intake Japanese cohorts. Intermediate points approximated.",
      source: { cite: "Tang 2015 Br J Nutr", id: "PMID:26202661" }, verified: false,
    },
  },
  "white-rice": {
    evidence: { pooledRR: 1.16, ciExcludesNull: true, participants: 577426, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "graded", rctLevel: "none", funding: "independent", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: "highest vs lowest intake (non-linear; harm above ~300 g/day)" },
    effectEstimate: "+16% type 2 diabetes, highest vs lowest (RR 1.16, 95% CI 1.02–1.32); NON-LINEAR — ≈neutral to ~1 serving/day (RR 0.97), rising above ~300 g/day; far larger in rice-staple populations. Brown rice is protective.",
    verified: true,
    sources: {
      pooledRR: { figure: "RR 1.16 (1.02–1.32) extreme categories; non-linear (RR 0.97 at ~158 g/day, 1.13 per serving above ~300 g/day); I²=73%", cite: "Yu/Balaji 2022 BMJ Open", id: "PMID:36167362" },
      participants: { figure: "577,426 participants, 25,956 cases, 8 cohorts", cite: "Yu/Balaji 2022 BMJ Open", id: "PMID:36167362" },
    },
    doseCurve: {
      outcome: "Type 2 diabetes", unit: "g/day", shape: "threshold-harm", normalRange: [0, 300],
      points: [ { x: 0, rr: 1.0 }, { x: 158, rr: 0.97, lo: 0.92, hi: 1.02 }, { x: 300, rr: 1.02 }, { x: 450, rr: 1.16, lo: 1.02, hi: 1.32 } ],
      note: "Roughly neutral up to ~1 serving/day; risk climbs only above ~300 g/day — which is why the harm is large in rice-staple populations and small in Western diets.",
      source: { cite: "Yu/Balaji 2022 BMJ Open", id: "PMID:36167362" }, verified: false,
    },
  },
  "soy": {
    evidence: { pooledRR: 0.88, ciExcludesNull: true, participants: 330826, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "graded", rctLevel: "markers", funding: "independent", pubBias: "untested", confoundingRisk: "moderate", intakeBasis: "~1–2 servings/day (≈25–40 mg isoflavones; 1 serving ≈ 100 g tofu / a cup of soy milk / ½ cup edamame)" },
    effectEstimate: "Cancer mortality RR 0.88 (95% CI 0.79–0.99) highest vs lowest; each 10 mg/day isoflavones ~7% lower cancer mortality, ~10% lower all-cause (Nachvak 2019, 23 studies). Strongest in high-intake Asian cohorts; generalisability to low-intake Western diets uncertain.",
    verified: true,
    sources: {
      pooledRR: { figure: "Cancer mortality RR 0.88 (0.79–0.99) high vs low; dose-response per 10 mg/day isoflavones", cite: "Nachvak 2019 J Acad Nutr Diet", id: "PMID:31278047" },
      participants: { figure: "330,826 participants, 23 prospective studies", cite: "Nachvak 2019 J Acad Nutr Diet", id: "PMID:31278047" },
    },
    doseCurve: {
      outcome: "Cancer / all-cause mortality", unit: "servings/day", shape: "monotonic-benefit", normalRange: [0, 2],
      points: [ { x: 0, rr: 1.0 }, { x: 1, rr: 0.94 }, { x: 2, rr: 0.90, lo: 0.83, hi: 0.97 } ],
      note: "≈7% lower cancer mortality per ~10 mg/day isoflavones; ~1 serving (100 g tofu, a cup of soy milk, or ½ cup edamame) ≈ ~20 mg. Expressed in food servings rather than mg isoflavones so the amount is actionable. Points approximated from the reported per-unit slope.",
      source: { cite: "Nachvak 2019 J Acad Nutr Diet", id: "PMID:31278047" }, verified: false,
    },
  },
  "cruciferous": {
    evidence: { pooledRR: 0.90, ciExcludesNull: true, participants: 2000000, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "graded", rctLevel: "none", funding: "independent", pubBias: "tested-clean", confoundingRisk: "moderate", intakeBasis: "higher vs lower intake (within the F&V dose-response)" },
    effectEstimate: "≈10% lower mortality/CVD as part of the fruit-and-veg dose-response; cruciferous-specific cancer signal too.",
    doseCurve: {
      outcome: "All-cause mortality", unit: "g/day", shape: "monotonic-benefit", normalRange: [20, 60],
      points: [ { x: 0, rr: 1.0 }, { x: 40, rr: 0.91, lo: 0.84, hi: 0.98 }, { x: 80, rr: 0.88, lo: 0.77, hi: 1.00 }, { x: 130, rr: 0.85, lo: 0.76, hi: 0.96 }, { x: 180, rr: 0.78, lo: 0.71, hi: 0.85 } ],
      note: "Cruciferous-specific quintile curve (Zhang 2011, Shanghai cohorts) — reaches RR ~0.78 only at the highest quintile (~150–210 g/day) in a HIGH-consuming population, so 'large' here needs a lot. Colon cancer reaches a comparable effect at a more realistic ~40–60 g/day (Lai 2025). x-values are approximate quintile midpoints.",
      source: { cite: "Zhang 2011 Am J Clin Nutr", id: "PMID:21593509" }, verified: false,
    },
  },
  "tomatoes": {
    evidence: { pooledRR: 0.95, ciExcludesNull: false, participants: 200000, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "some", rctLevel: "none", funding: "independent", pubBias: "untested", confoundingRisk: "high", intakeBasis: "high vs low blood lycopene (tomato-derived, biomarker)" },
    effectEstimate: "Modest cancer signal, but driven by the blood-lycopene biomarker (confounded with healthy diet), not clearly by tomato intake → neutral.",
  },
  "cocoa": {
    evidence: { pooledRR: 0.90, ciExcludesNull: false, participants: 21442, heterogeneity: "moderate", outcomeType: "hard", doseResponse: "none", rctLevel: "outcomes", funding: "mixed", pubBias: "untested", confoundingRisk: "low", intakeBasis: "500 mg cocoa flavanols/day vs placebo (RCT)" },
    effectEstimate: "COSMOS RCT: total CVD events HR 0.90 (95% CI 0.78–1.02), P=0.11 — not significant → a trial-grade roughly-null (a secondary CVD-death signal aside). NIH-funded but Mars Inc. supplied the cocoa product (industry involvement).",
    verified: true,
    sources: {
      pooledRR: { figure: "Total CVD events HR 0.90 (0.78–1.02), P=0.11 (primary outcome, ITT)", cite: "Sesso 2022 Am J Clin Nutr (COSMOS RCT)", id: "PMID:35294962" },
      participants: { figure: "21,442 randomized (866 primary CVD events; median 3.6 yr)", cite: "Sesso 2022 Am J Clin Nutr (COSMOS RCT)", id: "PMID:35294962" },
    },
  },
};

// What TRIALS + MECHANISM alone point to, per food — the grounded input for the
// "Trials & mechanism only" explore lens (which IGNORES observational cohorts) and for
// the per-food "under a different lens" section. This is deliberately the view of
// someone who dismisses cohort epidemiology: RCTs on hard outcomes where they exist,
// else validated surrogate markers (LDL, BP, glucose), else a validated causal pathway.
// Each record carries the trial + mechanism + a real source, so the `direction` is
// DERIVED from recorded evidence, not asserted. (Grounded in the v0.36 mechanistic
// research pass; figures snippet-cross-verified — WebFetch to journals is proxy-blocked.)
//   positive : RCT/pattern trial or favorable validated markers point to benefit
//   negative : validated harmful pathway/marker (LDL↑, BP↑, high-glycemic, carcinogen)
//   neutral  : the strongest trial is null, or trial vs mechanism genuinely conflict
//   none     : no trial and no clear mechanism either way (none remain after grounding)
const MECHANISM = {
  "wholemeal-bread": { direction: "positive", trial: "Wholegrain-vs-refined swap trials and β-glucan meta-analyses (Ho 2016) lower LDL and blunt postprandial glucose vs white bread.", mechanism: "Intact bran/germ → viscous fibre slows glucose absorption and feeds short-chain-fatty-acid-producing microbiota; lower glycemic load than white bread.", source: { cite: "Ho 2016 Br J Nutr (β-glucan LDL)", id: "PMID:27724985" }, confidence: "medium" },
  "white-bread": { direction: "negative", trial: "Controlled-feeding/crossover trials show refined-starch bread gives a higher postprandial glucose/insulin response than wholegrain; added salt raises BP (DASH-Sodium).", mechanism: "Milled endosperm → rapidly digested starch → high glycemic load; lacks the bran/germ fibre of wholemeal; salt load adds a BP pathway.", source: { cite: "Aune 2016 BMJ (refined grains not protective); Sacks 2001 NEJM (DASH-Sodium)", id: "PMID:27301975" }, confidence: "medium" },
  "tree-nuts": { direction: "positive", trial: "PREDIMED (Med diet + mixed nuts) cut major CVD events; 61-trial lipid meta-analysis (Del Gobbo 2015) shows nuts lower LDL/ApoB/TG.", mechanism: "Unsaturated fat, fibre, phytosterols → lower LDL.", source: { cite: "Del Gobbo 2015 Am J Clin Nutr; Estruch 2018 NEJM (PREDIMED)", id: "PMID:26561616" }, confidence: "high" },
  "legumes": { direction: "positive", trial: "Meta-analysis of 26 RCTs (Ha 2014): dietary pulses ~130 g/day lowered LDL-C by −0.17 mmol/L vs control.", mechanism: "Viscous fibre reduces bile-acid reabsorption → hepatic LDL-receptor upregulation; improved glycemic response.", source: { cite: "Ha 2014 CMAJ", id: "10.1503/cmaj.131727" }, confidence: "high" },
  "whole-grains": { direction: "positive", trial: "Meta-analysis of 58 RCTs (Ho 2016): oat β-glucan ~3.5 g/day lowered LDL-C −0.19 mmol/L and ApoB.", mechanism: "Viscous soluble fibre (β-glucan) → reduced cholesterol/bile-acid reabsorption; blunts postprandial glucose.", source: { cite: "Ho 2016 Br J Nutr", id: "PMID:27724985" }, confidence: "high" },
  "olive-oil": { direction: "positive", trial: "EUROLIVE crossover RCT: high-phenolic olive oil dose-dependently reduced oxidized LDL and raised HDL; PREDIMED EVOO arm cut CVD events (pattern-level).", mechanism: "Olive polyphenols reduce LDL oxidation (EFSA-recognised); MUFA-for-satfat improves lipids/BP.", source: { cite: "Covas 2006 Ann Intern Med (EUROLIVE); Estruch 2018 NEJM", id: "10.7326/0003-4819-145-5-200609050-00006" }, confidence: "high" },
  "soy": { direction: "positive", trial: "Meta-analysis of 46 controlled trials (Blanco Mejia 2019): soy protein ~25 g/day lowered LDL-C ~4.8 mg/dL.", mechanism: "Soy protein/isoflavones modestly lower LDL (displaces animal protein/satfat; LDL-receptor effects). Underpins the FDA heart claim.", source: { cite: "Blanco Mejia 2019 J Nutr", id: "10.1093/jn/nxz020" }, confidence: "high" },
  "leafy-greens": { direction: "positive", trial: "Meta-analysis of 16 crossover RCTs (Siervo 2013): inorganic nitrate/beetroot lowered systolic BP −4.4 mmHg. CONFLICT: a 5-week leafy-green RCT with matched nitrate control found no ambulatory-BP effect.", mechanism: "Dietary nitrate → nitrite → nitric oxide → vasodilation → lower BP (validated acutely; sustained effect uncertain).", source: { cite: "Siervo 2013 J Nutr; null: Jackson 2020 Am J Clin Nutr", id: "PMID:23596162" }, confidence: "medium" },
  "whole-fruit": { direction: "positive", trial: "Crossover RCT (Koutsos 2020): 2 whole apples/day lowered total & LDL cholesterol and TG vs a sugar-matched apple drink.", mechanism: "Whole-fruit soluble fibre (pectin) + polyphenols reduce cholesterol absorption/bile-acid recycling. Does NOT extend to juice.", source: { cite: "Koutsos 2020 Am J Clin Nutr", id: "10.1093/ajcn/nqz282" }, confidence: "medium" },
  "berries": { direction: "positive", trial: "6-month double-blind RCT (Curtis 2019): 1 cup/day blueberries improved flow-mediated dilatation (+1.45%) and arterial stiffness in metabolic-syndrome adults; anthocyanin RCT meta-analyses lower LDL-C.", mechanism: "Anthocyanins raise nitric-oxide/endothelial function and modestly improve lipids. Vascular markers positive; glycemic markers (HOMA-IR) often unchanged in RCTs.", source: { cite: "Curtis 2019 Am J Clin Nutr", id: "PMID:31136659" }, confidence: "high" },
  "cruciferous": { direction: "positive", trial: "Two double-blind RCTs (Armah 2015, n=130): high-glucoraphanin broccoli reduced plasma LDL-C ~5% over 12 weeks.", mechanism: "Glucoraphanin → sulforaphane → NRF2 pathway; LDL-lowering the validated surrogate. Single research group — generalisability uncertain.", source: { cite: "Armah 2015 Mol Nutr Food Res", id: "PMID:25851421" }, confidence: "medium" },
  "green-tea": { direction: "positive", trial: "Meta-analyses of RCTs: green-tea catechins lower LDL-C (Zheng 2011, 14 RCTs) and blood pressure (Peng 2014, 13 RCTs, SBP −2 mmHg).", mechanism: "EGCG reduces micellar cholesterol absorption and upregulates the LDL receptor; catechins improve endothelial NO.", source: { cite: "Zheng 2011 Am J Clin Nutr; Peng 2014 Sci Rep", id: "PMID:21715508" }, confidence: "high" },
  "avocado": { direction: "positive", trial: "Crossover controlled-feeding RCT (Wang 2015): 1 avocado/day lowered LDL-C, non-HDL and LDL particle number vs matched-fat diets.", mechanism: "MUFA (oleic acid) substitution plus fibre/phytosterols reduce LDL and LDL oxidation. (HAT trial missed its visceral-fat endpoint.)", source: { cite: "Wang 2015 J Am Heart Assoc", id: "PMID:25567051" }, confidence: "high" },
  "tomatoes": { direction: "positive", trial: "Meta-analysis of 21 intervention trials (Cheng 2017): tomato/lycopene improved FMD (+2.5%), lowered systolic BP and LDL-C.", mechanism: "Lycopene reduces LDL oxidation/oxidative stress and improves NO-mediated endothelial function. Trials small/heterogeneous.", source: { cite: "Cheng 2017 Atherosclerosis", id: "PMID:28129549" }, confidence: "medium" },
  "coffee": { direction: "neutral", trial: "RCTs: UNFILTERED coffee raises cholesterol (cafestol diterpenes); caffeine transiently raises BP (Mesas 2011 meta-analysis) but attenuates with habituation. FILTERED coffee is ~neutral on LDL.", mechanism: "Cafestol/kahweol downregulate the LDL receptor (unfiltered only); caffeine → transient sympathetic BP rise. Net: mixed, brew-dependent.", source: { cite: "Mesas 2011 Am J Clin Nutr", id: "10.3945/ajcn.111.016667" }, confidence: "medium", note: "Mechanism is brew-dependent and mild; filtered coffee is neutral. This is why the mechanism lens can't condemn coffee even though observation shows clear benefit." },
  "fatty-fish": { direction: "neutral", trial: "Low-dose fish-oil supplement RCTs are null on hard CVD outcomes (VITAL, ASCEND, Cochrane); only a high-dose purified-EPA DRUG (REDUCE-IT) was positive, and that is contested (mineral-oil placebo).", mechanism: "EPA/DHA lower triglycerides (validated), but the food/supplement doesn't move hard outcomes → net neutral.", source: { cite: "Manson 2019 NEJM (VITAL); ASCEND 2018 NEJM", id: "10.1056/NEJMoa1811403" }, confidence: "high" },
  "cocoa": { direction: "neutral", trial: "COSMOS RCT (n=21,442): cocoa-flavanol supplement did not significantly cut total CVD events (HR 0.90, P=0.11).", mechanism: "Flavanols raise nitric-oxide → improve FMD and modestly lower BP (favorable markers), but the hard-outcome trial is null.", source: { cite: "Sesso 2022 Am J Clin Nutr (COSMOS)", id: "PMID:35294962" }, confidence: "high" },
  "artificial-sweeteners": { direction: "neutral", trial: "Substitution RCTs favour sweeteners over sugar for weight (Rogers 2016), but a human RCT (Suez 2022) shows saccharin/sucralose can impair glycemia via the microbiome.", mechanism: "Energy displacement (benefit vs sugar) vs microbiome-mediated glucose intolerance (harm) — validated but opposing pathways → net neutral.", source: { cite: "Rogers 2016 Int J Obes; Suez 2022 Cell", id: "PMID:26365102" }, confidence: "medium" },
  "yogurt": { direction: "neutral", trial: "Meta-analysis of 9 RCTs (He 2019): probiotic yogurt did not significantly improve HbA1c, fasting glucose, insulin or HOMA-IR.", mechanism: "Proposed gut-microbiota/SCFA effects on insulin sensitivity — plausible but not robustly validated; marker effects null.", source: { cite: "He 2019 Nutrients", id: "10.3390/nu11030671" }, confidence: "medium" },
  "poultry": { direction: "neutral", trial: "Controlled-feeding RCT (Bergeron/APPROACH 2019): white meat raised LDL/ApoB near-identically to red meat, and both were worse than plant protein.", mechanism: "Lean poultry is lower in satfat than fatty red meat, but its LDL effect is indistinguishable — no distinct beneficial pathway.", source: { cite: "Bergeron 2019 Am J Clin Nutr (APPROACH)", id: "10.1093/ajcn/nqz035" }, confidence: "medium" },
  "milk": { direction: "neutral", trial: "Meta-analyses of RCTs (Derakhshandeh-Rishehri 2021) find no adverse effect of dairy/milk on LDL, HDL, TG or total cholesterol.", mechanism: "Milk-fat satfat would raise LDL, but the fluid-dairy matrix (MFGM, calcium) attenuates it → null in trials.", source: { cite: "Derakhshandeh-Rishehri 2021 Diabetes Metab Syndr", id: "PMID:34562868" }, confidence: "medium" },
  "potatoes": { direction: "neutral", trial: "No hard-outcome RCT; interventional trials are null/mixed on surrogates (cooled resistant-starch potato improved fasting glucose; fried-potato RCT null).", mechanism: "Whole potato is high-glycemic (would raise postprandial glucose), but preparation dominates and diverges → no consistent direction.", source: { cite: "resistant-starch potato crossover RCT 2021", id: "PMID:33119948" }, confidence: "low" },
  "french-fries": { direction: "neutral", trial: "30-day RCT (Smith 2022): French fries vs calorie-matched almonds — no difference in fat mass, fasting glucose, insulin or HbA1c.", mechanism: "Proposed high-glycemic-load + acrylamide harm, but the trial was null and acrylamide human carcinogenicity is unproven. (Industry-funded, short.)", source: { cite: "Smith 2022 Am J Clin Nutr", id: "10.1093/ajcn/nqac045" }, confidence: "medium", note: "Trials are null, yet the OBSERVATIONAL verdict is negative (T2D). A genuine contradiction — see the wrestle." },
  "eggs": { direction: "negative", trial: "Meta-analysis of 17 RCTs (Li 2020): added dietary cholesterol raised LDL-C ~8 mg/dL and the LDL/HDL ratio slightly.", mechanism: "Dietary cholesterol modestly suppresses the LDL receptor → higher LDL — but the effect is small, saturable and dwarfed by saturated fat.", source: { cite: "Li 2020 Nutrients", id: "PMID:32635569" }, confidence: "medium", note: "Mechanistically mildly LDL-raising, yet cohorts are null in the general population — a case where observation overrules a small surrogate signal." },
  "red-meat": { direction: "negative", trial: "Crossover RCT (Wang/Hazen 2019): red meat raised TMAO 2–3× (reversible). BOLD RCT: LEAN beef in a low-satfat pattern was lipid-neutral.", mechanism: "Carnitine → TMA → TMAO (atherogenic) plus satfat → LDL. Harm tracks satfat load + TMAO; lean red meat is LDL-neutral.", source: { cite: "Wang 2019 Eur Heart J; Roussell 2012 Am J Clin Nutr (BOLD)", id: "PMID:30535398" }, confidence: "high" },
  "cheese": { direction: "negative", trial: "Head-to-head crossover RCTs (Brassard 2017; Hjerpsted 2011; Feeney 2018): cheese raises LDL LESS than butter at equal saturated fat.", mechanism: "Cheese matrix (calcium + casein) forms fatty-acid soaps → more fecal fat, less SFA absorbed → attenuated LDL rise. Still net LDL-raising vs low-SFA.", source: { cite: "Brassard 2017 Am J Clin Nutr", id: "PMID:28251937" }, confidence: "high", note: "Mechanism says (mildly) LDL-raising, but cohorts show LOWER CVD — the matrix/whole-food outcome overrules the isolated marker." },
  "butter": { direction: "negative", trial: "Crossover RCT (Engel 2015): butter raised total and LDL cholesterol vs olive oil.", mechanism: "Saturated fat (palmitic/myristic) downregulates the LDL receptor → higher LDL vs unsaturated oils.", source: { cite: "Engel 2015 Am J Clin Nutr", id: "PMID:26135349" }, confidence: "high" },
  "coconut-oil": { direction: "negative", trial: "Meta-analysis of 16 clinical trials (Neelakantan 2020): coconut oil raised LDL-C +10.5 mg/dL vs non-tropical vegetable oils.", mechanism: "~85% saturated fat (lauric/myristic) downregulates the LDL receptor → raises LDL. (Also raises HDL.)", source: { cite: "Neelakantan 2020 Circulation", id: "PMID:31928080" }, confidence: "high" },
  "trans-fat": { direction: "negative", trial: "Feeding RCTs (Mensink & Katan 1990; Mensink 2003 meta of 60 trials): trans fat raises LDL AND lowers HDL — the worst total:HDL of any fat.", mechanism: "Reduced LDL clearance + raised Lp(a) + lowered HDL — a uniquely, unambiguously atherogenic dual pathway.", source: { cite: "Mensink & Katan 1990 NEJM; Mensink 2003 Am J Clin Nutr", id: "PMID:2374566" }, confidence: "high" },
  "sugary-drinks": { direction: "negative", trial: "RCT meta-analysis (Nguyen 2023): adding SSBs causes weight gain; double-blind RCT (Geidl-Flueck 2021): fructose/sucrose drinks doubled hepatic de-novo lipogenesis.", mechanism: "Liquid fructose → hepatic DNL → VLDL/triglycerides; low satiety → positive energy balance. Trials and mechanism agree.", source: { cite: "Nguyen 2023 Am J Clin Nutr; Geidl-Flueck 2021 J Hepatol", id: "PMID:36789935" }, confidence: "high" },
  "refined-grains": { direction: "negative", trial: "Meta-analysis of 80 RCTs (Sanders 2023): vs whole grain, refined grain gives higher postprandial glucose, insulin and HbA1c.", mechanism: "High glycemic index/load → larger glucose/insulin excursions. (No effect on fasting markers; postprandial only.)", source: { cite: "Sanders 2023 Crit Rev Food Sci Nutr", id: "10.1080/10408398.2021.2017838" }, confidence: "medium" },
  "white-rice": { direction: "negative", trial: "Acute/short RCTs: white rice gives higher postprandial glucose/insulin than brown; but a 3-month substitution RCT (Mohan 2019) was null on glucose/HbA1c overall.", mechanism: "High glycemic index → postprandial glucose/insulin spikes. Medium-term hard-surrogate trial null — so a weak/contested harm.", source: { cite: "Kumar/Mohan 2014; Mohan 2019 Br J Nutr", id: "PMID:24447043" }, confidence: "medium" },
  "ultra-processed": { direction: "negative", trial: "Inpatient randomized crossover trial (Hall 2019): an ad-libitum ultra-processed diet caused ~500 kcal/day overeating and weight gain vs an unprocessed diet matched for nutrients.", mechanism: "Hyper-palatability, energy density and fast eating rate → passive overconsumption. Causation directly demonstrated.", source: { cite: "Hall 2019 Cell Metabolism", id: "PMID:31105044" }, confidence: "high" },
  "processed-meat": { direction: "negative", trial: "DASH-Sodium controlled-feeding RCT: cutting sodium lowered systolic BP up to ~6–7 mmHg (processed meat is a major sodium source). IARC Group 1 for colorectal cancer.", mechanism: "Sodium → blood pressure (RCT-proven); N-nitroso/heme nitrosation → colorectal carcinogenesis (hazard-graded).", source: { cite: "Sacks 2001 NEJM (DASH-Sodium); Bouvard 2015 Lancet Oncol (IARC)", id: "PMID:11136953" }, confidence: "high" },
  "alcohol": { direction: "negative", trial: "Meta-analysis of 36 RCTs (Roerecke 2017): reducing alcohol lowered blood pressure dose-dependently.", mechanism: "Ethanol raises BP (RCT-reversible); ethanol → acetaldehyde, an IARC Group 1 carcinogen. Both point to harm.", source: { cite: "Roerecke 2017 Lancet Public Health", id: "PMID:29253389" }, confidence: "high" },
};
for (const _id in MECHANISM) {
  if (ASSESSMENTS[_id] && ASSESSMENTS[_id].evidence) {
    ASSESSMENTS[_id].mechanism = MECHANISM[_id];
    ASSESSMENTS[_id].evidence.experimentalDirection = MECHANISM[_id].direction;
  }
}

// How UNIFORMLY the verdict applies across the foods an entry names — recorded for
// EVERY item against ONE fixed question, not hand-picked for the ones we happened to
// discuss: "does this verdict apply roughly uniformly across the foods this entry
// names, or is it concentrated/heterogeneous?"
//   specific : the entry is a single food (no within-entry spread to worry about)
//   uniform  : a category, but the direction holds broadly across its members
//              (evidence is pooled across types and they behave alike)
//   mixed    : a category whose members genuinely diverge — the verdict is
//              concentrated in some and weak/absent (or reversed) in others
// The "not all" badge is DERIVED uniformly from `mixed`; the single champion
// (★ top pick) is restricted to `specific`/`uniform` (you can't crown a "not all"
// entry as THE thing to do). These first-pass calls themselves want review.
const CATEGORY_UNIFORMITY = {
  // categories where the members behave alike (pooled evidence)
  "tree-nuts": "uniform", "legumes": "uniform", "whole-grains": "uniform",
  "leafy-greens": "uniform", "cruciferous": "uniform", "fatty-fish": "uniform",
  "processed-meat": "uniform", "sugary-drinks": "uniform", "refined-grains": "uniform",
  "red-meat": "uniform", "poultry": "uniform", "cheese": "uniform", "soy": "uniform",
  "alcohol": "uniform",
  // genuinely heterogeneous categories → "not all"
  "whole-fruit": "mixed", "ultra-processed": "mixed", "artificial-sweeteners": "mixed",
  "berries": "mixed",
  // single foods / well-defined single substances
  "olive-oil": "specific", "yogurt": "specific", "coffee": "specific",
  "avocado": "specific", "trans-fat": "specific", "eggs": "specific",
  "milk": "specific", "butter": "specific", "potatoes": "specific",
  "french-fries": "specific", "coconut-oil": "specific", "green-tea": "specific",
  "white-rice": "specific", "tomatoes": "specific", "cocoa": "specific",
};

// The specific within-category caveat shown on `mixed` entries (the "not all" story).
// Only meaningful where CATEGORY_UNIFORMITY is "mixed".
const UNIFORMITY_NOTE = {
  "whole-fruit": "Strongest for berries, apples and grapes; sugary/tropical fruits are weaker, and fruit juice goes the other way.",
  "ultra-processed": "A broad, heterogeneous class — some ultra-processed foods are far worse than others; the class verdict is an average.",
  "artificial-sweeteners": "Different sweeteners (aspartame, sucralose, stevia…) behave differently; the class verdict masks real variation.",
  "berries": "The signal is concentrated in blueberries (the strongest single fruit for diabetes); strawberries/cranberries are weaker, and cranberries are often eaten as sweetened juice.",
};

for (const _f of FOODS) {
  _f.categoryUniformity = CATEGORY_UNIFORMITY[_f.id] || "specific";
  if (UNIFORMITY_NOTE[_f.id]) _f.uniformityNote = UNIFORMITY_NOTE[_f.id];
}

// Lift the redundant "(examples, etc.)" out of category food NAMES into a separate
// `examples` field (shown as a muted "e.g. …" subtitle instead of cluttering the
// title). Rule: only brackets that are an EXAMPLE LIST — i.e. end in "etc." — are
// lifted; brackets that SCOPE the verdict (e.g. potatoes "(boiled/baked)", milk
// "(whole or low-fat)", tea "(green or black)") carry meaning and are left in place.
for (const _f of FOODS) {
  const _m = _f.name.match(/^(.*?)\s*\(([^)]*?)(?:,?\s*etc\.?)\)\s*$/i);
  if (_m) {
    _f.name = _m[1].trim();
    _f.examples = _m[2].trim(); // e.g. "almonds, walnuts"
  }
}

// When each food last had a dedicated deep-research/grounding pass (independent of
// whether that pass could source-verify it). Surfaced so a verdict's evidence can be
// read as "current as of this date" — and so stale foods are visible. UPDATE the date
// for a food whenever it gets a fresh research pass.
const RESEARCHED_ON = {
  // grounding batches 1–3 (late June)
  "tree-nuts": "2026-06-29", "whole-grains": "2026-06-29", "sugary-drinks": "2026-06-29",
  "trans-fat": "2026-06-29", "butter": "2026-06-29", "white-rice": "2026-06-29",
  "cheese": "2026-06-29", "coffee": "2026-06-29", "fatty-fish": "2026-06-29",
  "olive-oil": "2026-06-29", "potatoes": "2026-06-29", "french-fries": "2026-06-29",
  // grounding batches 4–5 (2026-07-01) — includes foods we researched but could NOT verify
  "eggs": "2026-07-01", "avocado": "2026-07-01", "yogurt": "2026-07-01",
  "legumes": "2026-07-01", "soy": "2026-07-01", "whole-fruit": "2026-07-01",
  "ultra-processed": "2026-07-01", "processed-meat": "2026-07-01", "milk": "2026-07-01",
  "alcohol": "2026-07-01", "red-meat": "2026-07-01", "refined-grains": "2026-07-01",
  "cocoa": "2026-07-01", "poultry": "2026-07-01", "green-tea": "2026-07-01",
  "coconut-oil": "2026-07-01", "artificial-sweeteners": "2026-07-01",
  "tomatoes": "2026-07-01", "cruciferous": "2026-07-01", "leafy-greens": "2026-07-01",
  "berries": "2026-07-01", "wholemeal-bread": "2026-07-01", "white-bread": "2026-07-01",
};
for (const _f of FOODS) { if (RESEARCHED_ON[_f.id]) _f.researchedOn = RESEARCHED_ON[_f.id]; }


// Holding list — foods people ask about that we DON'T yet have a real verdict for.
// Rather than create empty, verdict-bearing cards (which would dilute the list and
// imply we'd assessed them), we name them here honestly: "known, but nothing to say
// yet." A food graduates to a full item only once there's a real, sourced verdict.
// This is the counterpart to the "highlight inadequacies" policy — the gaps are
// stated, not hidden. `reason`: "thin" = little/mixed hard-outcome evidence exists;
// "unresearched" = we simply haven't run the evidence pass yet.
const HOLDING_LIST = [
  { name: "Garlic & other alliums", reason: "thin", note: "Popular claims rest mainly on blood-pressure/cholesterol markers; hard-outcome cohort evidence is thin." },
  { name: "Onions", reason: "unresearched", note: "Part of the broad vegetable signal, but little food-specific hard-outcome data — not yet assessed on its own." },
  { name: "Mushrooms", reason: "unresearched", note: "Some intriguing cohort signals; not yet researched to our standard." },
  { name: "Shellfish (shrimp, mussels, etc.)", reason: "thin", note: "Sparse and mixed outcome evidence, separate from the fatty-fish signal." },
  { name: "Seeds (chia, flax, pumpkin, etc.)", reason: "thin", note: "Favourable lipid/marker studies, but little hard-outcome cohort evidence yet." },
  { name: "Honey", reason: "unresearched", note: "Often marketed as a 'natural' sugar; little outcome evidence either way — not yet researched." },
  { name: "Herbs & spices", reason: "thin", note: "Mostly small biomarker studies; no notable hard-outcome evidence yet." },
  { name: "Plant milks (oat, almond, soy drink, etc.)", reason: "unresearched", note: "Highly variable products; not yet assessed as a category." },
  { name: "Dried fruit", reason: "unresearched", note: "Sits between whole fruit and concentrated sugar; not yet assessed separately." },
  { name: "Fruit juice", reason: "thin", note: "Contrasts with whole fruit (worse for diabetes), but not yet given its own sourced verdict." },
];

// ── Absolute population burden (GBD) — a SEPARATE axis from relative effect ──
// "How much does this food matter at the population level?" is a different question
// from "how big and sure is its per-serving effect." The principled answer is
// GBD-style attributable burden (deaths/DALYs a dietary risk accounts for globally),
// NOT a relative-risk tier. Recorded here per GBD dietary risk factor and mapped to
// our foods. Crucially this is the RISK-FACTOR's burden (e.g. "diet low in
// vegetables" worldwide), shared across the foods it covers — not a single food's
// marginal contribution — so shared entries say so. `deathsM` = attributable deaths
// in millions/year (null where GBD's appendix figure couldn't be verified from the
// public summaries). All verified:false — figures are from GBD summaries, not the
// appendix tables (proxy-blocked). See research/methodology-review.md and ROADMAP §3b.
const BURDEN = {
  "low-whole-grains": { risk: "Diet low in whole grains", direction: "low", deathsM: 3.0, deaths: "~3 million/yr", dalysM: 82, rank: 2, tmrel: "~100–150 g/day", foods: ["whole-grains"], note: "Highest DALYs of any single dietary risk.", source: { cite: "GBD 2017 Diet Collaborators, Lancet 2019", id: "PMID:30954305" } },
  "low-fruit": { risk: "Diet low in fruit", direction: "low", deathsM: 2.0, deaths: "~2 million/yr", dalysM: 65, rank: 3, tmrel: "~200–300 g/day", foods: ["whole-fruit", "berries"], source: { cite: "GBD 2017 Diet Collaborators, Lancet 2019", id: "PMID:30954305" } },
  "low-nuts": { risk: "Diet low in nuts & seeds", direction: "low", deathsM: 2.0, deaths: "~2 million/yr", dalysM: 50, rank: 4, tmrel: "~16–25 g/day", foods: ["tree-nuts"], source: { cite: "GBD 2017 Diet Collaborators, Lancet 2019", id: "PMID:30954305" } },
  "low-veg": { risk: "Diet low in vegetables", direction: "low", deathsM: 1.5, deaths: "~1.5 million/yr", dalysM: 34, rank: 5, tmrel: "~290–430 g/day", foods: ["leafy-greens", "cruciferous", "tomatoes"], source: { cite: "GBD 2017 Diet Collaborators, Lancet 2019", id: "PMID:30954305" } },
  "low-seafood": { risk: "Diet low in seafood omega-3", direction: "low", deathsM: 1.0, deaths: "~1 million/yr (approx; >2% of global deaths, #6)", dalysM: null, rank: 6, tmrel: "~250 mg/day omega-3", foods: ["fatty-fish"], source: { cite: "GBD 2017 Diet Collaborators, Lancet 2019", id: "PMID:30954305" } },
  "low-legumes": { risk: "Diet low in legumes", direction: "low", deathsM: null, deaths: "lower tier (global count not isolated)", dalysM: null, rank: null, tmrel: "~50–70 g/day", foods: ["legumes"], note: "A leading diet risk in parts of Latin America, South Asia and sub-Saharan Africa.", source: { cite: "GBD 2017 Diet Collaborators, Lancet 2019", id: "PMID:30954305" } },
  "high-processed-meat": { risk: "Diet high in processed meat", direction: "high", deathsM: null, deaths: "lower tier (~172k IHD deaths, GBD 2019)", dalysM: null, rank: null, tmrel: "0 g/day", foods: ["processed-meat"], source: { cite: "GBD 2017 Diet Collaborators, Lancet 2019", id: "PMID:30954305" } },
  "high-red-meat": { risk: "Diet high in red meat", direction: "high", deathsM: null, deaths: "contested: ~25k/yr (GBD 2017) vs ~896k/yr (GBD 2019)", dalysM: null, rank: null, tmrel: "0 g/day", foods: ["red-meat"], note: "GBD 2019 raised this ~36-fold via a TMREL change, formally contested in the Lancet (2022).", source: { cite: "GBD 2017/2019; Lancet 2022 correspondence", id: "PMID:30954305" } },
  "high-ssb": { risk: "Diet high in sugar-sweetened beverages", direction: "high", deathsM: null, deaths: "lower tier (global count not isolated)", dalysM: null, rank: null, tmrel: "0 g/day", foods: ["sugary-drinks"], source: { cite: "GBD 2017 Diet Collaborators, Lancet 2019", id: "PMID:30954305" } },
  "high-trans-fat": { risk: "Diet high in trans fat", direction: "high", deathsM: null, deaths: "lower tier (global count not isolated)", dalysM: null, rank: null, tmrel: "0% of energy", foods: ["trans-fat"], source: { cite: "GBD 2017 Diet Collaborators, Lancet 2019", id: "PMID:30954305" } },
  "low-milk": { risk: "Diet low in milk", direction: "low", deathsM: null, deaths: "lower tier (global count not isolated)", dalysM: null, rank: null, tmrel: "~350–520 g/day", foods: ["milk"], source: { cite: "GBD 2017 Diet Collaborators, Lancet 2019", id: "PMID:30954305" } },
  "alcohol": { risk: "Alcohol use", direction: "high", deathsM: 2.8, deaths: "~2.8 million/yr", dalysM: null, rank: null, tmrel: "0 drinks/day", foods: ["alcohol"], separate: true, note: "A SEPARATE GBD risk (not one of the 15 dietary risks); #1 risk factor for ages 15–49.", source: { cite: "GBD 2016 Alcohol Collaborators, Lancet 2018", id: "DOI:10.1016/S0140-6736(18)31310-2" } },
};
// Map burden onto each covered food (with a "shared across the category" flag where
// one GBD risk spans several of our foods, so we never imply a single food owns the
// whole category's burden).
for (const _k in BURDEN) {
  const _b = BURDEN[_k];
  const _shared = _b.foods.length > 1;
  for (const _id of _b.foods) {
    if (ASSESSMENTS[_id]) {
      ASSESSMENTS[_id].burden = Object.assign({}, _b, { key: _k, sharedAcross: _shared ? _b.risk.replace(/^Diet (low|high) in /, "") : null });
    }
  }
}

// Allow Node (tests) to import this data while the browser loads it as a script.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { FOODS, ASSESSMENTS, NUTRIGRADE_RUBRIC, METHODOLOGY_VERSION, CATEGORY_UNIFORMITY, UNIFORMITY_NOTE, HOLDING_LIST, RESEARCHED_ON, MECHANISM, BURDEN };
}

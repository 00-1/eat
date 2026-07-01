/*
 * Steelmanning attempts — popular counter-arguments against our verdicts, in
 * their strongest form, judged honestly. `stance` records how our verdict fares:
 *   stance "holds"     — our verdict survives; we say WHY the argument fails under
 *                        our approach (usually biomarker/mechanism reductionism our
 *                        guardrail won't let override observed outcomes).
 *   stance "partial"   — partly right (a sub-type, a substitution, a population), or
 *                        it matches our stated uncertainty.
 *   stance "valid"     — a genuine limitation we concede.
 *   stance "certainty" — a DIFFERENT axis: the argument AGREES with our direction
 *                        but disputes our CERTAINTY (usually thinks we're too
 *                        cautious — credible people are more confident than we are).
 *                        We don't argue direction here; we defend or revisit the
 *                        certainty rating. These are interesting precisely because
 *                        the disagreement is about confidence, not verdict.
 *
 * Many real claims target a whole CATEGORY ("fruit", "carbs", "saturated fat"),
 * not one food. So claims live in two places:
 *   SHARED_CLAIMS — scoped to a tag; resolved onto every food carrying that tag.
 *   COUNTER_ARGUMENTS — genuinely food-specific, keyed by food id.
 * A food's displayed list = shared claims for its FOOD_TAGS + its specific ones.
 *
 * Attributions must be real. See research/counter-arguments-research.md.
 */

// Claim-scope tags a food belongs to (separate from its display `category`).
const TAG_LABEL = {
  fruit: "fruit",
  "high-carb": "carb-rich foods",
  "plant-antinutrient": "plant foods (lectins/phytates/oxalates)",
  "gluten-grain": "gluten grains",
  "saturated-fat": "saturated-fat-rich foods",
};

const FOOD_TAGS = {
  "tree-nuts": ["plant-antinutrient"],
  "legumes": ["high-carb", "plant-antinutrient"],
  "whole-grains": ["high-carb", "gluten-grain", "plant-antinutrient"],
  "leafy-greens": ["plant-antinutrient"],
  "whole-fruit": ["fruit", "high-carb"],
  "yogurt": ["saturated-fat"],
  "sugary-drinks": ["high-carb"],
  "refined-grains": ["high-carb", "gluten-grain"],
  "eggs": ["saturated-fat"],
  "milk": ["saturated-fat"],
  "cheese": ["saturated-fat"],
  "butter": ["saturated-fat"],
  "potatoes": ["high-carb"],
  "coconut-oil": ["saturated-fat"],
  "white-rice": ["high-carb"],
  "soy": ["plant-antinutrient"],
  "cruciferous": ["plant-antinutrient"],
  "cocoa": ["saturated-fat"],
};

// Category-level claims, each scoped to one or more tags.
const SHARED_CLAIMS = [
  {
    scope: ["fruit"],
    claim: "Fruit is harmful because its sugar/fructose spikes blood glucose and drives fat storage.",
    proponents: "Carnivore-diet advocates (e.g. Shawn Baker, Mikhaila Peterson) and parts of the low-carb community; echoes Robert Lustig's anti-fructose work (which targets added sugar, not whole fruit).",
    evidenceCited: "Acute glycemic response; fructose and hepatic de-novo lipogenesis in overfeeding studies.",
    stance: "holds",
    assessment:
      "Textbook biomarker reductionism — what our guardrail rejects. A glucose spike is a surrogate; an RCT meta-analysis in diabetics (Ren et al., Front Endocrinol 2023; 19 trials) found fruit actually LOWERED fasting glucose (−8.38 mg/dL) with neutral HbA1c. Whole fruit tracks with lower diabetes/mortality (Muraki 2013; Wang 2014) while fruit JUICE goes the other way, and Lustig himself exempts whole fruit. Mechanism doesn't override outcomes.",
  },
  {
    scope: ["high-carb"],
    claim: "Carb-rich foods spike blood sugar and insulin, so they're inherently fattening and harmful.",
    proponents: "The carbohydrate-insulin model — Gary Taubes (Good Calories, Bad Calories), low-carb/keto physicians and communities.",
    evidenceCited: "Insulin response to carbohydrate; glycemic index/load; short-term metabolic-ward studies.",
    stance: "holds",
    assessment:
      "What actually happens depends on the FOOD, not the macronutrient. Carb-rich WHOLE foods — whole grains, legumes, whole fruit — track with lower mortality and diabetes; refined and sugary carbs track with harm. Our model already scores those very differently, which is the point: 'carbs' isn't a health category. The insulin-spike mechanism doesn't survive contact with the outcome data for whole-food carbs.",
  },
  {
    scope: ["plant-antinutrient"],
    claim: "Plants defend themselves with anti-nutrients — lectins, phytates, oxalates — that harm humans.",
    proponents: "Steven Gundry (The Plant Paradox); carnivore/paleo communities; oxalate-focused writers (e.g. Sally Norton).",
    evidenceCited: "Raw-lectin toxicity; phytate mineral binding in vitro; oxalate content of some plants.",
    stance: "holds",
    assessment:
      "Cooking and soaking destroy the lectins that matter and cut phytates; the mineral effect is minor in a varied diet. The observed signal is the opposite of harm — legumes were among the strongest predictors of longevity across cultures (Darmadi-Blackberry 2004), and whole grains, nuts and greens all track with lower mortality. Oxalates are a real, bounded concern for recurrent kidney-stone formers (see that food's exceptions), not a general toxin. In-vitro mechanism, refuted by free-living outcomes.",
  },
  {
    scope: ["gluten-grain"],
    claim: "Gluten is inflammatory and harms everyone, not just people with celiac disease.",
    proponents: "William Davis (Wheat Belly), David Perlmutter (Grain Brain); paleo/ancestral communities.",
    evidenceCited: "Gluten/wheat-germ-agglutinin mechanisms; anecdotal symptom reports; glycemic load of refined wheat.",
    stance: "holds",
    assessment:
      "For people without celiac disease or diagnosed sensitivity, the outcome data run the other way: whole grains track with lower mortality, CVD and diabetes (Aune 2016; Reynolds 2019). Much of the case conflates refined wheat with whole grains — which we score very differently. Celiac (~1%) and a smaller non-celiac sensitivity group are real and are flagged in exceptions; 'gluten harms everyone' is not.",
  },
  {
    scope: ["saturated-fat"],
    claim: "Saturated fat was wrongly demonized; SFA-rich whole foods are fine because of the 'food matrix'.",
    proponents: "Nina Teicholz (The Big Fat Surprise), Gary Taubes; the food-matrix reframing of Astrup, Mozaffarian & Krauss et al. (JACC 2020); Chowdhury et al. (Annals 2014).",
    evidenceCited: "Meta-analyses finding SFA not significantly associated with CVD; the dairy 'matrix'; PURE (Dehghan 2018): higher dairy → lower mortality/CVD (HR ~0.83).",
    stance: "partial",
    assessment:
      "Partly right, and our verdicts reflect it: full-fat dairy and cheese come out roughly neutral (the matrix is the likely reason), not 'bad.' But it overstates consensus and does NOT generalise — the SFA→LDL→CVD pathway still holds for butter and coconut oil, the stronger 'SFA limits are unsupported' claims don't survive scrutiny, the AHA's RCT-based case that swapping SFA for PUFA cuts CVD ~30% stands, and several matrix papers carry dairy-industry ties. Food-specific, substitution-dependent — right about cheese, wrong if stretched to 'eat more saturated fat.'",
  },
];

const COUNTER_ARGUMENTS = {
  "olive-oil": [
    {
      claim: "Olive oil's cardiovascular benefit is well-established — rating it only 'Low' certainty is surprisingly, needlessly cautious.",
      proponents: "Mediterranean-diet researchers and the PREDIMED investigators (Estruch, Ros, Martínez-González); broad cardiology/AHA consensus and popular health media.",
      evidenceCited: "PREDIMED RCT (~30% fewer major cardiovascular events on a Mediterranean diet with extra-virgin olive oil); large US cohorts (Guasch-Ferré 2022, ~19% lower CVD mortality at >7 g/day); decades of Mediterranean-diet epidemiology.",
      stance: "certainty",
      assessment:
        "We AGREE on direction — olive oil is positive — so this isn't a verdict dispute; it challenges our confidence, which is the interesting part. Our 'Low' is narrower than it looks: it rates our confidence in the OIL ITSELF, not the Mediterranean pattern. PREDIMED randomized a whole dietary pattern (EVOO was supplied as one component of it), so it's strong evidence for the pattern, not for the oil in isolation; the oil-specific outcome-cohort base is comparatively modest and confounding-prone (olive-oil users eat better overall). PREDIMED was also retracted and republished in 2018 after randomization irregularities — the corrected result held, but that history argues FOR humility. So the confident experts and our Low aren't really in conflict: they're sure about the Mediterranean pattern; we're cautious about crediting the bottle of oil on its own. (Whether 'Low' is too cautious is flagged for a deeper research pass — we may simply not have grounded the oil-specific evidence enough yet.)",
    },
  ],
  "red-meat": [
    {
      claim: "Unprocessed red meat is unfairly maligned; the evidence against it is weak and low-certainty.",
      proponents: "Zeraatkar/Johnston NutriRECS group (Annals of Internal Medicine, 2019); many low-carb physicians.",
      evidenceCited: "GRADE assessment finding low-certainty evidence and small absolute risk reductions from cutting red meat.",
      stance: "valid",
      assessment:
        "This one largely AGREES with us. We already rate unprocessed red meat neutral/contested at very-low certainty — NutriRECS found low-certainty evidence and a tiny absolute effect (~8 deaths/1,000 over 11 years, CI including zero). Two honest caveats cut the other way: the lead author had an undisclosed industry tie, and a 2025 AJCN review found pro-red-meat trials ~4× more likely to report favorable results when industry-funded (OR 3.75). So 'the evidence is weak' is fair; 'therefore red meat is good' is not.",
    },
  ],
  "processed-meat": [
    {
      claim: "Processed meat is only guilty by association — it's the unhealthy overall lifestyle, not the meat.",
      proponents: "Low-carb and meat-industry-aligned commentators; general residual-confounding critiques.",
      evidenceCited: "Healthy-user bias; processed-meat eaters smoke more, exercise less.",
      stance: "partial",
      assessment:
        "Confounding is real and we discount for it — but here it doesn't carry the verdict. The signal is consistent across many cohorts with dose-response, there's a validated mechanism (nitrosamines, heme iron), and IARC classifies it a Group 1 carcinogen for colorectal cancer on this combined weight. Confounding shaves the estimate; it doesn't erase a convergent, mechanistically-backed harm.",
    },
  ],
  "coconut-oil": [
    {
      claim: "Coconut oil is a superfood — its MCTs boost metabolism and traditional coconut-eating peoples are healthy.",
      proponents: "Wellness influencers and marketing; pushback against the AHA's 2017 advisory to avoid it.",
      evidenceCited: "MCT metabolism studies; observational health of Tokelau/Kitava populations.",
      stance: "holds",
      assessment:
        "Both extremes overreach, and our 'neutral / very-low certainty' sits between them. MCT trials use purified MCT oil, not coconut oil (mostly lauric acid); the traditional-population data are confounded by the whole ancestral diet. With essentially no outcome data on coconut oil itself — and a consistent LDL rise (AHA 2017) — we decline to call it either super or poison.",
    },
  ],
  "alcohol": [
    {
      claim: "Moderate drinking is protective — the J-shaped curve shows wine drinkers live longer.",
      proponents: "Decades of earlier epidemiology and wine/resveratrol advocates; still common in popular media.",
      evidenceCited: "J-curve cohort associations between light drinking and lower CVD/mortality.",
      stance: "holds",
      assessment:
        "The J-curve is the textbook abstainer/'sick-quitter' bias: the 'none' group includes former and ill drinkers, flattering moderate drinkers. A 2024 meta-analysis of 107 cohorts (~4.8M people; Stockwell/Zhao) found the benefit vanished in higher-quality studies (RR 0.98, NS), surfaced only in low-quality ones, and was above 1.0 in nonsmoker cohorts. With cancer risk rising from low intake, our neutral-trending-harmful verdict reflects the corrected evidence, not the artifact.",
    },
  ],
  "sugary-drinks": [
    {
      claim: "Sugary drinks aren't uniquely harmful — 'a calorie is a calorie,' it's just energy balance.",
      proponents: "Energy-balance advocates and industry-funded research — most notably Coca-Cola's Global Energy Balance Network (James Hill, Steven Blair), and the sugar industry's documented influence (Kearns et al., 2016).",
      evidenceCited: "Isocaloric-substitution arguments; industry-sponsored reviews shifting blame to inactivity.",
      stance: "holds",
      assessment:
        "Refuted on multiple lines: cohorts show SSB-specific risk for diabetes and CVD, with randomized support on weight/metabolic markers and a clear mechanism (rapid liquid sugar, poor satiety). And the 'just calories / it's inactivity' framing is the textbook case of weaponized funding bias — an FOI analysis of 18,030 Coca-Cola emails (Serodio et al., 2020) showed the company deliberately obscured its role in the GEBN. Funding bias is a flag our method weighs explicitly.",
    },
  ],
  "ultra-processed": [
    {
      claim: "The 'ultra-processed' / NOVA category is unscientific and too broad to be useful.",
      proponents: "Various food scientists and industry commentators; legitimate academic critiques of NOVA's reproducibility.",
      evidenceCited: "Poor inter-rater classification of NOVA; the category lumps sodas with whole-grain bread.",
      stance: "partial",
      assessment:
        "A fair hit on the definition — which is why we already flag UPF as broad and heterogeneous and hold it only at moderate certainty. But the critique doesn't dissolve the outcome signal: high UPF intake tracks with worse health across cohorts, and a controlled inpatient trial (Hall 2019) showed these foods cause overeating. The category is fuzzy; the effect is not imaginary.",
    },
  ],
  "fatty-fish": [
    {
      claim: "Fish is dangerous because of mercury and other contaminants.",
      proponents: "Precautionary advocates and parts of the toxics/environmental discourse.",
      evidenceCited: "Methylmercury and PCB content, especially in large predatory fish.",
      stance: "partial",
      assessment:
        "Valid for high-mercury species and for pregnancy/young children — a real, bounded caveat. But for the oily fish our verdict is about (salmon, sardines, mackerel), the landmark analysis weighing exactly this trade-off found benefits outweigh contaminant risk at typical intake (Mozaffarian & Rimm, 2006). A scoping caveat, not a reversal.",
    },
  ],
  "artificial-sweeteners": [
    {
      claim: "Artificial sweeteners cause metabolic harm by disrupting the gut microbiome.",
      proponents: "Suez, Korem, Elinav & Segal (Weizmann Institute), Nature 2014.",
      evidenceCited: "Non-caloric sweeteners induced glucose intolerance in mice via microbiota; a small human experiment (n=7) found responders with distinct microbiomes.",
      stance: "partial",
      assessment:
        "A real, named scientific finding — not a strawman — and part of why we rate sweeteners neutral/very-low rather than benign. But the human evidence is thin: n=7, the causal fecal-transfer result was mouse-level, and a 2021 study failed to replicate glucose intolerance in healthy humans. It supports 'uncertain,' not 'harmful' — which is exactly our stance.",
    },
    {
      claim: "Even the WHO advises against artificial sweeteners — they don't help weight control and may raise long-term disease risk.",
      proponents: "World Health Organization, 2023 guideline on non-sugar sweeteners (NSS).",
      evidenceCited: "A commissioned 2022 systematic review found no long-term benefit for body fat and observational associations between higher NSS intake and type 2 diabetes, cardiovascular disease, and all-cause mortality.",
      stance: "partial",
      assessment:
        "An authoritative lean we take seriously rather than wave away — but the WHO itself issued it as a CONDITIONAL recommendation on LOW-certainty evidence, and the disease associations are observational and badly confounded by reverse causation (people already at cardiometabolic risk switch to diet products). Against sugar specifically, substitution trials still favour sweeteners short-term. So it reinforces 'net uncertain' — our neutral/low verdict — not a finding of harm.",
    },
  ],
};

// Resolve the full steelman list for a food: shared (scoped) claims + specific.
function counterArgumentsFor(foodId) {
  const tags = FOOD_TAGS[foodId] || [];
  const shared = SHARED_CLAIMS.filter(function (c) {
    return c.scope.some(function (t) { return tags.indexOf(t) !== -1; });
  }).map(function (c) {
    return Object.assign({ shared: true }, c);
  });
  const specific = COUNTER_ARGUMENTS[foodId] || [];
  return shared.concat(specific);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { COUNTER_ARGUMENTS, SHARED_CLAIMS, FOOD_TAGS, TAG_LABEL, counterArgumentsFor };
}

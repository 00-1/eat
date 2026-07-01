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
  "wholemeal-bread": ["high-carb", "gluten-grain", "plant-antinutrient"],
  "white-bread": ["high-carb", "gluten-grain"],
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
  "tree-nuts": [
    {
      claim: "Most nuts people actually eat are salted and roasted, so the sodium cancels out the benefit — the 'add nuts' verdict only holds for raw nuts.",
      proponents: "A common-sense reading from sodium/blood-pressure guidance (WHO <2000 mg/day; hypertension advocacy); reasonable given nuts' salt-snack reputation.",
      evidenceCited: "A 28 g serving of salted nuts adds ~90–190 mg sodium (roasted salted peanuts ~120 mg, salted almonds ~185 mg); sodium raises blood pressure, a causal CVD pathway.",
      stance: "holds",
      assessment:
        "The verdict survives, because the benefit was measured largely in people eating salted/roasted nuts. Bao 2013 (NEJM, tree nuts HR 0.83, peanuts 0.88) and Luu 2015 (a low-income US cohort eating mostly salted/roasted peanuts) both found robust lower mortality, and PREDIMED (Estruch 2018) got ~28% fewer CVD events with specifically raw nuts — so both salted-inclusive cohorts and raw-nut RCTs point the same way. A serving's ~90–190 mg sodium is only ~5–10% of the daily budget, and nuts' potassium/magnesium/unsaturated fat lower BP in trials on net. Honest caveat: no study directly compares salted vs unsalted outcomes, so this rests on mechanism plus the raw-nut RCT; unsalted/dry-roasted is the marginally better choice, especially if you're salt-sensitive — but salting doesn't erase the benefit.",
    },
  ],
  "avocado": [
    {
      claim: "The avocado–CVD association is a fragile observational signal driven by healthy-user confounding and substitution effects, and the one large RCT with a hard endpoint (visceral fat) was null.",
      proponents: "John P.A. Ioannidis (Stanford), a longstanding critic of single-food nutritional epidemiology; and the HAT-trial investigators themselves (Kris-Etherton, Sabaté, Lichtenstein, Petersen), who reported a null primary outcome.",
      evidenceCited: "Avocado eaters' healthy-user profile in NHANES (younger, more educated, higher income, lower BMI, more active); Pacheco 2022's benefit concentrated in substitution models (replacing butter/margarine/cheese/processed meat) with no stroke association; the HAT trial's null primary endpoint (visceral adipose tissue) despite industry funding.",
      stance: "partial",
      assessment:
        "Largely right — and it matches, rather than overturns, our Low certainty. Pacheco 2022 (JAHA, pooled HR 0.84 for CVD) is observational, showed no stroke effect, and drew much of its signal from substitution modelling, so it plausibly reflects avocado replacing worse fats more than avocado itself. The HAT trial (Kris-Etherton/Sabaté 2022, PMID 35861827) was null on its pre-specified visceral-fat endpoint and industry-funded, so its small LDL improvement is a biomarker that under our guardrail can't override the absent hard-outcome effect — though it usefully showed no weight gain, defusing the calorie-density worry. Net: the direction stays Positive but the argument justifies keeping certainty Low.",
    },
  ],
  "coffee": [
    {
      claim: "The single 'Positive, Moderate' verdict masks real heterogeneity: coffee's net effect may turn harmful for slow caffeine metabolisers (CYP1A2), and unfiltered brews measurably raise LDL — so certainty should be conditioned on genotype and preparation.",
      proponents: "Marilyn Cornelis & Ahmed El-Sohemy (Toronto) and Hannia Campos (Harvard) for the CYP1A2 heart-attack study; Paolo Palatini (Padova) for CYP1A2–hypertension; Rob Urgert & Martijn Katan (Wageningen) and Dag Thelle (Tromsø) for unfiltered-coffee LDL.",
      evidenceCited: "The CYP1A2 slow-metaboliser allele prolongs caffeine exposure (raising blood pressure and sympathetic tone); cafestol/kahweol diterpenes in unfiltered coffee suppress bile-acid synthesis and raise LDL, and paper filters remove them.",
      stance: "partial",
      assessment:
        "Partly right, and unusually it rests on an actual outcome study, not just a marker: Cornelis et al. (JAMA 2006, PMID 16522833; ~2,000 MI cases/controls) found heart-attack risk rose only in slow metabolisers (OR ~1.67–2.33 in under-59s at ≥2 cups) while fast metabolisers trended protective. The preparation caveat is solid too — Urgert & Katan (Annu Rev Nutr 1997) quantified an LDL rise per cafestol dose, favouring filtered brewing. But it stays 'partial,' not verdict-overturning: the CYP1A2 cardiac interaction failed to replicate in the far larger UK Biobank analysis (Zhou & Hyppönen 2019, 347,077 people, no interaction), and IARC downgraded coffee to Group 3. So the flat 'Moderate' is directionally sound for filtered coffee in the general population, but the certainty is honestly conditional on brew and genotype.",
    },
  ],
  "french-fries": [
    {
      claim: "The 'fries = negative for diabetes' verdict is too broad: the harm attaches specifically to deep-fried commercial fries (baked/boiled/mashed potatoes were null), so it likely reflects the deep-frying method plus fast-food correlates — not potatoes as a category — and shouldn't extend to home-baked or air-fried.",
      proponents: "The BMJ linked-editorial authors (Ibsen & Zhang) and the study's own authors (incl. Mousavi), who stress preparation method over the potato; the industry-funded Alliance for Potato Research & Education, which defends potatoes as nutrient-dense.",
      evidenceCited: "Mousavi et al. (BMJ 2025; >205,000 across NHS/NHS II/HPFS, 22,299 T2D cases): French fries HR 1.20 (1.12–1.28) per 3 servings/week, but combined baked/boiled/mashed potatoes not significantly associated. Deep-frying adds fats, acrylamide and advanced glycation end-products; air-frying cuts acrylamide ~90%.",
      stance: "partial",
      assessment:
        "Partly right, and the primary study supports it: Mousavi 2025 found deep-fried fries at HR 1.20 but a null association for baked/boiled/mashed potatoes, so condemning 'fries' broadly over-reaches onto home-baked/air-fried preparations that were never tested. The confounding critique is weaker — the 1.20 survived adjustment for BMI, activity, energy and diet quality, and the internal contrast with null baked potatoes argues the frying process carries real signal, consistent with the acrylamide/AGE mechanisms (which corroborate but don't override the outcome). So the negative verdict holds for standard deep-fried fries at moderate certainty; the honest fix is scope — label it deep-fried fries specifically, not potatoes or air-fried 'fries.'",
    },
  ],
  "green-tea": [
    {
      claim: "Tea's mortality benefit is largely healthy-user confounding in Asian cohorts, while the reproducibly causal tea signals point the other way (very hot tea raises oesophageal-cancer risk; concentrated green-tea-extract supplements cause liver injury) — so a blanket 'Positive' overstates it.",
      proponents: "Farhad Islami and the Golestan/IARC investigators (hot-beverage carcinogenicity); EFSA and the US Pharmacopeia panel (green-tea-catechin hepatotoxicity); and the original cohort authors (Kuriyama; Abe/Saito), who concede residual confounding.",
      evidenceCited: "Japanese cohorts note green-tea drinkers cluster with healthier lifestyles; Islami 2020 (Golestan) found objectively-measured tea ≥60 °C carried HR 1.41 for oesophageal squamous-cell cancer (hot beverages are IARC Group 2A); EFSA linked ≥800 mg/day EGCG from supplements to liver injury.",
      stance: "partial",
      assessment:
        "The confounding point is real and is exactly why 'Low certainty' is right — but it doesn't flip the direction. The UK Biobank study (Inoue-Choi 2022, Ann Intern Med, ~498,000 people, mostly black tea in a Western population) found HR 0.87–0.88 at 2+ cups/day after adjustment — the non-Asian, non-green replication that defuses the healthy-user objection — and a 2024 38-cohort meta-analysis pooled HR 0.90. The temperature and extract harms are genuine but concern scalding heat and concentrated supplements, not brewed tea (EFSA explicitly exempts normal infusions; the Golestan risk is driven by ≥60 °C heat), so per our guardrail they qualify rather than override. Net: the argument correctly pins the uncertainty but fails as a case against a Positive direction.",
    },
  ],
  "poultry": [
    {
      claim: "Poultry isn't truly 'neutral': the label hides a well-replicated substitution benefit (poultry replacing red/processed meat lowers mortality), while a few cohorts flag weight gain or specific cancers.",
      proponents: "An Pan & Frank Hu (Harvard) and Zheng/Satija (BMJ) for the red-meat-substitution benefit; Mozaffarian & Hu for the weight-gain signal; Knüppel/Bradbury/Key (Oxford, UK Biobank) and Bonfiglio/Giannelli (Italy) for the weak cancer associations.",
      evidenceCited: "Pan 2012 and Zheng 2019: swapping a daily serving of red meat for poultry is associated with 7–19% lower mortality. Mozaffarian 2011 (NEJM) lists poultry among foods with modest weight gain. Knüppel 2020 (UK Biobank) raw poultry–melanoma/prostate/NHL associations; Bonfiglio 2025 links >300 g/wk poultry to higher GI-cancer mortality. High-heat cooking forms HCAs/PAHs.",
      stance: "partial",
      assessment:
        "The substitution point is genuine and well-replicated (Pan 2012, PMID 22412075; Zheng 2019, PMID 31189526), so 'neutral' as a standalone verdict is defensible against an absolute-harm claim but understates poultry's value as a swap for red meat. The cancer signals are weak and confounded: in Knüppel 2020 the poultry associations did not survive correction for multiple testing, and Bonfiglio 2025 rests on only 108 GI-cancer deaths with no adjustment for physical activity or cooking method. Per our guardrail the HCA/PAH chemistry alone can't upgrade harm when the outcome data are inconsistent — so a 'harmful' verdict fails, but the substitution upside means the flat 'neutral' is only a partial answer.",
    },
  ],
  "tomatoes": [
    {
      claim: "Higher whole-tomato intake (especially cooked) is consistently associated with lower prostate-cancer risk in large cohorts and dose-response meta-analyses, so the verdict should be modestly Positive, not neutral.",
      proponents: "Edward Giovannucci (Harvard, Health Professionals Follow-Up Study); Ke Zu et al. (2014 HPFS update); Rowles & Erdman (Illinois, 2018 meta-analysis); and the WCRF, which lists tomato/lycopene as 'limited-suggestive' for prostate cancer.",
      evidenceCited: "Giovannucci HPFS (JNCI 2002) and Zu 2014 (JNCI; lethal-disease HR 0.72 top vs bottom lycopene quintile) show an inverse cooked-tomato/prostate-cancer signal; Rowles/Erdman 2018 found a dose-response for cooked (not raw) tomatoes. Mechanism: lycopene, more bioavailable when cooked, is anti-angiogenic.",
      stance: "partial",
      assessment:
        "This is the strongest possible steelman because it argues from human outcomes, not a biomarker — and it's partly right: the cooked-tomato/prostate-cancer signal is real and reproducible. But it doesn't overturn 'neutral' for two reasons our guardrail reinforces. First, it's narrow (males, one cancer site) and can't justify a general positive verdict on tomatoes as a food. Second, the causal test failed the other way: isolated as a pill or measured as serum lycopene, RCTs and biomarker cohorts went null (Kristal 2011 PCPT; Cochrane 2011), and the FDA's evidence review permitted only a heavily-qualified claim. A modest, site-specific outcome signal against a biomarker that collapses when isolated lands honestly at neutral / low certainty, not Positive.",
    },
  ],
  "trans-fat": [
    {
      claim: "The RR 1.42 applies specifically to INDUSTRIAL trans fat; de Souza 2015 itself found RUMINANT trans fat (dairy/beef) not associated with heart disease, so labelling the blanket category 'Negative, High' is too broad for the naturally-occurring subtype.",
      proponents: "Russell de Souza & Sonia Anand (McMaster, the meta-analysis authors); Dariush Mozaffarian (trans-palmitoleate research); Benoît Lamarche (Laval, ruminant-vs-industrial RCTs). Regulators (WHO, FDA, EFSA) all specifically target industrial/partially-hydrogenated-oil trans fat.",
      evidenceCited: "de Souza 2015 (BMJ): industrial TFA associated with CHD (RR 1.42, 1.05–1.92) but ruminant TFA not significant (0.93, 0.73–1.18); the paper even found ruminant trans-palmitoleate inversely associated with diabetes. Mozaffarian's MESA/Health-ABC cohorts linked trans-palmitoleate to lower incident diabetes. Bans (Denmark 2003, FDA 2018, WHO REPLACE) target industrial TFA only.",
      stance: "partial",
      assessment:
        "The direction is correct and robust for industrial trans fat — de Souza 2015 (PMID 26268692) reports RR 1.42 for CHD, an observed outcome our guardrail privileges — but the same paper found ruminant TFA not significantly associated with heart disease, and trans-palmitoleate even trended protective for diabetes. So a blanket 'trans fat = Negative' overstates the case for the naturally-occurring dairy/beef subtype: the honest disposition is partial. The ruminant evidence is weaker and shorter-term and doesn't touch the strong industrial-TFA outcome data — the fix is scope (this verdict is about industrial partially-hydrogenated oils), not a change of direction.",
    },
  ],
  "berries": [
    {
      claim: "Berry 'superfood' benefits are healthy-user confounding and industry spin — the RCTs miss hard glycemic endpoints, and much research is blueberry-council funded.",
      proponents: "Nutrition-epidemiology methodologists on residual confounding; and blueberry-review authors themselves, who note NutriGrade rated no berry evidence 'high quality' and that flagship RCTs (e.g. Curtis 2019) left HOMA-IR unchanged.",
      evidenceCited: "Cohort associations track overall diet quality; the U.S. Highbush Blueberry Council (a USDA checkoff) funds much positive berry research; berry RCTs consistently move vascular markers but not fasting glycemia.",
      stance: "partial",
      assessment:
        "A fair hit that we already price in with Low certainty. The confounding and funding concerns are real, and the trial evidence is vascular-marker (FMD) not hard-outcome — which is exactly why berries aren't rated higher. But the type-2-diabetes cohort signal is consistent and specifically strongest for blueberries (Muraki 2013), and anthocyanin RCTs corroborate the direction on validated markers. So 'uncertain and modest' is right; 'no real effect' overshoots.",
    },
  ],
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

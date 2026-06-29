/*
 * Popular counter-arguments against our verdicts.
 *
 * The point is to pressure-test our model against REAL, attributed positions —
 * not strawmen — and to judge each honestly:
 *   stance "holds"   — our verdict survives; we say WHY the argument fails under
 *                      our approach (usually: it relies on a biomarker/mechanism
 *                      that our guardrail won't let override observed outcomes).
 *   stance "partial" — partly right (true for a sub-type, a substitution, or a
 *                      population), but not the whole verdict; or it matches our
 *                      stated uncertainty.
 *   stance "valid"   — a genuine limitation we concede; noted with what it implies.
 *
 * Each entry: { claim, proponents, evidenceCited?, stance, assessment }.
 * `proponents` must be real and attributable. Keyed by food id.
 *
 * This list is being expanded/verified via dedicated research; entries here are
 * established public positions. See research/counter-arguments-research.md.
 */
const COUNTER_ARGUMENTS = {
  "whole-fruit": [
    {
      claim: "Fruit is harmful because its sugar/fructose spikes blood glucose and drives fat storage.",
      proponents: "Carnivore-diet advocates (e.g. Shawn Baker, Mikhaila Peterson) and parts of the low-carb community; echoes Robert Lustig's anti-fructose work (which actually targets added sugar, not whole fruit).",
      evidenceCited: "Acute glycemic response; fructose and hepatic de-novo lipogenesis in overfeeding studies.",
      stance: "holds",
      assessment:
        "Textbook biomarker reductionism — exactly what our guardrail rejects. A glucose spike is a surrogate; an RCT meta-analysis in diabetics (Ren et al., Front Endocrinol 2023; 19 trials, 888 people) found fruit actually LOWERED fasting glucose (−8.38 mg/dL) with neutral HbA1c — the spike doesn't translate into worse control. Observationally, whole fruit tracks with lower diabetes and mortality (Muraki 2013; Wang 2014) while fruit JUICE goes the other way, and Lustig himself exempts whole fruit. Mechanism doesn't override the outcome data.",
    },
  ],
  "whole-grains": [
    {
      claim: "Grains are inflammatory and gluten harms everyone, not just people with celiac disease.",
      proponents: "William Davis (Wheat Belly), David Perlmutter (Grain Brain); paleo/ancestral communities.",
      evidenceCited: "Gluten/wheat-germ-agglutinin mechanisms; anecdotal symptom reports; glycemic load of refined wheat.",
      stance: "holds",
      assessment:
        "For people without celiac disease or diagnosed sensitivity, the observed outcome data run the other way: each extra serving of whole grains tracks with lower mortality, CVD, and diabetes (Aune 2016; Reynolds 2019). Much of the indictment conflates refined wheat with whole grains — which our model already scores very differently. Mechanism over outcomes again.",
    },
  ],
  "legumes": [
    {
      claim: "Legumes are harmful because of anti-nutrients — lectins and phytates.",
      proponents: "Steven Gundry (The Plant Paradox); paleo/carnivore communities.",
      evidenceCited: "Raw-lectin toxicity; phytate mineral binding in vitro.",
      stance: "holds",
      assessment:
        "Soaking and cooking destroy the lectins that matter, and phytate's mineral effect is minor in a varied diet. The observed signal is the opposite of harm: legume intake was among the strongest dietary predictors of longevity across cultures (Darmadi-Blackberry 2004). In-vitro mechanism, refuted by free-living outcomes.",
    },
  ],
  "red-meat": [
    {
      claim: "Unprocessed red meat is unfairly maligned; the evidence against it is weak and low-certainty.",
      proponents: "Zeraatkar/Johnston NutriRECS group (Annals of Internal Medicine, 2019); many low-carb physicians.",
      evidenceCited: "GRADE assessment finding low-certainty evidence and small absolute risk reductions from cutting red meat.",
      stance: "valid",
      assessment:
        "This one largely AGREES with us. We already rate unprocessed red meat neutral/contested at very-low certainty for exactly this reason — NutriRECS found low-certainty evidence and a tiny absolute effect (~8 deaths/1,000 over 11 years, CI including zero). Two honest caveats cut the other way, though: the lead author had an undisclosed industry tie, and a 2025 AJCN review found pro-red-meat trials are ~4× more likely to report favorable results when industry-funded (OR 3.75). So 'the evidence is weak' is fair; 'therefore red meat is good' is not.",
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
  "butter": [
    {
      claim: "Saturated fat was wrongly demonized; butter is fine or even healthy.",
      proponents: "Nina Teicholz (The Big Fat Surprise), Gary Taubes; the 'food matrix' reframing of Astrup, Mozaffarian & Krauss et al. (JACC 2020); Chowdhury et al. (Annals 2014).",
      evidenceCited: "Meta-analyses finding saturated fat not significantly associated with CVD; the dairy 'matrix' argument; PURE (Dehghan 2018) showing higher dairy → lower mortality/CVD.",
      stance: "partial",
      assessment:
        "Partly right, and our verdict reflects it: butter is neutral/low-certainty, not 'bad,' and the food-matrix point genuinely holds for full-fat dairy/cheese (PURE: HR ~0.83). But it overstates consensus — the stronger 'SFA limits are unsupported' claims don't survive scrutiny, the AHA's RCT-based case that swapping SFA for PUFA cuts CVD ~30% still stands, and the matrix papers carry dairy-industry ties. Outcomes also depend on the substitution (olive/seed oils beat butter; butter beats trans fat). Neutral, not a health food.",
    },
  ],
  "coconut-oil": [
    {
      claim: "Coconut oil is a superfood — its MCTs boost metabolism and traditional coconut-eating peoples are healthy.",
      proponents: "Wellness influencers and marketing; pushback against the AHA's 2017 advisory to avoid it.",
      evidenceCited: "MCT metabolism studies; observational health of Tokelau/Kitava populations.",
      stance: "holds",
      assessment:
        "Both extremes overreach, and our 'neutral / very-low certainty' sits honestly between them. MCT trials use purified MCT oil, not coconut oil (mostly lauric acid); the traditional-population data are confounded by the entire ancestral diet and lifestyle. With essentially no outcome data on coconut oil itself, we decline to call it either super or poison.",
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
      claim: "Sugary drinks aren't uniquely harmful — 'a calorie is a calorie,' it's just about energy balance.",
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
  "milk": [
    {
      claim: "Full-fat dairy is fine or even protective — the 'food matrix' means its saturated fat shouldn't be judged in isolation.",
      proponents: "Astrup, Mozaffarian & Krauss et al. (JACC 2020 food-matrix review); supported by the PURE cohort (Dehghan, Lancet 2018).",
      evidenceCited: "PURE: higher total dairy → lower mortality/CVD (HR ~0.83), whole-fat not worse; dairy 'matrix' (calcium, MFGM, fermentation) blunts the LDL effect.",
      stance: "partial",
      assessment:
        "Genuinely well-attributed and it matches our verdict — we already rate milk neutral, not harmful, and the matrix point has real outcome support for dairy. Two limits keep it from 'therefore drink lots': the supporting data are observational (the same healthy-user biases contrarians invoke elsewhere), and several matrix papers carry dairy-industry ties. Neutral is the honest read, which is where we already sit.",
    },
  ],
  "cheese": [
    {
      claim: "Cheese's saturated fat and salt should make it unhealthy, yet it isn't — proof the saturated-fat model is wrong.",
      proponents: "Food-matrix proponents (Astrup et al., JACC 2020); fermented-dairy researchers.",
      evidenceCited: "Dose-response meta-analyses showing flat-to-slightly-protective CHD associations for cheese despite its SFA/sodium.",
      stance: "partial",
      assessment:
        "We agree cheese is roughly neutral (the 'dairy matrix' is the likely reason), so this isn't a counter to us — it's a counter to a naive SFA-only model we don't use. It does NOT generalise to 'all saturated fat is fine': the matrix effect is food-specific, and the SFA→LDL→CVD pathway still holds for, e.g., butter and coconut oil. Right about cheese, overreaching if extended.",
    },
  ],
  "artificial-sweeteners": [
    {
      claim: "Artificial sweeteners cause metabolic harm by disrupting the gut microbiome.",
      proponents: "Suez, Korem, Elinav & Segal (Weizmann Institute), Nature 2014.",
      evidenceCited: "Non-caloric sweeteners induced glucose intolerance in mice via microbiota; a small human experiment (n=7) found responders with distinct microbiomes.",
      stance: "partial",
      assessment:
        "A real, named scientific finding — not a strawman — and it's part of why we rate sweeteners neutral/very-low rather than benign. But the human evidence is thin: n=7, the causal fecal-transfer result was mouse-level, and a 2021 study failed to replicate glucose intolerance in healthy humans. It supports 'uncertain,' not 'harmful' — which is exactly our stance.",
    },
  ],
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { COUNTER_ARGUMENTS };
}

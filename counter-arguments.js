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
        "Textbook biomarker reductionism — exactly what our guardrail rejects. A glucose spike is a surrogate; what's observed when people add whole fruit is LOWER diabetes and mortality risk (Muraki 2013; Wang 2014), while fruit JUICE goes the other way. Fiber and the food matrix blunt the glycemic response, and Lustig himself exempts whole fruit. Mechanism doesn't override the outcome data.",
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
        "This one largely AGREES with us. We already rate unprocessed red meat neutral/contested at very-low certainty for exactly this reason — the cohort signal is small, inconsistent, and heavily confounded. It's a good example of a 'counter-argument' that our model has already absorbed rather than one it needs to beat.",
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
      proponents: "Nina Teicholz (The Big Fat Surprise), Gary Taubes; supported by Chowdhury et al. (Annals, 2014).",
      evidenceCited: "Meta-analyses finding saturated fat not significantly associated with CVD; weak butter–mortality association.",
      stance: "partial",
      assessment:
        "Partly right, and our verdict reflects it: butter is neutral/low-certainty, not 'bad.' Where the rehabilitation overreaches is 'therefore eat more' — outcomes depend on the substitution: replacing butter with olive/seed oils lowers modeled CVD risk, while replacing trans fat with butter improves it. Neutral, substitution-dependent — not a health food.",
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
        "The J-curve is the textbook abstainer/'sick-quitter' bias: the 'none' group includes former and ill drinkers, flattering moderate drinkers. Bias-corrected analyses (Stockwell 2016; GBD 2018; Zhao 2023) erase the protection, and cancer risk rises from low intake. Our neutral-trending-harmful verdict reflects the corrected evidence, not the artifact.",
    },
  ],
  "sugary-drinks": [
    {
      claim: "Sugary drinks aren't uniquely harmful — 'a calorie is a calorie,' it's just about energy balance.",
      proponents: "Industry-funded research and energy-balance advocates; the sugar industry's documented influence (Kearns et al., 2016).",
      evidenceCited: "Isocaloric-substitution arguments; industry-sponsored reviews downplaying SSBs.",
      stance: "holds",
      assessment:
        "Refuted on multiple lines: cohorts show SSB-specific risk for diabetes and CVD, and there's randomized support on weight and metabolic markers, with a clear mechanism (rapid liquid sugar, poor satiety/compensation). The 'just calories' framing is heavily tied to documented industry funding bias — a flag our method weighs explicitly.",
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
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { COUNTER_ARGUMENTS };
}

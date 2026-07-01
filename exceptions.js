/*
 * Subgroup exceptions — "who should be careful."
 *
 * A FIXED checklist applied to EVERY food, so this is systematic rather than
 * ad-hoc opinion. Categories (the `type` field):
 *   allergy      IgE allergy (mapped against the regulatory "Big-9" + known others)
 *   intolerance  intolerance / malabsorption (lactose, FODMAPs, fructose, histamine, gluten-NCGS)
 *   autoimmune   immune disease triggered by the food (celiac)
 *   condition    a medical condition that changes the calculus (gout, kidney stones, diabetes, G6PD…)
 *   medication   food–drug interaction (warfarin/vit-K, MAOI/tyramine)
 *   life-stage   pregnancy / infancy guidance
 *   contaminant  contaminant load (mercury, etc.)
 *
 * Every food id has an entry; an empty array means "assessed, nothing notable."
 * Each exception:
 *   { type, group, prevalence: { estimate, source }, severity, mitigation? }
 *   severity: "avoid" | "caution" | "mitigate"
 * Prevalence figures: the major allergy/intolerance/condition rates are now pinned
 * to real systematic reviews and surveillance (celiac Singh 2018; food allergies
 * Spolidoro 2023; IBS Sperber 2021; G6PD Nkhoma 2009; alpha-gal CDC MMWR 2023;
 * gout GBD 2021; PKU Hillert 2020). Where a headline source has since been
 * retracted (lactose malabsorption's 68% figure, Storhaug 2017) we say so rather
 * than quietly leaning on it. Smaller/where-relevant figures (kidney stones, GERD,
 * histamine intolerance) remain estimate-with-basis pending a targeted check. See
 * research/exceptions-research.md.
 */

const EXCEPTION_TYPE_LABEL = {
  allergy: "Allergy",
  intolerance: "Intolerance",
  autoimmune: "Autoimmune",
  condition: "Condition",
  medication: "Medication",
  "life-stage": "Life stage",
  contaminant: "Contaminant",
};

const EXCEPTIONS = {
  "wholemeal-bread": [
    {
      type: "autoimmune",
      group: "People with celiac disease (wheat gluten)",
      prevalence: { estimate: "~0.7% biopsy-confirmed, ~1.4% seroprevalence", source: "Singh 2018 meta-analysis (PMID 29551598)" },
      severity: "avoid",
      mitigation: "Choose certified gluten-free wholegrain breads (buckwheat, brown-rice, teff).",
    },
    {
      type: "allergy",
      group: "People with wheat allergy",
      prevalence: { estimate: "~0.4% of the population", source: "food-allergy reviews" },
      severity: "avoid",
    },
    {
      type: "intolerance",
      group: "People with IBS (wheat/rye fructans, a FODMAP)",
      prevalence: { estimate: "IBS ~10% of adults", source: "Monash FODMAP" },
      severity: "mitigate",
      mitigation: "Sourdough and spelt are lower-FODMAP; reduce portion or switch grain.",
    },
  ],
  "white-bread": [
    {
      type: "autoimmune",
      group: "People with celiac disease (wheat gluten)",
      prevalence: { estimate: "~0.7% biopsy-confirmed, ~1.4% seroprevalence", source: "Singh 2018 meta-analysis (PMID 29551598)" },
      severity: "avoid",
      mitigation: "Choose certified gluten-free breads.",
    },
    {
      type: "allergy",
      group: "People with wheat allergy",
      prevalence: { estimate: "~0.4% of the population", source: "food-allergy reviews" },
      severity: "avoid",
    },
    {
      type: "condition",
      group: "People with hypertension (bread is a leading sodium source)",
      prevalence: { estimate: "hypertension affects ~30%+ of adults", source: "CVD epidemiology" },
      severity: "caution",
      mitigation: "Choose lower-sodium loaves; bread contributes ~7% of US / ~17% of UK dietary salt.",
    },
  ],
  "tree-nuts": [
    {
      type: "allergy",
      group: "People with tree-nut allergy",
      prevalence: { estimate: "~0.5% (challenge/point prevalence; self-reported higher)", source: "Spolidoro 2023, European systematic review (Allergy, DOI 10.1111/all.15801)" },
      severity: "avoid",
      mitigation: "Strict avoidance; carry prescribed epinephrine. Allergy is often to specific nuts.",
    },
  ],
  "legumes": [
    {
      type: "intolerance",
      group: "People prone to gas/bloating, especially with IBS (galacto-oligosaccharides, a FODMAP)",
      prevalence: { estimate: "IBS affects ~4% of adults by strict Rome IV criteria (~10% under older criteria); mild gas is more widespread", source: "Sperber 2021, Rome Foundation Global Study (Gastroenterology); Monash FODMAP" },
      severity: "mitigate",
      mitigation: "Soak and cook thoroughly, rinse canned beans, and ramp up portions gradually so gut bacteria adapt.",
    },
    {
      type: "condition",
      group: "People with G6PD deficiency (fava beans → favism/haemolysis)",
      prevalence: { estimate: "G6PD deficiency affects ~400 million people (~4.9% weighted global prevalence; esp. Mediterranean, African, South/East Asian ancestry)", source: "Nkhoma 2009 meta-analysis (Blood Cells Mol Dis)" },
      severity: "avoid",
      mitigation: "Avoid fava (broad) beans specifically; other legumes are not implicated.",
    },
  ],
  "whole-grains": [
    {
      type: "autoimmune",
      group: "People with celiac disease (gluten in wheat, barley, rye)",
      prevalence: { estimate: "~0.7% biopsy-confirmed (~1.4% seroprevalence)", source: "Singh 2018 meta-analysis, Clin Gastroenterol Hepatol (PMID 29551598)" },
      severity: "avoid",
      mitigation: "Choose naturally gluten-free whole grains: oats (certified), brown rice, quinoa, buckwheat.",
    },
    {
      type: "allergy",
      group: "People with wheat allergy",
      prevalence: { estimate: "~0.1% (point prevalence; ~1.6% self-reported lifetime)", source: "Spolidoro 2023, European systematic review (Allergy, DOI 10.1111/all.15801)" },
      severity: "avoid",
    },
    {
      type: "intolerance",
      group: "People with IBS (wheat/rye fructans, a FODMAP)",
      prevalence: { estimate: "IBS ~4% of adults by Rome IV (~10% under older criteria)", source: "Sperber 2021, Rome Foundation Global Study (Gastroenterology); Monash FODMAP" },
      severity: "mitigate",
      mitigation: "Sourdough and oats are lower-FODMAP; reduce portion or switch grain.",
    },
  ],
  "leafy-greens": [
    {
      type: "condition",
      group: "Recurrent calcium-oxalate kidney-stone formers (high-oxalate greens like spinach, chard)",
      prevalence: { estimate: "~9% lifetime kidney-stone risk; a subset are oxalate-sensitive", source: "urology epidemiology" },
      severity: "caution",
      mitigation: "Favour lower-oxalate greens (kale, lettuce, rocket), pair with a calcium source, stay well hydrated.",
    },
    {
      type: "medication",
      group: "People taking warfarin (vitamin K affects clotting)",
      prevalence: { estimate: "applies to warfarin users specifically", source: "anticoagulation guidance" },
      severity: "caution",
      mitigation: "Keep vitamin-K intake consistent week to week rather than avoiding greens; tell your clinician.",
    },
  ],
  "berries": [
    {
      type: "allergy",
      group: "People with strawberry / pollen-food (oral allergy) syndrome",
      prevalence: { estimate: "~3–4% of toddlers, declining to ~0.5–1% later; usually mild", source: "Bosnian pediatric prevalence study (PMC3354175)" },
      severity: "caution",
      mitigation: "Affected people avoid raw strawberries; cooked berries and other berries (e.g. blueberries) are usually tolerated.",
    },
    {
      type: "intolerance",
      group: "People with salicylate sensitivity (berries are high-salicylate)",
      prevalence: { estimate: "general-population rate uncertain; higher in aspirin-sensitive asthma", source: "salicylate-intolerance reviews" },
      severity: "mitigate",
      mitigation: "Salicylate-sensitive individuals limit high-salicylate berries and substitute lower-salicylate fruit.",
    },
  ],
  "whole-fruit": [
    {
      type: "intolerance",
      group: "People with fructose malabsorption or IBS (high-FODMAP fruits like apple, pear, mango)",
      prevalence: { estimate: "IBS ~4% of adults by Rome IV (~10% under older criteria); fructose-malabsorption prevalence contested", source: "Sperber 2021, Rome Foundation Global Study; Monash FODMAP" },
      severity: "mitigate",
      mitigation: "Choose lower-FODMAP fruit (berries, citrus, kiwi, grapes) and moderate portions.",
    },
    {
      type: "allergy",
      group: "People with pollen-food (oral allergy) syndrome",
      prevalence: { estimate: "common among those with birch/grass pollen allergy", source: "allergy reviews" },
      severity: "caution",
      mitigation: "Cooked or peeled fruit is usually tolerated.",
    },
  ],
  "fatty-fish": [
    {
      type: "allergy",
      group: "People with finned-fish allergy",
      prevalence: { estimate: "~0.1–0.2% (point prevalence)", source: "Spolidoro 2023, European systematic review (Allergy)" },
      severity: "avoid",
    },
    {
      type: "contaminant",
      group: "Pregnant/breastfeeding people and young children (methylmercury)",
      prevalence: { estimate: "guidance targets these groups", source: "FDA/EPA fish advice" },
      severity: "caution",
      mitigation: "Choose low-mercury oily fish (salmon, sardines, mackerel-Atlantic); limit high-mercury predators (swordfish, king mackerel, shark).",
    },
  ],
  "olive-oil": [],
  "yogurt": [
    {
      type: "allergy",
      group: "People with cow's-milk allergy",
      prevalence: { estimate: "~0.5–0.6% (point prevalence; 2–3% of infants, usually outgrown)", source: "Spolidoro 2023, European systematic review (Allergy)" },
      severity: "avoid",
      mitigation: "Use plant-based or lactose-free alternatives (note: milk allergy ≠ lactose intolerance).",
    },
    {
      type: "intolerance",
      group: "People with lactose intolerance",
      prevalence: { estimate: "lactose malabsorption in ~65–70% of adults globally, highly ancestry-dependent (~5% in northern Europeans to >90% in parts of East Asia)", source: "NIDDK (the widely-cited 68% pooled figure, Storhaug 2017, was retracted in 2025)" },
      severity: "mitigate",
      mitigation: "Yogurt is often tolerated because live cultures pre-digest lactose; or choose lactose-free.",
    },
  ],
  "coffee": [
    {
      type: "life-stage",
      group: "Pregnant people (caffeine)",
      prevalence: { estimate: "guidance applies during pregnancy", source: "ACOG" },
      severity: "caution",
      mitigation: "Limit to <200 mg caffeine/day (~1–2 cups).",
    },
    {
      type: "condition",
      group: "People with anxiety, arrhythmia, reflux or insomnia (slow CYP1A2 metabolisers more sensitive)",
      prevalence: { estimate: "varies; a substantial minority are caffeine-sensitive", source: "clinical / pharmacogenetics" },
      severity: "caution",
      mitigation: "Lower the dose, switch to decaf, or avoid late-day intake.",
    },
  ],
  "avocado": [
    {
      type: "intolerance",
      group: "People with IBS (larger servings are higher-FODMAP — sorbitol)",
      prevalence: { estimate: "IBS ~4% of adults by Rome IV (~10% under older criteria)", source: "Sperber 2021, Rome Foundation Global Study (Gastroenterology); Monash FODMAP" },
      severity: "mitigate",
      mitigation: "Keep to about 1/3 of an avocado per serving.",
    },
    {
      type: "allergy",
      group: "People with latex allergy (latex-fruit cross-reactivity)",
      prevalence: { estimate: "a subset of latex-allergic people", source: "allergy reviews" },
      severity: "caution",
    },
  ],
  "processed-meat": [
    {
      type: "allergy",
      group: "People with alpha-gal syndrome (tick-bite-acquired mammalian-meat allergy)",
      prevalence: { estimate: ">100,000 lab-diagnosed US cases 2010–2022; CDC estimates up to ~450,000 affected (regional, rising)", source: "CDC MMWR 2023 (mm7230a2)" },
      severity: "avoid",
    },
    {
      type: "condition",
      group: "People with hypertension (high sodium)",
      prevalence: { estimate: "hypertension affects ~30%+ of adults", source: "CVD epidemiology" },
      severity: "caution",
      mitigation: "Limit portions; choose lower-sodium options.",
    },
    {
      type: "intolerance",
      group: "People with histamine intolerance (cured/aged meats)",
      prevalence: { estimate: "uncommon; exact prevalence unclear", source: "clinical reviews" },
      severity: "mitigate",
    },
  ],
  "sugary-drinks": [
    {
      type: "condition",
      group: "People with diabetes or prediabetes",
      prevalence: { estimate: "diabetes ~10% of adults; prediabetes far higher", source: "diabetes epidemiology" },
      severity: "caution",
      mitigation: "Replace with water or unsweetened drinks.",
    },
  ],
  "trans-fat": [],
  "ultra-processed": [
    {
      type: "allergy",
      group: "People with food allergies (variable/hidden allergens and additives)",
      prevalence: { estimate: "depends on the product", source: "allergen labelling" },
      severity: "caution",
      mitigation: "Read ingredient labels; formulations change.",
    },
  ],
  "refined-grains": [
    {
      type: "autoimmune",
      group: "People with celiac disease (wheat gluten)",
      prevalence: { estimate: "~0.7% biopsy-confirmed (~1.4% seroprevalence)", source: "Singh 2018 meta-analysis, Clin Gastroenterol Hepatol (PMID 29551598)" },
      severity: "avoid",
      mitigation: "Choose gluten-free options.",
    },
    {
      type: "allergy",
      group: "People with wheat allergy",
      prevalence: { estimate: "~0.1% (point prevalence; ~1.6% self-reported lifetime)", source: "Spolidoro 2023, European systematic review (Allergy, DOI 10.1111/all.15801)" },
      severity: "avoid",
    },
  ],
  "eggs": [
    {
      type: "allergy",
      group: "People with egg allergy",
      prevalence: { estimate: "~0.2% (point prevalence; 1–2% of young children, often outgrown)", source: "Spolidoro 2023, European systematic review (Allergy)" },
      severity: "avoid",
    },
    {
      type: "condition",
      group: "People with diabetes or familial hypercholesterolaemia (dietary cholesterol; the subgroup where cohort signals diverge)",
      prevalence: { estimate: "diabetes ~10% of adults; FH ~1 in 250", source: "cohort subgroup analyses; lipid guidelines" },
      severity: "caution",
      mitigation: "Keep intake moderate and prioritise overall dietary pattern; discuss with your clinician.",
    },
  ],
  "red-meat": [
    {
      type: "allergy",
      group: "People with alpha-gal syndrome (tick-bite-acquired mammalian-meat allergy)",
      prevalence: { estimate: ">100,000 lab-diagnosed US cases 2010–2022; CDC estimates up to ~450,000 affected (regional, rising)", source: "CDC MMWR 2023 (mm7230a2)" },
      severity: "avoid",
    },
    {
      type: "condition",
      group: "People with gout (purines)",
      prevalence: { estimate: "gout affects ~3.9% of US adults (~1–4% globally)", source: "GBD 2021 gout (Lancet Rheumatol 2024); US NHANES" },
      severity: "caution",
      mitigation: "Limit red and organ meat portions.",
    },
    {
      type: "condition",
      group: "People with hereditary haemochromatosis (heme iron overload)",
      prevalence: { estimate: "HFE C282Y homozygosity ~1 in 200–300 of Northern-European ancestry (higher in Irish, ~1 in 100)", source: "HFE genetics reviews; UK Biobank (PMC6334179)" },
      severity: "caution",
    },
  ],
  "poultry": [],
  "milk": [
    {
      type: "allergy",
      group: "People with cow's-milk allergy",
      prevalence: { estimate: "~0.5–0.6% (point prevalence; 2–3% of infants, usually outgrown)", source: "Spolidoro 2023, European systematic review (Allergy)" },
      severity: "avoid",
      mitigation: "Use fortified plant-based alternatives.",
    },
    {
      type: "intolerance",
      group: "People with lactose intolerance (milk has the most lactose of the dairy foods)",
      prevalence: { estimate: "lactose malabsorption in ~65–70% of adults globally, highly ancestry-dependent (~5% in northern Europeans to >90% in parts of East Asia)", source: "NIDDK (the widely-cited 68% pooled figure, Storhaug 2017, was retracted in 2025)" },
      severity: "mitigate",
      mitigation: "Lactose-free milk, smaller amounts with food, or a lactase supplement.",
    },
  ],
  "cheese": [
    {
      type: "allergy",
      group: "People with cow's-milk allergy",
      prevalence: { estimate: "~0.5–0.6% (point prevalence)", source: "Spolidoro 2023, European systematic review (Allergy)" },
      severity: "avoid",
    },
    {
      type: "intolerance",
      group: "People with lactose intolerance",
      prevalence: { estimate: "~65–70% of adults globally have lactose malabsorption, highly ancestry-dependent (~5% N European to >90% E Asian)", source: "NIDDK (the widely-cited 68% figure, Storhaug 2017, was retracted in 2025)" },
      severity: "mitigate",
      mitigation: "Aged hard cheeses (cheddar, parmesan) are very low in lactose and usually well tolerated.",
    },
    {
      type: "medication",
      group: "People taking MAOI antidepressants (tyramine in aged cheese)",
      prevalence: { estimate: "applies to MAOI users specifically", source: "psychopharmacology guidance" },
      severity: "caution",
      mitigation: "Avoid aged/mature cheeses on MAOIs (hypertensive-crisis risk).",
    },
  ],
  "butter": [
    {
      type: "allergy",
      group: "People with cow's-milk allergy (butter contains trace milk protein)",
      prevalence: { estimate: "~0.5–0.6% (point prevalence)", source: "Spolidoro 2023, European systematic review (Allergy)" },
      severity: "caution",
      mitigation: "Clarified butter/ghee has less protein but is not guaranteed safe; the milk-allergic should be cautious.",
    },
  ],
  "potatoes": [
    {
      type: "condition",
      group: "Anyone eating green or sprouted potatoes (glycoalkaloids/solanine)",
      prevalence: { estimate: "affects spoiled/green tubers, not normal potatoes", source: "food-safety guidance" },
      severity: "caution",
      mitigation: "Discard green or heavily sprouted parts; store cool and dark.",
    },
  ],
  "french-fries": [
    {
      type: "contaminant",
      group: "High-temperature fried/baked starches form acrylamide (a probable carcinogen)",
      prevalence: { estimate: "present in most commercially fried potato products", source: "EFSA/FDA acrylamide guidance" },
      severity: "caution",
      mitigation: "Fry/bake to golden (not brown), avoid charring; eat occasionally.",
    },
  ],
  "alcohol": [
    {
      type: "life-stage",
      group: "Pregnant people (fetal alcohol spectrum disorders)",
      prevalence: { estimate: "no safe amount established in pregnancy", source: "CDC/ACOG" },
      severity: "avoid",
    },
    {
      type: "condition",
      group: "People with liver disease, alcohol-use disorder, or certain cancer histories",
      prevalence: { estimate: "alcohol-use disorder ~5% of adults", source: "addiction epidemiology" },
      severity: "avoid",
    },
    {
      type: "medication",
      group: "People on medications that interact with alcohol (many)",
      prevalence: { estimate: "applies to many common drugs", source: "pharmacology guidance" },
      severity: "caution",
      mitigation: "Check medication labels and ask a pharmacist.",
    },
  ],
  "artificial-sweeteners": [
    {
      type: "condition",
      group: "People with phenylketonuria (PKU) — aspartame is a phenylalanine source",
      prevalence: { estimate: "PKU affects ~1 in 10,000 births in Europe (global ~1 in 24,000; varies widely, up to ~1 in 4,000 in Turkey)", source: "Hillert 2020 global PKU survey (Am J Hum Genet, PMID 32668217)" },
      severity: "avoid",
      mitigation: "Avoid aspartame specifically; other sweeteners are unaffected.",
    },
    {
      type: "intolerance",
      group: "People with IBS or sensitivity to sugar alcohols (a related sweetener class)",
      prevalence: { estimate: "sugar alcohols cause dose-dependent GI effects in many people", source: "clinical reviews" },
      severity: "mitigate",
      mitigation: "Moderate intake; sugar alcohols (sorbitol, xylitol) are the main culprits.",
    },
  ],
  "coconut-oil": [
    {
      type: "allergy",
      group: "People with coconut allergy",
      prevalence: { estimate: "rare; most tree-nut-allergic people tolerate coconut despite its FDA tree-nut labelling", source: "allergy reviews" },
      severity: "caution",
    },
  ],
  "green-tea": [
    {
      type: "life-stage",
      group: "Pregnant people (caffeine)",
      prevalence: { estimate: "guidance applies during pregnancy", source: "ACOG" },
      severity: "caution",
      mitigation: "Keep total caffeine <200 mg/day; tea has less than coffee.",
    },
    {
      type: "condition",
      group: "People prone to iron deficiency (tea tannins reduce non-heme iron absorption)",
      prevalence: { estimate: "iron deficiency affects ~10–30% of menstruating women", source: "haematology epidemiology" },
      severity: "mitigate",
      mitigation: "Drink tea between meals rather than with iron-rich meals.",
    },
  ],
  "white-rice": [
    {
      type: "condition",
      group: "People with diabetes or prediabetes (high glycemic load)",
      prevalence: { estimate: "diabetes ~10% of adults; far higher with prediabetes", source: "diabetes epidemiology" },
      severity: "caution",
      mitigation: "Prefer whole grains; pair with protein/fat/fibre and keep portions modest.",
    },
    {
      type: "contaminant",
      group: "Infants/young children and high-rice diets (inorganic arsenic accumulates in rice)",
      prevalence: { estimate: "FDA/EFSA flag rice as a notable dietary arsenic source", source: "FDA/EFSA" },
      severity: "caution",
      mitigation: "Vary grains; rinse rice and cook in excess water for young children.",
    },
  ],
  "soy": [
    {
      type: "allergy",
      group: "People with soy allergy",
      prevalence: { estimate: "~0.3% (point prevalence; a Big-9 allergen)", source: "Spolidoro 2023, European systematic review (Allergy)" },
      severity: "avoid",
    },
    {
      type: "condition",
      group: "People with hypothyroidism + iodine deficiency (isoflavones at very high intake)",
      prevalence: { estimate: "relevant mainly with co-existing iodine deficiency", source: "endocrinology reviews" },
      severity: "mitigate",
      mitigation: "Ensure adequate iodine; separate soy from thyroid medication timing.",
    },
  ],
  "cruciferous": [
    {
      type: "condition",
      group: "People with hypothyroidism + iodine deficiency (raw-cruciferous goitrogens)",
      prevalence: { estimate: "relevant mainly raw and with iodine deficiency", source: "endocrinology reviews" },
      severity: "mitigate",
      mitigation: "Cooking deactivates most goitrogens; ensure adequate iodine.",
    },
    {
      type: "intolerance",
      group: "People with IBS (raffinose/FODMAPs cause gas/bloating)",
      prevalence: { estimate: "IBS ~4% of adults by Rome IV (~10% under older criteria)", source: "Sperber 2021, Rome Foundation Global Study (Gastroenterology); Monash FODMAP" },
      severity: "mitigate",
      mitigation: "Cook well and increase portions gradually.",
    },
  ],
  "tomatoes": [
    {
      type: "condition",
      group: "People with acid reflux / GERD (acidic)",
      prevalence: { estimate: "GERD ~15–20% of adults; only some are tomato-triggered", source: "GI epidemiology" },
      severity: "mitigate",
      mitigation: "Reduce portion or avoid if it triggers symptoms.",
    },
  ],
  "cocoa": [
    {
      type: "condition",
      group: "People sensitive to caffeine/theobromine, and sugar load in sweetened chocolate",
      prevalence: { estimate: "dark chocolate has modest caffeine/theobromine; sugar varies by product", source: "food composition data" },
      severity: "mitigate",
      mitigation: "Choose higher-cocoa, lower-sugar products; mind portion.",
    },
  ],
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { EXCEPTIONS, EXCEPTION_TYPE_LABEL };
}

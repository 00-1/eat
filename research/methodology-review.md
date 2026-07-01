# How our approach compares to established methods — a methodology review

*Compiled 2026-07-01 from a multi-agent literature pass. Figures are cross-checked
across multiple web searches but full texts were largely not opened (journal fetches
are proxy-blocked here), so treat exact thresholds/quotes as needing a final source
check. The point of this document is to benchmark our design choices against how the
field actually does this — where we align, where we deviate, and whether the
deviations are defensible — and to inform the open "magnitude bump / ranking" question.*

## 1. The landscape

**Formal evidence-grading**
- **GRADE** — rates *certainty* (High/Moderate/Low/Very-low) per outcome via risk-of-bias, inconsistency, indirectness, imprecision, publication bias; RCTs start High, observational Low, upgradable (large effect, dose-response gradient, confounding-toward-null). Certainty is kept **separate** from effect size. (Guyatt et al., *BMJ* 2004; *J Clin Epidemiol* series.)
- **NutriGrade** (Schwingshackl 2016, *Adv Nutr*) — our base. 0–10 score → High/Mod/Low/Very-low. Critically, for **cohorts it folds effect size and dose-response into the score**, i.e. it *couples* magnitude with certainty — a point critics raised (*Adv Nutr* 2017, PMID 28916579).
- **WCRF/AICR CUP** — expert matrix (Convincing/Probable/Limited); a plausible **dose-response is a required gate** for the top grades; keeps causal-strength grade separate from per-serving risk.
- **WHO/IARC** — hazard groups (1/2A/2B/3) = **certainty that it *can* cause cancer, explicitly not risk/dose/potency** (processed meat Group 1 vs red meat 2A; absolute risk small). Hazard ≠ magnitude.
- **Cochrane** SoF tables — show effect (relative *and* absolute) *beside* a separate GRADE certainty. **Umbrella reviews** (Ioannidis Class I–IV) instead *blend* effect+precision+bias into one class — a documented limitation.

**Population burden & the state of the art on strength-vs-size**
- **GBD** (Lancet 2019) ranks diet risks by **absolute attributable burden** — PAF = f(exposure, RR, TMREL counterfactual) → deaths/DALYs. Top three diet burdens: high sodium, **low whole grains, low fruit** — broad-effect staples dominate absolute burden. (Uses a mediation matrix to avoid double-counting shared pathways like fibre.)
- **Burden of Proof** (Zheng/Murray, *Nat Med* 2022) — purpose-built to separate effect size from evidence strength: it rates the **most conservative effect consistent with the data** (the heterogeneity-widened 5th/95th-quantile bound), mapped to **1–5 stars**. A big *mean* effect with wide CI → low stars. **Vegetables→ischaemic heart disease: a 22.9% mean protective effect but only 2 stars ("weak")**; unprocessed red meat→T2D likewise 2 stars. Only 22/180 risk-outcome pairs earned 4–5 stars. (Critiqued as over-conservative, *Nat Med* 2023.)
- **Dose-response** — standard is nonlinear meta-analysis with restricted cubic splines (Greenland–Longnecker; Orsini); GBD/BoP use Bayesian regularized trimmed splines (MR-BRT). J/U-curves (alcohol, sodium) are the cautionary cases — often bias artifacts (sick-quitter, reverse causation).

**Dietary guidance & consumer tools**
- **USDA DGA / NESR** grade *bodies of evidence* (Strong/Moderate/Limited/NA) and build guidance around **dietary patterns, not single foods** — deliberate insulation against food ranking.
- **Diet-quality indices** (HEI, AHEI, DASH, Mediterranean score) score whole **diets** by component adherence; validated against ~18–26% lower mortality. No single food is "good/bad."
- **examine.com** — grades interventions→outcomes A–F with **separate magnitude arrows**; does not rank single foods. Same philosophy as us.
- **Single-food rankers are where the trouble is:** Nutri-Score (per-100g nutrient profiling → olive oil D, diet soda B); NOVA/UPF (processing, not nutrients → lumps whole-grain bread with soda); **Tufts Food Compass** (1–100 → Lucky Charms outranked steak — the canonical cautionary tale); Yuka (hazard-not-risk additive penalties, arbitrary weights). Every fixed universal single-food weighting scheme produces item-level absurdities.

## 2. Best practice on the problems we hit (with where experts disagree)

- **(a) Separate effect size from certainty** — near-universal (GRADE, BoP, IARC, examine). *How* to operationalize is contested (GRADE keeps them qualitatively distinct; BoP collapses into one conservative number).
- **(b) All-cause vs cause-specific** — all-cause mortality is the **bias-robust, patient-relevant** endpoint (immune to cause misclassification; captures net harm), but it is under-powered and *diluted*. Consensus: use it as the robustness/safety check, not necessarily the sole primary. No consensus that it deserves a fixed "bump."
- **(c) Relative vs absolute** — settled: **relative risk misleads about importance**; absolute measures (ARR/NNT, PAF/attributable burden) are required to say "how much it matters." GBD is the formal instantiation.
- **(d) Observational vs RCT vs mechanism** — "**mechanism corroborates, never overrides**" is well-supported: Fleming–DeMets surrogate-endpoint literature (CAST: fixed the arrhythmia surrogate, raised mortality), the saturated-fat/LDL surrogacy debate, Bradford Hill (plausibility helps, isn't decisive), GRADE (mechanism enters only via indirectness). Live fault line: whether GRADE's auto-downgrade of cohorts is even appropriate for nutrition (the NutriRECS red-meat blow-up).
- **(e) Dose-response / nonlinearity** — model the *shape*; a single pooled RR can hide a threshold/nadir.
- **(f) Heterogeneous categories** — lumping dissimilar items (UPF; "fruit" incl. juice; red/processed meat) biases and blurs category verdicts.
- **(g) Communicating uncertainty** — natural frequencies + absolute risks (Gigerenzer); pair every estimate with an explicit certainty signal; avoid false precision.

## 3. How WE compare — alignment, deviation, and what to change

| Design choice | Best-practice stance | Us | Verdict |
|---|---|---|---|
| Effect size vs certainty as separate axes | Near-universal | Separate (magnitude vs certainty) | **Aligned — and we improved on our NutriGrade base**, which couples them for cohorts |
| Judge by outcomes, not nutrient profiling | Rankers that profile nutrients fail (Nutri-Score/Food Compass) | Outcome-based | **Aligned** — avoids the "olive oil D / Lucky Charms > steak" trap |
| Mechanism corroborates, never overrides | Well-supported (surrogate literature) | Explicit guardrail + lens + wrestle section | **Aligned, and unusually explicit** |
| Dose-response as first-class | Endorsed | Curves + derived shapes | **Aligned** |
| Heterogeneous categories | Warn/split | "not all", contested flag, split berries | **Aligned** |
| Communicate uncertainty | Certainty + absolute framing | Certainty tiers, contested, provenance banner | **Aligned** (could add absolute framing) |
| **Ranking single foods** | Rigorous systems **don't**; they grade patterns/evidence | We do (shortlists) | **Deviation** — defensible only via outcomes + heavy caveats |
| **All-cause relative-risk "bump"** | Importance = **absolute burden** (PAF), not a relative-risk tier bump | Home-grown +1 tier | **Deviation — weakest link; recommend change** |
| Point-score certainty vs conservative-bound | BoP rates the conservative floor | Deterministic point score (NutriGrade-style) | Defensible; BoP-style is an option for later |

**The two real deviations, and what to do:**

**(1) We rank single foods.** This is our biggest divergence from validated practice — nobody credible does it, and the ones who try produce absurdities. Our mitigations are the right ones (outcome-based not nutrient-profiling; "not all"/contested/certainty caveats; "provisional" banner; challengeable). Recommendation: **keep leaning into the caveats, never present the shortlist as definitive, and frame it explicitly as "largest, surest *relative* effect," not "healthiest."** Consider a standing disclaimer to that effect on the shortlists.

**(2) The all-cause magnitude bump — this is the veg/fruit puzzle.** The bump is a home-grown proxy with no established analog. The principled way to express "how much a food matters" is **absolute attributable burden (GBD PAF)**, not a one-tier relative-risk promotion. The bump distorts (coffee RR 0.83 ends up "large," tying trans fat 1.42), and — crucially for the veg question — it's the *only* thing that put fruit (and, once I added the outcome, veg) on the cusp.

Two facts from the review reframe the veg-vs-fruit intuition:
- **Rigorous methods don't rank veg as strong either.** Burden of Proof gives **vegetables→IHD just 2 stars** despite a 22.9% mean effect. A ~RR 0.90 food is *modest in relative terms* even if it's a nutrition all-star. So "veg not on the cusp" is **consistent with best practice**, not a bug — the "veg should be #1" feeling is a *pattern/reputation* view, not a *single-food relative-effect* fact.
- **Where veg/whole-grains/fruit legitimately dominate is absolute burden** (GBD's top-three diet risks are sodium, low whole grains, low fruit) — precisely because they're staples eaten in quantity, not because their per-serving relative effect is large.

**Recommendation on the bump/ranking question:**
- **Near-term:** gate or soften the bump (only bump when the all-cause effect is itself significant and ≥ small; or make it a half-step) so "large" means large and coffee stops tying trans fat. This drops fruit/veg/coffee to "moderate" (off the cusp) — which is the honest, BoP-consistent outcome.
- **Real fix (= our §3 "absolute impact"):** add an **absolute-burden axis** (GBD PAF-style: relative effect × how common/consumed × outcome frequency) as a *separate* measure of "how much it matters." Then broad staples (veg, whole grains) can rank high on *burden* without distorting the *relative-effect* magnitude — the two questions the shortlist currently conflates get their own axes.
- Optionally offer the shortlist under either lens ("biggest sure effect" vs "biggest population impact"), making explicit that they answer different questions.

**Where a considered deviation is fine:** applying GRADE-style auto-downgrade-of-cohorts rigidly would gut nutrition evidence (the NutriRECS lesson); our observation-led, mechanism-corroborates stance is a defensible middle path and we should keep it.

## 4. Sources (representative; see the compiled research notes for the full list)
GRADE (Guyatt *BMJ* 2004; *J Clin Epidemiol* 2011, PMID 21802902) · NutriGrade (Schwingshackl 2016, PMC5105044; critique PMID 28916579) · WCRF/AICR CUP · IARC Monographs Preamble; Bouvard 2015 *Lancet Oncol* PMID 26514947 · GBD 2017 Diet, *Lancet* 2019 PMID 30954305 · Burden of Proof (Zheng/Murray *Nat Med* 2022, PMC9556298; veg PMC9556321; red meat PMC9556326; critique PMC10129864) · Greenland–Longnecker/Orsini dose-response (PMID 22135359) · Fleming & DeMets *Ann Intern Med* 1996 · Bradford Hill 1965 · Ioannidis *JAMA* 2018 PMID 30422271 · NutriRECS Johnston 2019 *Ann Intern Med* DOI 10.7326/M19-1621 · USDA NESR (Obbagy 2022, PMC9340967) · HEI-2015 (Krebs-Smith 2018, PMC6719291); Mediterranean score (Trichopoulou 2003, PMID 12826634) · Nutri-Score; NOVA (Monteiro 2016); Tufts Food Compass (Mozaffarian 2021, *Nat Food*) · examine.com grading · Gigerenzer & Edwards *BMJ* 2003 (PMC200816).

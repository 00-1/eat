# Exception-prevalence sourcing

*Compiled 2026-07-01. Pins the subgroup-exception prevalence figures in
`exceptions.js` to real systematic reviews and surveillance data, replacing the
earlier "estimate-with-basis" placeholders. Figures are cross-checked across web
searches; full texts were largely not opened (journal/PubMed fetches are
proxy-blocked here), so treat exact quantiles as needing a final source check.*

## Sourced figures

| Exception | Figure used | Source |
|---|---|---|
| Celiac disease | ~0.7% biopsy-confirmed; ~1.4% seroprevalence | Singh 2018 meta-analysis, *Clin Gastroenterol Hepatol* (PMID 29551598) — pooled biopsy 0.7% (0.5–0.9), sero 1.4% (1.1–1.7) |
| Cow's-milk allergy | ~0.5–0.6% point prevalence (2–3% infants) | Spolidoro 2023 updated European systematic review, *Allergy* (DOI 10.1111/all.15801) |
| Egg allergy | ~0.2% point prevalence | Spolidoro 2023 (point 0.2%; self-reported lifetime 2.4%) |
| Wheat allergy | ~0.1% point (~1.6% self-reported lifetime) | Spolidoro 2023 |
| Tree-nut allergy | ~0.5% point prevalence | Spolidoro 2023 |
| Fish (finned) allergy | ~0.1–0.2% point prevalence | Spolidoro 2023 |
| Soy allergy | ~0.3% point prevalence | Spolidoro 2023 |
| IBS | ~4% by strict Rome IV; ~10% under older (Rome III) criteria | Sperber 2021 Rome Foundation Global Study, *Gastroenterology* |
| G6PD deficiency | ~400 million people; ~4.9% weighted global prevalence | Nkhoma 2009 meta-analysis, *Blood Cells Mol Dis* |
| Alpha-gal syndrome | >100,000 lab-diagnosed US cases 2010–2022; CDC estimates up to ~450,000 affected | CDC MMWR 2023 (mm7230a2); StatNews/CDC coverage |
| Gout | ~3.9% of US adults; ~1–4% globally (55.8M in 2020) | GBD 2021 gout, *Lancet Rheumatol* 2024 (PMC11263476); US NHANES |
| Hereditary haemochromatosis | HFE C282Y homozygosity ~1 in 200–300 N-European (Irish ~1 in 100) | HFE genetics reviews; UK Biobank (PMC6334179) |
| PKU | ~1 in 10,000 births in Europe; global ~1 in 24,000; up to ~1 in 4,000 (Turkey) | Hillert 2020 global PKU survey, *Am J Hum Genet* (PMID 32668217) |

## Honest caveats

- **Lactose malabsorption — headline source retracted.** The widely-cited global
  figure of **68%** comes from Storhaug et al. 2017 (*Lancet Gastroenterol
  Hepatol*), which was placed under an Expression of Concern (2024) and **retracted
  in 2025** over non-representative source data. Lactose malabsorption is
  nonetheless common and strongly ancestry-dependent (from ~5% in northern
  Europeans to >90% in parts of East Asia; NIDDK). We keep a ~65–70% "global"
  ballpark but flag the retraction in the data rather than lean on it quietly —
  consistent with the "highlight inadequacies" policy.
- **Point vs self-reported prevalence.** Food-allergy figures are *challenge/point*
  prevalence (Spolidoro 2023); self-reported rates run several-fold higher (e.g.
  cow's milk 5.7%, egg 2.4% self-reported lifetime). We use point prevalence as the
  more conservative, clinically-meaningful number and note "self-reported higher."
- **IBS criterion dependence.** The familiar "~10%" is a Rome III figure; strict
  Rome IV roughly halves it (~4%). We state both so the criterion is explicit.
- **Still estimate-with-basis (not yet pinned this pass):** calcium-oxalate
  kidney-stone lifetime risk, GERD prevalence, histamine intolerance, salicylate
  sensitivity, pollen-food (oral allergy) syndrome, latex-fruit cross-reactivity.
  These are lower-stakes (severity "caution"/"mitigate") and await a targeted pass.

## Sources (representative)
Singh P, et al. Global Prevalence of Celiac Disease. *Clin Gastroenterol Hepatol*
2018 (PMID 29551598) · Spolidoro GCI, et al. Prevalence estimates of eight big food
allergies in Europe. *Allergy* 2023 (DOI 10.1111/all.15801) · Sperber AD, et al.
Worldwide prevalence and burden of functional GI disorders (Rome Foundation Global
Study). *Gastroenterology* 2021 · Nkhoma ET, et al. The global prevalence of G6PD
deficiency. *Blood Cells Mol Dis* 2009 · CDC. Geographic Distribution of Suspected
Alpha-gal Syndrome Cases — United States, 2017–2022. *MMWR* 2023;72(30) · GBD 2021
Gout Collaborators. *Lancet Rheumatol* 2024 (PMC11263476) · Hillert A, et al. The
Genetic Landscape and Epidemiology of Phenylketonuria. *Am J Hum Genet* 2020 (PMID
32668217) · Storhaug CL, et al. *Lancet Gastroenterol Hepatol* 2017 — **RETRACTED
2025** · NIDDK, Definition & Facts for Lactose Intolerance.

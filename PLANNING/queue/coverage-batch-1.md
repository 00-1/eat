# QUEUE: Coverage batch 1 (new foods)

Status: **DRAFT — food list awaiting user confirmation before handing to worker.**
Do not run until the verification-upgrade pass is merged (avoid overlapping edits).

Proposed batch (my picks by demand × clean-evidence availability — user to adjust):
1. **Oats / oatmeal** — β-glucan; strong LDL + T2D evidence. Likely positive.
2. **Peanuts** — botanically a legume, distinct from tree nuts; high demand; in the
   nut-mortality cohorts (Bao 2013 NEJM). Likely positive.
3. **Seed oils** (canola/rapeseed, sunflower, soybean oil) — high current controversy;
   distinct from olive/coconut/butter. PUFA-for-SFA lowers CVD (Cochrane/Hooper;
   Mozaffarian). Likely positive-to-neutral, *contested* — worth addressing head-on.
4. **Brown rice** — the protective contrast to white rice; lower T2D (Sun 2010).
5. **Pasta** — refined but low-GI when al dente; cohort evidence mixed. Likely neutral.
6. **Energy drinks** — caffeine + sugar (± taurine); distinct from coffee & SSB;
   arrhythmia/CV signals. Likely negative/neutral, thin hard-outcome.
7. **Mushrooms** — currently on the holding list; graduate if the cohort signal holds
   (mushroom intake & mortality/cancer meta-analyses ~2021).

---

## Prompt to paste (once food list is confirmed)

You are adding new food items to a diet-evidence web app in this repo. Verdicts are
COMPUTED from recorded evidence facts; the app answers "what happens to health when
this food is ADDED to a typical diet?" Work on `main` (or a branch off it).

FIRST read `ADDING-FOODS.md` end to end and follow it exactly — it defines every
field (id/name/category/effect/certainty/outcomes/summary/rationale/considerations/
studies/lastReviewed/revisions in FOODS; evidence/effectEstimate/verified/sources/
doseCurve in ASSESSMENTS; EXCEPTIONS; MECHANISM; RESEARCHED_ON; FOOD_SCOPE;
CARD_MEMBERS; counter-arguments FOOD_TAGS) and the recording conventions. Also skim
`scoring.js` and `test/data.test.js` for the invariants.

For EACH candidate food, decide FIRST whether it deserves its own card:
- Own card if it's eaten as its own thing AND has distinct food-level evidence.
- Otherwise make it a `members` entry on an existing food, or a `HOLDING_LIST` entry
  with an honest reason — do NOT create an empty verdict-bearing card.

Then for each that earns a card, ground it on REAL hard-outcome evidence (prefer
meta-analyses of prospective cohorts on mortality/CVD/T2D/cancer at realistic intake;
biomarkers are support, not the verdict). Use the biomedical APIs (NCBI E-utilities
`efetch`/`esummary`, Europe PMC `fullTextXML`) — verify figures against the actual
results, never invent a PMID/DOI/number. Set `verified:true` only when
sources.pooledRR + sources.participants are pinned to real IDs; else `verified:false`
with an honest note.

RULES:
- Certainty is COMPUTED — set the `evidence` inputs honestly; `certainty` in FOODS
  must equal the tier `Scoring.assess` computes (the central-invariant test enforces
  it). Do not hand-tune inputs to hit a tier.
- Add an EXCEPTIONS entry for every new food (empty array if none), a MECHANISM entry
  (real PMID/DOI, direction ≠ "none"), a RESEARCHED_ON date, FOOD_SCOPE if it's a
  class, CARD_MEMBERS if it overlaps an existing card, and FOOD_TAGS if a shared
  counter-argument applies.
- Run `node --test` after each food; keep all tests green.
- Bump METHODOLOGY_VERSION + changelog; update the holding list if a food graduates.
- Commit + push (repo commit style). Reply with a table: food | own-card?/member?/
  hold | verdict (effect·certainty) | key source (PMID/DOI) | verified?.

# Diet Effects — Planning Backlog

Living board for the planning/review agent. Product code lives on `main`; this
branch (`claude/planning`) is a workspace and never merges to `main`.

Current product state: **v0.61**, 38 foods, 35/38 source-verified, 76 tests green.

## In flight
- **Verification-upgrade pass** (worker agent, own environment with API access):
  re-verify recorded figures against full text via NCBI E-utilities / Europe PMC,
  flip remaining `verified:false` foods (coconut-oil, white-bread,
  artificial-sweeteners) and dose curves where a real anchor exists, else keep the
  honest gap. Prompt: this session's chat / to be mirrored in `queue/`.

## Active streams (priority order)

### 1. Coverage — EXHAUSTIVE (hundreds+ of foods)  *[user: go big]*
Cover the whole food landscape. Key design: **signal tiers** (derived) — notable foods
get full cards + the summary panels; the long tail ("no strong signal — eat to taste")
collapses into a compact list at the bottom. See `design/scalable-coverage.md`.
- **PREREQUISITE (Phase 0):** build the signalTier field + long-tail list UI + a
  ~300–500-item candidate taxonomy BEFORE the grounding pass, or 300 cards wreck the
  UI. High-judgment → do it here with the user, not unattended.
- Then Phase 1 (worker, unattended, batched): grounding down the taxonomy; foods
  self-sort into notable / long-tail / member / holding.
- `queue/coverage-batch-1.md` is now superseded by the exhaustive plan (keep as a
  smoke-test batch if wanted).

### 2. Substitution — FULL, as a sourced GRAPH  *[user: don't skimp]*
Not a dense N×N matrix (mostly empty) — a substitution GRAPH: real sourced swap edges
(with HR + citation) where the literature estimates them, plus flagged `derived`
within-category comparisons elsewhere. See `design/substitution.md`.
- Status: design set; needs the swap-data schema + a sourcing pass (queue to worker).

### 3. Epistemic honesty — CONFIRMED (C + A + D)  *[user: approved]*
Tier margin ("9/16 — 1 from Low") + nearest single input-flip, both engine-derived, in
the expanded card; one honest "curated inputs" framing sentence on the approach tab.
See `design/epistemic-honesty.md`.
- Status: approved; ready to spec/build (engine-derived, low-risk).

## Parked (deliberately, per user)
- UI/design pass (summary length, tag noise, expanded-card wall, mobile).
- ED-safety note.
- Challenge mechanism (real path for a user to contest a verdict — currently a stub).
- "Dose makes the poison" relabel (optional wording).

## Notes
- Feature branch `claude/food-diet-effect-app-ywq9e5` is STALE (frozen at the initial
  commit, 128 behind main). Do not base work on it; all work is on `main`.

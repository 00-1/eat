# Diet Effects — Planning Backlog

Living board for the planning/review agent. Product code lives on `main`; this
branch (`claude/planning`) is a workspace and never merges to `main`.

Current product state: **v0.62**, 38 foods, 35/38 source-verified, 76 tests green.

## Process
Two-agent autonomous loop coordinated through git — see `PROTOCOL.md`. Planner (this
branch) reviews + merges to main; worker grinds on its own branch. Change-requests
flow via `reviews/OPEN.md`; worker progress via `PROGRESS.md` on its branch.

## Sequence for the big pass
1. ✅ Merge verification pass (v0.62) to main — DONE (reviewed, 76 green).
2. **Phase 0 (planner, next):** signal-tiering field + long-tail "eat to taste" UI on
   main; generate the ~300–500-item taxonomy into `PLAN.md`. Must land before kickoff.
3. Finalize the worker kickoff prompt (points at PLAN.md + PROTOCOL.md).
4. User kicks off worker; planner starts the review watcher (scheduled wake-ups).
5. Loop runs to done (PLAN.md exhausted + OPEN.md empty).

## Done
- **Verification-upgrade pass (v0.62)** — worker re-checked every snippet-sourced
  figure against full text. Catches: red-meat T2D PMID 39174153→39174161, poultry
  Shi→Papp, tomatoes re-attributed (Luo 2021, 0.98→0.91). 3 gaps confirmed genuine.
  Merged to main after review.

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

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

### 1. Coverage  — *highest leverage; the demo→tool wall*
More foods. Parallelizable: queue food batches to the worker after the verification
pass. First batch drafted in `queue/coverage-batch-1.md`. Selection rule: demand
(how often people ask) × availability of clean hard-outcome evidence.
- Status: batch 1 drafted, awaiting go + user picks.

### 2. Substitution  — *biggest presentation-correctness gap; co-design*
Verdicts answer "added to a typical diet" and hide the comparator ("butter neutral"
misleads without "vs what"). Design in `design/substitution.md`.
- Status: design options drafted, needs a decision on weight (light note vs matrix).

### 3. Epistemic honesty  — *the most distinctive thing we could build; co-design*
Surface where a verdict is fragile / input-sensitive, to counter the "computed =
objective" illusion. Design in `design/epistemic-honesty.md`.
- Status: design options drafted, needs a decision on scope.

## Parked (deliberately, per user)
- UI/design pass (summary length, tag noise, expanded-card wall, mobile).
- ED-safety note.
- Challenge mechanism (real path for a user to contest a verdict — currently a stub).
- "Dose makes the poison" relabel (optional wording).

## Notes
- Feature branch `claude/food-diet-effect-app-ywq9e5` is STALE (frozen at the initial
  commit, 128 behind main). Do not base work on it; all work is on `main`.

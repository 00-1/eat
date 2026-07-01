# Two-agent working protocol

Two AI agents drive this project autonomously, coordinating **through git** (no chat).

## Roles & branches
- **Planner/Reviewer** (this agent) — owns `claude/planning` (the plan + review notes)
  and is the **only one who merges to `main`**. Reviews every worker batch.
- **Worker** — owns a `claude/worker-*` branch. Does the grind (grounding foods,
  sourcing). Never pushes to `main`; pushes batches to its own branch.
- **`main`** = product, source of truth. Reviewed commits only.

## Shared files (the "bus")
- `PLANNING/PLAN.md` — the ordered work-list (taxonomy of foods / tasks). *Planner owns.*
- `PLANNING/reviews/OPEN.md` — open change-requests from the reviewer. *Worker must
  clear these before starting new work.* *Planner owns.*
- `PROGRESS.md` (on the worker branch) — which work-list items are done / held, with
  reasons. *Worker owns.*

## Worker loop (runs unattended until done)
1. `git fetch origin`; rebase its branch onto `origin/main` (absorb merged work).
2. Read `origin/claude/planning:PLANNING/reviews/OPEN.md`. If any items are open,
   FIX THEM FIRST, mark them addressed, push.
3. Take the next N items from `PLANNING/PLAN.md` not yet in `PROGRESS.md`.
4. Ground them (ADDING-FOODS.md + signal-tier rules); `node --test` must pass;
   commit + push to its branch; update `PROGRESS.md`.
5. Repeat until PLAN.md is exhausted AND OPEN.md is empty.
- **Never pause for the user. Never defer silently.** If an item can't be done, record
  it in `PROGRESS.md` as holding/insufficient-evidence with a one-line reason and move
  on — that IS completing it honestly.

## Planner loop (scheduled self-wake-ups)
1. On wake: `git fetch`. New worker commits? Review: run `node --test`; check every new
   figure traces to a real PMID/DOI; the central invariant holds (stored certainty ==
   computed); gaps kept honest; signal-tier applied; no silent deferrals vs PLAN.md.
2. Clean → **merge worker branch → `main`, push.** Resolve any fixed OPEN items.
3. Problems → write specific change-requests to `PLANNING/reviews/OPEN.md`, push. Do
   NOT merge until fixed.
4. Done when PLAN.md exhausted + OPEN.md empty + final batch merged → stop the loop,
   report to the user. Else reschedule the wake-up.

## Conflict avoidance (important)
- Only the **worker** edits product code (data.js, app.js, etc.). Only the **planner**
  edits `main` (via merges) and the planning branch.
- Any architectural/UI change the planner needs (e.g. Phase 0 signal-tiering) lands on
  `main` and is merged into the worker branch BEFORE the worker's food grind starts, so
  the two never edit data.js concurrently.
- With that discipline, merges are near-conflict-free (worker appends foods; planner
  only merges).

## Definition of done
Every `PLAN.md` item is either a merged food (notable or long-tail card / member) or a
recorded `PROGRESS.md` holding entry with a reason, and `OPEN.md` is empty.

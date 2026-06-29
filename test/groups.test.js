"use strict";

// Food GROUPS are scored by the SAME engine as foods. These tests pin the same
// invariants: stored certainty == computed tier, valid evidence, and that every
// membership maps a real food to a real group.

const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../scoring.js");
const { GROUPS, FOOD_GROUPS, groupsFor } = require("../groups.js");
const { FOODS } = require("../data.js");

const EFFECTS = ["positive", "negative", "neutral"];

test("every group is well-formed and its stored certainty equals the computed tier", () => {
  for (const id of Object.keys(GROUPS)) {
    const g = GROUPS[id];
    assert.equal(g.id, id, `${id}: id mismatch`);
    assert.ok(EFFECTS.includes(g.effect), `${id}: bad effect`);
    assert.ok(g.evidence && typeof g.evidence.pooledRR === "number", `${id}: bad evidence`);
    assert.ok(Array.isArray(g.outcomes) && g.outcomes.length, `${id}: no outcomes`);
    assert.ok(g.rationale && g.summary, `${id}: missing prose`);
    const computed = S.assess(g.evidence, g.outcomes);
    assert.equal(g.certainty, computed.tier, `${id}: stored "${g.certainty}" != computed "${computed.tier}"`);
  }
});

test("group effect direction agrees with its pooledRR", () => {
  for (const id of Object.keys(GROUPS)) {
    const g = GROUPS[id];
    if (g.effect === "positive") assert.ok(g.evidence.pooledRR < 1, `${id}: positive but RR >= 1`);
    if (g.effect === "negative") assert.ok(g.evidence.pooledRR > 1, `${id}: negative but RR <= 1`);
  }
});

test("food→group memberships reference real foods and real groups", () => {
  const foodIds = new Set(FOODS.map((f) => f.id));
  for (const foodId of Object.keys(FOOD_GROUPS)) {
    assert.ok(foodIds.has(foodId), `membership for unknown food: ${foodId}`);
    for (const gid of FOOD_GROUPS[foodId]) {
      assert.ok(GROUPS[gid], `food ${foodId} maps to unknown group ${gid}`);
    }
  }
});

test("groupsFor returns the resolved group objects", () => {
  const g = groupsFor("tomatoes");
  assert.ok(g.length >= 1 && g[0].id === "vegetables");
  assert.deepEqual(groupsFor("nonexistent-food"), []);
});

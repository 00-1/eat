"use strict";

// Steelmanning attempts: structurally honest, attributed, and — for category
// claims — correctly scoped and resolved onto member foods.

const test = require("node:test");
const assert = require("node:assert/strict");
const { FOODS } = require("../data.js");
const {
  COUNTER_ARGUMENTS,
  SHARED_CLAIMS,
  FOOD_TAGS,
  TAG_LABEL,
  counterArgumentsFor,
} = require("../counter-arguments.js");

const STANCES = ["holds", "partial", "valid", "certainty"];
const TAGS = Object.keys(TAG_LABEL);
const FOOD_IDS = new Set(FOODS.map((f) => f.id));

function wellFormed(c, where) {
  for (const k of ["claim", "proponents", "assessment"]) {
    assert.ok(c[k] && String(c[k]).trim().length > 0, `${where}: missing ${k}`);
  }
  assert.ok(STANCES.includes(c.stance), `${where}: bad stance ${c.stance}`);
  assert.ok(c.proponents.length > 15, `${where}: proponents too vague`);
}

test("food-specific counter-arguments attach to real foods and are well-formed", () => {
  for (const id of Object.keys(COUNTER_ARGUMENTS)) {
    assert.ok(FOOD_IDS.has(id), `counter-arguments for unknown food: ${id}`);
    assert.ok(COUNTER_ARGUMENTS[id].length > 0, `${id}: empty list`);
    COUNTER_ARGUMENTS[id].forEach((c) => wellFormed(c, id));
  }
});

test("FOOD_TAGS reference real foods and known tags", () => {
  for (const id of Object.keys(FOOD_TAGS)) {
    assert.ok(FOOD_IDS.has(id), `tags for unknown food: ${id}`);
    FOOD_TAGS[id].forEach((t) => assert.ok(TAGS.includes(t), `${id}: unknown tag ${t}`));
  }
});

test("shared claims are well-formed, scoped to known tags, and resolve to >=1 food", () => {
  for (const c of SHARED_CLAIMS) {
    wellFormed(c, "shared:" + c.claim.slice(0, 30));
    assert.ok(Array.isArray(c.scope) && c.scope.length > 0, "shared claim needs a scope");
    c.scope.forEach((t) => assert.ok(TAGS.includes(t), `shared claim bad scope ${t}`));
    const members = FOODS.filter((f) => (FOOD_TAGS[f.id] || []).some((t) => c.scope.includes(t)));
    assert.ok(members.length >= 1, `shared claim "${c.claim.slice(0, 30)}" resolves to no foods`);
  }
});

test("counterArgumentsFor merges shared (scoped) + specific, flagging shared", () => {
  // whole-fruit is tagged fruit + high-carb -> should pick up both shared claims
  const wf = counterArgumentsFor("whole-fruit");
  assert.ok(wf.some((c) => c.shared && c.scope.includes("fruit")), "whole-fruit missing fruit claim");
  assert.ok(wf.some((c) => c.shared && c.scope.includes("high-carb")), "whole-fruit missing carb claim");
  // sugary-drinks has a specific claim + the shared carb claim
  const sd = counterArgumentsFor("sugary-drinks");
  assert.ok(sd.some((c) => c.shared), "sugary-drinks missing shared claim");
  assert.ok(sd.some((c) => !c.shared), "sugary-drinks missing its specific claim");
  // olive oil now carries a specific "challenges our certainty" steelman
  const oo = counterArgumentsFor("olive-oil");
  assert.ok(oo.some((c) => c.stance === "certainty"), "olive-oil missing its certainty steelman");
  // a food with no tags and no specific claims resolves to empty
  assert.deepEqual(counterArgumentsFor("avocado"), []);
});

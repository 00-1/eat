"use strict";

// Counter-arguments must be well-formed and attached to real foods. They are the
// project's adversarial self-check, so we keep them structurally honest.

const test = require("node:test");
const assert = require("node:assert/strict");
const { FOODS } = require("../data.js");
const { COUNTER_ARGUMENTS } = require("../counter-arguments.js");

const STANCES = ["holds", "partial", "valid"];

test("counter-arguments attach to real food ids", () => {
  const ids = new Set(FOODS.map((f) => f.id));
  for (const id of Object.keys(COUNTER_ARGUMENTS)) {
    assert.ok(ids.has(id), `counter-arguments for unknown food: ${id}`);
  }
});

test("every counter-argument is well-formed", () => {
  for (const id of Object.keys(COUNTER_ARGUMENTS)) {
    const list = COUNTER_ARGUMENTS[id];
    assert.ok(Array.isArray(list) && list.length > 0, `${id}: empty list`);
    for (const c of list) {
      for (const k of ["claim", "proponents", "assessment"]) {
        assert.ok(c[k] && String(c[k]).trim().length > 0, `${id}: missing ${k}`);
      }
      assert.ok(STANCES.includes(c.stance), `${id}: bad stance ${c.stance}`);
      // Guard against lazy strawmen: an attribution should name a source, not be vague.
      assert.ok(
        c.proponents.length > 15,
        `${id}: proponents too vague — must be a real, attributable source`
      );
    }
  }
});

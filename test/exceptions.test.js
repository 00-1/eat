"use strict";

// Exceptions are a FIXED checklist applied to every food. These tests enforce
// "applied equally" (every food assessed) and structural honesty (sourced
// prevalence, valid severity/type).

const test = require("node:test");
const assert = require("node:assert/strict");
const { FOODS } = require("../data.js");
const { EXCEPTIONS, EXCEPTION_TYPE_LABEL } = require("../exceptions.js");

const SEVERITIES = ["avoid", "caution", "mitigate"];
const TYPES = Object.keys(EXCEPTION_TYPE_LABEL);

test("every food is assessed against the checklist (entry present, even if empty)", () => {
  for (const f of FOODS) {
    assert.ok(Array.isArray(EXCEPTIONS[f.id]), `${f.id}: no exceptions entry (must be [] if none)`);
  }
});

test("no exceptions for unknown foods", () => {
  const ids = new Set(FOODS.map((f) => f.id));
  for (const id of Object.keys(EXCEPTIONS)) {
    assert.ok(ids.has(id), `exceptions for unknown food: ${id}`);
  }
});

test("every exception is well-formed with sourced prevalence", () => {
  for (const id of Object.keys(EXCEPTIONS)) {
    for (const e of EXCEPTIONS[id]) {
      assert.ok(TYPES.includes(e.type), `${id}: bad type ${e.type}`);
      assert.ok(SEVERITIES.includes(e.severity), `${id}: bad severity ${e.severity}`);
      assert.ok(e.group && e.group.trim().length > 0, `${id}: missing group`);
      assert.ok(e.prevalence && e.prevalence.estimate && e.prevalence.estimate.trim().length > 0, `${id}: missing prevalence estimate`);
      assert.ok(e.prevalence.source && e.prevalence.source.trim().length > 0, `${id}: prevalence needs a source`);
    }
  }
});
